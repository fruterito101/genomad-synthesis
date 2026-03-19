//! Breeding Proof Generator - RISC Zero Host Program
//!
//! Generates ZK proofs for breeding verification

use methods::BREEDING_VERIFIER_ELF;
use risc0_zkvm::{default_prover, ExecutorEnv, ProverOpts, VerifierContext};

/// Number of traits in DNA
const NUM_TRAITS: usize = 8;

/// Result of proof generation
#[derive(Debug)]
pub struct BreedingProof {
    pub seal: Vec<u8>,
    pub journal: Vec<u8>,
    pub child_commitment: [u8; 32],
    pub is_valid: bool,
}

/// Generate a ZK proof for breeding verification
pub fn generate_breeding_proof(
    parent_a: [u8; NUM_TRAITS],
    parent_b: [u8; NUM_TRAITS],
    child: [u8; NUM_TRAITS],
) -> Result<BreedingProof, Box<dyn std::error::Error>> {
    // Create executor environment with inputs
    let env = ExecutorEnv::builder()
        .write(&parent_a)?
        .write(&parent_b)?
        .write(&child)?
        .build()?;

    // Generate the proof
    let prover = default_prover();
    let prove_info = prover.prove(env, BREEDING_VERIFIER_ELF)?;
    let receipt = prove_info.receipt;

    // Extract journal (public outputs)
    let journal_bytes = receipt.journal.bytes.clone();
    
    // Decode commitment and validity from journal
    let mut child_commitment = [0u8; 32];
    child_commitment.copy_from_slice(&journal_bytes[0..32]);
    let is_valid = journal_bytes[32] != 0;

    // Get the seal (proof data)
    let seal = receipt.inner.groth16()?.seal.clone();

    Ok(BreedingProof {
        seal,
        journal: journal_bytes,
        child_commitment,
        is_valid,
    })
}

/// Verify a breeding proof locally (for testing)
pub fn verify_breeding_proof(proof: &BreedingProof) -> bool {
    // In production, verification happens on-chain
    // This is just for local testing
    proof.is_valid
}

fn main() {
    println!("Genomad Breeding Proof Generator");
    println!("================================\n");

    // Example: Generate proof for test breeding
    let parent_a: [u8; NUM_TRAITS] = [85, 78, 72, 80, 60, 75, 82, 70]; // Fruterito-like
    let parent_b: [u8; NUM_TRAITS] = [92, 87, 85, 88, 65, 94, 85, 75]; // Jazzita-like
    
    // Child with valid traits (within mutation range of parents average)
    let child: [u8; NUM_TRAITS] = [88, 82, 78, 84, 62, 84, 83, 72];

    println!("Parent A traits: {:?}", parent_a);
    println!("Parent B traits: {:?}", parent_b);
    println!("Child traits:    {:?}", child);
    println!();

    match generate_breeding_proof(parent_a, parent_b, child) {
        Ok(proof) => {
            println!("✓ Proof generated successfully!");
            println!("  Seal size: {} bytes", proof.seal.len());
            println!("  Journal size: {} bytes", proof.journal.len());
            println!("  Child commitment: 0x{}", hex::encode(&proof.child_commitment));
            println!("  Is valid: {}", proof.is_valid);
        }
        Err(e) => {
            println!("✗ Proof generation failed: {}", e);
        }
    }
}
