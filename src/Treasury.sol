// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Treasury
 * @dev A simple treasury contract for DAO funds that only accepts ETH deposits
 * and can only be withdrawn through governance
 */
contract Treasury is Ownable {
    // Transaction struct to track treasury activity
    struct Transaction {
        address sender;
        address recipient;
        uint256 amount;
        uint256 timestamp;
        string transactionType; // "deposit" or "withdrawal"
    }
    
    // Array to store all transactions
    Transaction[] public transactions;

    // Events
    event Deposit(address indexed sender, uint256 amount);
    event Withdrawal(address indexed recipient, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Internal function to handle deposits
     */
    function _deposit(address sender, uint256 amount) internal {
        require(amount > 0, "Amount must be greater than 0");
        
        // Record the transaction when receiving ETH
        transactions.push(Transaction({
            sender: sender,
            recipient: address(this),
            amount: amount,
            timestamp: block.timestamp,
            transactionType: "deposit"
        }));
        
        emit Deposit(sender, amount);
    }

    /**
     * @dev Receive ETH 
     */
    receive() external payable {
        _deposit(msg.sender, msg.value);
    }

    /**
     * @dev Fallback function to also receive ETH
     */
    fallback() external payable {
        _deposit(msg.sender, msg.value);
    }

    /**
     * @dev Public function to deposit ETH
     */
    function deposit() external payable {
        _deposit(msg.sender, msg.value);
    }

    /**
     * @dev Withdraw ETH from the treasury (only callable by owner/governance)
     * @param recipient The address to send the ETH to
     * @param amount The amount of ETH to withdraw
     */
    function withdraw(address payable recipient, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(recipient != address(0), "Cannot withdraw to zero address");
        require(address(this).balance >= amount, "Insufficient ETH balance");
        
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "ETH transfer failed");
        
        // Record the transaction
        transactions.push(Transaction({
            sender: address(this),
            recipient: recipient,
            amount: amount,
            timestamp: block.timestamp,
            transactionType: "withdrawal"
        }));
        
        emit Withdrawal(recipient, amount);
    }

    /**
     * @dev Get the ETH balance of the treasury
     * @return The ETH balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Get the number of transactions
     * @return The number of transactions
     */
    function getTransactionCount() external view returns (uint256) {
        return transactions.length;
    }

    /**
     * @dev Get a range of transactions
     * @param startIndex The starting index
     * @param count The number of transactions to retrieve
     * @return An array of transactions
     */
    function getTransactions(uint256 startIndex, uint256 count) external view returns (Transaction[] memory) {
        require(startIndex < transactions.length, "Start index out of bounds");
        
        // Adjust count if it exceeds the array bounds
        if (startIndex + count > transactions.length) {
            count = transactions.length - startIndex;
        }
        
        Transaction[] memory result = new Transaction[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = transactions[startIndex + i];
        }
        
        return result;
    }
}
