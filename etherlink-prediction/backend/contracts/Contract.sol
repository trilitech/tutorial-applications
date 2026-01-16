// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

// for creating a contract that can be owned by an address
// this is useful for managing access permissions to methods in the contract
import "@openzeppelin/contracts/access/Ownable.sol";

// for preventing reentrancy attacks on functions that modify state
// this is important for functions that involve transferring tokens or ether
// to ensure that the function cannot be called again while it is still executing
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/** @title A simple prediction market that uses the Pari-mutuel model allowing winners to share the prize pool.
 */

contract PredictxtzContract is Ownable, ReentrancyGuard {
    // This contract allows users to create markets, place bets, resolve markets, and claim winnings.

    constructor() Ownable(msg.sender) {}

    // constants
    uint256 public constant PRECISION = 1e18;
    uint256 public constant VIRTUAL_LIQUIDITY = 1000 * PRECISION; // used to calculate price per share

    // holds information about each market
    struct Market {
        uint256 id;
        string question;
        // string description;
        uint256 endTime; // When betting stops
    //  uint256 resolveTime;    // When market can be resolved. // For now, we resolve immediately after endTime or manually
        bool resolved;
        uint8 winner; // 0 = NO, 1 = YES, 2 = INVALID
        uint256 totalYesAmount; // Total $ bet on YES
        uint256 totalNoAmount; // Total $ bet on NO
        uint256 totalYesShares; // Total YES shares (for price calculation)
        uint256 totalNoShares; // Total No shares (for price calculation)
        uint256 marketBalance; // how much is in the market
        address creator;
        // uint256 createdAt;
        bool active;
    }

    // calculates the total position held by a market participant
    struct Position {
        uint256 yesAmount; // $ amount bet on YES
        uint256 noAmount; // $ amount bet on NO
        uint256 yesShares; // YES shares owned (for pool splitting)
        uint256 noShares; // NO shares owned (for pool splitting)
        bool claimed; // Whether winnings have been claimed
    }

    uint256 public marketCounter; // keeps track of the no of markets created

    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Position)) public positions;
    mapping(address => uint256[]) public userMarkets;

    // events
    event MarketCreated(
        uint256 indexed marketId,
        address indexed creator,
        string question,
        uint256 endTime
    );

    event BetPlaced(
        uint256 indexed marketId,
        address indexed user,
        bool indexed isYes,
        uint256 amount,
        uint256 shares
    );

    event MarketResolved(
        uint256 indexed marketId,
        uint8 indexed winner,
        address indexed resolver
    );

    event WinningsClaimed(
        uint256 indexed marketId,
        address indexed user,
        uint256 amount
    );

    function createMarket(
        string calldata question,
        uint256 duration
    ) external returns (uint256) {
        require(duration > 0, "Duration must be positive");
        require(bytes(question).length > 0, "Question cannot be empty");

        uint256 marketId = ++marketCounter;

        markets[marketId] = Market({
            id: marketId,
            question: question,
            endTime: block.timestamp + duration,
            resolved: false,
            winner: 2, // Unresolved
            totalYesAmount: 0, // No money in pool yet
            totalNoAmount: 0, // No money in pool yet
            totalYesShares: VIRTUAL_LIQUIDITY, // Virtual shares for pricing
            totalNoShares: VIRTUAL_LIQUIDITY, // Virtual shares for pricing
            marketBalance: 0,
            creator: msg.sender,
            // createdAt: block.timestamp,
            active: true
        });

        // emiting events makes it cheaper to track changes in the contract without needing to read the entire state and paying gas
        emit MarketCreated(
            marketId,
            msg.sender,
            question,
            block.timestamp + duration
        );
        return marketId;
    }

    /**
     * Calculate pricePerShare without fees
     */
    function pricePerShareWithoutFees(
        uint256 marketId,
        bool isYes
    ) public view returns (uint256) {
        Market memory market = markets[marketId];
        uint256 totalShares = market.totalYesShares + market.totalNoShares;

        if (isYes) {
            return (market.totalYesShares * PRECISION) / totalShares;
        } else {
            return (market.totalNoShares * PRECISION) / totalShares;
        }
    }

    /**
     * Calculate how many shares you get for a bet amount
     * More money = more shares = bigger portion of winnings
     */
    function calculateShares(
        uint256 marketId,
        bool isYes,
        uint256 betAmount
    ) public view returns (uint256) {
        Market memory market = markets[marketId];
        require(market.active, "Market not active");

        // The share price is now calculated without fees
        uint256 pricePerShare = pricePerShareWithoutFees(marketId, isYes);
        uint256 shares = (betAmount * PRECISION) / pricePerShare;
        return shares;
    }

    // BETTING FUNCTIONS

    /**
     * @dev Place a bet on YES or NO
     * @param marketId The market to bet on
     * @param isYes true for a bet on YES, false for a bet on NO
     */
    function placeBet(
        uint256 marketId,
        bool isYes
    ) external payable nonReentrant {
        Market storage market = markets[marketId];
        uint256 betAmount = msg.value; // Use the value sent with the transaction as the bet amount
        market.marketBalance += msg.value;

        // Validation
        require(market.active, "Market not active");
        require(!market.resolved, "Market has been resolved");
        require(block.timestamp < market.endTime, "Betting period ended");
        require(betAmount > 0, "Must bet positive amount");

        uint256 shares = calculateShares(marketId, isYes, betAmount); // 100shares when amount = $51

        // Update market totals
        if (isYes) {
            market.totalYesAmount += betAmount; // Tracks the total amount bet on YES
            market.totalYesShares += shares; // Synthetic YES shares (virtual liquidity) + Real YES shares
            positions[marketId][msg.sender].yesAmount += betAmount; // Tracks user's YES bet amount
            positions[marketId][msg.sender].yesShares += shares; // Tracks user's YES shares
        } else {
            market.totalNoAmount += betAmount;
            market.totalNoShares += shares;
            positions[marketId][msg.sender].noAmount += betAmount;
            positions[marketId][msg.sender].noShares += shares;
        }

        // Track user participation
        if (
            positions[marketId][msg.sender].yesAmount +
                positions[marketId][msg.sender].noAmount ==
            betAmount
        ) {
            userMarkets[msg.sender].push(marketId);
        }

        emit BetPlaced(marketId, msg.sender, isYes, betAmount, shares);
    }

    // Only the owner can resolve markets
    function resolveMarket(uint256 marketId, uint8 winner) external onlyOwner {
        Market storage market = markets[marketId];

        require(!market.resolved, "Already resolved");
        require(winner <= 2, "Invalid winner");

        market.resolved = true;
        market.active = false;
        market.winner = winner;

        emit MarketResolved(marketId, winner, msg.sender);
    }

    // CLAIMING WINNINGS

    /**
     * @dev Claim winnings from a resolved market
     * Winners split the total pool proportionally to their shares
     */
    function claimWinnings(uint256 marketId) external nonReentrant {
        Market storage market = markets[marketId]; //access storage so we can update
        Position storage position = positions[marketId][msg.sender];

        require(market.resolved, "Market not resolved");
        require(!position.claimed, "Already claimed");

        position.claimed = true;

        uint256 payout = 0;

        if (market.winner == 2) {
            // INVALID - refund original bets
            payout = position.yesAmount + position.noAmount;
        } else if (market.winner == 1 && position.yesShares > 0) {
            // YES wins - split the total pool among YES shareholders
            uint256 totalPool = market.totalYesAmount + market.totalNoAmount;
            uint256 winningSideShares = market.totalYesShares -
                VIRTUAL_LIQUIDITY; // Remove virtual liquidity

            if (winningSideShares > 0) {
                payout = (position.yesShares * totalPool) / winningSideShares;
            }
        } else if (market.winner == 0 && position.noShares > 0) {
            // NO wins - split the total pool among NO shareholders
            uint256 totalPool = market.totalYesAmount + market.totalNoAmount;
            uint256 winningSideShares = market.totalNoShares -
                VIRTUAL_LIQUIDITY; // Remove virtual liquidity

            if (winningSideShares > 0) {
                payout = (position.noShares * totalPool) / winningSideShares;
            }
        }

        if (payout > 0) {
            (bool success, ) = payable(msg.sender).call{value: payout}("");
            market.marketBalance -= payout;
            require(success, "XTZ transfer failed");
            emit WinningsClaimed(marketId, msg.sender, payout);
        }
    }

    //  VIEW FUNCTIONS

    function getUserPosition(
        uint256 marketId,
        address user
    ) external view returns (Position memory) {
        return positions[marketId][user];
    }

    function getUserMarkets(
        address user
    ) external view returns (uint256[] memory) {
        return userMarkets[user];
    }

    function getMarket(uint256 marketId) external view returns (Market memory) {
        return markets[marketId];
    }

    // Useful for the frontend to know the most recent probabilities for each outcome
    function getProbability(
        uint256 marketId,
        bool isYes
    ) external view returns (uint256) {
        uint256 price = pricePerShareWithoutFees(marketId, isYes);
        return (price * 100) / PRECISION; // get the percentage probability
    }
}
