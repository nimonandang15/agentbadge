// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Test-only stand-in for the real Agent ID registry (0x60B926... on BNB Chain).
/// @dev NOT for production deployment. Lets tests grant/revoke a fake Agent ID per address.
contract MockAgentIdRegistry {
    mapping(address => uint256) private _balances;

    function setHasId(address account, bool hasId) external {
        _balances[account] = hasId ? 1 : 0;
    }

    function balanceOf(address owner) external view returns (uint256) {
        return _balances[owner];
    }
}
