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
 * @dev AI-optimized Bitcoin DeFi vault with time-based yield calculation
 */
contract AIVault is IVault, ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable vaultBTC;
    
    // User deposit info
    struct DepositInfo {
        uint256 amount;
        uint256 depositTime;
        uint256 lastClaimTime;
    }
    
    // User balances and deposit tracking
    mapping(address => DepositInfo) public deposits;
    
    // Total deposits in vault (user principal only)
    uint256 public totalDeposits;
    
    // Yield reserves (funded by owner for paying yields)
    uint256 public yieldReserves;
    
    // APY in basis points (e.g., 500 = 5%)
    uint256 public constant APY_BPS = 500; // 5% APY
    
    // Minimum deposit time before yield accrues (1 day)
    uint256 public constant MIN_DEPOSIT_TIME = 1 days;
    
    // Events
    event Deposit(address indexed user, uint256 amount, uint256 timestamp);
    event Withdraw(address indexed user, uint256 amount, uint256 yield, uint256 timestamp);
    event YieldClaimed(address indexed user, uint256 yield, uint256 timestamp);
    event EmergencyWithdraw(address indexed user, uint256 amount);
    event YieldReservesFunded(address indexed funder, uint256 amount);
    event YieldReservesWithdrawn(address indexed owner, uint256 amount);

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
        
        DepositInfo storage userDeposit = deposits[msg.sender];
        
        // If user has existing deposit, claim any pending yield first
        if (userDeposit.amount > 0) {
            uint256 pendingYield = _calculateYield(msg.sender);
            if (pendingYield > 0 && yieldReserves >= pendingYield) {
                yieldReserves -= pendingYield;
                vaultBTC.safeTransfer(msg.sender, pendingYield);
                emit YieldClaimed(msg.sender, pendingYield, block.timestamp);
            }
        }
        
        // Update deposit info
        userDeposit.amount += amount;
        userDeposit.depositTime = block.timestamp;
        userDeposit.lastClaimTime = block.timestamp;
        
        totalDeposits += amount;
        
        emit Deposit(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Withdraw vaultBTC from the vault with proportional yield
     * @param amount Amount of vaultBTC to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        
        DepositInfo storage userDeposit = deposits[msg.sender];
        require(userDeposit.amount >= amount, "Insufficient balance");
        
        // Calculate proportional yield based on withdrawal amount
        uint256 totalYield = _calculateYield(msg.sender);
        uint256 proportionalYield = (totalYield * amount) / userDeposit.amount;
        
        // Cap yield to available reserves
        uint256 actualYield = proportionalYield > yieldReserves ? yieldReserves : proportionalYield;
        
        uint256 totalWithdraw = amount + actualYield;
        
        // Update state
        userDeposit.amount -= amount;
        totalDeposits -= amount;
        
        if (actualYield > 0) {
            yieldReserves -= actualYield;
        }
        
        // Reset times if fully withdrawn
        if (userDeposit.amount == 0) {
            userDeposit.depositTime = 0;
            userDeposit.lastClaimTime = 0;
        } else {
            // Update last claim time for remaining balance
            userDeposit.lastClaimTime = block.timestamp;
        }
        
        vaultBTC.safeTransfer(msg.sender, totalWithdraw);
        
        emit Withdraw(msg.sender, amount, actualYield, block.timestamp);
    }

    /**
     * @dev Claim accrued yield without withdrawing principal
     */
    function claimYield() external nonReentrant whenNotPaused {
        uint256 yield = _calculateYield(msg.sender);
        require(yield > 0, "No yield to claim");
        require(yieldReserves >= yield, "Insufficient yield reserves");
        
        DepositInfo storage userDeposit = deposits[msg.sender];
        userDeposit.lastClaimTime = block.timestamp;
        
        yieldReserves -= yield;
        vaultBTC.safeTransfer(msg.sender, yield);
        
        emit YieldClaimed(msg.sender, yield, block.timestamp);
    }

    /**
     * @dev Calculate yield for a user based on their balance and time since last claim
     * @param user Address of the user
     * @return yield Calculated yield amount
     */
    function calculateYield(address user) public view returns (uint256) {
        return _calculateYield(user);
    }

    /**
     * @dev Internal yield calculation
     */
    function _calculateYield(address user) internal view returns (uint256) {
        DepositInfo storage userDeposit = deposits[user];
        
        if (userDeposit.amount == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - userDeposit.lastClaimTime;
        
        // No yield if minimum time hasn't passed
        if (timeElapsed < MIN_DEPOSIT_TIME) return 0;
        
        // Calculate yield: (balance * APY * timeElapsed) / (10000 * 365 days)
        // APY_BPS is in basis points (500 = 5%)
        uint256 yield = (userDeposit.amount * APY_BPS * timeElapsed) / (10000 * 365 days);
        
        return yield;
    }

    /**
     * @dev Get user's deposit info
     */
    function getDepositInfo(address user) external view returns (
        uint256 amount,
        uint256 depositTime,
        uint256 lastClaimTime,
        uint256 pendingYield
    ) {
        DepositInfo storage info = deposits[user];
        return (
            info.amount,
            info.depositTime,
            info.lastClaimTime,
            _calculateYield(user)
        );
    }

    /**
     * @dev Get user balance (for interface compatibility)
     */
    function balances(address user) external view returns (uint256) {
        return deposits[user].amount;
    }

    /**
     * @dev Fund yield reserves (anyone can fund, but typically owner)
     */
    function fundYieldReserves(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        
        vaultBTC.safeTransferFrom(msg.sender, address(this), amount);
        yieldReserves += amount;
        
        emit YieldReservesFunded(msg.sender, amount);
    }

    /**
     * @dev Withdraw excess yield reserves (only owner)
     */
    function withdrawYieldReserves(uint256 amount) external onlyOwner nonReentrant {
        require(amount <= yieldReserves, "Insufficient reserves");
        
        yieldReserves -= amount;
        vaultBTC.safeTransfer(msg.sender, amount);
        
        emit YieldReservesWithdrawn(msg.sender, amount);
    }

    /**
     * @dev Get total contract balance (deposits + reserves)
     */
    function getTotalBalance() external view returns (uint256) {
        return vaultBTC.balanceOf(address(this));
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
     * @dev Emergency withdraw function (only when paused, no yield)
     */
    function emergencyWithdraw() external nonReentrant whenPaused {
        DepositInfo storage userDeposit = deposits[msg.sender];
        uint256 amount = userDeposit.amount;
        require(amount > 0, "No balance to withdraw");
        
        userDeposit.amount = 0;
        userDeposit.depositTime = 0;
        userDeposit.lastClaimTime = 0;
        totalDeposits -= amount;
        
        vaultBTC.safeTransfer(msg.sender, amount);
        
        emit EmergencyWithdraw(msg.sender, amount);
    }
}
