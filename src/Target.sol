// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

contract Target {
    uint256 private _value;
    address public owner;
    
    event ValueUpdated(uint256 oldValue, uint256 newValue, address updater);
    
    constructor() {
        owner = msg.sender;
        _value = 0;
    }
    
    /**
     * @dev Update the stored uint value
     * @param newValue The new value to store
     */
    function updateValue(uint256 newValue) public {
        uint256 oldValue = _value;
        _value = newValue;
        
        emit ValueUpdated(oldValue, newValue, msg.sender);
    }
    
    /**
     * @dev Get the current stored value
     * @return The current stored value
     */
    function getValue() public view returns (uint256) {
        return _value;
    }
    
    /**
     * @dev Restricted function that only the owner can call
     * @param newOwner The new owner address
     */
    function transferOwnership(address newOwner) public {
        require(msg.sender == owner, "Only owner can transfer ownership");
        require(newOwner != address(0), "New owner cannot be the zero address");
        
        owner = newOwner;
    }

    fallback() external payable {

    }

    receive() external payable {

    }
}
