// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.22;

// import {Test, console} from "forge-std/Test.sol";
// import {VotingToken} from "../src/VotingToken.sol";

// contract VotingTokenTest is Test {
//     VotingToken public token;
//     address public tokenOwner;
//     address public user1;
//     address public user2;
//     uint256 public initialSupply = 1_000_000 * 10 ** 18; // 1 million tokens with 18 decimals

//     function setUp() public {
//         tokenOwner = address(1);
//         user1 = address(2);
//         user2 = address(3);
        
//         vm.startPrank(tokenOwner);
//         token = new VotingToken(tokenOwner);
//         vm.stopPrank();
//     }

//     function testInitialSupply() public {
//         assertEq(token.totalSupply(), initialSupply);
//         assertEq(token.balanceOf(tokenOwner), initialSupply);
//     }

//     function testTransfer() public {
//         uint256 amount = 1000 * 10 ** 18;
        
//         vm.startPrank(tokenOwner);
//         bool success = token.transfer(user1, amount);
//         vm.stopPrank();
        
//         assertTrue(success);
//         assertEq(token.balanceOf(user1), amount);
//         assertEq(token.balanceOf(tokenOwner), initialSupply - amount);
//     }

//     function testVotingPower() public {
//         uint256 amount = 1000 * 10 ** 18;
        
//         // Transfer tokens and check voting power
//         vm.startPrank(tokenOwner);
//         token.transfer(user1, amount);
//         vm.stopPrank();
        
//         // Delegate to self to activate voting power
//         vm.startPrank(user1);
//         token.delegate(user1);
//         vm.stopPrank();
        
//         // Move forward one block to ensure the checkpoint is created
//         vm.roll(block.number + 1);
        
//         // Check voting power
//         assertEq(token.getVotes(user1), amount);
//     }

//     function testDelegation() public {
//         uint256 amount = 1000 * 10 ** 18;
        
//         // Transfer tokens to user1
//         vm.startPrank(tokenOwner);
//         token.transfer(user1, amount);
//         vm.stopPrank();
        
//         // User1 delegates to user2
//         vm.startPrank(user1);
//         token.delegate(user2);
//         vm.stopPrank();
        
//         // Move forward one block
//         vm.roll(block.number + 1);
        
//         // Check voting power
//         assertEq(token.getVotes(user1), 0);
//         assertEq(token.getVotes(user2), amount);
//     }

//     function testPastVotingPower() public {
//         uint256 amount = 1000 * 10 ** 18;
        
//         // Transfer tokens to user1
//         vm.startPrank(tokenOwner);
//         token.transfer(user1, amount);
//         vm.stopPrank();
        
//         // User1 delegates to self
//         vm.startPrank(user1);
//         token.delegate(user1);
//         vm.stopPrank();
        
//         uint256 blockNumber = block.number;
        
//         // Move forward several blocks
//         vm.roll(block.number + 10);
        
//         // Check past voting power at the specific block
//         assertEq(token.getPastVotes(user1, blockNumber), amount);
//     }
// }
