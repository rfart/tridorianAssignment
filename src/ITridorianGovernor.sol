// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.28;

import {IGovernor} from "@openzeppelin/contracts/governance/IGovernor.sol";

/**
 * @title ITridorianGovernor
 * @dev Interface for the TridorianGovernor contract
 */
interface ITridorianGovernor is IGovernor {
    /**
     * @dev Returns all currently active proposal IDs.
     * @return Array of active proposal IDs
     */
    function getActiveProposals() external view returns (uint256[] memory);

    /**
     * @dev Returns the number of active proposals.
     * @return The number of active proposals
     */
    function activeProposalsLength() external view returns (uint256);
    
    /**
     * @dev Checks if a specific proposal is active
     * @param proposalId The ID of the proposal to check
     * @return True if the proposal is active, false otherwise
     */
    function isProposalActive(uint256 proposalId) external view returns (bool);
    
    /**
     * @dev Returns the active proposals array
     */
    function activeProposals(uint256 index) external view returns (uint256);

    /**
     * @dev See {Governor-votingDelay}
     */
    function votingDelay() external view override returns (uint256);

    /**
     * @dev See {Governor-votingPeriod}
     */
    function votingPeriod() external view override returns (uint256);

    /**
     * @dev See {Governor-quorum}
     */
    function quorum(uint256 blockNumber) external view override returns (uint256);

    /**
     * @dev See {Governor-state}
     */
    function state(uint256 proposalId) external view override returns (ProposalState);

    /**
     * @dev See {Governor-proposalNeedsQueuing}
     */
    function proposalNeedsQueuing(uint256 proposalId) external view returns (bool);

    /**
     * @dev See {Governor-proposalThreshold}
     */
    function proposalThreshold() external view override returns (uint256);
}
