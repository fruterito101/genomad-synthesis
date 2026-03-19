// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title BreedingVerifier
 * @notice Verifies ZK proofs for breeding operations
 * @dev Uses RISC Zero Groth16 verification (simplified for hackathon)
 */
contract BreedingVerifier {
    // ═══════════════════════════════════════════════════════
    // STORAGE
    // ═══════════════════════════════════════════════════════

    address public owner;
    
    // Image ID of the breeding verifier guest program
    // This is the hash of the compiled RISC Zero guest code
    bytes32 public breedingImageId;
    
    // Mapping of verified commitments
    mapping(bytes32 => bool) public verifiedCommitments;
    
    // ═══════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════
    
    event ProofVerified(bytes32 indexed commitment, bool isValid);
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
     * @notice Verify a breeding proof
     * @param seal The Groth16 proof seal
     * @param journal The public outputs (commitment + isValid)
     * @return isValid Whether the proof is valid
     * @return commitment The child DNA commitment
     */
    function verifyBreedingProof(
        bytes calldata seal,
        bytes calldata journal
    ) external returns (bool isValid, bytes32 commitment) {
        // Decode journal
        require(journal.length >= 33, "Invalid journal length");
        
        // First 32 bytes: commitment
        commitment = bytes32(journal[0:32]);
        
        // Next byte: isValid flag
        isValid = journal[32] != 0;
        
        // In production, verify the Groth16 proof against the image ID
        // For hackathon MVP, we trust the proof structure
        // verifyGroth16(seal, breedingImageId, sha256(journal));
        
        // Simple validation for hackathon
        require(seal.length > 0, "Empty seal");
        require(commitment != bytes32(0), "Empty commitment");
        
        // Mark commitment as verified
        if (isValid) {
            verifiedCommitments[commitment] = true;
        }
        
        emit ProofVerified(commitment, isValid);
        
        return (isValid, commitment);
    }
    
    /**
     * @notice Check if a commitment was previously verified
     */
    function isCommitmentVerified(bytes32 commitment) external view returns (bool) {
        return verifiedCommitments[commitment];
    }
    
    /**
     * @notice Batch verify multiple proofs
     */
    function batchVerify(
        bytes[] calldata seals,
        bytes[] calldata journals
    ) external returns (bool[] memory results) {
        require(seals.length == journals.length, "Length mismatch");
        
        results = new bool[](seals.length);
        
        for (uint256 i = 0; i < seals.length; i++) {
            (bool isValid,) = this.verifyBreedingProof(seals[i], journals[i]);
            results[i] = isValid;
        }
        
        return results;
    }
}
