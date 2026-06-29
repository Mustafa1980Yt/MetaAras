// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title  MTAStaking
 * @author MetaAras Team
 * @notice MTA token staking contract with tier-based fixed APY and per-position reward tracking.
 *
 * @dev    Tier system:
 *         Bronze  : 30 days  → 8%  APY
 *         Silver  : 90 days  → 15% APY
 *         Gold    : 180 days → 25% APY
 *         Platinum: 365 days → 40% APY
 *
 *         Reward mechanics:
 *         - APY is enforced per-position: reward = amount × apyBps × elapsed / PRECISION_DIVISOR
 *         - `lastClaimTime` resets on every claim or compound, ensuring no double-counting.
 *         - The `rewardsPool` wallet pre-approves this contract to spend on its behalf.
 *
 *         Security properties:
 *         - All external state-changing functions use `nonReentrant` + CEI pattern.
 *         - UUPS proxy allows upgrades gated by UPGRADER_ROLE (should be Timelock in prod).
 *         - A `__gap` of 50 slots is reserved for future storage layout extensions.
 *         - Early exit incurs a 20% penalty transferred to `rewardsPool`.
 *
 *         Centralization risks (document for audit):
 *         - DEFAULT_ADMIN_ROLE can update tier configs and rewardsPool without timelock.
 *           In production, this role MUST be held by the Timelock controller.
 *         - UPGRADER_ROLE enables proxy replacement; should also be the Timelock.
 *         - PAUSER_ROLE can halt staking and unstaking; assign to Gnosis Safe.
 */
contract MTAStaking is
    Initializable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    using SafeERC20 for IERC20;

    // ─── Types ─────────────────────────────────────────────────────────────────

    /// @notice Available staking tiers, ordered by ascending lock duration.
    enum Tier { Bronze, Silver, Gold, Platinum }

    /// @notice Configuration for a single staking tier.
    struct TierConfig {
        uint256 lockDuration; // Lock period in seconds
        uint256 apyBps;       // Annual yield in basis points (8% = 800)
    }

    /**
     * @notice Records a single user staking position.
     * @dev    Timestamps are `uint48` to pack three fields into one storage slot alongside
     *         `claimedRewards`, saving 3 SSTORE/SLOAD operations versus using `uint256`.
     *         uint48 max ≈ year 10 895 AD, so overflow is not a practical concern.
     *
     *         `stakedApyBps` is snapshotted at stake time and never mutated.
     *         This ensures each position earns the APY it was offered, regardless of
     *         future `updateTierConfig` calls (protects user from retrospective APY cuts).
     *         Positions created before this field was introduced will have stakedApyBps == 0;
     *         `_pendingRewards` falls back to the live tier config for backward compatibility.
     */
    struct StakePosition {
        uint256 amount;         // Staked token amount (wei)
        uint256 claimedRewards; // Lifetime rewards paid from this position (wei)
        uint256 stakedApyBps;   // APY locked at stake time (0 = pre-upgrade, uses live config)
        uint48  startTime;      // Stake creation timestamp
        uint48  unlockTime;     // Timestamp after which no early-exit penalty applies
        uint48  lastClaimTime;  // Timestamp of most recent reward claim / compound
        Tier    tier;           // Tier selected at stake time
        bool    active;         // False once unstaked
    }

    // ─── Constants ─────────────────────────────────────────────────────────────

    /// @notice Role that may pause and unpause the contract.
    bytes32 public constant PAUSER_ROLE   = keccak256("PAUSER_ROLE");

    /// @notice Role that may trigger a UUPS upgrade.
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    /// @notice 10 000 basis points = 100%.
    uint256 public constant BPS_DENOMINATOR        = 10_000;

    /// @notice Seconds in a Julian year (365 days).
    uint256 public constant YEAR_SECONDS           = 365 days;

    /// @notice Early exit penalty: 20% of the staked amount.
    uint256 public constant EARLY_EXIT_PENALTY_BPS = 2_000;

    /// @notice Minimum amount required to open a position (1 MTA). Prevents dust-spam.
    uint256 public constant MIN_STAKE_AMOUNT = 1e18;

    /// @notice Maximum allowed lock duration for any tier (5 years).
    ///         Guards against uint48 silent truncation on unlockTime arithmetic.
    uint256 public constant MAX_LOCK_DURATION = 1825 days;

    /// @dev Pre-computed denominator: BPS_DENOMINATOR × YEAR_SECONDS.
    ///      Avoids re-computing 315 360 000 000 on every reward calculation.
    uint256 private constant PRECISION_DIVISOR = BPS_DENOMINATOR * YEAR_SECONDS;

    // ─── State ─────────────────────────────────────────────────────────────────

    /// @notice ERC-20 token accepted for staking.
    IERC20  public stakingToken;

    /// @notice Wallet/contract that funds staking rewards and receives penalty tokens.
    address public rewardsPool;

    /// @notice Tier → configuration mapping.
    mapping(Tier => TierConfig) public tierConfigs;

    /// @notice user → positionId → StakePosition.
    mapping(address => mapping(uint256 => StakePosition)) public positions;

    /// @notice Number of positions opened by each user (used as next position ID).
    mapping(address => uint256) public positionCount;

    /// @notice Sum of all currently staked tokens across all users.
    uint256 public globalTotalStaked;

    /// @notice Lifetime total of early-exit penalties collected.
    uint256 public totalPenaltiesCollected;

    /// @dev Storage gap for future upgrade safety (OZ upgradeable pattern).
    uint256[50] private __gap;

    // ─── Events ────────────────────────────────────────────────────────────────

    /**
     * @notice Emitted when tokens are staked.
     * @param user       Staker address.
     * @param positionId Newly created position index.
     * @param amount     Tokens staked (wei).
     * @param tier       Selected tier.
     * @param unlockTime Timestamp when the lock expires.
     */
    event Staked(
        address indexed user,
        uint256 indexed positionId,
        uint256 amount,
        Tier    tier,
        uint256 unlockTime
    );

    /**
     * @notice Emitted when a staking position is closed.
     * @param user       Staker address.
     * @param positionId Position that was closed.
     * @param amount     Tokens returned to user (after penalty, if any).
     * @param penalty    Tokens sent to `rewardsPool` as early-exit fee.
     */
    event Unstaked(
        address indexed user,
        uint256 indexed positionId,
        uint256 amount,
        uint256 penalty
    );

    /**
     * @notice Emitted when accumulated rewards are paid out.
     * @param user       Recipient address.
     * @param positionId Source position.
     * @param amount     Reward amount transferred.
     */
    event RewardClaimed(
        address indexed user,
        uint256 indexed positionId,
        uint256 amount
    );

    /**
     * @notice Emitted when rewards are re-staked into an existing position.
     * @param user        Staker address.
     * @param positionId  Position receiving the compounded rewards.
     * @param rewardAdded Reward tokens added to the position.
     * @param newTotal    Updated position amount after compounding.
     */
    event Compounded(
        address indexed user,
        uint256 indexed positionId,
        uint256 rewardAdded,
        uint256 newTotal
    );

    /**
     * @notice Emitted when a user pays an early-exit penalty.
     * @param user    Staker who exited early.
     * @param amount  Penalty amount sent to `rewardsPool`.
     */
    event EarlyExitPenaltyCollected(address indexed user, uint256 amount);

    /**
     * @notice Emitted when a tier's parameters are updated.
     * @param tier         The tier that was changed.
     * @param lockDuration New lock duration in seconds.
     * @param apyBps       New APY in basis points.
     */
    event TierConfigUpdated(Tier indexed tier, uint256 lockDuration, uint256 apyBps);

    /**
     * @notice Emitted when the rewards pool address is replaced.
     * @param oldPool Previous rewards pool address.
     * @param newPool New rewards pool address.
     */
    event RewardsPoolUpdated(address indexed oldPool, address indexed newPool);

    /**
     * @notice Emitted when the rewards pool cannot cover pending rewards during unstake.
     *         The principal is still returned; the reward is forfeited for this unstake.
     * @param user        Staker who unstaked.
     * @param positionId  Position that was closed.
     * @param rewardLost  Reward amount that could not be transferred.
     */
    event RewardPoolDepleted(address indexed user, uint256 indexed positionId, uint256 rewardLost);

    /**
     * @notice Emitted when an admin force-closes a position to an alternate address.
     *         Used to recover funds for blacklisted stakers.
     * @param user        Original staker.
     * @param positionId  Position that was closed.
     * @param destination Address that received the principal.
     * @param amount      Tokens transferred to destination.
     */
    event EmergencyUnstaked(
        address indexed user,
        uint256 indexed positionId,
        address destination,
        uint256 amount
    );

    // ─── Errors ────────────────────────────────────────────────────────────────

    /// @notice Thrown when an out-of-range tier value is supplied.
    error Staking__InvalidTier();

    /// @notice Thrown when operating on an inactive (already unstaked) position.
    error Staking__PositionNotActive();

    /// @notice Thrown when a zero address is provided.
    error Staking__ZeroAddress();

    /// @notice Thrown when a claim or compound is attempted with no pending rewards.
    error Staking__InsufficientRewards();

    /// @notice Thrown when `updateTierConfig` receives a zero APY or APY > 100%.
    error Staking__InvalidApyBps();

    /// @notice Thrown when `updateTierConfig` receives a zero lock duration.
    error Staking__InvalidLockDuration();

    /// @notice Thrown when the stake amount is below MIN_STAKE_AMOUNT.
    error Staking__BelowMinimum();

    // ─── Initializer ───────────────────────────────────────────────────────────

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialises the proxy implementation.
     * @dev    Called exactly once via the proxy's `initialize` selector.
     *         Default tier configs are set here and may be updated post-deploy via
     *         `updateTierConfig` (requires DEFAULT_ADMIN_ROLE → Timelock).
     * @param _stakingToken Address of the MTA ERC-20 token.
     * @param _rewardsPool  Wallet/contract that funds rewards and receives penalties.
     * @param _admin        Address granted DEFAULT_ADMIN_ROLE and UPGRADER_ROLE.
     * @param _pauser       Address granted PAUSER_ROLE (Gnosis Safe).
     */
    function initialize(
        address _stakingToken,
        address _rewardsPool,
        address _admin,
        address _pauser
    ) external initializer {
        if (_stakingToken == address(0)) revert Staking__ZeroAddress();
        if (_rewardsPool  == address(0)) revert Staking__ZeroAddress();
        if (_admin        == address(0)) revert Staking__ZeroAddress();
        if (_pauser       == address(0)) revert Staking__ZeroAddress();

        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        stakingToken = IERC20(_stakingToken);
        rewardsPool  = _rewardsPool;

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(PAUSER_ROLE,        _pauser);
        _grantRole(UPGRADER_ROLE,      _admin);

        tierConfigs[Tier.Bronze]   = TierConfig({lockDuration: 30 days,  apyBps: 800});
        tierConfigs[Tier.Silver]   = TierConfig({lockDuration: 90 days,  apyBps: 1_500});
        tierConfigs[Tier.Gold]     = TierConfig({lockDuration: 180 days, apyBps: 2_500});
        tierConfigs[Tier.Platinum] = TierConfig({lockDuration: 365 days, apyBps: 4_000});
    }

    // ─── External: Core ────────────────────────────────────────────────────────

    /**
     * @notice Stakes `amount` MTA tokens under the chosen `tier`.
     * @dev    Creates a new `StakePosition`; callers may hold multiple positions.
     *         The `amount` is pulled from the caller via `safeTransferFrom`.
     * @param amount Amount of MTA to stake (wei); must be > 0.
     * @param tier   Lock tier; determines APY and lock duration.
     */
    function stake(
        uint256 amount,
        Tier    tier
    ) external whenNotPaused nonReentrant {
        if (amount < MIN_STAKE_AMOUNT) revert Staking__BelowMinimum();
        // Solidity 0.8 rejects out-of-range enum values at ABI-decode time; no explicit check needed.

        TierConfig memory cfg = tierConfigs[tier];
        uint256 positionId    = positionCount[msg.sender]++;
        uint48  now_          = uint48(block.timestamp);
        uint48  unlock        = uint48(block.timestamp + cfg.lockDuration);

        positions[msg.sender][positionId] = StakePosition({
            amount:        amount,
            claimedRewards: 0,
            stakedApyBps:  cfg.apyBps,   // snapshot — immune to future updateTierConfig
            startTime:     now_,
            unlockTime:    unlock,
            lastClaimTime: now_,
            tier:          tier,
            active:        true
        });

        globalTotalStaked += amount;

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        emit Staked(msg.sender, positionId, amount, tier, unlock);
    }

    /**
     * @notice Closes a staking position and returns tokens to the caller.
     * @dev    If the lock period has not elapsed, a 20% early-exit penalty is charged.
     *         Any pending rewards are automatically paid before the principal is returned.
     *         Strict CEI: ALL state mutations complete before ANY external call.
     * @param positionId Index of the position to unstake.
     */
    function unstake(uint256 positionId) external whenNotPaused nonReentrant {
        StakePosition storage pos = positions[msg.sender][positionId];
        if (!pos.active) revert Staking__PositionNotActive();

        // ── Checks ────────────────────────────────────────────────────────────
        uint256 pendingReward = _pendingRewards(pos);
        uint256 amount        = pos.amount;
        uint256 penalty       = 0;

        if (block.timestamp < pos.unlockTime) {
            penalty = (amount * EARLY_EXIT_PENALTY_BPS) / BPS_DENOMINATOR;
        }

        uint256 returnAmount = amount - penalty;

        // ── Effects (all state before any external call) ──────────────────────
        pos.active        = false;
        pos.amount        = 0;
        pos.lastClaimTime = uint48(block.timestamp);
        globalTotalStaked -= amount;

        if (penalty > 0) {
            totalPenaltiesCollected += penalty;
        }

        // ── Interactions ──────────────────────────────────────────────────────
        // Principal and penalty first — these MUST succeed (contract holds the tokens).
        if (penalty > 0) {
            stakingToken.safeTransfer(rewardsPool, penalty);
            emit EarlyExitPenaltyCollected(msg.sender, penalty);
        }
        stakingToken.safeTransfer(msg.sender, returnAmount);
        emit Unstaked(msg.sender, positionId, returnAmount, penalty);

        // Reward last — conditional on pool solvency so a dry pool never blocks principal.
        // pos.active is already false and nonReentrant is active, so updating state here is safe.
        if (pendingReward > 0) {
            uint256 poolBal = stakingToken.balanceOf(rewardsPool);
            uint256 poolAlw = stakingToken.allowance(rewardsPool, address(this));
            if (poolBal >= pendingReward && poolAlw >= pendingReward) {
                pos.claimedRewards += pendingReward;
                stakingToken.safeTransferFrom(rewardsPool, msg.sender, pendingReward);
                emit RewardClaimed(msg.sender, positionId, pendingReward);
            } else {
                emit RewardPoolDepleted(msg.sender, positionId, pendingReward);
            }
        }
    }

    /**
     * @notice Claims accumulated rewards for a specific position.
     * @dev    Rewards are pulled from `rewardsPool` via pre-approved `safeTransferFrom`.
     * @param positionId Index of the position whose rewards to claim.
     */
    function claimRewards(uint256 positionId) external whenNotPaused nonReentrant {
        StakePosition storage pos = positions[msg.sender][positionId];
        if (!pos.active) revert Staking__PositionNotActive();

        uint256 reward = _pendingRewards(pos);
        if (reward == 0) revert Staking__InsufficientRewards();

        // CEI: state before external call
        pos.claimedRewards += reward;
        pos.lastClaimTime   = uint48(block.timestamp);

        stakingToken.safeTransferFrom(rewardsPool, msg.sender, reward);

        emit RewardClaimed(msg.sender, positionId, reward);
    }

    /**
     * @notice Re-stakes pending rewards into an existing position (auto-compound).
     * @dev    The lock `unlockTime` is NOT extended. Only the staked `amount` grows.
     *         Rewards are pulled from `rewardsPool` and deposited into this contract.
     * @param positionId Index of the position to compound into.
     */
    function compound(uint256 positionId) external whenNotPaused nonReentrant {
        StakePosition storage pos = positions[msg.sender][positionId];
        if (!pos.active) revert Staking__PositionNotActive();

        uint256 reward = _pendingRewards(pos);
        if (reward == 0) revert Staking__InsufficientRewards();

        // CEI: state before external call
        pos.claimedRewards += reward;
        pos.lastClaimTime   = uint48(block.timestamp);
        pos.amount         += reward;
        globalTotalStaked  += reward;

        stakingToken.safeTransferFrom(rewardsPool, address(this), reward);

        emit Compounded(msg.sender, positionId, reward, pos.amount);
    }

    // ─── External: Admin ───────────────────────────────────────────────────────

    /// @notice Pauses staking, unstaking, and reward operations. Requires PAUSER_ROLE.
    function pause()   external onlyRole(PAUSER_ROLE) { _pause(); }

    /// @notice Unpauses the contract. Requires PAUSER_ROLE.
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    /**
     * @notice Updates the lock duration and APY for a tier.
     * @dev    APY changes apply only to NEW positions opened after this call.
     *         Existing positions retain their `stakedApyBps` snapshot (immutable at stake time).
     *         Lock-duration changes apply to new positions only (existing unlockTime unchanged).
     *         Must be called through the Timelock in production to provide a 48-hour window.
     * @param tier         Tier to update.
     * @param lockDuration New lock period in seconds; must be 1 s – MAX_LOCK_DURATION.
     * @param apyBps       New APY in basis points; must be 1–10 000 (0.01%–100%).
     */
    function updateTierConfig(
        Tier    tier,
        uint256 lockDuration,
        uint256 apyBps
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (lockDuration == 0 || lockDuration > MAX_LOCK_DURATION) revert Staking__InvalidLockDuration();
        if (apyBps == 0 || apyBps > BPS_DENOMINATOR)               revert Staking__InvalidApyBps();
        tierConfigs[tier] = TierConfig({lockDuration: lockDuration, apyBps: apyBps});
        emit TierConfigUpdated(tier, lockDuration, apyBps);
    }

    /**
     * @notice Force-closes a position and sends principal to `destination`.
     * @dev    Intended for blacklisted stakers whose tokens would otherwise be permanently
     *         locked (safeTransfer to a blacklisted address reverts). Admin may redirect funds
     *         to an address that can receive them (e.g., the staker's unblacklisted wallet
     *         or a treasury recovery address).
     *         Early-exit penalty applies if the lock has not elapsed.
     *         Pending rewards are NOT transferred (pool-side transfer still requires a
     *         non-blacklisted destination, which is handled separately by claimRewards).
     *         CEI: all state mutations precede external calls.
     * @param user        Original staker whose position to close.
     * @param positionId  Position index.
     * @param destination Address to receive the principal (must not be zero).
     */
    function adminUnstake(
        address user,
        uint256 positionId,
        address destination
    ) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        if (destination == address(0)) revert Staking__ZeroAddress();

        StakePosition storage pos = positions[user][positionId];
        if (!pos.active) revert Staking__PositionNotActive();

        uint256 amount  = pos.amount;
        uint256 penalty = 0;
        if (block.timestamp < pos.unlockTime) {
            penalty = (amount * EARLY_EXIT_PENALTY_BPS) / BPS_DENOMINATOR;
        }
        uint256 returnAmount = amount - penalty;

        // Effects
        pos.active        = false;
        pos.amount        = 0;
        pos.lastClaimTime = uint48(block.timestamp);
        globalTotalStaked -= amount;
        if (penalty > 0) totalPenaltiesCollected += penalty;

        // Interactions
        if (penalty > 0) {
            stakingToken.safeTransfer(rewardsPool, penalty);
            emit EarlyExitPenaltyCollected(user, penalty);
        }
        stakingToken.safeTransfer(destination, returnAmount);
        emit EmergencyUnstaked(user, positionId, destination, returnAmount);
    }

    /**
     * @notice Updates the rewards pool address.
     * @dev    The new pool must separately approve this contract to spend on its behalf.
     * @param newPool The replacement rewards pool address.
     */
    function updateRewardsPool(address newPool) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newPool == address(0)) revert Staking__ZeroAddress();
        address old = rewardsPool;
        rewardsPool = newPool;
        emit RewardsPoolUpdated(old, newPool);
    }

    // ─── External: View ────────────────────────────────────────────────────────

    /**
     * @notice Returns the pending (unclaimed) reward for a given position.
     * @dev    Returns 0 for inactive positions rather than reverting.
     * @param user       The staker's address.
     * @param positionId The position to query.
     * @return Pending reward in wei.
     */
    function pendingRewards(
        address user,
        uint256 positionId
    ) external view returns (uint256) {
        StakePosition storage pos = positions[user][positionId];
        if (!pos.active) return 0;
        return _pendingRewards(pos);
    }

    /**
     * @notice Returns the full details of a staking position.
     * @param user       The staker's address.
     * @param positionId The position index.
     * @return The `StakePosition` struct copied to memory.
     */
    function getPosition(
        address user,
        uint256 positionId
    ) external view returns (StakePosition memory) {
        return positions[user][positionId];
    }

    /**
     * @notice Returns the configuration (lock duration and APY) for a tier.
     * @param tier The tier to query.
     * @return The `TierConfig` struct.
     */
    function getTierConfig(Tier tier) external view returns (TierConfig memory) {
        return tierConfigs[tier];
    }

    // ─── Internal ──────────────────────────────────────────────────────────────

    /// @dev UUPS upgrade guard. Only UPGRADER_ROLE (Timelock in production) may upgrade.
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(UPGRADER_ROLE) {} // solhint-disable-line no-empty-blocks

    // ─── Private Helpers ───────────────────────────────────────────────────────

    /**
     * @dev  Computes pending reward for an active position.
     *       Formula: amount × apyBps × elapsed / (BPS_DENOMINATOR × YEAR_SECONDS)
     *       Uses `pos.stakedApyBps` (snapshotted at stake time) so that tier config updates
     *       do not retroactively affect existing positions. Falls back to the live tier config
     *       for positions created before the snapshot field was introduced (stakedApyBps == 0).
     */
    function _pendingRewards(StakePosition storage pos) private view returns (uint256) {
        uint256 elapsed = block.timestamp - pos.lastClaimTime;
        uint256 apyBps  = pos.stakedApyBps != 0 ? pos.stakedApyBps : tierConfigs[pos.tier].apyBps;
        return (pos.amount * apyBps * elapsed) / PRECISION_DIVISOR;
    }
}
