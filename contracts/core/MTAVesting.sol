// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title  MTAVesting
 * @author MetaAras Team
 * @notice Linear vesting contract with cliff support for MTA token distribution.
 *
 * @dev    Supported allocation groups:
 *         - Team & Advisors  : 12-month cliff, 36-month linear vesting
 *         - Seed Investors   : 6-month cliff, 18-month linear vesting
 *         - Treasury         : no cliff, released by DAO governance
 *
 *         Architecture:
 *         - Each beneficiary receives one or more independent `VestingSchedule` records.
 *         - `totalVestingAmount` tracks committed but unreleased tokens to prevent
 *           over-allocation when scheduling against the contract's actual balance.
 *         - A monotonic `_scheduleNonce` prevents `scheduleId` collisions for identical
 *           parameters created in the same block.
 *         - `startTime` must not be in the past to prevent instant cliff bypass.
 *
 *         Security:
 *         - All token movements follow Checks-Effects-Interactions (CEI).
 *         - `nonReentrant` guards every external state-changing function.
 *         - Only VESTING_ADMIN_ROLE may create or revoke schedules.
 *         - Revoked schedules pay earned tokens to the beneficiary before
 *           returning the remainder to `treasury`.
 */
contract MTAVesting is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── Types ─────────────────────────────────────────────────────────────────

    /// @notice Immutable record for a single vesting allocation.
    struct VestingSchedule {
        address beneficiary;     // Recipient of vested tokens
        uint256 totalAmount;     // Total tokens committed (wei)
        uint256 released;        // Tokens already transferred to beneficiary
        uint64  startTime;       // Unix timestamp when vesting begins
        uint64  cliffDuration;   // Seconds before any tokens vest
        uint64  vestingDuration; // Total vesting window in seconds (cliff-inclusive)
        bool    revocable;       // Whether VESTING_ADMIN_ROLE may cancel this schedule
        bool    revoked;         // True once the schedule has been cancelled
    }

    // ─── Constants ─────────────────────────────────────────────────────────────

    /// @notice Role required to create or revoke vesting schedules.
    bytes32 public constant VESTING_ADMIN_ROLE = keccak256("VESTING_ADMIN_ROLE");

    // ─── Immutables ────────────────────────────────────────────────────────────

    /// @notice The MTA token contract.
    IERC20 public immutable token; // solhint-disable-line immutable-vars-naming

    /// @notice Address that receives tokens from cancelled (revoked) schedules.
    address public immutable treasury; // solhint-disable-line immutable-vars-naming

    // ─── State ─────────────────────────────────────────────────────────────────

    /// @dev Ordered list of all created schedule IDs.
    bytes32[] private _scheduleIds;

    /// @dev scheduleId → VestingSchedule.
    mapping(bytes32 => VestingSchedule) private _schedules;

    /// @dev beneficiary → list of their schedule IDs.
    mapping(address => bytes32[]) private _beneficiarySchedules;

    /// @notice Total tokens committed across all active schedules but not yet released.
    uint256 public totalVestingAmount;

    /// @dev Monotonically increasing counter to prevent scheduleId hash collisions.
    uint256 private _scheduleNonce;

    // ─── Events ────────────────────────────────────────────────────────────────

    /**
     * @notice Emitted when a new vesting schedule is created.
     * @param scheduleId     Unique identifier for the schedule.
     * @param beneficiary    Token recipient.
     * @param totalAmount    Total tokens committed.
     * @param startTime      Vesting start timestamp.
     * @param cliffDuration  Cliff length in seconds.
     * @param vestingDuration Total vesting window in seconds.
     */
    event ScheduleCreated(
        bytes32 indexed scheduleId,
        address indexed beneficiary,
        uint256 totalAmount,
        uint64  startTime,
        uint64  cliffDuration,
        uint64  vestingDuration
    );

    /**
     * @notice Emitted when tokens are transferred to the beneficiary.
     * @param scheduleId  The schedule from which tokens were released.
     * @param beneficiary Recipient of the released tokens.
     * @param amount      Number of tokens released.
     */
    event TokensReleased(
        bytes32 indexed scheduleId,
        address indexed beneficiary,
        uint256 amount
    );

    /**
     * @notice Emitted when a revocable schedule is cancelled.
     * @param scheduleId  The cancelled schedule.
     * @param beneficiary Address whose schedule was cancelled.
     * @param returned    Tokens returned to the treasury (unvested portion).
     */
    event ScheduleRevoked(
        bytes32 indexed scheduleId,
        address indexed beneficiary,
        uint256 returned
    );

    // ─── Errors ────────────────────────────────────────────────────────────────

    /// @notice Thrown when a zero address is provided.
    error Vesting__ZeroAddress();

    /// @notice Thrown when a zero token amount is specified.
    error Vesting__ZeroAmount();

    /// @notice Thrown when vesting or cliff durations are invalid.
    error Vesting__InvalidDuration();

    /// @notice Thrown when the requested schedule ID does not exist.
    error Vesting__ScheduleNotFound();

    /// @notice Thrown when a non-beneficiary attempts to release tokens.
    error Vesting__NotBeneficiary();

    /// @notice Thrown when no tokens are currently releasable.
    error Vesting__NothingToRelease();

    /// @notice Thrown when attempting to revoke a non-revocable schedule.
    error Vesting__NotRevocable();

    /// @notice Thrown when attempting to revoke an already-revoked schedule.
    error Vesting__AlreadyRevoked();

    /// @notice Thrown when the contract balance is insufficient for the new schedule.
    error Vesting__InsufficientBalance();

    /// @notice Thrown when `startTime` is set to a timestamp in the past.
    error Vesting__StartTimeInPast();

    /// @notice Thrown when the beneficiary is unable to receive tokens (e.g. blacklisted).
    error Vesting__CannotRelease();

    // ─── Constructor ───────────────────────────────────────────────────────────

    /**
     * @notice Deploys MTAVesting.
     * @dev    Tokens must be sent to this contract before creating schedules.
     * @param _token    Address of the MTA ERC-20 token.
     * @param _treasury Address that receives unvested tokens from revoked schedules.
     * @param _admin    Address granted DEFAULT_ADMIN_ROLE and VESTING_ADMIN_ROLE.
     */
    constructor(address _token, address _treasury, address _admin) {
        if (_token    == address(0)) revert Vesting__ZeroAddress();
        if (_treasury == address(0)) revert Vesting__ZeroAddress();
        if (_admin    == address(0)) revert Vesting__ZeroAddress();

        token    = IERC20(_token);
        treasury = _treasury;

        _grantRole(DEFAULT_ADMIN_ROLE,  _admin);
        _grantRole(VESTING_ADMIN_ROLE,  _admin);
    }

    // ─── External: Schedule Management ────────────────────────────────────────

    /**
     * @notice Creates a new vesting schedule.
     * @dev    The contract must hold at least `totalVestingAmount + totalAmount` tokens
     *         before this call.  `startTime == 0` defaults to `block.timestamp`.
     * @param beneficiary     Address that will receive vested tokens.
     * @param totalAmount     Total tokens to vest (wei).
     * @param startTime       Unix timestamp for vesting start (0 = now; future dates only).
     * @param cliffDuration   Seconds before any tokens vest.
     * @param vestingDuration Total vesting window in seconds (must be >= cliffDuration).
     * @param revocable       Whether the admin may cancel this schedule.
     * @return scheduleId     Unique identifier for the created schedule.
     */
    function createSchedule(
        address beneficiary,
        uint256 totalAmount,
        uint64  startTime,
        uint64  cliffDuration,
        uint64  vestingDuration,
        bool    revocable
    ) external onlyRole(VESTING_ADMIN_ROLE) returns (bytes32 scheduleId) {
        if (beneficiary     == address(0)) revert Vesting__ZeroAddress();
        if (totalAmount     == 0)          revert Vesting__ZeroAmount();
        if (vestingDuration == 0 || cliffDuration > vestingDuration) revert Vesting__InvalidDuration();
        if (startTime != 0 && startTime < uint64(block.timestamp))   revert Vesting__StartTimeInPast();

        uint256 contractBalance = token.balanceOf(address(this));
        if (contractBalance < totalVestingAmount + totalAmount) revert Vesting__InsufficientBalance();

        uint64 start = startTime == 0 ? uint64(block.timestamp) : startTime;

        scheduleId = keccak256(
            abi.encodePacked(beneficiary, totalAmount, start, cliffDuration, vestingDuration, _scheduleNonce++)
        );

        _schedules[scheduleId] = VestingSchedule({
            beneficiary:     beneficiary,
            totalAmount:     totalAmount,
            released:        0,
            startTime:       start,
            cliffDuration:   cliffDuration,
            vestingDuration: vestingDuration,
            revocable:       revocable,
            revoked:         false
        });

        _scheduleIds.push(scheduleId);
        _beneficiarySchedules[beneficiary].push(scheduleId);
        totalVestingAmount += totalAmount;

        emit ScheduleCreated(scheduleId, beneficiary, totalAmount, start, cliffDuration, vestingDuration);
    }

    /**
     * @notice Releases all currently vested tokens to the caller.
     * @dev    Caller must be the beneficiary of `scheduleId`.
     *         Follows Checks-Effects-Interactions: state is updated before the transfer.
     * @param scheduleId The schedule from which to release tokens.
     */
    function release(bytes32 scheduleId) external nonReentrant {
        VestingSchedule storage schedule = _schedules[scheduleId];
        if (schedule.beneficiary == address(0))    revert Vesting__ScheduleNotFound();
        if (schedule.beneficiary != msg.sender)    revert Vesting__NotBeneficiary();

        uint256 releasable = _releasableAmount(schedule);
        if (releasable == 0) revert Vesting__NothingToRelease();

        // CEI: effects before interaction
        schedule.released      += releasable;
        totalVestingAmount     -= releasable;

        token.safeTransfer(schedule.beneficiary, releasable);

        emit TokensReleased(scheduleId, schedule.beneficiary, releasable);
    }

    /**
     * @notice Cancels a revocable schedule, paying earned tokens to the beneficiary
     *         and returning the remainder to `treasury`.
     * @dev    Only callable by VESTING_ADMIN_ROLE.
     *         CEI is maintained: all state mutations precede external calls.
     * @param scheduleId The schedule to revoke.
     */
    function revoke(bytes32 scheduleId) external onlyRole(VESTING_ADMIN_ROLE) nonReentrant {
        VestingSchedule storage schedule = _schedules[scheduleId];
        if (schedule.beneficiary == address(0)) revert Vesting__ScheduleNotFound();
        if (!schedule.revocable)                revert Vesting__NotRevocable();
        if (schedule.revoked)                   revert Vesting__AlreadyRevoked();

        uint256 releasable     = _releasableAmount(schedule);
        uint256 refund         = schedule.totalAmount - schedule.released - releasable;
        uint256 totalRemaining = releasable + refund;

        // CEI: effects before interactions
        schedule.revoked       = true;
        totalVestingAmount    -= totalRemaining;

        if (releasable > 0) {
            schedule.released += releasable;
            token.safeTransfer(schedule.beneficiary, releasable);
            emit TokensReleased(scheduleId, schedule.beneficiary, releasable);
        }

        if (refund > 0) {
            token.safeTransfer(treasury, refund);
        }

        emit ScheduleRevoked(scheduleId, schedule.beneficiary, refund);
    }

    // ─── External: View ────────────────────────────────────────────────────────

    /**
     * @notice Returns the full details of a vesting schedule.
     * @param scheduleId ID of the schedule to query.
     * @return VestingSchedule storage struct (copied to memory).
     */
    function getSchedule(bytes32 scheduleId) external view returns (VestingSchedule memory) {
        return _schedules[scheduleId];
    }

    /**
     * @notice Returns all schedule IDs belonging to `beneficiary`.
     * @param beneficiary Address to query.
     * @return Array of schedule IDs.
     */
    function getBeneficiarySchedules(address beneficiary) external view returns (bytes32[] memory) {
        return _beneficiarySchedules[beneficiary];
    }

    /**
     * @notice Returns the number of tokens currently releasable from `scheduleId`.
     * @param scheduleId ID of the schedule to query.
     * @return Amount of tokens (wei) available for immediate release.
     */
    function releasableAmount(bytes32 scheduleId) external view returns (uint256) {
        VestingSchedule storage schedule = _schedules[scheduleId];
        if (schedule.beneficiary == address(0)) revert Vesting__ScheduleNotFound();
        return _releasableAmount(schedule);
    }

    /**
     * @notice Returns the total number of tokens that have vested for `scheduleId`
     *         as of the current block timestamp (includes already-released tokens).
     * @param scheduleId ID of the schedule to query.
     * @return Cumulative vested amount in wei.
     */
    function vestedAmount(bytes32 scheduleId) external view returns (uint256) {
        VestingSchedule storage schedule = _schedules[scheduleId];
        if (schedule.beneficiary == address(0)) revert Vesting__ScheduleNotFound();
        return _vestedAmount(schedule, uint64(block.timestamp));
    }

    /// @notice Returns the total number of vesting schedules created.
    function scheduleCount() external view returns (uint256) {
        return _scheduleIds.length;
    }

    // ─── Private Helpers ───────────────────────────────────────────────────────

    /// @dev Returns tokens earned but not yet released.
    function _releasableAmount(VestingSchedule storage schedule) private view returns (uint256) {
        return _vestedAmount(schedule, uint64(block.timestamp)) - schedule.released;
    }

    /**
     * @dev  Computes the cumulative vested amount at a given `timestamp`.
     *       Returns `schedule.released` for revoked schedules (no new vesting after revocation).
     *       Linear schedule: after cliff, tokens vest pro-rata over the full vesting window.
     */
    function _vestedAmount(
        VestingSchedule storage schedule,
        uint64 timestamp
    ) private view returns (uint256) {
        if (schedule.revoked) {
            return schedule.released;
        }

        uint64 cliffEnd   = schedule.startTime + schedule.cliffDuration;
        if (timestamp < cliffEnd) {
            return 0;
        }

        uint64 vestingEnd = schedule.startTime + schedule.vestingDuration;
        if (timestamp >= vestingEnd) {
            return schedule.totalAmount;
        }

        uint64 elapsed = timestamp - schedule.startTime;
        return (schedule.totalAmount * elapsed) / schedule.vestingDuration;
    }
}
