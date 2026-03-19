// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./GenomadNFT.sol";

/**
 * @title BreedingFactory
 * @notice Handles breeding requests and execution for Genomad agents
 */
contract BreedingFactory {
    // ═══════════════════════════════════════════════════════
    // TYPES
    // ═══════════════════════════════════════════════════════

    enum RequestStatus {
        Pending,
        Approved,
        Executed,
        Cancelled,
        Expired
    }

    struct BreedingRequest {
        uint256 parentA;
        uint256 parentB;
        address initiator;
        address parentBOwner;
        bool parentBApproved;
        RequestStatus status;
        uint256 createdAt;
        uint256 expiresAt;
    }

    // ═══════════════════════════════════════════════════════
    // STORAGE
    // ═══════════════════════════════════════════════════════

    GenomadNFT public nft;
    address public owner;

    uint256 private _requestIdCounter;
    uint256 public breedingFee = 0.01 ether; // 0.01 MON
    uint256 public requestExpiry = 7 days;

    mapping(uint256 => BreedingRequest) public requests;

    // ═══════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════

    event BreedingRequested(
        uint256 indexed requestId,
        uint256 indexed parentA,
        uint256 indexed parentB,
        address initiator
    );

    event BreedingApproved(uint256 indexed requestId, address indexed approver);
    event BreedingExecuted(uint256 indexed requestId, uint256 indexed childTokenId);
    event BreedingCancelled(uint256 indexed requestId);

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

    constructor(address _nft) {
        nft = GenomadNFT(_nft);
        owner = msg.sender;
    }

    // ═══════════════════════════════════════════════════════
    // ADMIN
    // ═══════════════════════════════════════════════════════

    function setBreedingFee(uint256 _fee) external onlyOwner {
        breedingFee = _fee;
    }

    function setRequestExpiry(uint256 _expiry) external onlyOwner {
        requestExpiry = _expiry;
    }

    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    // ═══════════════════════════════════════════════════════
    // BREEDING FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /**
     * @notice Request to breed two agents
     * @param parentA Token ID of first parent (must be owned by caller)
     * @param parentB Token ID of second parent
     */
    function requestBreeding(uint256 parentA, uint256 parentB) external payable returns (uint256 requestId) {
        require(msg.value >= breedingFee, "Insufficient fee");
        require(parentA != parentB, "Cannot breed with self");

        // Verify ownership of parentA
        require(nft.ownerOf(parentA) == msg.sender, "Not owner of parentA");

        address parentBOwner = nft.ownerOf(parentB);
        bool sameOwner = parentBOwner == msg.sender;

        requestId = ++_requestIdCounter;

        requests[requestId] = BreedingRequest({
            parentA: parentA,
            parentB: parentB,
            initiator: msg.sender,
            parentBOwner: parentBOwner,
            parentBApproved: sameOwner, // Auto-approve if same owner
            status: sameOwner ? RequestStatus.Approved : RequestStatus.Pending,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + requestExpiry
        });

        emit BreedingRequested(requestId, parentA, parentB, msg.sender);

        if (sameOwner) {
            emit BreedingApproved(requestId, msg.sender);
        }
    }

    /**
     * @notice Approve a breeding request (called by parentB owner)
     */
    function approveBreeding(uint256 requestId) external {
        BreedingRequest storage req = requests[requestId];

        require(req.status == RequestStatus.Pending, "Not pending");
        require(block.timestamp < req.expiresAt, "Request expired");
        require(msg.sender == req.parentBOwner, "Not parentB owner");

        req.parentBApproved = true;
        req.status = RequestStatus.Approved;

        emit BreedingApproved(requestId, msg.sender);
    }

    /**
     * @notice Execute an approved breeding request
     * @param dnaCommitment Hash commitment of the child's DNA
     */
    function executeBreeding(uint256 requestId, bytes32 dnaCommitment) external returns (uint256 childTokenId) {
        BreedingRequest storage req = requests[requestId];

        require(req.status == RequestStatus.Approved, "Not approved");
        require(block.timestamp < req.expiresAt, "Request expired");
        require(msg.sender == req.initiator, "Not initiator");

        // Get parent generations
        IGenomad.AgentData memory dataA = nft.getAgentData(req.parentA);
        IGenomad.AgentData memory dataB = nft.getAgentData(req.parentB);

        uint256 childGeneration = (dataA.generation > dataB.generation ? dataA.generation : dataB.generation) + 1;

        // Mint child NFT
        childTokenId = nft.registerBredAgent(
            req.initiator,
            dnaCommitment,
            childGeneration,
            req.parentA,
            req.parentB
        );

        req.status = RequestStatus.Executed;

        emit BreedingExecuted(requestId, childTokenId);
    }

    /**
     * @notice Cancel a pending breeding request
     */
    function cancelBreeding(uint256 requestId) external {
        BreedingRequest storage req = requests[requestId];

        require(req.status == RequestStatus.Pending || req.status == RequestStatus.Approved, "Cannot cancel");
        require(msg.sender == req.initiator, "Not initiator");

        req.status = RequestStatus.Cancelled;

        // Refund fee
        payable(req.initiator).transfer(breedingFee);

        emit BreedingCancelled(requestId);
    }

    /**
     * @notice Get breeding request details
     */
    function getRequest(uint256 requestId) external view returns (BreedingRequest memory) {
        return requests[requestId];
    }

    /**
     * @notice Check if a request is still valid
     */
    function isRequestValid(uint256 requestId) external view returns (bool) {
        BreedingRequest memory req = requests[requestId];
        return req.status == RequestStatus.Approved && block.timestamp < req.expiresAt;
    }
}
