// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title VaultBTC
 * @dev Mock ERC20 token representing vaultBTC for testing purposes with faucet restrictions
 */
contract VaultBTC is ERC20 {
    // Faucet restrictions
    uint256 public constant MAX_PER_REQUEST = 1000 * 10**18; // 1000 vaultBTC
    uint256 public constant MAX_DAILY = 2000 * 10**18; // 2000 vaultBTC per day
    uint256 public constant MAX_LIFETIME = 5000 * 10**18; // 5000 vaultBTC lifetime
    uint256 public constant COOLDOWN_PERIOD = 24 hours;

    // Track minting per address
    mapping(address => uint256) public lastMintTime;
    mapping(address => uint256) public dailyMintAmount;
    mapping(address => uint256) public totalMinted;
    mapping(address => uint256) public lastMintDay;

    // Events
    event FaucetMint(address indexed to, uint256 amount, uint256 remainingDaily, uint256 remainingLifetime);

    constructor() ERC20("Vault Bitcoin", "vaultBTC") {
        // Mint initial supply to deployer for testing
        _mint(msg.sender, 1000000 * 10**decimals());
    }

    /**
     * @dev Mint tokens for testing with faucet restrictions
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= MAX_PER_REQUEST, "Amount exceeds max per request");
        
        uint256 currentDay = block.timestamp / 1 days;
        
        // Check cooldown (24 hours between requests)
        if (lastMintTime[to] > 0) {
            require(
                block.timestamp >= lastMintTime[to] + COOLDOWN_PERIOD,
                "Cooldown period not expired"
            );
        }
        
        // Reset daily amount if it's a new day
        if (lastMintDay[to] != currentDay) {
            dailyMintAmount[to] = 0;
            lastMintDay[to] = currentDay;
        }
        
        // Check daily limit
        require(
            dailyMintAmount[to] + amount <= MAX_DAILY,
            "Daily limit exceeded"
        );
        
        // Check lifetime limit
        require(
            totalMinted[to] + amount <= MAX_LIFETIME,
            "Lifetime limit exceeded"
        );
        
        // Update tracking
        lastMintTime[to] = block.timestamp;
        dailyMintAmount[to] += amount;
        totalMinted[to] += amount;
        
        // Mint tokens
        _mint(to, amount);
        
        emit FaucetMint(to, amount, MAX_DAILY - dailyMintAmount[to], MAX_LIFETIME - totalMinted[to]);
    }

    /**
     * @dev Get remaining daily allowance for an address
     */
    function getRemainingDaily(address account) external view returns (uint256) {
        uint256 currentDay = block.timestamp / 1 days;
        if (lastMintDay[account] != currentDay) {
            return MAX_DAILY;
        }
        return MAX_DAILY - dailyMintAmount[account];
    }

    /**
     * @dev Get remaining lifetime allowance for an address
     */
    function getRemainingLifetime(address account) external view returns (uint256) {
        return MAX_LIFETIME - totalMinted[account];
    }

    /**
     * @dev Get time until cooldown expires
     */
    function getCooldownRemaining(address account) external view returns (uint256) {
        if (lastMintTime[account] == 0) {
            return 0;
        }
        uint256 elapsed = block.timestamp - lastMintTime[account];
        if (elapsed >= COOLDOWN_PERIOD) {
            return 0;
        }
        return COOLDOWN_PERIOD - elapsed;
    }
}

