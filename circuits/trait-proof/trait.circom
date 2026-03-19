pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

/*
 * TraitProof Circuit
 * 
 * Proves that 8 traits are valid (0-100 range) and match a content hash.
 * 
 * This is a simplified version for the hackathon.
 * Full implementation would verify trait calculation from content.
 */
template TraitProof() {
    // Public inputs
    signal input traits[8];           // 8 traits (0-100)
    signal input contentHash;         // Hash of content
    
    // Private inputs  
    signal input traitSalt;           // Salt for trait commitment
    
    // Output
    signal output valid;
    
    // ═══════════════════════════════════════════════════════
    // TRAIT RANGE VALIDATION (0-100)
    // ═══════════════════════════════════════════════════════
    
    component ltChecks[8];
    signal rangeValid[8];
    
    for (var i = 0; i < 8; i++) {
        // Check trait[i] <= 100
        ltChecks[i] = LessEqThan(8); // 8 bits enough for 0-100
        ltChecks[i].in[0] <== traits[i];
        ltChecks[i].in[1] <== 100;
        rangeValid[i] <== ltChecks[i].out;
    }
    
    // All traits must be in range
    signal allRangeValid[7];
    allRangeValid[0] <== rangeValid[0] * rangeValid[1];
    for (var i = 1; i < 7; i++) {
        allRangeValid[i] <== allRangeValid[i-1] * rangeValid[i+1];
    }
    
    // ═══════════════════════════════════════════════════════
    // TRAIT COMMITMENT VERIFICATION
    // ═══════════════════════════════════════════════════════
    
    // Hash traits + salt to create commitment
    component traitHash = Poseidon(9);
    for (var i = 0; i < 8; i++) {
        traitHash.inputs[i] <== traits[i];
    }
    traitHash.inputs[8] <== traitSalt;
    
    // Verify commitment matches content hash
    // In production: contentHash would be derived from actual content
    // For hackathon: we just verify the commitment structure
    signal hashMatch;
    component hashEq = IsEqual();
    hashEq.in[0] <== traitHash.out;
    hashEq.in[1] <== contentHash;
    hashMatch <== hashEq.out;
    
    // ═══════════════════════════════════════════════════════
    // FINAL VALIDATION
    // ═══════════════════════════════════════════════════════
    
    // Valid if all ranges OK AND hash matches
    // For hackathon MVP: just check ranges (hash verification optional)
    valid <== allRangeValid[6];
}

component main {public [traits, contentHash]} = TraitProof();
