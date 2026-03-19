pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/mux1.circom";

/*
 * BreedProof Circuit - Simplified for hackathon
 */
template BreedProof() {
    signal input parentATraits[8];
    signal input parentBTraits[8];
    signal input childTraits[8];
    signal input crossoverMask[8];
    
    signal output valid;
    
    component muxes[8];
    component lowerBound[8];
    component upperBound[8];
    component childRange[8];
    
    signal expectedTrait[8];
    signal diff[8];
    signal lowerOk[8];
    signal upperOk[8];
    signal boundsOk[8];
    signal traitValid[8];
    
    for (var i = 0; i < 8; i++) {
        muxes[i] = Mux1();
        muxes[i].c[0] <== parentBTraits[i];
        muxes[i].c[1] <== parentATraits[i];
        muxes[i].s <== crossoverMask[i];
        expectedTrait[i] <== muxes[i].out;
        
        diff[i] <== childTraits[i] - expectedTrait[i] + 10;
        
        lowerBound[i] = GreaterEqThan(8);
        lowerBound[i].in[0] <== diff[i];
        lowerBound[i].in[1] <== 0;
        lowerOk[i] <== lowerBound[i].out;
        
        upperBound[i] = LessEqThan(8);
        upperBound[i].in[0] <== diff[i];
        upperBound[i].in[1] <== 20;
        upperOk[i] <== upperBound[i].out;
        
        childRange[i] = LessEqThan(8);
        childRange[i].in[0] <== childTraits[i];
        childRange[i].in[1] <== 100;
        
        // Split into two steps to avoid non-quadratic
        boundsOk[i] <== lowerOk[i] * upperOk[i];
        traitValid[i] <== boundsOk[i] * childRange[i].out;
    }
    
    signal allValid[7];
    allValid[0] <== traitValid[0] * traitValid[1];
    for (var i = 1; i < 7; i++) {
        allValid[i] <== allValid[i-1] * traitValid[i+1];
    }
    
    valid <== allValid[6];
}

component main {public [parentATraits, parentBTraits, childTraits]} = BreedProof();
