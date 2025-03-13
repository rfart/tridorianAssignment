// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Script, console2} from "forge-std/Script.sol";
import {TridorianGovernor} from "../src/TridorianGovernor.sol";
import {VotingToken} from "../src/VotingToken.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";

contract DeployTridorianGovernor is Script {
    function run() external returns (TridorianGovernor) {
        // Get deployment private key from environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        
        console2.log("Deployer address:", deployerAddress);

        // Optional: use an existing voting token if its address is provided
        address votingTokenAddress = vm.envOr("VOTING_TOKEN_ADDRESS", address(0));
        VotingToken votingToken;

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // If voting token address is not provided, deploy a new one
        if (votingTokenAddress == address(0)) {
            console2.log("Deploying new VotingToken");
            votingToken = new VotingToken(deployerAddress);
            console2.log("VotingToken deployed at:", address(votingToken));
        } else {
            console2.log("Using existing VotingToken at:", votingTokenAddress);
            votingToken = VotingToken(votingTokenAddress);
        }
        
        // Deploy TimelockController
        // Parameters: 
        // - minDelay: Minimum delay for executing transactions (1 day)
        // - proposers: List of addresses that can propose (initially only deployer)
        // - executors: List of addresses that can execute (initially empty array - meaning anyone can execute)
        // - admin: Address that can grant and revoke roles (initially deployer)
        address[] memory proposers = new address[](1);
        proposers[0] = deployerAddress;
        
        address[] memory executors = new address[](0);
        
        TimelockController timelock = new TimelockController(
            1 minutes,    // 1 day minimum delay
            proposers, // Proposers
            executors, // Executors (empty array means anyone can execute)
            deployerAddress  // Admin
        );
        
        console2.log("TimelockController deployed at:", address(timelock));
        
        // Deploy TridorianGovernor
        TridorianGovernor governor = new TridorianGovernor(
            votingToken,
            timelock
        );
        
        // Grant PROPOSER_ROLE to the Governor
        bytes32 PROPOSER_ROLE = timelock.PROPOSER_ROLE();
        timelock.grantRole(PROPOSER_ROLE, address(governor));
        
        // Optionally revoke admin role from the deployer if you want the timelock to be controlled only by governance
        // Uncomment the following line to do this:
        // timelock.revokeRole(timelock.DEFAULT_ADMIN_ROLE(), deployerAddress);
        
        vm.stopBroadcast();
        
        console2.log("TridorianGovernor deployed at:", address(governor));
        
        return governor;
    }
}
