// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.28;

import {Governor} from "@openzeppelin/contracts/governance/Governor.sol";
import {GovernorCountingSimple} from "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import {GovernorSettings} from "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import {GovernorStorage} from "@openzeppelin/contracts/governance/extensions/GovernorStorage.sol";
import {GovernorTimelockControl} from "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import {GovernorVotes} from "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import {GovernorVotesQuorumFraction} from "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";

contract TridorianGovernor is Governor, GovernorSettings, GovernorCountingSimple, GovernorStorage, GovernorVotes, GovernorVotesQuorumFraction, GovernorTimelockControl {
    // Variables to track active proposals
    uint256[] public activeProposals;
    
    // Mapping to check if a proposal is active (for efficient lookup)
    mapping(uint256 => bool) private _isProposalActive;

    constructor(IVotes _token, TimelockController _timelock)
        Governor("TridorianGovernor")
        GovernorSettings(1 minutes, 10 minutes, 0)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4)
        GovernorTimelockControl(_timelock)
    {}

    /**
     * @dev Returns all currently active proposal IDs.
     * @return Array of active proposal IDs
     */
    function getActiveProposals() public view returns (uint256[] memory) {
        return activeProposals;
    }

    /**
     * @dev Returns the number of active proposals.
     * @return The number of active proposals
     */
    function activeProposalsLength() public view returns (uint256) {
        return activeProposals.length;
    }
    
    /**
     * @dev Checks if a specific proposal is active
     * @param proposalId The ID of the proposal to check
     * @return True if the proposal is active, false otherwise
     */
    function isProposalActive(uint256 proposalId) public view returns (bool) {
        return _isProposalActive[proposalId];
    }

    // The following functions are overrides required by Solidity.

    function votingDelay()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(Governor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function proposalNeedsQueuing(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.proposalNeedsQueuing(proposalId);
    }

    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    function _propose(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, string memory description, address proposer)
        internal
        override(Governor, GovernorStorage)
        returns (uint256)
    {
        uint256 proposalId = super._propose(targets, values, calldatas, description, proposer);
        
        // Add to active proposals 
        activeProposals.push(proposalId);
        _isProposalActive[proposalId] = true;
        
        return proposalId;
    }

    function _queueOperations(uint256 proposalId, address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
        internal
        override(Governor, GovernorTimelockControl)
        returns (uint48)
    {
        // If the proposal is active, remove it from active proposals
        if (_isProposalActive[proposalId]) {
            _removeProposal(proposalId);
        }
        
        return super._queueOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _executeOperations(uint256 proposalId, address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
        internal
        override(Governor, GovernorTimelockControl)
    {
        super._executeOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
        internal
        override(Governor, GovernorTimelockControl)
        returns (uint256)
    {
        uint256 proposalId = super._cancel(targets, values, calldatas, descriptionHash);
        
        // If the proposal is active, remove it from active proposals
        if (_isProposalActive[proposalId]) {
            _removeProposal(proposalId);
        }
        
        return proposalId;
    }

    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }
    
    /**
     * @dev Internal helper to remove a proposal from the active proposals array
     * @param proposalId The ID of the proposal to remove
     */
    function _removeProposal(uint256 proposalId) internal {
        // Mark as not active
        _isProposalActive[proposalId] = false;
        
        // Find and remove from array
        uint256 _length = activeProposals.length;
        for (uint256 i; i < _length;) {
            if (activeProposals[i] == proposalId) {
                // Replace with last element and pop
                activeProposals[i] = activeProposals[activeProposals.length - 1];
                activeProposals.pop();
                break;
            }
            unchecked {
                ++i;
            }
        }
    }
}
