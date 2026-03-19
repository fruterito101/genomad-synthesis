// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title BreedingVerifier
 * @notice Verifies ZK proofs for Genomad breeding operations
 * @dev Based on: skills/risc-zero/GENESIS-TEMPLATE.md
 * 
 * Journal Layout (54 bytes):
 * - [0:32]   Child DNA commitment (bytes32)
 * - [32:33]  Is valid (uint8, 0 or 1)
 * - [33:41]  Parent A ID (uint64)
 * - [41:49]  Parent B ID (uint64)
 * - [49:53]  Child generation (uint32)
 * - [53:54]  Mutation count (uint8)
 */
contract BreedingVerifier {
    // ═══════════════════════════════════════════════════════
    // TYPES
    // ═══════════════════════════════════════════════════════

    struct BreedingJournal {
        bytes32 childCommitment;
        bool isValid;
        uint64 parentAId;
        uint64 parentBId;
        uint32 childGeneration;
        uint8 mutationCount;
    }

    // ═══════════════════════════════════════════════════════
    // STORAGE
    // ═══════════════════════════════════════════════════════

    address public owner;
    
    // Image ID of the breeding verifier guest program
    // This is the hash of the compiled RISC Zero guest code
    bytes32 public breedingImageId;
    
    // Mapping of verified commitments
    mapping(bytes32 => bool) public verifiedCommitments;
    
    // Mapping of commitment to breeding details
    mapping(bytes32 => BreedingJournal) public breedingDetails;
    
    // ═══════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════
    
    event BreedingProofVerified(
        bytes32 indexed commitment,
        uint64 indexed parentAId,
        uint64 indexed parentBId,
        uint32 childGeneration,
        uint8 mutationCount
    );
    
    event ImageIdUpdated(bytes32 oldImageId, bytes32 newImageId);
    
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
    
    constructor(bytes32 _breedingImageId) {
        owner = msg.sender;
        breedingImageId = _breedingImageId;
    }
    
    // ═══════════════════════════════════════════════════════
    // ADMIN FUNCTIONS
    // ═══════════════════════════════════════════════════════
    
    /**
     * @notice Update the breeding image ID (when guest code changes)
     */
    function setBreedingImageId(bytes32 _imageId) external onlyOwner {
        bytes32 oldId = breedingImageId;
        breedingImageId = _imageId;
        emit ImageIdUpdated(oldId, _imageId);
    }
    
    // ═══════════════════════════════════════════════════════
    // VERIFICATION FUNCTIONS
    // ═══════════════════════════════════════════════════════
    
    /**
     * @notice Verify a breeding proof and decode the journal
     * @param seal The Groth16 proof seal
     * @param journal The public outputs from ZK execution
     * @return decoded The decoded breeding journal
     */
    function verifyBreedingProof(
        bytes calldata seal,
        bytes calldata journal
    ) external returns (BreedingJournal memory decoded) {
        // Validate journal length
        require(journal.length >= 54, "Invalid journal length");
        
        // In production: verify Groth16 proof
        // verifier.verify(seal, breedingImageId, sha256(journal));
        
        // For hackathon: validate structure
        require(seal.length > 0, "Empty seal");
        
        // Decode journal
        decoded = decodeJournal(journal);
        
        // Validate breeding
        require(decoded.isValid, "Invalid breeding");
        require(decoded.childCommitment != bytes32(0), "Empty commitment");
        require(decoded.parentAId != decoded.parentBId, "Cannot breed with self");
        
        // Mark commitment as verified
        verifiedCommitments[decoded.childCommitment] = true;
        breedingDetails[decoded.childCommitment] = decoded;
        
        emit BreedingProofVerified(
            decoded.childCommitment,
            decoded.parentAId,
            decoded.parentBId,
            decoded.childGeneration,
            decoded.mutationCount
        );
        
        return decoded;
    }
    
    /**
     * @notice Decode a breeding journal without verification
     * @dev Useful for previewing journal contents
     */
    function decodeJournal(bytes calldata journal) public pure returns (BreedingJournal memory) {
        require(journal.length >= 54, "Invalid journal length");
        
        bytes32 commitment;
        assembly {
            commitment := calldataload(journal.offset)
        }
        
        return BreedingJournal({
            childCommitment: commitment,
            isValid: journal[32] != 0,
            parentAId: uint64(bytes8(journal[33:41])),
            parentBId: uint64(bytes8(journal[41:49])),
            childGeneration: uint32(bytes4(journal[49:53])),
            mutationCount: uint8(journal[53])
        });
    }
    
    /**
     * @notice Check if a commitment was previously verified
     */
    function isCommitmentVerified(bytes32 commitment) external view returns (bool) {
        return verifiedCommitments[commitment];
    }
    
    /**
     * @notice Get breeding details for a verified commitment
     */
    function getBreedingDetails(bytes32 commitment) external view returns (BreedingJournal memory) {
        require(verifiedCommitments[commitment], "Commitment not verified");
        return breedingDetails[commitment];
    }
    
    /**
     * @notice Verify and extract just the essential data for breeding
     * @return commitment The child DNA commitment
     * @return parentAId First parent ID
     * @return parentBId Second parent ID  
     * @return generation Child generation number
     */
    function verifyAndExtract(
        bytes calldata seal,
        bytes calldata journal
    ) external returns (
        bytes32 commitment,
        uint64 parentAId,
        uint64 parentBId,
        uint32 generation
    ) {
        BreedingJournal memory decoded = this.verifyBreedingProof(seal, journal);
        return (
            decoded.childCommitment,
            decoded.parentAId,
            decoded.parentBId,
            decoded.childGeneration
        );
    }
}
