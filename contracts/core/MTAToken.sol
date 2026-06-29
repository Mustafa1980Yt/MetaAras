// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Permit, IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";
import {IMTAToken} from "../interfaces/IMTAToken.sol";

/**
 * @title  MTAToken
 * @author MetaAras Team
 * @notice MetaAras (MTA) ERC-20 governance and utility token.
 *
 * @dev    Feature set:
 *         - Hard-capped supply: 100 000 000 MTA (18 decimals)
 *         - ERC-20Permit  (EIP-2612): gasless approval signatures
 *         - ERC-20Votes   (EIP-5805): on-chain governance vote power
 *         - ERC-20Burnable: user and protocol burn support
 *         - AccessControl : role-based permission management
 *         - Pausable       : emergency stop controlled by PAUSER_ROLE
 *         - Blacklist      : OFAC compliance address blocking
 *         - Mint lock      : minting permanently disabled via revokeMinter()
 *
 *         Role responsibilities:
 *         - DEFAULT_ADMIN_ROLE : Timelock/Gnosis Safe — grants/revokes roles
 *         - MINTER_ROLE        : deploy-time only; revoked after distribution
 *         - PAUSER_ROLE        : Gnosis Safe multisig (3-of-5)
 *         - BLACKLISTER_ROLE   : Gnosis Safe multisig / compliance team
 *
 *         Security properties:
 *         - No upgrade proxy — immutable bytecode, maximises trust
 *         - Mint flag is one-way: once disabled, it cannot be re-enabled
 *         - Blacklist blocks transfers, not burns; users may still destroy own tokens
 */
contract MTAToken is
    ERC20,
    ERC20Burnable,
    ERC20Permit,
    ERC20Votes,
    AccessControl,
    Pausable,
    IMTAToken
{
    // ─── Constants ─────────────────────────────────────────────────────────────

    /// @notice Absolute maximum token supply (100 000 000 MTA).
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10 ** 18;

    /// @notice Role that authorises token minting.
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @notice Role that authorises pausing and unpausing.
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /// @notice Role that authorises blacklist management.
    bytes32 public constant BLACKLISTER_ROLE = keccak256("BLACKLISTER_ROLE");

    // ─── State ─────────────────────────────────────────────────────────────────

    /// @dev When true, `mint` permanently reverts regardless of MINTER_ROLE.
    bool private _mintingDisabled;

    /// @dev Per-address OFAC compliance block list.
    mapping(address => bool) private _blacklisted;

    // ─── Constructor ───────────────────────────────────────────────────────────

    /**
     * @notice Deploys MTAToken and assigns initial access-control roles.
     * @dev    No tokens are minted at deploy time.
     *         After distribution is complete the deployer MUST call `revokeMinter`.
     * @param admin       Address granted DEFAULT_ADMIN_ROLE (Timelock or Gnosis Safe).
     * @param minter      Address granted MINTER_ROLE for the initial distribution.
     * @param pauser      Address granted PAUSER_ROLE (Gnosis Safe multisig).
     * @param blacklister Address granted BLACKLISTER_ROLE (compliance team).
     */
    constructor(
        address admin,
        address minter,
        address pauser,
        address blacklister
    ) ERC20("MetaAras", "MTA") ERC20Permit("MetaAras") {
        if (admin       == address(0)) revert MTA__ZeroAddress();
        if (minter      == address(0)) revert MTA__ZeroAddress();
        if (pauser      == address(0)) revert MTA__ZeroAddress();
        if (blacklister == address(0)) revert MTA__ZeroAddress();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE,        minter);
        _grantRole(PAUSER_ROLE,        pauser);
        _grantRole(BLACKLISTER_ROLE,   blacklister);
    }

    // ─── External: Mint ────────────────────────────────────────────────────────

    /**
     * @notice Mints `amount` new MTA tokens to `to`.
     * @dev    Reverts once `revokeMinter` has been called.
     *         Total supply can never exceed `MAX_SUPPLY`.
     * @param to     Recipient address; must not be the zero address.
     * @param amount Token amount in wei; must be greater than zero.
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        if (_mintingDisabled) revert MTA__MintingPermanentlyDisabled();
        if (to     == address(0)) revert MTA__ZeroAddress();
        if (amount == 0)          revert MTA__ZeroAmount();

        uint256 available = MAX_SUPPLY - totalSupply();
        if (amount > available) revert MTA__MaxSupplyExceeded(amount, available);

        _mint(to, amount);
    }

    /**
     * @notice Permanently disables minting. This action is irreversible.
     * @dev    Should be called by the admin after the full token distribution is complete.
     *         The MINTER_ROLE itself is NOT automatically revoked here; call
     *         `revokeRole(MINTER_ROLE, minterAddress)` separately for clean-up.
     */
    function revokeMinter() external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_mintingDisabled) revert MTA__MintingPermanentlyDisabled();
        _mintingDisabled = true;
        emit MinterRevoked(msg.sender);
    }

    // ─── External: Pause ───────────────────────────────────────────────────────

    /// @notice Pauses all token transfers. Requires PAUSER_ROLE.
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /// @notice Unpauses token transfers. Requires PAUSER_ROLE.
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // ─── External: Blacklist ───────────────────────────────────────────────────

    /**
     * @notice Adds or removes `account` from the OFAC compliance blacklist.
     * @dev    Blacklisted addresses cannot send or receive tokens.
     *         Burns are still permitted (the `to` address check is skipped for zero-address).
     * @param account Address to update; must not be the zero address.
     * @param status  True to blacklist, false to remove from blacklist.
     */
    function setBlacklist(
        address account,
        bool status
    ) external onlyRole(BLACKLISTER_ROLE) {
        if (account == address(0)) revert MTA__ZeroAddress();
        _blacklisted[account] = status;
        emit BlacklistUpdated(account, status);
    }

    // ─── External: View ────────────────────────────────────────────────────────

    /// @notice Returns true when minting has been permanently disabled.
    function isMintingDisabled() external view returns (bool) {
        return _mintingDisabled;
    }

    /// @notice Returns true when `account` is blacklisted.
    /// @param account Address to query.
    function isBlacklisted(address account) external view returns (bool) {
        return _blacklisted[account];
    }

    /**
     * @notice Returns the current circulating supply.
     * @dev    Equals `totalSupply()`. Provided for compatibility with analytics dashboards.
     *         Burned tokens reduce this value automatically via ERC20Burnable.
     */
    function circulatingSupply() external view returns (uint256) {
        return totalSupply();
    }

    // ─── Public: View ──────────────────────────────────────────────────────────

    /**
     * @notice Returns the current EIP-2612 nonce for `owner`.
     * @dev    Resolves the diamond-inheritance conflict between ERC20Permit and Nonces.
     * @param owner Address to query.
     */
    function nonces(
        address owner
    ) public view override(ERC20Permit, IERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }

    // ─── Public: ERC165 ───────────────────────────────────────────────────────

    /**
     * @notice Returns true if this contract implements the interface defined by `interfaceId`.
     * @param interfaceId ERC-165 interface identifier.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // ─── Internal Overrides ────────────────────────────────────────────────────

    /**
     * @dev  Hook called before every token movement (mint, transfer, burn).
     *       Enforces: (1) contract-level pause, (2) sender/recipient blacklist.
     *       Blacklist is intentionally skipped for the zero address to allow burns.
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Votes) whenNotPaused {
        if (from != address(0) && _blacklisted[from]) revert MTA__Blacklisted(from);
        if (to   != address(0) && _blacklisted[to])   revert MTA__Blacklisted(to);
        super._update(from, to, value);
    }
}
