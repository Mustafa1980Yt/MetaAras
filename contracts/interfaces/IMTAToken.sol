// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";

/// @title IMTAToken — MetaAras token interface
/// @notice Public surface of MTAToken: mint, blacklist, pause, and governance vote support.
interface IMTAToken is IERC20, IERC20Permit, IVotes {
    // ─── Events ────────────────────────────────────────────────────────────────

    /// @notice Emitted when minting is permanently disabled via `revokeMinter`.
    /// @param caller The address that triggered the revocation.
    event MinterRevoked(address indexed caller);

    /// @notice Emitted when an address is added to or removed from the blacklist.
    /// @param account The address whose blacklist status changed.
    /// @param status  True = blacklisted, False = removed.
    event BlacklistUpdated(address indexed account, bool status);

    // ─── Errors ────────────────────────────────────────────────────────────────

    /// @notice Thrown when a zero address is supplied where it is not allowed.
    error MTA__ZeroAddress();

    /// @notice Thrown when a zero amount is supplied.
    error MTA__ZeroAmount();

    /// @notice Thrown when a mint would exceed `MAX_SUPPLY`.
    /// @param requested Amount requested to mint.
    /// @param available Remaining mintable supply.
    error MTA__MaxSupplyExceeded(uint256 requested, uint256 available);

    /// @notice Thrown when a blacklisted address attempts a transfer.
    /// @param account The blacklisted address.
    error MTA__Blacklisted(address account);

    /// @notice Thrown when `mint` or `revokeMinter` is called after minting has been disabled.
    error MTA__MintingPermanentlyDisabled();

    // ─── Mutative Functions ────────────────────────────────────────────────────

    /// @notice Mints `amount` tokens to `to`. Requires MINTER_ROLE.
    /// @param to     Recipient address.
    /// @param amount Amount of tokens (in wei) to mint.
    function mint(address to, uint256 amount) external;

    /// @notice Permanently disables minting. Irreversible. Requires DEFAULT_ADMIN_ROLE.
    function revokeMinter() external;

    /// @notice Adds or removes `account` from the blacklist. Requires BLACKLISTER_ROLE.
    /// @param account Address to update.
    /// @param status  True to blacklist, false to remove.
    function setBlacklist(address account, bool status) external;

    // ─── View Functions ────────────────────────────────────────────────────────

    /// @notice Returns true when minting has been permanently disabled.
    function isMintingDisabled() external view returns (bool);

    /// @notice Returns true when `account` is on the blacklist.
    /// @param account Address to query.
    function isBlacklisted(address account) external view returns (bool);

    /// @notice Returns the hard-capped maximum token supply (100 000 000 MTA in wei).
    function MAX_SUPPLY() external view returns (uint256); // solhint-disable-line func-name-mixedcase

    /// @notice Returns the current circulating supply (equal to `totalSupply` after burns).
    function circulatingSupply() external view returns (uint256);
}
