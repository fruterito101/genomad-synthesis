// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title IGenomad
 * @notice Interface for Genomad NFT and Breeding
 */
interface IGenomad {
    struct AgentData {
        bytes32 dnaCommitment;
        uint256 generation;
        uint256 parentA;
        uint256 parentB;
        uint256 createdAt;
        bool isActive;
    }

    event AgentRegistered(
        uint256 indexed tokenId,
        address indexed owner,
        bytes32 dnaCommitment,
        uint256 generation
    );

    event AgentActivated(uint256 indexed tokenId, address indexed activator);
    event AgentDeactivated(uint256 indexed tokenId);

    event BreedingRequested(
        uint256 indexed requestId,
        uint256 indexed parentA,
        uint256 indexed parentB,
        address initiator
    );

    event BreedingApproved(uint256 indexed requestId, address indexed approver);
    event BreedingExecuted(uint256 indexed requestId, uint256 indexed childTokenId);
    event BreedingCancelled(uint256 indexed requestId);

    function registerAgent(bytes32 dnaCommitment) external returns (uint256 tokenId);
    function getAgentData(uint256 tokenId) external view returns (AgentData memory);
    function activateAgent(uint256 tokenId) external;
    function deactivateAgent(uint256 tokenId) external;
}
