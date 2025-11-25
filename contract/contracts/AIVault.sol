// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IVault.sol";

/**
 * @title AIVault
 * @dev AI-optimized Bitcoin DeFi vault with deposit/withdraw functionality
 */
contract AIVault is IVault, ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable vaultBTC;
    
    // User balances
    mapping(address => uint256) public balances;
    
    // Total deposits in vault
    uint256 public totalDeposits;
    
    // APY in basis points (e.g., 500 = 5%)
    uint256 public constant APY_BPS = 500; // 5% APY
    
    // Events
    event Deposit(address indexed user, uint256 amount, uint256 timestamp);
    event Withdraw(address indexed user, uint256 amount, uint256 yield, uint256 timestamp);
    event EmergencyWithdraw(address indexed user, uint256 amount);

    constructor(address _vaultBTC) Ownable(msg.sender) {
        require(_vaultBTC != address(0), "Invalid vaultBTC address");
        vaultBTC = IERC20(_vaultBTC);
    }

    /**
     * @dev Deposit vaultBTC into the vault
     * @param amount Amount of vaultBTC to deposit
     */
    function deposit(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        
        vaultBTC.safeTransferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;
        totalDeposits += amount;
        
        emit Deposit(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Withdraw vaultBTC from the vault with yield calculation
     * @param amount Amount of vaultBTC to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        uint256 yield = calculateYield(msg.sender);
        uint256 totalWithdraw = amount;
        
        // If withdrawing full balance, include yield
        if (amount == balances[msg.sender] && yield > 0) {
            totalWithdraw += yield;
        }
        
        balances[msg.sender] -= amount;
        totalDeposits -= amount;
        
        vaultBTC.safeTransfer(msg.sender, totalWithdraw);
        
        emit Withdraw(msg.sender, amount, yield, block.timestamp);
    }

    /**
     * @dev Calculate yield for a user based on their balance and time
     * @param user Address of the user
     * @return yield Calculated yield amount
     */
    function calculateYield(address user) public view returns (uint256) {
        uint256 userBalance = balances[user];
        if (userBalance == 0) return 0;
        
        // Simple yield calculation: APY / 365 days * days since deposit
        // For demo purposes, we'll use a simplified calculation
        // In production, this would track deposit timestamps
        uint256 annualYield = (userBalance * APY_BPS) / 10000;
        // Approximate daily yield (simplified for demo)
        uint256 dailyYield = annualYield / 365;
        
        // Return 30 days of yield as example
        return dailyYield * 30;
    }

    /**
     * @dev Emergency pause function (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause function (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency withdraw function (only when paused)
     */
    function emergencyWithdraw() external nonReentrant whenPaused {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance to withdraw");
        
        balances[msg.sender] = 0;
        totalDeposits -= amount;
        
        vaultBTC.safeTransfer(msg.sender, amount);
        
        emit EmergencyWithdraw(msg.sender, amount);
    }
}

