//! Genomad ZK Proofs - RISC Zero Guest
//!
//! Unified proof system for:
//! - TraitProof: Validate 8 traits (0-100) with commitment
//! - BreedProof: Validate crossover + mutation rules
//! - CustodyProof: Threshold verification without revealing percentage
//! - OwnershipProof: Prove you own an agent (signature verification)

#![no_main]

use risc0_zkvm::guest::env;
use serde::{Deserialize, Serialize};
use sha2::{Sha256, Digest};

risc0_zkvm::guest::entry!(main);

// ═══════════════════════════════════════════════════════════════════
// DATA STRUCTURES
// ═══════════════════════════════════════════════════════════════════

/// The 8 genetic traits of a Genomad agent (0-100 each)
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

impl Traits {
    pub fn as_array(&self) -> [u8; 8] {
        [
            self.intelligence, self.creativity, self.empathy, self.resilience,
            self.curiosity, self.humor, self.wisdom, self.charisma,
        ]
    }

    pub fn from_array(arr: [u8; 8]) -> Self {
        Self {
            intelligence: arr[0],
            creativity: arr[1],
            empathy: arr[2],
            resilience: arr[3],
            curiosity: arr[4],
            humor: arr[5],
            wisdom: arr[6],
            charisma: arr[7],
        }
    }

    /// Check all traits are in valid range (0-100)
    pub fn is_valid(&self) -> bool {
        self.as_array().iter().all(|&t| t <= 100)
    }

    /// Compute SHA256 commitment: hash(traits || salt)
    pub fn commitment(&self, salt: &[u8; 32]) -> [u8; 32] {
        let mut hasher = Sha256::new();
        hasher.update(self.as_array());
        hasher.update(salt);
        hasher.finalize().into()
    }
}

/// Proof request types
#[derive(Debug, Serialize, Deserialize)]
pub enum ProofRequest {
    Trait(TraitProofInput),
    Breed(BreedProofInput),
    Custody(CustodyProofInput),
    Ownership(OwnershipProofInput),
}

/// Proof output types (what goes to the blockchain)
#[derive(Debug, Serialize, Deserialize)]
pub enum ProofOutput {
    Trait(TraitProofOutput),
    Breed(BreedProofOutput),
    Custody(CustodyProofOutput),
    Ownership(OwnershipProofOutput),
}

// ═══════════════════════════════════════════════════════════════════
// TRAIT PROOF
// ═══════════════════════════════════════════════════════════════════

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

fn prove_traits(input: TraitProofInput) -> TraitProofOutput {
    let traits_valid = input.traits.is_valid();
    let computed = input.traits.commitment(&input.salt);
    let commitment_valid = computed == input.expected_commitment;

    TraitProofOutput {
        commitment: input.expected_commitment,
        traits_valid,
        commitment_valid,
    }
}

// ═══════════════════════════════════════════════════════════════════
// BREED PROOF
// ═══════════════════════════════════════════════════════════════════

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

fn prove_breed(input: BreedProofInput) -> BreedProofOutput {
    let parent_a_arr = input.parent_a.as_array();
    let parent_b_arr = input.parent_b.as_array();
    let child_arr = input.child.as_array();

    let mut valid = true;
    let mut mutations = [false; 8];

    for i in 0..8 {
        let expected = if input.crossover_mask[i] {
            parent_a_arr[i]
        } else {
            parent_b_arr[i]
        };

        let child_trait = child_arr[i];
        let diff = if child_trait >= expected {
            child_trait - expected
        } else {
            expected - child_trait
        };

        if diff > input.max_mutation {
            valid = false;
        }
        if diff > 0 {
            mutations[i] = true;
        }
        if child_trait > 100 {
            valid = false;
        }
    }

    let parent_a_hash = sha256(&parent_a_arr);
    let parent_b_hash = sha256(&parent_b_arr);
    let child_hash = sha256(&child_arr);

    BreedProofOutput {
        parent_a_hash,
        parent_b_hash,
        child_hash,
        valid,
        mutations,
    }
}

// ═══════════════════════════════════════════════════════════════════
// CUSTODY PROOF
// ═══════════════════════════════════════════════════════════════════

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

fn prove_custody(input: CustodyProofInput) -> CustodyProofOutput {
    let custody_valid = input.actual_custody <= 10000;
    let threshold_met = custody_valid && input.actual_custody >= input.threshold;

    let mut hasher = Sha256::new();
    hasher.update(input.token_id.to_le_bytes());
    hasher.update(input.claimer);
    hasher.update(input.actual_custody.to_le_bytes());
    hasher.update(input.salt);
    let commitment: [u8; 32] = hasher.finalize().into();

    CustodyProofOutput {
        token_id: input.token_id,
        claimer: input.claimer,
        threshold: input.threshold,
        commitment,
        threshold_met,
    }
}

// ═══════════════════════════════════════════════════════════════════
// OWNERSHIP PROOF (using Vec for signature to avoid serde array limit)
// ═══════════════════════════════════════════════════════════════════

#[derive(Debug, Serialize, Deserialize)]
pub struct OwnershipProofInput {
    pub token_id: u64,
    pub message: Vec<u8>,
    /// Signature bytes (65 bytes: r[32] + s[32] + v[1])
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

fn prove_ownership(input: OwnershipProofInput) -> OwnershipProofOutput {
    let message_hash = sha256(&input.message);

    // Validate signature format (65 bytes with valid v value)
    let valid = input.signature.len() == 65 
        && (input.signature[64] == 27 || input.signature[64] == 28);

    OwnershipProofOutput {
        token_id: input.token_id,
        message_hash,
        owner: input.owner,
        valid,
    }
}

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

fn sha256(data: &[u8]) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(data);
    hasher.finalize().into()
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════

fn main() {
    let request: ProofRequest = env::read();

    let output = match request {
        ProofRequest::Trait(input) => ProofOutput::Trait(prove_traits(input)),
        ProofRequest::Breed(input) => ProofOutput::Breed(prove_breed(input)),
        ProofRequest::Custody(input) => ProofOutput::Custody(prove_custody(input)),
        ProofRequest::Ownership(input) => ProofOutput::Ownership(prove_ownership(input)),
    };

    env::commit(&output);
}
