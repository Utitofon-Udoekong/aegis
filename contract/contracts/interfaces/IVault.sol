// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IVault {
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function calculateYield(address user) external view returns (uint256);
    function balances(address user) external view returns (uint256);
}

