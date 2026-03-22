// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title ReputationRegistry
 * @notice ERC-8004 compliant Reputation Registry for Genomad agents
 * @dev Allows clients to give feedback to agents, building on-chain reputation
 */
contract ReputationRegistry {
    // ═══════════════════════════════════════════════════════
    // TYPES
    // ═══════════════════════════════════════════════════════

    struct Feedback {
        int128 value;
        uint8 valueDecimals;
        string tag1;
        string tag2;
        uint64 feedbackIndex;
        bool isRevoked;
        uint256 timestamp;
    }

    // ═══════════════════════════════════════════════════════
    // STORAGE
    // ═══════════════════════════════════════════════════════

    address public identityRegistry;
    address public owner;

    // agentId => clientAddress => Feedback[]
    mapping(uint256 => mapping(address => Feedback[])) private _feedbacks;
    
    // agentId => clientAddress => feedbackCount
    mapping(uint256 => mapping(address => uint64)) private _feedbackCounts;
    
    // agentId => total feedback count
    mapping(uint256 => uint256) private _totalFeedbacks;
    
    // agentId => sum of all values (for average calculation)
    mapping(uint256 => int256) private _valueSums;

    // ═══════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════

    event NewFeedback(
        uint256 indexed agentId,
        address indexed clientAddress,
        uint64 feedbackIndex,
        int128 value,
        uint8 valueDecimals,
        string indexed indexedTag1,
        string tag1,
        string tag2,
        string endpoint,
        string feedbackURI,
        bytes32 feedbackHash
    );

    event FeedbackRevoked(
        uint256 indexed agentId,
        address indexed clientAddress,
        uint64 feedbackIndex
    );

    event IdentityRegistryUpdated(address indexed oldRegistry, address indexed newRegistry);

    // ═══════════════════════════════════════════════════════
    // MODIFIERS
    // ═══════════════════════════════════════════════════════

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // ═══════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════

    constructor(address _identityRegistry) {
        identityRegistry = _identityRegistry;
        owner = msg.sender;
    }

    // ═══════════════════════════════════════════════════════
    // ADMIN
    // ═══════════════════════════════════════════════════════

    function setIdentityRegistry(address _registry) external onlyOwner {
        address old = identityRegistry;
        identityRegistry = _registry;
        emit IdentityRegistryUpdated(old, _registry);
    }

    function getIdentityRegistry() external view returns (address) {
        return identityRegistry;
    }

    // ═══════════════════════════════════════════════════════
    // FEEDBACK FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /**
     * @notice Give feedback to an agent
     * @param agentId The token ID of the agent
     * @param value The feedback value (can be negative)
     * @param valueDecimals Decimal places for the value (0-18)
     * @param tag1 Primary tag for categorization
     * @param tag2 Secondary tag for categorization
     * @param endpoint Optional: the endpoint being rated
     * @param feedbackURI Optional: URI to detailed feedback file
     * @param feedbackHash Optional: hash of feedback file for integrity
     */
    function giveFeedback(
        uint256 agentId,
        int128 value,
        uint8 valueDecimals,
        string calldata tag1,
        string calldata tag2,
        string calldata endpoint,
        string calldata feedbackURI,
        bytes32 feedbackHash
    ) external {
        require(valueDecimals <= 18, "valueDecimals must be 0-18");
        
        // Verify agent exists by calling identityRegistry
        // In production, would check ownerOf(agentId) != address(0)
        // For simplicity, we allow any agentId

        // Increment feedback index for this client-agent pair
        uint64 feedbackIndex = ++_feedbackCounts[agentId][msg.sender];

        // Store feedback
        _feedbacks[agentId][msg.sender].push(Feedback({
            value: value,
            valueDecimals: valueDecimals,
            tag1: tag1,
            tag2: tag2,
            feedbackIndex: feedbackIndex,
            isRevoked: false,
            timestamp: block.timestamp
        }));

        // Update aggregates
        _totalFeedbacks[agentId]++;
        _valueSums[agentId] += int256(value);

        emit NewFeedback(
            agentId,
            msg.sender,
            feedbackIndex,
            value,
            valueDecimals,
            tag1,
            tag1,
            tag2,
            endpoint,
            feedbackURI,
            feedbackHash
        );
    }

    /**
     * @notice Simple feedback without optional fields
     * @param agentId The token ID of the agent
     * @param value The feedback value
     * @param tag1 Primary tag
     */
    function giveFeedbackSimple(
        uint256 agentId,
        int128 value,
        string calldata tag1
    ) external {
        uint64 feedbackIndex = ++_feedbackCounts[agentId][msg.sender];

        _feedbacks[agentId][msg.sender].push(Feedback({
            value: value,
            valueDecimals: 0,
            tag1: tag1,
            tag2: "",
            feedbackIndex: feedbackIndex,
            isRevoked: false,
            timestamp: block.timestamp
        }));

        _totalFeedbacks[agentId]++;
        _valueSums[agentId] += int256(value);

        emit NewFeedback(
            agentId,
            msg.sender,
            feedbackIndex,
            value,
            0,
            tag1,
            tag1,
            "",
            "",
            "",
            bytes32(0)
        );
    }

    /**
     * @notice Revoke a previously given feedback
     * @param agentId The agent ID
     * @param feedbackIndex The index of feedback to revoke
     */
    function revokeFeedback(uint256 agentId, uint64 feedbackIndex) external {
        require(feedbackIndex > 0, "Invalid index");
        require(feedbackIndex <= _feedbackCounts[agentId][msg.sender], "Feedback not found");
        
        uint256 arrayIndex = feedbackIndex - 1;
        Feedback storage feedback = _feedbacks[agentId][msg.sender][arrayIndex];
        
        require(!feedback.isRevoked, "Already revoked");
        
        feedback.isRevoked = true;
        _valueSums[agentId] -= int256(feedback.value);
        
        emit FeedbackRevoked(agentId, msg.sender, feedbackIndex);
    }

    // ═══════════════════════════════════════════════════════
    // GETTERS
    // ═══════════════════════════════════════════════════════

    /**
     * @notice Get all feedbacks from a client to an agent
     * @param agentId The agent ID
     * @param clientAddress The client address
     * @return Array of Feedback structs
     */
    function getFeedbacks(
        uint256 agentId,
        address clientAddress
    ) external view returns (Feedback[] memory) {
        return _feedbacks[agentId][clientAddress];
    }

    /**
     * @notice Get a specific feedback
     * @param agentId The agent ID
     * @param clientAddress The client address
     * @param feedbackIndex The feedback index (1-based)
     */
    function getFeedback(
        uint256 agentId,
        address clientAddress,
        uint64 feedbackIndex
    ) external view returns (Feedback memory) {
        require(feedbackIndex > 0 && feedbackIndex <= _feedbackCounts[agentId][clientAddress], "Invalid index");
        return _feedbacks[agentId][clientAddress][feedbackIndex - 1];
    }

    /**
     * @notice Get feedback count for a client-agent pair
     */
    function getFeedbackCount(
        uint256 agentId,
        address clientAddress
    ) external view returns (uint64) {
        return _feedbackCounts[agentId][clientAddress];
    }

    /**
     * @notice Get total feedback count for an agent
     */
    function getTotalFeedbackCount(uint256 agentId) external view returns (uint256) {
        return _totalFeedbacks[agentId];
    }

    /**
     * @notice Get average reputation score for an agent
     * @param agentId The agent ID
     * @return average The average value (multiplied by 100 for precision)
     * @return count Total number of feedbacks
     */
    function getAverageReputation(uint256 agentId) external view returns (int256 average, uint256 count) {
        count = _totalFeedbacks[agentId];
        if (count == 0) {
            return (0, 0);
        }
        // Return average * 100 for 2 decimal precision
        average = (_valueSums[agentId] * 100) / int256(count);
    }

    /**
     * @notice Check if an agent has good reputation (average >= threshold)
     * @param agentId The agent ID
     * @param threshold Minimum average score required
     */
    function hasGoodReputation(uint256 agentId, int128 threshold) external view returns (bool) {
        uint256 count = _totalFeedbacks[agentId];
        if (count == 0) {
            return false; // No reputation yet
        }
        int256 average = _valueSums[agentId] / int256(count);
        return average >= int256(threshold);
    }
}
