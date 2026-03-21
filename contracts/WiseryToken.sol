// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title WiseryToken (WSR)
 * @dev ERC-20 token for the Wisery prediction & voting platform
 *
 * Total Supply: 1,000,000,000 WSR (1 billion)
 *
 * Distribution:
 * - 30% Community Rewards (voting, predictions, engagement)
 * - 30% Team & Development
 * - 15% Ecosystem & Partnerships
 * - 15% Liquidity Pool
 * - 10% Reserve
 */
contract WiseryToken is ERC20, ERC20Burnable, Ownable, Pausable {

    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion WSR

    // Reward pool for platform activities
    uint256 public rewardPool;

    // Per-distributor daily spending cap (default 10,000 WSR)
    uint256 public distributorDailyLimit = 10_000 * 10**18;

    // Mapping for authorized reward distributors (platform backend)
    mapping(address => bool) public rewardDistributors;

    // Daily spending tracker: distributor => day => amount spent
    mapping(address => mapping(uint256 => uint256)) public dailySpent;

    event RewardDistributed(address indexed distributor, address indexed to, uint256 amount, string reason);
    event DistributorUpdated(address indexed distributor, bool authorized);
    event DailyLimitUpdated(uint256 newLimit);
    event RewardPoolWithdrawn(address indexed to, uint256 amount);

    constructor() ERC20("Wisery", "WSR") Ownable(msg.sender) {
        // Mint initial supply to deployer
        _mint(msg.sender, MAX_SUPPLY);

        // Allocate 30% to reward pool (held by contract)
        uint256 rewardAllocation = (MAX_SUPPLY * 30) / 100;
        _transfer(msg.sender, address(this), rewardAllocation);
        rewardPool = rewardAllocation;
    }

    /**
     * @dev Authorize/revoke reward distributors (platform backend wallets)
     */
    function setDistributor(address distributor, bool authorized) external onlyOwner {
        require(distributor != address(0), "Invalid distributor");
        rewardDistributors[distributor] = authorized;
        emit DistributorUpdated(distributor, authorized);
    }

    /**
     * @dev Update the daily spending limit per distributor
     */
    function setDailyLimit(uint256 newLimit) external onlyOwner {
        require(newLimit > 0, "Limit must be positive");
        distributorDailyLimit = newLimit;
        emit DailyLimitUpdated(newLimit);
    }

    /**
     * @dev Get current day number for rate limiting
     */
    function _currentDay() internal view returns (uint256) {
        return block.timestamp / 1 days;
    }

    /**
     * @dev Check and update daily spending for a distributor
     */
    function _checkDailyLimit(address distributor, uint256 amount) internal {
        if (distributor != owner()) {
            uint256 day = _currentDay();
            uint256 spent = dailySpent[distributor][day] + amount;
            require(spent <= distributorDailyLimit, "Daily limit exceeded");
            dailySpent[distributor][day] = spent;
        }
    }

    /**
     * @dev Distribute rewards from pool to users
     * Only callable by authorized distributors, with daily limit enforcement
     */
    function distributeReward(address to, uint256 amount, string calldata reason) external whenNotPaused {
        require(rewardDistributors[msg.sender] || msg.sender == owner(), "Not authorized");
        require(amount <= rewardPool, "Insufficient reward pool");
        require(to != address(0), "Invalid recipient");

        _checkDailyLimit(msg.sender, amount);

        rewardPool -= amount;
        _transfer(address(this), to, amount);

        emit RewardDistributed(msg.sender, to, amount, reason);
    }

    /**
     * @dev Batch distribute rewards (for daily/weekly distributions)
     */
    function batchDistributeRewards(
        address[] calldata recipients,
        uint256[] calldata amounts,
        string calldata reason
    ) external whenNotPaused {
        require(rewardDistributors[msg.sender] || msg.sender == owner(), "Not authorized");
        require(recipients.length == amounts.length, "Length mismatch");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        require(totalAmount <= rewardPool, "Insufficient reward pool");

        _checkDailyLimit(msg.sender, totalAmount);

        rewardPool -= totalAmount;
        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] != address(0) && amounts[i] > 0) {
                _transfer(address(this), recipients[i], amounts[i]);
                emit RewardDistributed(msg.sender, recipients[i], amounts[i], reason);
            }
        }
    }

    /**
     * @dev Add tokens to reward pool (owner can top up)
     */
    function addToRewardPool(uint256 amount) external onlyOwner {
        _transfer(msg.sender, address(this), amount);
        rewardPool += amount;
    }

    /**
     * @dev Withdraw from reward pool (owner only, for migration)
     */
    function withdrawFromRewardPool(uint256 amount, address to) external onlyOwner {
        require(amount <= rewardPool, "Insufficient reward pool");
        require(to != address(0), "Invalid recipient");
        rewardPool -= amount;
        _transfer(address(this), to, amount);
        emit RewardPoolWithdrawn(to, amount);
    }

    /**
     * @dev Pause all reward distributions (emergency)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause reward distributions
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev View remaining reward pool
     */
    function getRewardPoolBalance() external view returns (uint256) {
        return rewardPool;
    }
}
