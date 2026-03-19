//! Genomad ZK Host - Orchestrates proof generation

use methods::{GENOMAD_PROOF_ELF, GENOMAD_PROOF_ID};
use risc0_zkvm::{default_prover, ExecutorEnv, Receipt};
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct Traits {
    pub intelligence: u8,
    pub creativity: u8,
    pub empathy: u8,
    pub resilience: u8,
    pub curiosity: u8,
    pub humor: u8,
    pub wisdom: u8,
    pub charisma: u8,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum ProofRequest {
    Trait(TraitProofInput),
    Breed(BreedProofInput),
    Custody(CustodyProofInput),
    Ownership(OwnershipProofInput),
}

#[derive(Debug, Serialize, Deserialize)]
pub enum ProofOutput {
    Trait(TraitProofOutput),
    Breed(BreedProofOutput),
    Custody(CustodyProofOutput),
    Ownership(OwnershipProofOutput),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TraitProofInput {
    pub traits: Traits,
    pub salt: [u8; 32],
    pub expected_commitment: [u8; 32],
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TraitProofOutput {
    pub commitment: [u8; 32],
    pub traits_valid: bool,
    pub commitment_valid: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BreedProofInput {
    pub parent_a: Traits,
    pub parent_b: Traits,
    pub child: Traits,
    pub crossover_mask: [bool; 8],
    pub max_mutation: u8,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BreedProofOutput {
    pub parent_a_hash: [u8; 32],
    pub parent_b_hash: [u8; 32],
    pub child_hash: [u8; 32],
    pub valid: bool,
    pub mutations: [bool; 8],
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CustodyProofInput {
    pub token_id: u64,
    pub claimer: [u8; 20],
    pub threshold: u16,
    pub actual_custody: u16,
    pub salt: [u8; 32],
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CustodyProofOutput {
    pub token_id: u64,
    pub claimer: [u8; 20],
    pub threshold: u16,
    pub commitment: [u8; 32],
    pub threshold_met: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OwnershipProofInput {
    pub token_id: u64,
    pub message: Vec<u8>,
    pub signature: Vec<u8>,
    pub owner: [u8; 20],
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OwnershipProofOutput {
    pub token_id: u64,
    pub message_hash: [u8; 32],
    pub owner: [u8; 20],
    pub valid: bool,
}

pub fn prove(request: ProofRequest) -> Receipt {
    let env = ExecutorEnv::builder()
        .write(&request)
        .expect("Failed to write request")
        .build()
        .expect("Failed to build env");

    let prover = default_prover();
    let prove_info = prover
        .prove(env, GENOMAD_PROOF_ELF)
        .expect("Failed to generate proof");

    prove_info.receipt
}

pub fn verify_and_decode(receipt: &Receipt) -> ProofOutput {
    receipt.verify(GENOMAD_PROOF_ID).expect("Proof verification failed");
    receipt.journal.decode().expect("Failed to decode journal")
}

fn main() {
    println!("╔══════════════════════════════════════════════════════════════╗");
    println!("║              GENOMAD ZK PROOF SYSTEM (RISC Zero)             ║");
    println!("╚══════════════════════════════════════════════════════════════╝\n");

    // Test TraitProof
    println!("🧬 Testing TraitProof...");
    let traits = Traits {
        intelligence: 85, creativity: 72, empathy: 90, resilience: 65,
        curiosity: 88, humor: 55, wisdom: 78, charisma: 82,
    };
    let salt = [0u8; 32];
    
    use sha2::{Sha256, Digest};
    let mut hasher = Sha256::new();
    hasher.update([traits.intelligence, traits.creativity, traits.empathy, 
                   traits.resilience, traits.curiosity, traits.humor,
                   traits.wisdom, traits.charisma]);
    hasher.update(salt);
    let expected_commitment: [u8; 32] = hasher.finalize().into();

    let trait_request = ProofRequest::Trait(TraitProofInput {
        traits: traits.clone(),
        salt,
        expected_commitment,
    });

    println!("   Generating proof...");
    let receipt = prove(trait_request);
    let output = verify_and_decode(&receipt);

    if let ProofOutput::Trait(result) = output {
        println!("   ✅ Traits valid: {}", result.traits_valid);
        println!("   ✅ Commitment valid: {}", result.commitment_valid);
        println!("   📝 Commitment: 0x{}\n", hex::encode(result.commitment));
    }

    // Test BreedProof
    println!("🧪 Testing BreedProof...");
    let parent_a = Traits {
        intelligence: 80, creativity: 60, empathy: 70, resilience: 90,
        curiosity: 75, humor: 50, wisdom: 85, charisma: 65,
    };
    let parent_b = Traits {
        intelligence: 70, creativity: 90, empathy: 60, resilience: 80,
        curiosity: 85, humor: 70, wisdom: 75, charisma: 80,
    };
    let child = Traits {
        intelligence: 82, creativity: 88, empathy: 68, resilience: 82,
        curiosity: 77, humor: 68, wisdom: 83, charisma: 78,
    };
    let crossover_mask = [true, false, true, false, true, false, true, false];

    let breed_request = ProofRequest::Breed(BreedProofInput {
        parent_a, parent_b, child, crossover_mask, max_mutation: 10,
    });

    println!("   Generating proof...");
    let receipt = prove(breed_request);
    let output = verify_and_decode(&receipt);

    if let ProofOutput::Breed(result) = output {
        println!("   ✅ Breeding valid: {}", result.valid);
        println!("   🧬 Mutations: {:?}\n", result.mutations);
    }

    // Test CustodyProof
    println!("🔐 Testing CustodyProof...");
    let custody_request = ProofRequest::Custody(CustodyProofInput {
        token_id: 42,
        claimer: [0x12; 20],
        threshold: 5000,     // 50%
        actual_custody: 7500, // 75% (hidden)
        salt: [0u8; 32],
    });

    println!("   Generating proof...");
    let receipt = prove(custody_request);
    let output = verify_and_decode(&receipt);

    if let ProofOutput::Custody(result) = output {
        println!("   ✅ Threshold met (≥50%): {}", result.threshold_met);
        println!("   🔒 Actual percentage: HIDDEN\n");
    }

    println!("═══════════════════════════════════════════════════════════════");
    println!("📋 IMAGE ID for Solidity:");
    println!("   bytes32 constant GENOMAD_IMAGE_ID = 0x{};", hex::encode(bytemuck::bytes_of(&GENOMAD_PROOF_ID)));
    println!("═══════════════════════════════════════════════════════════════");
}
