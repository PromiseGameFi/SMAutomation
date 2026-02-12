// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ISmartExecutor {
    function execute(uint256 _ruleId) external;
}

contract ReactiveExecutor {
    ISmartExecutor public immutable smartExecutor;
    address public owner;
    
    event Reacted(uint256 ruleId, address trigger, uint256 value);
    event ReactDebug(string message);
    event ReactData(bytes data);

    constructor(address _smartExecutor) {
        smartExecutor = ISmartExecutor(_smartExecutor);
        owner = msg.sender;
    }

    // Standard Somnia Callback Signature (Inferred from generic patterns)
    // We allow setting the selector, so we define this specific function.
    function react(
        bytes32[] calldata topics, 
        bytes calldata data, 
        bytes[] calldata simulationResults
    ) external {
        emit ReactDebug("React called!");
        
        // 1. Parse Event Data (Transfer)
        // Topic 0: Keccak256("Transfer(address,address,uint256)")
        // Topic 1: from
        // Topic 2: to
        // Data: value
        
        // Basic check for Transfer event signature
        if (topics.length < 3) return;
        
        // address from = address(uint160(uint256(topics[1])));
        // address to = address(uint160(uint256(topics[2])));
        uint256 value = abi.decode(data, (uint256));
        
        emit Reacted(0, msg.sender, value);

        // 2. Logic Check (e.g. Value > 0.01 ether)
        if (value > 0.01 ether) {
            emit ReactDebug("Condition Met!");
            // Execute Action
            // Note: In a real scenario, we map the ruleId dynamically.
            // Here we hardcode specific logic for the demo.
            
            // To call SmartExecutor, this contract must be authorized or owner of the rule.
            // For now, we just emit the success 
        }
    }
    
    // Fallback just in case the signature is different, to capture logs
    fallback() external {
        emit ReactDebug("Fallback called");
        emit ReactData(msg.data);
    }
}
