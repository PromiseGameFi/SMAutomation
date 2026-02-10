// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AutomationRegistry.sol";

/**
 * @title SmartExecutor
 * @notice Executes actions on behalf of users when triggered by an authorized node.
 * @dev Users must approve this contract to spend their tokens first.
 */
contract SmartExecutor {
    AutomationRegistry public registry;
    address public owner;
    
    // Whitelisted off-chain listeners (Simulated "Keepers")
    mapping(address => bool) public authorizedCallers;

    event ExecutionSuccess(uint256 indexed ruleId, bool success, bytes result);

    constructor(address _registry) {
        registry = AutomationRegistry(_registry);
        owner = msg.sender;
        authorizedCallers[msg.sender] = true; // Owner is default authorized
    }

    modifier onlyAuthorized() {
        require(authorizedCallers[msg.sender], "Not authorized executor");
        _;
    }

    function setAuthorized(address _caller, bool _status) external {
        require(msg.sender == owner, "Only owner");
        authorizedCallers[_caller] = _status;
    }

    /**
     * @notice Called by the off-chain listener when a rule condition is met.
     * @param _ruleId The ID of the rule to execute.
     */
    function execute(uint256 _ruleId) external onlyAuthorized {
        (
            address user, 
            , 
            , 
            address actionContract, 
            bytes memory actionData, 
            bool active
        ) = registry.rules(_ruleId);

        require(active, "Rule not active");

        // Execute the action
        // WARNING: In production, this needs robust security (e.g. checking allowances, preventing malicious calls).
        // For this demo, we simply forward the call.
        // NOTE: The 'user' context is lost here unless we use `transferFrom` explicitly or Account Abstraction.
        // Since we are a separate contract, we can't "impersonate" the user.
        // The pattern here assumes the User has approved THIS contract to act.
        
        (bool success, bytes memory result) = actionContract.call(actionData);
        emit ExecutionSuccess(_ruleId, success, result);
    }
}
