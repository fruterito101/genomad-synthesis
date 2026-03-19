// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title IGenomad
 * @notice Interface for Genomad NFT and Breeding
 * @dev FASE 4: Full on-chain storage with encrypted data, custody, and ZK proofs
 */
interface IGenomad {
    // ═══════════════════════════════════════════════════════
    // STRUCTS
    // ═══════════════════════════════════════════════════════

    struct AgentData {
        bytes32 dnaCommitment;
        uint8[8] traits;
        uint256 generation;
        uint256 parentA;
        uint256 parentB;
        uint256 createdAt;
        bool isActive;
    }

    struct EncryptedData {
        bytes encryptedSoul;
        bytes encryptedIdentity;
        bytes32 contentHash;
    }

    // ═══════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════

    event AgentRegistered(
        uint256 indexed tokenId,
        address indexed owner,
        bytes32 dnaCommitment,
        uint256 generation
    );

    event AgentActivated(uint256 indexed tokenId, address indexed activator);
    event AgentDeactivated(uint256 indexed tokenId);
    
    event EncryptedDataStored(uint256 indexed tokenId, bytes32 contentHash);

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
    // AGENT FUNCTIONS
    // ═══════════════════════════════════════════════════════

    function registerAgent(bytes32 dnaCommitment) external returns (uint256 tokenId);
    
    function registerAgentWithData(
        bytes32 dnaCommitment,
        uint8[8] calldata traits,
        bytes calldata encryptedSoul,
        bytes calldata encryptedIdentity,
        bytes32 contentHash
    ) external returns (uint256 tokenId);

    function registerAgentWithProof(
        bytes32 dnaCommitment,
        uint8[8] calldata traits,
        bytes calldata encryptedSoul,
        bytes calldata encryptedIdentity,
        bytes32 contentHash,
        bytes calldata zkProof
    ) external returns (uint256 tokenId);

    function getAgentData(uint256 tokenId) external view returns (AgentData memory);
    function getEncryptedData(uint256 tokenId) external view returns (EncryptedData memory);
    function getTraits(uint256 tokenId) external view returns (uint8[8] memory);
    
    function activateAgent(uint256 tokenId) external;
    function deactivateAgent(uint256 tokenId) external;
    
    function updateEncryptedData(
        uint256 tokenId,
        bytes calldata encryptedSoul,
        bytes calldata encryptedIdentity,
        bytes32 contentHash
    ) external;

    // ═══════════════════════════════════════════════════════
    // CUSTODY FUNCTIONS
    // ═══════════════════════════════════════════════════════

    function getCustody(uint256 tokenId, address holder) external view returns (uint256);
    function getCustodyHolders(uint256 tokenId) external view returns (address[] memory);
    function hasCustodyThreshold(uint256 tokenId, address holder, uint256 threshold) external view returns (bool);
    function transferCustody(uint256 tokenId, address to, uint256 amount) external;
}
