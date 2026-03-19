// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IRiscZeroVerifier} from "risc0/IRiscZeroVerifier.sol";

/**
 * @title GenomadVerifier
 * @notice Verifies RISC Zero proofs for Genomad operations
 * @dev Uses the deployed RiscZeroVerifierRouter on Monad
 */
contract GenomadVerifier {
    // ═══════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════
    
    /// @notice The RISC Zero verifier contract
    IRiscZeroVerifier public immutable verifier;
    
    /// @notice The image ID of the genomad-proof guest program
    /// @dev This is set after compiling the guest
    bytes32 public immutable imageId;
    
    /// @notice Owner for emergency functions
    address public owner;
    
    /// @notice Whether verification is bypassed (for testing)
    bool public bypassMode;
    
    // ═══════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════
    
    event TraitProofVerified(bytes32 indexed commitment, bool traitsValid, bool commitmentValid);
    event BreedProofVerified(bytes32 indexed childHash, bytes32 parentAHash, bytes32 parentBHash, bool valid);
    event CustodyProofVerified(uint64 indexed tokenId, address claimer, uint16 threshold, bool met);
    event OwnershipProofVerified(uint64 indexed tokenId, address owner, bool valid);
    
    // ═══════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════
    
    constructor(address _verifier, bytes32 _imageId, bool _bypassMode) {
        verifier = IRiscZeroVerifier(_verifier);
        imageId = _imageId;
        owner = msg.sender;
        bypassMode = _bypassMode;
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // PROOF VERIFICATION
    // ═══════════════════════════════════════════════════════════════════
    
    /**
     * @notice Verify a trait proof
     * @param seal The RISC Zero proof seal
     * @param journal The public outputs (commitment, traitsValid, commitmentValid)
     * @return commitment The verified trait commitment
     * @return traitsValid Whether all traits are in valid range
     * @return commitmentValid Whether the commitment matches
     */
    function verifyTraitProof(
        bytes calldata seal,
        bytes calldata journal
    ) external returns (bytes32 commitment, bool traitsValid, bool commitmentValid) {
        if (!bypassMode) {
            // Verify the ZK proof
            verifier.verify(seal, imageId, sha256(journal));
        }
        
        // Decode journal (ProofOutput::Trait)
        // Journal format: [type(1), commitment(32), traitsValid(1), commitmentValid(1)]
        require(journal.length >= 35, "Invalid journal length");
        require(journal[0] == 0x00, "Not a TraitProof"); // Type discriminant
        
        assembly {
            commitment := calldataload(add(journal.offset, 1))
            traitsValid := byte(0, calldataload(add(journal.offset, 33)))
            commitmentValid := byte(0, calldataload(add(journal.offset, 34)))
        }
        
        emit TraitProofVerified(commitment, traitsValid, commitmentValid);
    }
    
    /**
     * @notice Verify a breed proof
     * @param seal The RISC Zero proof seal
     * @param journal The public outputs
     * @return childHash Hash of child traits
     * @return valid Whether breeding rules were followed
     */
    function verifyBreedProof(
        bytes calldata seal,
        bytes calldata journal
    ) external returns (bytes32 childHash, bool valid) {
        if (!bypassMode) {
            verifier.verify(seal, imageId, sha256(journal));
        }
        
        // Decode journal (ProofOutput::Breed)
        // Format: [type(1), parentAHash(32), parentBHash(32), childHash(32), valid(1), mutations(8)]
        require(journal.length >= 106, "Invalid journal length");
        require(journal[0] == 0x01, "Not a BreedProof");
        
        bytes32 parentAHash;
        bytes32 parentBHash;
        
        assembly {
            parentAHash := calldataload(add(journal.offset, 1))
            parentBHash := calldataload(add(journal.offset, 33))
            childHash := calldataload(add(journal.offset, 65))
            valid := byte(0, calldataload(add(journal.offset, 97)))
        }
        
        emit BreedProofVerified(childHash, parentAHash, parentBHash, valid);
    }
    
    /**
     * @notice Verify a custody proof
     * @param seal The RISC Zero proof seal  
     * @param journal The public outputs
     * @return tokenId The token being verified
     * @return thresholdMet Whether the custody threshold is met
     */
    function verifyCustodyProof(
        bytes calldata seal,
        bytes calldata journal
    ) external returns (uint64 tokenId, bool thresholdMet) {
        if (!bypassMode) {
            verifier.verify(seal, imageId, sha256(journal));
        }
        
        // Decode journal (ProofOutput::Custody)
        // Format: [type(1), tokenId(8), claimer(20), threshold(2), commitment(32), thresholdMet(1)]
        require(journal.length >= 64, "Invalid journal length");
        require(journal[0] == 0x02, "Not a CustodyProof");
        
        address claimer;
        uint16 threshold;
        
        assembly {
            tokenId := shr(192, calldataload(add(journal.offset, 1)))
            claimer := shr(96, calldataload(add(journal.offset, 9)))
            threshold := shr(240, calldataload(add(journal.offset, 29)))
            thresholdMet := byte(0, calldataload(add(journal.offset, 63)))
        }
        
        emit CustodyProofVerified(tokenId, claimer, threshold, thresholdMet);
    }
    
    /**
     * @notice Verify an ownership proof
     * @param seal The RISC Zero proof seal
     * @param journal The public outputs
     * @return tokenId The token being verified
     * @return valid Whether ownership is proven
     */
    function verifyOwnershipProof(
        bytes calldata seal,
        bytes calldata journal
    ) external returns (uint64 tokenId, bool valid) {
        if (!bypassMode) {
            verifier.verify(seal, imageId, sha256(journal));
        }
        
        // Decode journal (ProofOutput::Ownership)
        // Format: [type(1), tokenId(8), messageHash(32), owner(20), valid(1)]
        require(journal.length >= 62, "Invalid journal length");
        require(journal[0] == 0x03, "Not an OwnershipProof");
        
        address owner_;
        
        assembly {
            tokenId := shr(192, calldataload(add(journal.offset, 1)))
            owner_ := shr(96, calldataload(add(journal.offset, 41)))
            valid := byte(0, calldataload(add(journal.offset, 61)))
        }
        
        emit OwnershipProofVerified(tokenId, owner_, valid);
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // ADMIN
    // ═══════════════════════════════════════════════════════════════════
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    function setBypassMode(bool _bypass) external onlyOwner {
        bypassMode = _bypass;
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        owner = newOwner;
    }
}
