// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Script, console} from "forge-std/Script.sol";
import {VotingToken} from "../src/VotingToken.sol";
import {TridorianGovernor} from "../src/TridorianGovernor.sol";
import {TimelockController} from "../lib/openzeppelin-contracts/contracts/governance/TimelockController.sol";

contract DeployGovernance is Script {
    // Config values
    uint256 public constant TIMELOCK_MIN_DELAY = 1 days;

    function run() public {
        // Begin transaction
        vm.startBroadcast();
        
        address deployer = vm.addr(vm.envUint("PRIVATE_KEY"));
        console.log("Deploying contracts with address:", deployer);
        
        // 1. Deploy VotingToken
        console.log("Deploying VotingToken...");
        VotingToken votingToken = new VotingToken(deployer);
        console.log("VotingToken deployed at:", address(votingToken));
        
        // 2. Deploy TimelockController
        console.log("Deploying TimelockController...");
        address[] memory proposers = new address[](0); // Initially empty, governor will be added as proposer later
        address[] memory executors = new address[](1);
        executors[0] = address(0); // Allow anyone to execute once a proposal passes
        
        TimelockController timelock = new TimelockController(
            TIMELOCK_MIN_DELAY,
            proposers,
            executors,
            deployer // Admin role granted to deployer initially
        );
        console.log("TimelockController deployed at:", address(timelock));
        
        // 3. Deploy TridorianGovernor
        console.log("Deploying TridorianGovernor...");
        TridorianGovernor governor = new TridorianGovernor(votingToken, timelock);
        console.log("TridorianGovernor deployed at:", address(governor));
        
        // 4. Setup TimelockController roles
        console.log("Setting up governance roles...");
        
        // Grant proposer role to the governor
        bytes32 PROPOSER_ROLE = timelock.PROPOSER_ROLE();
        timelock.grantRole(PROPOSER_ROLE, address(governor));
        
        // Revoke admin role from deployer (optional, could keep for initial setup)
        bytes32 ADMIN_ROLE = timelock.DEFAULT_ADMIN_ROLE();
        timelock.revokeRole(ADMIN_ROLE, deployer);
        
        console.log("Governance system deployed and configured successfully!");
        console.log("----------------------------------------------------");
        console.log("VotingToken:", address(votingToken));
        console.log("TimelockController:", address(timelock));
        console.log("TridorianGovernor:", address(governor));
        
        vm.stopBroadcast();
    }
}
