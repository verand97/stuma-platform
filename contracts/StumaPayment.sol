// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC20 standard token (USDT).
 */
interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title StumaPayment
 * @dev Manages USDT payments for Indonesian UMKM (MSMEs) on Layer 2 networks (Polygon & Arbitrum).
 * Supports direct payment to merchant or contract custody with batch withdrawals to optimize gas fees.
 */
contract StumaPayment {
    address public owner;
    IERC20 public usdtToken;

    // Track total USDT received by the contract for custody
    uint256 public totalCustodyBalance;

    // Merchant balances stored in the contract for batch withdrawal
    mapping(address => uint256) public merchantBalances;

    // Mapping of orderId to payment details to prevent double payment and verify transactions
    struct Payment {
        address customer;
        address merchant;
        uint256 amount;
        uint256 timestamp;
        bool exists;
    }
    mapping(bytes32 => Payment) public payments;

    // Events
    event PaymentProcessed(
        address indexed customer,
        address indexed merchant,
        bytes32 indexed orderId,
        uint256 amount,
        uint256 timestamp,
        bool isDirectTransfer
    );
    event Withdrawal(address indexed merchant, uint256 amount, uint256 feeSaved);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    constructor(address _usdtAddress) {
        require(_usdtAddress != address(0), "Invalid USDT token address");
        owner = msg.sender;
        usdtToken = IERC20(_usdtAddress);
    }

    /**
     * @dev Process payment for an order.
     * @param orderId Unique identifier of the order from Laravel backend.
     * @param merchant Address of the UMKM merchant.
     * @param amount Amount of USDT (in 6 decimals) to transfer.
     * @param useCustody If true, keeps funds in contract for batch withdrawal (saves gas on settlement).
     */
    function payForOrder(
        bytes32 orderId,
        address merchant,
        uint256 amount,
        bool useCustody
    ) external {
        require(merchant != address(0), "Invalid merchant address");
        require(amount > 0, "Amount must be greater than zero");
        require(!payments[orderId].exists, "Order has already been paid");

        // Record the payment
        payments[orderId] = Payment({
            customer: msg.sender,
            merchant: merchant,
            amount: amount,
            timestamp: block.timestamp,
            exists: true
        });

        if (useCustody) {
            // Transfer USDT from customer to this contract (holding it for batch withdrawal)
            require(
                usdtToken.transferFrom(msg.sender, address(this), amount),
                "USDT transfer to contract failed"
            );
            merchantBalances[merchant] += amount;
            totalCustodyBalance += amount;
        } else {
            // Transfer USDT directly from customer to merchant
            require(
                usdtToken.transferFrom(msg.sender, merchant, amount),
                "USDT direct transfer failed"
            );
        }

        emit PaymentProcessed(msg.sender, merchant, orderId, amount, block.timestamp, !useCustody);
    }

    /**
     * @dev Allows a merchant to withdraw their accumulated balance in a single batch transaction.
     * This saves them significant gas fees by avoiding many individual small transfers.
     */
    function withdrawMerchantBalance() external {
        uint256 amount = merchantBalances[msg.sender];
        require(amount > 0, "No balance to withdraw");

        // Reset balance before transfer to prevent re-entrancy
        merchantBalances[msg.sender] = 0;
        totalCustodyBalance -= amount;

        // Perform the transfer
        require(usdtToken.transfer(msg.sender, amount), "USDT withdrawal transfer failed");

        // Estimate gas savings: a transfer costs ~21k-50k gas, batching saves multiple transfer costs
        emit Withdrawal(msg.sender, amount, amount > 0 ? 1 : 0);
    }

    /**
     * @dev Change owner of the payment gateway contract.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        owner = newOwner;
    }

    /**
     * @dev Update the USDT Token contract address in case of upgrade.
     */
    function setUsdtTokenAddress(address _newUsdtAddress) external onlyOwner {
        require(_newUsdtAddress != address(0), "Invalid USDT token address");
        usdtToken = IERC20(_newUsdtAddress);
    }
}
