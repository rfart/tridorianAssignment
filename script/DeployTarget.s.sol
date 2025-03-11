// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Script, console2} from "forge-std/Script.sol";
import {Target} from "../src/Target.sol";

contract DeployTarget is Script {
    function run() external returns (Target) {
        // Get deployment private key from environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        
        console2.log("Deploying Target contract with deployer:", deployerAddress);
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy Target contract
        Target target = new Target();
        
        // Stop broadcasting transactions
        vm.stopBroadcast();

        console2.log("Target contract deployed at:", address(target));
        
        return target;
    }
}
