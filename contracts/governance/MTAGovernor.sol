// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Governor} from "@openzeppelin/contracts/governance/Governor.sol";
import {GovernorSettings} from "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import {GovernorCountingSimple} from "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import {GovernorVotes} from "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import {GovernorVotesQuorumFraction} from "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import {GovernorTimelockControl} from "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title  MTAGovernor
 * @author MetaAras Team
 * @notice MetaAras DAO on-chain governance contract.
 *
 * @dev    Uses EIP-6372 timestamp-based clock (mode=timestamp) instead of block numbers.
 *         This ensures identical governance timing across Ethereum and BSC regardless
 *         of chain-specific block intervals (12s Ethereum vs ~3s BSC).
 *
 * Parameters (seconds-based after EIP-6372 clock override):
 *  - Voting delay      : 86400 s  = 1 day  (waiting period before voting starts)
 *  - Voting period     : 604800 s = 7 days (active voting window)
 *  - Proposal threshold: 500,000 MTA = 0.5% of supply (sybil resistance)
 *  - Quorum            : 4% of total delegated supply
 *  - Timelock delay    : 48 hours (MTATimelock MIN_DELAY)
 *
 * Vote types (GovernorCountingSimple):
 *  0 = Against / 1 = For / 2 = Abstain
 */
contract MTAGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    constructor(
        IVotes _token,
        TimelockController _timelock
    )
        Governor("MetaAras Governor")
        GovernorSettings(
            1 days,      // 86400 s — voting delay (EIP-6372 timestamp mode)
            7 days,      // 604800 s — voting period
            500_000e18   // 500,000 MTA proposal threshold (0.5% of total supply)
        )
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4)    // 4% quorum
        GovernorTimelockControl(_timelock)
    {}

    // ─── Required Overrides ────────────────────────────────────────────────────
    // clock() and CLOCK_MODE() are NOT overridden here — GovernorVotes delegates
    // them to MTAToken, which overrides ERC20Votes.clock() / CLOCK_MODE() with
    // "mode=timestamp". This keeps the clock definition in a single place.

    function votingDelay()
        public view override(Governor, GovernorSettings) returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public view override(Governor, GovernorSettings) returns (uint256)
    {
        return super.votingPeriod();
    }

    function quorum(uint256 timepoint)
        public view override(Governor, GovernorVotesQuorumFraction) returns (uint256)
    {
        return super.quorum(timepoint);
    }

    function state(uint256 proposalId)
        public view override(Governor, GovernorTimelockControl) returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function proposalNeedsQueuing(uint256 proposalId)
        public view override(Governor, GovernorTimelockControl) returns (bool)
    {
        return super.proposalNeedsQueuing(proposalId);
    }

    function proposalThreshold()
        public view override(Governor, GovernorSettings) returns (uint256)
    {
        return super.proposalThreshold();
    }

    function _queueOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint48) {
        return super._queueOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _executeOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._executeOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor()
        internal view override(Governor, GovernorTimelockControl) returns (address)
    {
        return super._executor();
    }
}
