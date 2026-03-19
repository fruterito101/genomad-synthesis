//! Genomad Breeding Proof Generator - RISC Zero Host Program
//!
//! Based on: skills/risc-zero/HOST-CODE.md
//!
//! Generates ZK proofs for breeding verification

use methods::BREEDING_VERIFIER_ELF;
use risc0_zkvm::{default_prover, ExecutorEnv};

/// Number of traits in DNA
const NUM_TRAITS: usize = 8;

/// DNA input structure (matches guest)
#[derive(Debug, Clone)]
pub struct AgentDNA {
    pub traits: [u8; NUM_TRAITS],
    pub generation: u32,
}

impl AgentDNA {
    pub fn to_bytes(&self) -> [u8; 12] {
        let mut bytes = [0u8; 12];
        bytes[..8].copy_from_slice(&self.traits);
        bytes[8..12].copy_from_slice(&self.generation.to_le_bytes());
        bytes
    }
}

/// Result of proof generation
#[derive(Debug)]
pub struct BreedingProof {
    pub seal: Vec<u8>,
    pub journal: Vec<u8>,
    pub child_commitment: [u8; 32],
    pub is_valid: bool,
    pub parent_a_id: u64,
    pub parent_b_id: u64,
    pub child_generation: u32,
    pub mutation_count: u8,
}

/// Generate a ZK proof for breeding verification
pub fn generate_breeding_proof(
    parent_a: AgentDNA,
    parent_b: AgentDNA,
    child: AgentDNA,
    parent_a_id: u64,
    parent_b_id: u64,
) -> Result<BreedingProof, Box<dyn std::error::Error>> {
    println!("[ZK] Preparing inputs...");
    
    // Create executor environment with inputs
    let env = ExecutorEnv::builder()
        .write(&parent_a.to_bytes())?
        .write(&parent_b.to_bytes())?
        .write(&child.to_bytes())?
        .write(&parent_a_id)?
        .write(&parent_b_id)?
        .build()?;

    println!("[ZK] Generating proof (this may take a while)...");
    
    // Generate the proof
    let prover = default_prover();
    let prove_info = prover.prove(env, BREEDING_VERIFIER_ELF)?;
    let receipt = prove_info.receipt;

    println!("[ZK] Proof generated! Extracting outputs...");
    
    // Extract journal (public outputs)
    let journal_bytes = receipt.journal.bytes.clone();
    
    // Decode outputs from journal
    // Layout: commitment(32) + is_valid(1) + parent_a_id(8) + parent_b_id(8) + generation(4) + mutations(1)
    let mut child_commitment = [0u8; 32];
    child_commitment.copy_from_slice(&journal_bytes[0..32]);
    
    let is_valid = journal_bytes[32] != 0;
    
    let parent_a_id_out = u64::from_le_bytes(journal_bytes[33..41].try_into()?);
    let parent_b_id_out = u64::from_le_bytes(journal_bytes[41..49].try_into()?);
    let child_generation = u32::from_le_bytes(journal_bytes[49..53].try_into()?);
    let mutation_count = journal_bytes[53];

    // Get the seal (proof data)
    let seal = receipt.inner.groth16()?.seal.clone();

    Ok(BreedingProof {
        seal,
        journal: journal_bytes,
        child_commitment,
        is_valid,
        parent_a_id: parent_a_id_out,
        parent_b_id: parent_b_id_out,
        child_generation,
        mutation_count,
    })
}

fn main() {
    println!("╔══════════════════════════════════════════════════════════╗");
    println!("║     GENOMAD — ZK Breeding Proof Generator               ║");
    println!("║     Powered by RISC Zero                                ║");
    println!("╚══════════════════════════════════════════════════════════╝");
    println!();

    // Example: Fruterito x Jazzita breeding
    let fruterito = AgentDNA {
        traits: [85, 78, 72, 80, 60, 75, 82, 70], // social, technical, creativity, analysis, trading, empathy, teaching, leadership
        generation: 0,
    };
    
    let jazzita = AgentDNA {
        traits: [92, 87, 85, 88, 65, 94, 85, 75],
        generation: 0,
    };
    
    // Valid child (traits within mutation range of parents average)
    let child = AgentDNA {
        traits: [88, 82, 78, 84, 62, 84, 83, 72],
        generation: 1,
    };

    println!("Parent A (Fruterito): {:?}", fruterito.traits);
    println!("Parent B (Jazzita):   {:?}", jazzita.traits);
    println!("Child:                {:?}", child.traits);
    println!();

    match generate_breeding_proof(fruterito, jazzita, child, 1, 2) {
        Ok(proof) => {
            println!("✅ Proof generated successfully!");
            println!();
            println!("📊 Proof Details:");
            println!("   Seal size:        {} bytes", proof.seal.len());
            println!("   Journal size:     {} bytes", proof.journal.len());
            println!("   Child commitment: 0x{}", hex::encode(&proof.child_commitment));
            println!("   Is valid:         {}", proof.is_valid);
            println!("   Parent A ID:      {}", proof.parent_a_id);
            println!("   Parent B ID:      {}", proof.parent_b_id);
            println!("   Child generation: {}", proof.child_generation);
            println!("   Mutation count:   {}", proof.mutation_count);
            println!();
            println!("🔒 Private data (NOT revealed):");
            println!("   - Exact trait values of all agents");
            println!("   - Which parent contributed which traits");
            println!("   - Specific mutation amounts");
        }
        Err(e) => {
            println!("❌ Proof generation failed: {}", e);
        }
    }
}
