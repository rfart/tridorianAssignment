// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Script, console2} from "forge-std/Script.sol";
import {VotingToken} from "../src/VotingToken.sol";

contract DeployVotingToken is Script {
    function run() external returns (VotingToken) {
        // Get deployment private key from environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        
        console2.log("Deploying VotingToken with deployer:", deployerAddress);
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy VotingToken with the deployer as the recipient
        VotingToken votingToken = new VotingToken(deployerAddress);
        
        // Stop broadcasting transactions
        vm.stopBroadcast();

        console2.log("VotingToken deployed at:", address(votingToken));
        
        return votingToken;
    }
}
