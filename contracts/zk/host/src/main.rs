//! Genomad Breeding Proof Generator - RISC Zero Host Program

use methods::BREEDING_VERIFIER_ELF;
use risc0_zkvm::{default_prover, ExecutorEnv};

const NUM_TRAITS: usize = 8;

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

fn main() {
    println!("Genomad Breeding Proof Generator");
    println!("================================\n");

    // Tiamat (Genesis)
    let tiamat = AgentDNA {
        traits: [90, 80, 92, 85, 45, 86, 75, 85], // social, tech, creativity, analysis, trading, empathy, teaching, leadership
        generation: 0,
    };
    
    // Apsu (Genesis)
    let apsu = AgentDNA {
        traits: [80, 90, 72, 82, 50, 75, 90, 85],
        generation: 0,
    };
    
    // Valid child (average of parents ± mutation)
    let child = AgentDNA {
        traits: [85, 85, 82, 83, 47, 80, 82, 85],
        generation: 1,
    };

    println!("Parent A (Tiamat): {:?}", tiamat.traits);
    println!("Parent B (Apsu):   {:?}", apsu.traits);
    println!("Child traits:      {:?}", child.traits);
    println!();

    // Build environment
    let env = ExecutorEnv::builder()
        .write(&tiamat.to_bytes()).unwrap()
        .write(&apsu.to_bytes()).unwrap()
        .write(&child.to_bytes()).unwrap()
        .write(&1u64).unwrap()  // parent_a_id
        .write(&2u64).unwrap()  // parent_b_id
        .build()
        .unwrap();

    println!("[ZK] Generating proof...");
    
    let prover = default_prover();
    match prover.prove(env, BREEDING_VERIFIER_ELF) {
        Ok(prove_info) => {
            let receipt = prove_info.receipt;
            let journal = &receipt.journal.bytes;
            
            println!("\n✅ PROOF GENERATED!");
            println!("==================\n");
            
            // Parse journal output
            if journal.len() >= 54 {
                let commitment = &journal[0..32];
                let is_valid = journal[32] != 0;
                let parent_a = u64::from_le_bytes(journal[33..41].try_into().unwrap());
                let parent_b = u64::from_le_bytes(journal[41..49].try_into().unwrap());
                let gen = u32::from_le_bytes(journal[49..53].try_into().unwrap());
                let mutations = journal[53];
                
                println!("📊 Public Outputs (Journal):");
                println!("   Child commitment: 0x{}...", hex::encode(&commitment[..8]));
                println!("   Breeding valid:   {}", if is_valid { "✓ YES" } else { "✗ NO" });
                println!("   Parent A ID:      {}", parent_a);
                println!("   Parent B ID:      {}", parent_b);
                println!("   Child generation: {}", gen);
                println!("   Mutations:        {}", mutations);
                println!();
                println!("🔒 Private (ZK-hidden):");
                println!("   - Exact trait values");
                println!("   - Mutation amounts");
                println!("   - Parent contributions");
            }
            
            // Verify the proof
            match receipt.verify(methods::BREEDING_VERIFIER_ID) {
                Ok(_) => println!("\n🔐 Proof VERIFIED against image ID!"),
                Err(e) => println!("\n⚠️  Verification failed: {}", e),
            }
        }
        Err(e) => {
            println!("❌ Proof failed: {}", e);
        }
    }
}
