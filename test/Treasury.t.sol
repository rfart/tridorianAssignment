// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.22;

// import {Test, console} from "forge-std/Test.sol";
// import {Treasury} from "../src/Treasury.sol";

// contract TreasuryTest is Test {
//     Treasury public treasury;
    
//     address public owner = address(this);
//     address public user1 = address(0x1);
//     address public user2 = address(0x2);

//     function setUp() public {
//         // Deploy the treasury contract
//         treasury = new Treasury();
        
//         // Fund users with ETH
//         vm.deal(user1, 10 ether);
//         vm.deal(user2, 10 ether);
//     }

//     function testETHDeposit() public {
//         // User1 sends ETH to the treasury
//         vm.prank(user1);
//         (bool success,) = address(treasury).call{value: 1 ether}("");
//         assertTrue(success);
        
//         // Check treasury balance
//         assertEq(address(treasury).balance, 1 ether);
        
//         // Check transaction was recorded
//         Treasury.Transaction memory tx = treasury.transactions(0);
//         assertEq(tx.sender, user1);
//         assertEq(tx.recipient, address(this));
//         assertEq(tx.amount, 1 ether);
//         assertEq(tx.transactionType, "deposit");
//     }

//     function testFallbackDeposit() public {
//         // User1 sends ETH to the treasury using the fallback function
//         vm.prank(user1);
//         (bool success,) = address(treasury).call{value: 1 ether}(hex"12345678"); // random calldata
//         assertTrue(success);
        
//         // Check treasury balance
//         assertEq(address(treasury).balance, 1 ether);
        
//         // Check transaction was recorded
//         Treasury.Transaction memory tx = treasury.transactions(0);
//         assertEq(tx.sender, user1);
//         assertEq(tx.amount, 1 ether);
//         assertEq(tx.transactionType, "deposit");
//     }

//     function testZeroValueDeposit() public {
//         // User1 tries to send 0 ETH
//         vm.prank(user1);
//         (bool success,) = address(treasury).call{value: 0}("");
//         assertFalse(success);
        
//         // Check treasury balance remains 0
//         assertEq(address(treasury).balance, 0);
//     }

//     function testWithdrawal() public {
//         // First deposit some ETH
//         vm.prank(user1);
//         (bool depositSuccess,) = address(treasury).call{value: 1 ether}("");
//         assertTrue(depositSuccess);
        
//         // Check initial balance of user2
//         uint256 initialBalance = user2.balance;
        
//         // Treasury owner withdraws ETH to user2
//         treasury.withdraw(payable(user2), 0.5 ether);
        
//         // Check balances
//         assertEq(address(treasury).balance, 0.5 ether);
//         assertEq(user2.balance, initialBalance + 0.5 ether);
        
//         // Check transaction was recorded
//         Treasury.Transaction memory tx = treasury.transactions(1);
//         assertEq(tx.sender, address(treasury));
//         assertEq(tx.recipient, user2);
//         assertEq(tx.amount, 0.5 ether);
//         assertEq(tx.transactionType, "withdrawal");
//     }

//     function testOnlyOwnerCanWithdraw() public {
//         // First deposit some ETH
//         vm.prank(user1);
//         (bool success,) = address(treasury).call{value: 1 ether}("");
//         assertTrue(success);
        
//         // Try to withdraw as non-owner
//         vm.prank(user1);
//         vm.expectRevert("Ownable: caller is not the owner");
//         treasury.withdraw(payable(user2), 0.5 ether);
//     }

//     function testGetBalance() public {
//         // First deposit some ETH
//         vm.prank(user1);
//         (bool success,) = address(treasury).call{value: 1 ether}("");
//         assertTrue(success);
        
//         assertEq(treasury.getBalance(), 1 ether);
//     }

//     function testGetTransactions() public {
//         // Create several transactions
//         vm.prank(user1);
//         (bool success1,) = address(treasury).call{value: 1 ether}("");
//         assertTrue(success1);
        
//         vm.prank(user2);
//         (bool success2,) = address(treasury).call{value: 2 ether}("");
//         assertTrue(success2);
        
//         treasury.withdraw(payable(user1), 0.5 ether);
        
//         // Get transaction count
//         assertEq(treasury.getTransactionCount(), 3);
        
//         // Get a subset of transactions
//         Treasury.Transaction[] memory txs = treasury.getTransactions(1, 2);
//         assertEq(txs.length, 2);
//         assertEq(txs[0].amount, 2 ether);
//         assertEq(txs[1].amount, 0.5 ether);
//     }

//     function testInsufficientBalance() public {
//         // First deposit some ETH
//         vm.prank(user1);
//         (bool success,) = address(treasury).call{value: 1 ether}("");
//         assertTrue(success);
        
//         // Try to withdraw more than balance
//         vm.expectRevert("Insufficient ETH balance");
//         treasury.withdraw(payable(user2), 2 ether);
//     }

//     function testExplicitDeposit() public {
//         // User1 uses the explicit deposit function
//         vm.prank(user1);
//         treasury.deposit{value: 1 ether}();
        
//         // Check treasury balance
//         assertEq(address(treasury).balance, 1 ether);
        
//         // Check transaction was recorded
//         Treasury.Transaction memory tx = treasury.transactions(0);
//         assertEq(tx.sender, user1);
//         assertEq(tx.recipient, address(this));
//         assertEq(tx.amount, 1 ether);
//         assertEq(tx.transactionType, "deposit");
//     }
// }
