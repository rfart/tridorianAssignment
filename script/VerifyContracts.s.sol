// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.22;

// import {Script, console2} from "forge-std/Script.sol";

// contract VerifyContracts is Script {
//     function run() external {
//         // Get contract addresses from environment variables
//         address votingTokenAddress = vm.envAddress("VOTING_TOKEN_ADDRESS");
//         address timelockAddress = vm.envAddress("TIMELOCK_ADDRESS");
//         address governorAddress = vm.envAddress("GOVERNOR_ADDRESS");
        
//         // Get deployer address for verification
//         address deployerAddress = vm.addr(vm.envUint("PRIVATE_KEY"));

//         console2.log("Starting contract verification...");
        
//         // Verify VotingToken
//         if (votingTokenAddress != address(0)) {
//             console2.log("Verifying VotingToken at:", votingTokenAddress);
//             string[] memory votingTokenArgs = new string[](4);
//             votingTokenArgs[0] = "verify-contract";
//             votingTokenArgs[1] = "--constructor-args";
//             votingTokenArgs[2] = abi.encode(deployerAddress);
//             votingTokenArgs[3] = string.concat(votingTokenAddress, ":src/VotingToken.sol:VotingToken");
            
//             vm.ffi(votingTokenArgs);
//         }
        
//         // Verify TimelockController
//         if (timelockAddress != address(0)) {
//             console2.log("Verifying TimelockController at:", timelockAddress);
            
//             // Create proposers array
//             address[] memory proposers = new address[](1);
//             proposers[0] = deployerAddress;
            
//             // Empty executors array
//             address[] memory executors = new address[](0);
            
//             string[] memory timelockArgs = new string[](4);
//             timelockArgs[0] = "verify-contract";
//             timelockArgs[1] = "--constructor-args";
//             timelockArgs[2] = abi.encode(uint256(1 days), proposers, executors, deployerAddress);
//             timelockArgs[3] = string.concat(timelockAddress, ":@openzeppelin/contracts/governance/TimelockController.sol:TimelockController");
            
//             vm.ffi(timelockArgs);
//         }
        
//         // Verify TridorianGovernor
//         if (governorAddress != address(0)) {
//             console2.log("Verifying TridorianGovernor at:", governorAddress);
//             string[] memory governorArgs = new string[](4);
//             governorArgs[0] = "verify-contract";
//             governorArgs[1] = "--constructor-args";
//             governorArgs[2] = abi.encode(votingTokenAddress, timelockAddress);
//             governorArgs[3] = string.concat(governorAddress, ":src/TridorianGovernor.sol:TridorianGovernor");
            
//             vm.ffi(governorArgs);
//         }
        
//         console2.log("Contract verification completed!");
//     }
// }
