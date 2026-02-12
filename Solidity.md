# Solidity Best Practices & Standards
Based on official [Solidity Documentation](https://soliditylang.org/) and industry standards.

## 1. Security First (Vital)

### Checks-Effects-Interactions (CEI) Pattern
Always update state *before* making external calls to prevent reentrancy attacks.
```solidity
// Bad
function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount);
    (bool success, ) = msg.sender.call{value: amount}(""); // Interaction
    require(success);
    balances[msg.sender] -= amount; // Effect (Too late!)
}

// Good
function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount);
    balances[msg.sender] -= amount; // Effect
    (bool success, ) = msg.sender.call{value: amount}(""); // Interaction
    require(success);
}
```

### Access Control
*   Use `Ownable` or `AccessControl` (OpenZeppelin) for sensitive functions.
*   Clearly label `internal` vs `private` functions.

### Validate Inputs
*   Use `require` statements early in functions to validate all inputs.
*   Prefer **Custom Errors** (Solidity 0.8.4+) over string messages for gas savings.
    ```solidity
    error InsufficientBalance(uint256 available, uint256 required);
    if (balance < amount) revert InsufficientBalance(balance, amount);
    ```

## 2. Gas Optimization

### Storage vs. Memory vs. Calldata
*   **Calldata**: Use `calldata` instead of `memory` for function arguments that are not modified. It is cheaper and immutable.
*   **Storage**: Minimizing storage writes is the most effective gas optimization.
*   **Caching**: Cache storage variables in memory if reading them multiple times in a loop.
    ```solidity
    // Good: Cache length
    uint256 len = myArray.length;
    for (uint256 i = 0; i < len; ++i) { ... }
    ```

### Loop Optimization
*   Avoid unbounded loops that can hit the block gas limit.
*   Use `++i` (pre-increment) instead of `i++` (post-increment) in loops (marginal but standard practice).
*   Use `unchecked { ++i; }` to skip overflow checks when incrementing loop counters that surely won't overflow.

### Variable Packing
*   Order state variables to fit into 32-byte slots.
    ```solidity
    // Bad (takes 3 slots)
    uint128 a;
    uint256 b;
    uint128 c;

    // Good (takes 2 slots)
    uint128 a;
    uint128 c; // a and c packed into one slot
    uint256 b;
    ```

## 3. Code Style & Naming

### Layout Order
According to the style guide, order contract elements as:
1.  Pragma statements
2.  Import statements
3.  Interfaces / Libraries
4.  Contract declaration
5.  Type declarations (structs, enums)
6.  State variables
7.  Events
8.  Errors
9.  Modifiers
10. Functions

### Function Ordering
1.  Constructor
2.  Receive / Fallback
3.  External
4.  Public
5.  Internal
6.  Private

### Naming Conventions
*   **Contracts/Libraries**: `PascalCase`
*   **State Variables**: `camelCase`
*   **Constants**: `UPPER_SNAKE_CASE`
*   **Functions**: `camelCase`
*   **Private/Internal Variables**: Prefix with underscore `_userBalance`.
*   **Interfaces**: Prefix with `I` (e.g., `IERC20`).

### NatSpec Documentation
Use NatSpec for all public interfaces.
```solidity
/// @notice Deposits tokens into the vault
/// @param amount The amount of tokens to deposit
/// @return shares The amount of shares minted
function deposit(uint256 amount) external returns (uint256 shares);
```

## 4. Modern Solidity Features (0.8.x+)

*   **Overflow Protection**: Checked arithmetic is default in 0.8.0+. Use `unchecked` blocks only for gas optimization where overflow is impossible.
*   **Immutable Variables**: Use `immutable` for variables set only in the constructor to save deployment and runtime gas.
*   **Delete**: Use `delete` to reset variables to their default value, which refunds gas.
