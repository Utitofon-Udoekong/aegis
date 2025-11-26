// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IVault {
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function claimYield() external;
    function calculateYield(address user) external view returns (uint256);
    function balances(address user) external view returns (uint256);
    function getDepositInfo(address user) external view returns (
        uint256 amount,
        uint256 depositTime,
        uint256 lastClaimTime,
        uint256 pendingYield
    );
    function fundYieldReserves(uint256 amount) external;
    function yieldReserves() external view returns (uint256);
    function totalDeposits() external view returns (uint256);
}
