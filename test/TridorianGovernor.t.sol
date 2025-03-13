// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Test, console} from "forge-std/Test.sol";
import {TridorianGovernor} from "../src/TridorianGovernor.sol";
import {VotingToken} from "../src/VotingToken.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {IGovernor} from "@openzeppelin/contracts/governance/IGovernor.sol";

contract MockContract {
    uint256 public value;
    
    function setValue(uint256 _value) external {
        value = _value;
    }
}

contract TridorianGovernorTest is Test {
    TridorianGovernor public governor;
    VotingToken public token;
    TimelockController public timelock;
    MockContract public mockContract;
    
    address public admin;
    address public proposer;
    address public voter1;
    address public voter2;
    address public executor;
    address public nonDelegated;
    
    uint256 public initialSupply = 1_000_000 * 10 ** 18;
    uint256 public proposalId;
    
    // Values for proposal
    address[] targets = new address[](1);
    uint256[] values = new uint256[](1);
    bytes[] calldatas = new bytes[](1);
    string description = "Set value to 42 in mock contract";
    
    function setUp() public {
        admin = address(1);
        proposer = address(2);
        voter1 = address(3);
        voter2 = address(4);
        executor = address(5);
        nonDelegated = address(6);
        
        vm.startPrank(admin);
        
        // Deploy the token
        token = new VotingToken(admin);
        
        // Setup timelock roles
        address[] memory proposers = new address[](1);
        address[] memory executors = new address[](1);
        proposers[0] = address(0); // Will be replaced by governor
        executors[0] = address(0); // Allow anyone to execute
        
        // Deploy the timelock
        timelock = new TimelockController(
            1 minutes, // Min delay
            proposers,
            executors,
            admin
        );
        
        // Deploy the governor
        governor = new TridorianGovernor(token, timelock);
        
        // Grant proposer role to the governor
        timelock.grantRole(timelock.PROPOSER_ROLE(), address(governor));
        timelock.grantRole(timelock.CANCELLER_ROLE(), address(governor));
        
        // Deploy a mock contract for testing proposals
        mockContract = new MockContract();
        
        // Distribute tokens and delegate voting power
        token.transfer(proposer, 100_000 * 10 ** 18);
        token.transfer(voter1, 400_000 * 10 ** 18);  // 40% of supply
        token.transfer(voter2, 50_000 * 10 ** 18);
        token.transfer(nonDelegated, 10_000 * 10 ** 18); // User with tokens but no delegation
        
        vm.stopPrank();
        
        // Set up users' voting power
        vm.startPrank(proposer);
        token.delegate(proposer);
        vm.stopPrank();
        
        vm.startPrank(voter1);
        token.delegate(voter1);
        vm.stopPrank();
        
        vm.startPrank(voter2);
        token.delegate(voter2);
        vm.stopPrank();
        
        // Prepare proposal data
        targets[0] = address(mockContract);
        values[0] = 0;
        calldatas[0] = abi.encodeWithSelector(MockContract.setValue.selector, 42);
        
        // Move forward a block for checkpoints to be effective
        vm.roll(block.number + 1);
    }
    
    function testCreateProposal() public {
        vm.startPrank(proposer);
        
        // Create proposal
        proposalId = governor.propose(targets, values, calldatas, description);
        
        vm.stopPrank();
        
        // Verify proposal was created with expected state
        assertEq(uint256(governor.state(proposalId)), uint256(IGovernor.ProposalState.Pending));
    }
    
    function testFailProposalNoVotes() public {
        // Test that trying to propose without delegation fails
        vm.startPrank(nonDelegated);
        // This should fail because nonDelegated has tokens but hasn't delegated
        governor.propose(targets, values, calldatas, description);
        vm.stopPrank();
    }
    
    function testFailProposalInvalidArguments() public {
        vm.startPrank(proposer);
        
        // Test with empty targets
        address[] memory emptyTargets = new address[](0);
        vm.expectRevert();
        governor.propose(emptyTargets, values, calldatas, description);
        
        // Test with mismatched arrays
        address[] memory moreTargets = new address[](2);
        moreTargets[0] = address(mockContract);
        moreTargets[1] = address(this);
        vm.expectRevert();
        governor.propose(moreTargets, values, calldatas, description);
        
        // Test with empty description
        vm.expectRevert();
        governor.propose(targets, values, calldatas, "");
        
        vm.stopPrank();
    }
    
    function testProposalThresholdWithDifferentUsers() public {
        // Get the proposal threshold
        uint256 threshold = governor.proposalThreshold();
        console.log("Proposal threshold:", threshold);
        
        // Log voting powers
        uint256 proposerVotes = token.getVotes(proposer);
        uint256 voter1Votes = token.getVotes(voter1);
        uint256 voter2Votes = token.getVotes(voter2);
        uint256 nonDelegatedVotes = token.getVotes(nonDelegated);
        
        console.log("Proposer voting power:", proposerVotes);
        console.log("Voter1 voting power:", voter1Votes);
        console.log("Voter2 voting power:", voter2Votes);
        console.log("NonDelegated voting power:", nonDelegatedVotes);
        
        // Test proposer can create proposal (has enough votes)
        vm.startPrank(proposer);
        uint256 pid1 = governor.propose(targets, values, calldatas, "Proposal by proposer");
        vm.stopPrank();
        assertEq(uint256(governor.state(pid1)), uint256(IGovernor.ProposalState.Pending));
        
        // Test voter1 can create proposal (has enough votes)
        vm.startPrank(voter1);
        uint256 pid2 = governor.propose(targets, values, calldatas, "Proposal by voter1");
        vm.stopPrank();
        assertEq(uint256(governor.state(pid2)), uint256(IGovernor.ProposalState.Pending));
        
        // Test voter2 can create proposal (has enough votes)
        vm.startPrank(voter2);
        uint256 pid3 = governor.propose(targets, values, calldatas, "Proposal by voter2");
        vm.stopPrank();
        assertEq(uint256(governor.state(pid3)), uint256(IGovernor.ProposalState.Pending));
    }
    
    function testProposalCalldata() public {
        // Test different calldata types
        
        // 1. Empty calldata
        bytes[] memory emptyCalldata = new bytes[](1);
        emptyCalldata[0] = bytes("");
        
        vm.startPrank(proposer);
        vm.expectRevert(); // Should revert with empty calldata
        governor.propose(targets, values, emptyCalldata, "Empty calldata proposal");
        vm.stopPrank();
        
        // 2. Invalid calldata (wrong signature)
        bytes[] memory invalidCalldata = new bytes[](1);
        invalidCalldata[0] = abi.encodeWithSignature("nonExistingFunction()", 0);
        
        vm.startPrank(proposer);
        uint256 pid = governor.propose(targets, values, invalidCalldata, "Invalid calldata proposal");
        vm.stopPrank();
        
        // This should create the proposal, but execution would fail later
        assertEq(uint256(governor.state(pid)), uint256(IGovernor.ProposalState.Pending));
        
        // 3. Valid calldata with different parameter value
        bytes[] memory differentCalldata = new bytes[](1);
        differentCalldata[0] = abi.encodeWithSelector(MockContract.setValue.selector, 100);
        
        vm.startPrank(proposer);
        uint256 pid2 = governor.propose(targets, values, differentCalldata, "Different value calldata");
        vm.stopPrank();
        
        assertEq(uint256(governor.state(pid2)), uint256(IGovernor.ProposalState.Pending));
    }
    
    function testVotingWorkflow() public {
        // Create proposal
        vm.startPrank(proposer);
        proposalId = governor.propose(targets, values, calldatas, description);
        vm.stopPrank();
        
        // Check proposal is pending
        assertEq(uint256(governor.state(proposalId)), uint256(IGovernor.ProposalState.Pending));
        
        // Move forward past voting delay
        vm.warp(block.timestamp + governor.votingDelay() + 1);
        vm.roll(block.number + 1);
        
        // Check proposal is active
        assertEq(uint256(governor.state(proposalId)), uint256(IGovernor.ProposalState.Active));
        
        // Cast votes
        vm.startPrank(voter1);
        governor.castVote(proposalId, 1); // Vote in favor (1 = For)
        vm.stopPrank();
        
        vm.startPrank(voter2);
        governor.castVote(proposalId, 0); // Vote against (0 = Against)
        vm.stopPrank();
        
        // Move forward past voting period
        vm.warp(block.timestamp + governor.votingPeriod() + 1);
        vm.roll(block.number + 1);
        
        // Check proposal is succeeded (voter1 has 40% which is > quorum of 4%)
        assertEq(uint256(governor.state(proposalId)), uint256(IGovernor.ProposalState.Succeeded));
        
        // Queue the proposal
        bytes32 descriptionHash = keccak256(bytes(description));
        vm.startPrank(proposer);
        governor.queue(targets, values, calldatas, descriptionHash);
        vm.stopPrank();
        
        assertEq(uint256(governor.state(proposalId)), uint256(IGovernor.ProposalState.Queued));
        
        // Move forward past timelock delay
        vm.warp(block.timestamp + 1 minutes + 1);
        
        // Execute the proposal
        vm.startPrank(executor);
        governor.execute(targets, values, calldatas, descriptionHash);
        vm.stopPrank();
        
        // Check proposal is executed
        assertEq(uint256(governor.state(proposalId)), uint256(IGovernor.ProposalState.Executed));
        
        // Check that the mock contract's value was updated
        assertEq(mockContract.value(), 42);
    }
    
    function testQuorum() public {
        // First roll the blockchain to have some history
        vm.roll(block.number + 5);
        
        // Create proposal
        vm.startPrank(proposer);
        proposalId = governor.propose(targets, values, calldatas, description);
        vm.stopPrank();
        
        // Check quorum for a past block (current block - 1)
        uint256 blockNumberForQuorum = block.number - 1;
        uint256 quorum = governor.quorum(blockNumberForQuorum);
        uint256 expectedQuorum = (initialSupply * 4) / 100; // 4% of initial supply
        assertEq(quorum, expectedQuorum);
        
        // Move forward past voting delay
        vm.warp(block.timestamp + governor.votingDelay() + 1);
        vm.roll(block.number + 1);
        
        // Just voter2 votes (not enough for quorum)
        vm.startPrank(voter2);
        governor.castVote(proposalId, 1); // Vote in favor
        vm.stopPrank();
        
        // Move forward past voting period
        vm.warp(block.timestamp + governor.votingPeriod() + 1);
        vm.roll(block.number + 1);
        
        // Check proposal is defeated (not enough votes for quorum)
        assertEq(uint256(governor.state(proposalId)), uint256(IGovernor.ProposalState.Defeated));
    }
    
    function testActiveProposalTracking() public {
        // Check that there are no active proposals initially
        uint256[] memory activePropsList = governor.getActiveProposals();
        assertEq(activePropsList.length, 0);
        
        // Create proposal
        vm.startPrank(proposer);
        uint256 newProposalId = governor.propose(targets, values, calldatas, description);
        vm.stopPrank();
        
        // Check that the active proposals list is updated
        activePropsList = governor.getActiveProposals();
        assertEq(activePropsList.length, 1);
        assertEq(activePropsList[0], newProposalId);
        assertTrue(governor.isProposalActive(newProposalId));
        
        // First move past voting delay to make proposal active
        vm.warp(block.timestamp + governor.votingDelay() + 1);
        vm.roll(block.number + 5);
        
        // Vote to ensure proposal passes
        vm.startPrank(voter1);
        governor.castVote(newProposalId, 1); // Vote in favor
        vm.stopPrank();
        
        // Then move past voting period to make it succeeded
        vm.warp(block.timestamp + governor.votingPeriod() + 1);
        vm.roll(block.number + 5);
        
        // Check that proposal is now in Succeeded state
        assertEq(uint256(governor.state(newProposalId)), uint256(IGovernor.ProposalState.Succeeded));
        
        // Queue the proposal
        bytes32 descriptionHash = keccak256(bytes(description));
        vm.startPrank(proposer);
        governor.queue(targets, values, calldatas, descriptionHash);
        vm.stopPrank();
        
        // Check that the active proposals list is empty after queueing
        activePropsList = governor.getActiveProposals();
        assertEq(activePropsList.length, 0);
        assertFalse(governor.isProposalActive(newProposalId));
    }
    
    function testActiveProposalCancelation() public {
        // Create proposal
        vm.startPrank(proposer);
        uint256 newProposalId = governor.propose(targets, values, calldatas, description);
        
        // Check that the proposal is active
        uint256[] memory activePropsList = governor.getActiveProposals();
        assertEq(activePropsList.length, 1);
        assertEq(activePropsList[0], newProposalId);
        assertTrue(governor.isProposalActive(newProposalId));
        
        // Cancel the proposal (only possible in Pending state, which is fine)
        bytes32 descriptionHash = keccak256(bytes(description));
        governor.cancel(targets, values, calldatas, descriptionHash);
        vm.stopPrank();
        
        // Check that the active proposals list is cleared
        activePropsList = governor.getActiveProposals();
        assertEq(activePropsList.length, 0);
        assertFalse(governor.isProposalActive(newProposalId));
    }
    
    function testActiveProposalMultiple() public {
        // Create first proposal
        vm.startPrank(proposer);
        uint256 firstProposalId = governor.propose(targets, values, calldatas, "First proposal");
        vm.stopPrank();
        
        // Check that the active proposal is set to the first proposal
        uint256[] memory activePropsList = governor.getActiveProposals();
        assertEq(activePropsList.length, 1);
        assertEq(activePropsList[0], firstProposalId);
        assertTrue(governor.isProposalActive(firstProposalId));
        
        // First move past voting delay to make proposal active
        vm.warp(block.timestamp + governor.votingDelay() + 1);
        vm.roll(block.number + 5);
        
        // Vote on first proposal
        vm.startPrank(voter1);
        governor.castVote(firstProposalId, 1); // Vote in favor
        vm.stopPrank();
        
        // Then move past voting period to make it succeeded
        vm.warp(block.timestamp + governor.votingPeriod() + 1);
        vm.roll(block.number + 5);
        
        // Check that proposal is now in Succeeded state
        assertEq(uint256(governor.state(firstProposalId)), uint256(IGovernor.ProposalState.Succeeded));
        
        // Queue first proposal
        bytes32 firstDescriptionHash = keccak256(bytes("First proposal"));
        vm.startPrank(proposer);
        governor.queue(targets, values, calldatas, firstDescriptionHash);
        
        // Check that active proposal is cleared
        activePropsList = governor.getActiveProposals();
        assertEq(activePropsList.length, 0);
        
        // Create second proposal
        uint256 secondProposalId = governor.propose(targets, values, calldatas, "Second proposal");
        vm.stopPrank();
        
        // Check that active proposal is now the second one
        activePropsList = governor.getActiveProposals();
        assertEq(activePropsList.length, 1);
        assertEq(activePropsList[0], secondProposalId);
        assertTrue(governor.isProposalActive(secondProposalId));
    }

    function testCalldataEncoding() public {
        // This test verifies that calldata is properly encoded
        
        // Create a proposal with explicit calldata encoding
        bytes memory correctCalldata = abi.encodeWithSelector(
            MockContract.setValue.selector, 
            42
        );
        
        bytes[] memory correctCalldatas = new bytes[](1);
        correctCalldatas[0] = correctCalldata;
        
        console.log("Correct calldata length:", correctCalldata.length);
        
        vm.startPrank(proposer);
        uint256 newProposalId = governor.propose(targets, values, correctCalldatas, "Explicit calldata encoding");
        vm.stopPrank();
        
        // Verify the proposal was created successfully
        assertEq(uint256(governor.state(newProposalId)), uint256(IGovernor.ProposalState.Pending));
        
        // Now complete the flow to verify execution works
        vm.warp(block.timestamp + governor.votingDelay() + 1);
        vm.roll(block.number + 5);
        
        vm.startPrank(voter1);
        governor.castVote(newProposalId, 1); // Vote in favor
        vm.stopPrank();
        
        vm.warp(block.timestamp + governor.votingPeriod() + 1);
        vm.roll(block.number + 5);
        
        bytes32 descHash = keccak256(bytes("Explicit calldata encoding"));
        vm.startPrank(proposer);
        governor.queue(targets, values, correctCalldatas, descHash);
        vm.stopPrank();
        
        vm.warp(block.timestamp + 1 minutes + 1);
        
        vm.startPrank(executor);
        governor.execute(targets, values, correctCalldatas, descHash);
        vm.stopPrank();
        
        // Verify execution was successful
        assertEq(mockContract.value(), 42);
    }
}
