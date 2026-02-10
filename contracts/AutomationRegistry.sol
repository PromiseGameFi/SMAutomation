// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AutomationRegistry
 * @notice Stores user-defined automation rules for off-chain listeners to pick up.
 */
contract AutomationRegistry {
    struct Rule {
        address user;
        address triggerContract; // The contract to watch (e.g. USDC)
        bytes conditionData;     // Encoded condition (e.g. "minBalance = 100")
        address actionContract;  // The contract to call when condition is met
        bytes actionData;        // The data to call actionContract with
        bool active;
    }

    // Mapping from Rule ID to Rule
    mapping(uint256 => Rule) public rules;
    uint256 public nextRuleId;

    event RuleRegistered(uint256 indexed ruleId, address indexed user, address triggerContract);
    event RuleDisabled(uint256 indexed ruleId);

    /**
     * @notice Register a new automation rule.
     * @param _triggerContract The address to monitor (e.g. existing Token).
     * @param _conditionData Arbitrary bytes describing the condition (off-chain logic interprets this).
     * @param _actionContract The contract to execute when triggered.
     * @param _actionData The payload to send to the action contract.
     */
    function registerRule(
        address _triggerContract,
        bytes calldata _conditionData,
        address _actionContract,
        bytes calldata _actionData
    ) external returns (uint256) {
        uint256 ruleId = nextRuleId++;
        
        rules[ruleId] = Rule({
            user: msg.sender,
            triggerContract: _triggerContract,
            conditionData: _conditionData,
            actionContract: _actionContract,
            actionData: _actionData,
            active: true
        });

        emit RuleRegistered(ruleId, msg.sender, _triggerContract);
        return ruleId;
    }

    function disableRule(uint256 _ruleId) external {
        require(rules[_ruleId].user == msg.sender, "Not rule owner");
        rules[_ruleId].active = false;
        emit RuleDisabled(_ruleId);
    }
}
