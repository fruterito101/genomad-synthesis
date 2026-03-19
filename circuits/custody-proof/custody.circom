pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";

/*
 * CustodyProof Circuit
 * Proves custody threshold without revealing exact percentage.
 */
template CustodyProof() {
    signal input tokenId;
    signal input claimer;
    signal input threshold;
    signal input custodyCommitment;
    
    signal input actualCustody;
    signal input salt;
    
    signal output valid;
    
    // Threshold check
    component gte = GreaterEqThan(16);
    gte.in[0] <== actualCustody;
    gte.in[1] <== threshold;
    signal thresholdMet <== gte.out;
    
    // Range check
    component lte = LessEqThan(16);
    lte.in[0] <== actualCustody;
    lte.in[1] <== 10000;
    signal rangeValid <== lte.out;
    
    // Commitment
    component commitHash = Poseidon(4);
    commitHash.inputs[0] <== tokenId;
    commitHash.inputs[1] <== claimer;
    commitHash.inputs[2] <== actualCustody;
    commitHash.inputs[3] <== salt;
    
    component commitEq = IsEqual();
    commitEq.in[0] <== commitHash.out;
    commitEq.in[1] <== custodyCommitment;
    signal commitmentValid <== commitEq.out;
    
    // Two-step multiplication
    signal step1 <== thresholdMet * rangeValid;
    valid <== step1 * commitmentValid;
}

component main {public [tokenId, claimer, threshold, custodyCommitment]} = CustodyProof();
