//! 🧬 GENOMAD ZK ULTRA HOST — Full Power Orchestrator
//!
//! Tests all 7 proof types:
//! 1. TraitProof, 2. BreedProof, 3. CustodyProof, 4. OwnershipProof
//! 5. LineageProof, 6. ContentProof, 7. EvolutionProof

use methods::{GENOMAD_PROOF_ELF, GENOMAD_PROOF_ID};
use risc0_zkvm::{default_prover, ExecutorEnv, Receipt};
use serde::{Deserialize, Serialize};
use sha2::{Sha256, Digest};

// ═══════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS (must match guest)
// ═══════════════════════════════════════════════════════════════════

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Default)]
pub struct Traits {
    pub intelligence: u8, pub creativity: u8, pub empathy: u8, pub resilience: u8,
    pub curiosity: u8, pub humor: u8, pub wisdom: u8, pub charisma: u8,
}

impl Traits {
    pub fn as_array(&self) -> [u8; 8] {
        [self.intelligence, self.creativity, self.empathy, self.resilience,
         self.curiosity, self.humor, self.wisdom, self.charisma]
    }
    pub fn fitness(&self) -> u16 { self.as_array().iter().map(|&t| t as u16).sum() }
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct AgentIdentity {
    pub token_id: u64, pub generation: u8, pub traits_hash: [u8; 32],
    pub parent_a_id: Option<u64>, pub parent_b_id: Option<u64>, pub birth_timestamp: u64,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct CustodyShare { pub owner: [u8; 20], pub percentage: u16 }

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AgentState {
    pub token_id: u64, pub traits: Traits, pub experience: u64,
    pub level: u8, pub last_action_timestamp: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum EvolutionAction {
    Train { trait_index: u8, intensity: u8 },
    Rest { duration: u64 },
    Interact { partner_id: u64, outcome: u8 },
    LevelUp,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum ProofRequest {
    Trait(TraitProofInput), Breed(BreedProofInput), Custody(CustodyProofInput),
    Ownership(OwnershipProofInput), Lineage(LineageProofInput),
    Content(ContentProofInput), Evolution(EvolutionProofInput),
}

#[derive(Debug, Serialize, Deserialize)]
pub enum ProofOutput {
    Trait(TraitProofOutput), Breed(BreedProofOutput), Custody(CustodyProofOutput),
    Ownership(OwnershipProofOutput), Lineage(LineageProofOutput),
    Content(ContentProofOutput), Evolution(EvolutionProofOutput),
}

// Input/Output structs
#[derive(Debug, Serialize, Deserialize)]
pub struct TraitProofInput { pub traits: Traits, pub salt: [u8; 32], pub expected_commitment: [u8; 32] }
#[derive(Debug, Serialize, Deserialize)]
pub struct TraitProofOutput { pub commitment: [u8; 32], pub traits_valid: bool, pub commitment_valid: bool, pub fitness: u16, pub rarity_tier: u8 }

#[derive(Debug, Serialize, Deserialize)]
pub struct BreedProofInput { pub parent_a: Traits, pub parent_b: Traits, pub child: Traits, pub crossover_mask: [bool; 8], pub max_mutation: u8, pub random_seed: u64 }
#[derive(Debug, Serialize, Deserialize)]
pub struct BreedProofOutput { pub parent_a_hash: [u8; 32], pub parent_b_hash: [u8; 32], pub child_hash: [u8; 32], pub valid: bool, pub mutations: [i8; 8], pub child_fitness: u16, pub child_rarity: u8, pub hybrid_vigor: bool }

#[derive(Debug, Serialize, Deserialize)]
pub struct CustodyProofInput { pub token_id: u64, pub claimer: [u8; 20], pub threshold: u16, pub all_shares: Vec<CustodyShare>, pub salt: [u8; 32] }
#[derive(Debug, Serialize, Deserialize)]
pub struct CustodyProofOutput { pub token_id: u64, pub claimer: [u8; 20], pub threshold: u16, pub threshold_met: bool, pub total_custody: u16, pub num_owners: u8, pub commitment: [u8; 32] }

#[derive(Debug, Serialize, Deserialize)]
pub struct OwnershipProofInput { pub token_id: u64, pub message: Vec<u8>, pub signature_r: [u8; 32], pub signature_s: [u8; 32], pub recovery_id: u8, pub expected_owner: [u8; 20] }
#[derive(Debug, Serialize, Deserialize)]
pub struct OwnershipProofOutput { pub token_id: u64, pub message_hash: [u8; 32], pub owner: [u8; 20], pub valid: bool, pub signature_format_valid: bool }

#[derive(Debug, Serialize, Deserialize)]
pub struct LineageProofInput { pub target_agent: AgentIdentity, pub ancestors: Vec<AgentIdentity>, pub depth: u8 }
#[derive(Debug, Serialize, Deserialize)]
pub struct LineageProofOutput { pub target_hash: [u8; 32], pub lineage_root: [u8; 32], pub valid: bool, pub generation: u8, pub total_ancestors: u16, pub deepest_verified: u8, pub has_legendary_ancestor: bool }

#[derive(Debug, Serialize, Deserialize)]
pub struct ContentProofInput { pub token_id: u64, pub soul_content: Vec<u8>, pub identity_content: Vec<u8>, pub expected_hash: [u8; 32], pub encryption_key_hash: [u8; 32] }
#[derive(Debug, Serialize, Deserialize)]
pub struct ContentProofOutput { pub token_id: u64, pub content_hash: [u8; 32], pub valid: bool, pub soul_size: u32, pub identity_size: u32, pub key_verified: bool }

#[derive(Debug, Serialize, Deserialize)]
pub struct EvolutionProofInput { pub old_state: AgentState, pub action: EvolutionAction, pub new_state: AgentState, pub timestamp: u64 }
#[derive(Debug, Serialize, Deserialize)]
pub struct EvolutionProofOutput { pub old_state_hash: [u8; 32], pub new_state_hash: [u8; 32], pub action_hash: [u8; 32], pub valid: bool, pub level_changed: bool, pub traits_changed: bool, pub experience_gained: u64 }

// ═══════════════════════════════════════════════════════════════════
// PROOF GENERATION
// ═══════════════════════════════════════════════════════════════════

pub fn prove(request: ProofRequest) -> Receipt {
    let env = ExecutorEnv::builder().write(&request).unwrap().build().unwrap();
    let prover = default_prover();
    prover.prove(env, GENOMAD_PROOF_ELF).unwrap().receipt
}

pub fn verify_and_decode(receipt: &Receipt) -> ProofOutput {
    receipt.verify(GENOMAD_PROOF_ID).unwrap();
    receipt.journal.decode().unwrap()
}

fn sha256(data: &[u8]) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(data);
    hasher.finalize().into()
}

// ═══════════════════════════════════════════════════════════════════
// MAIN — Test all 7 proof types
// ═══════════════════════════════════════════════════════════════════

fn main() {
    println!("\n╔════════════════════════════════════════════════════════════════╗");
    println!("║     🧬 GENOMAD ZK ULTRA — 7 PROOF TYPES (RISC Zero v3.0)      ║");
    println!("╚════════════════════════════════════════════════════════════════╝\n");

    // 1. TRAIT PROOF
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!("1️⃣  TRAIT PROOF — Validate traits + commitment + rarity");
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    let traits = Traits { intelligence: 92, creativity: 88, empathy: 95, resilience: 78, curiosity: 91, humor: 65, wisdom: 85, charisma: 89 };
    let salt = [42u8; 32];
    let mut hasher = Sha256::new();
    hasher.update(traits.as_array());
    hasher.update(salt);
    let expected_commitment: [u8; 32] = hasher.finalize().into();

    let receipt = prove(ProofRequest::Trait(TraitProofInput { traits: traits.clone(), salt, expected_commitment }));
    if let ProofOutput::Trait(r) = verify_and_decode(&receipt) {
        println!("   ✅ Traits Valid: {}", r.traits_valid);
        println!("   ✅ Commitment Valid: {}", r.commitment_valid);
        println!("   💪 Fitness: {}/800", r.fitness);
        println!("   ⭐ Rarity Tier: {} (1=Common, 5=Legendary)", r.rarity_tier);
    }

    // 2. BREED PROOF
    println!("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!("2️⃣  BREED PROOF — Crossover + mutations + hybrid vigor");
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    let parent_a = Traits { intelligence: 80, creativity: 60, empathy: 70, resilience: 90, curiosity: 75, humor: 50, wisdom: 85, charisma: 65 };
    let parent_b = Traits { intelligence: 70, creativity: 90, empathy: 60, resilience: 80, curiosity: 85, humor: 70, wisdom: 75, charisma: 80 };
    let child = Traits { intelligence: 82, creativity: 88, empathy: 68, resilience: 87, curiosity: 82, humor: 68, wisdom: 82, charisma: 78 };

    let receipt = prove(ProofRequest::Breed(BreedProofInput {
        parent_a: parent_a.clone(), parent_b: parent_b.clone(), child: child.clone(),
        crossover_mask: [true, false, true, false, true, false, true, false], max_mutation: 10, random_seed: 12345
    }));
    if let ProofOutput::Breed(r) = verify_and_decode(&receipt) {
        println!("   ✅ Breeding Valid: {}", r.valid);
        println!("   🧬 Mutations: {:?}", r.mutations);
        println!("   💪 Child Fitness: {}/800 (Parent A: {}, Parent B: {})", r.child_fitness, parent_a.fitness(), parent_b.fitness());
        println!("   🌟 Hybrid Vigor: {} (child > both parents)", r.hybrid_vigor);
        println!("   ⭐ Child Rarity: {}", r.child_rarity);
    }

    // 3. CUSTODY PROOF
    println!("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!("3️⃣  CUSTODY PROOF — Multi-owner threshold (hidden percentages)");
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    let owner_a = [0x11u8; 20];
    let owner_b = [0x22u8; 20];
    let owner_c = [0x33u8; 20];

    let receipt = prove(ProofRequest::Custody(CustodyProofInput {
        token_id: 42,
        claimer: owner_a,
        threshold: 5000, // 50%
        all_shares: vec![
            CustodyShare { owner: owner_a, percentage: 4000 }, // 40%
            CustodyShare { owner: owner_b, percentage: 3500 }, // 35%
            CustodyShare { owner: owner_c, percentage: 2500 }, // 25%
        ],
        salt: [0u8; 32],
    }));
    if let ProofOutput::Custody(r) = verify_and_decode(&receipt) {
        println!("   ✅ Threshold Met (≥50%): {}", r.threshold_met);
        println!("   📊 Claimer's Custody: {}% (threshold: {}%)", r.total_custody as f32 / 100.0, r.threshold as f32 / 100.0);
        println!("   👥 Total Owners: {}", r.num_owners);
        println!("   🔒 Other owners' shares: HIDDEN");
    }

    // 4. OWNERSHIP PROOF
    println!("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!("4️⃣  OWNERSHIP PROOF — ECDSA signature verification");
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    let receipt = prove(ProofRequest::Ownership(OwnershipProofInput {
        token_id: 1,
        message: b"I own agent #1".to_vec(),
        signature_r: [0xAB; 32],
        signature_s: [0xCD; 32],
        recovery_id: 0,
        expected_owner: [0x99; 20],
    }));
    if let ProofOutput::Ownership(r) = verify_and_decode(&receipt) {
        println!("   ✅ Signature Format Valid: {}", r.signature_format_valid);
        println!("   📝 Message Hash: 0x{}...", hex::encode(&r.message_hash[..8]));
        println!("   👤 Verified Owner: 0x{}...", hex::encode(&r.owner[..8]));
    }

    // 5. LINEAGE PROOF
    println!("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!("5️⃣  LINEAGE PROOF — Full genealogy tree verification");
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    let grandparent_a = AgentIdentity { token_id: 1, generation: 0, traits_hash: [0xF1; 32], parent_a_id: None, parent_b_id: None, birth_timestamp: 1000 };
    let grandparent_b = AgentIdentity { token_id: 2, generation: 0, traits_hash: [0xF2; 32], parent_a_id: None, parent_b_id: None, birth_timestamp: 1001 };
    let parent = AgentIdentity { token_id: 3, generation: 1, traits_hash: [0xAB; 32], parent_a_id: Some(1), parent_b_id: Some(2), birth_timestamp: 2000 };
    let target = AgentIdentity { token_id: 5, generation: 2, traits_hash: [0xCD; 32], parent_a_id: Some(3), parent_b_id: Some(4), birth_timestamp: 3000 };

    let receipt = prove(ProofRequest::Lineage(LineageProofInput {
        target_agent: target,
        ancestors: vec![grandparent_a, grandparent_b, parent],
        depth: 3,
    }));
    if let ProofOutput::Lineage(r) = verify_and_decode(&receipt) {
        println!("   ✅ Lineage Valid: {}", r.valid);
        println!("   🧬 Generation: {}", r.generation);
        println!("   👴 Total Ancestors Verified: {}", r.total_ancestors);
        println!("   📊 Deepest Generation: {}", r.deepest_verified);
        println!("   👑 Has Legendary Ancestor: {}", r.has_legendary_ancestor);
        println!("   🌳 Lineage Merkle Root: 0x{}...", hex::encode(&r.lineage_root[..8]));
    }

    // 6. CONTENT PROOF
    println!("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!("6️⃣  CONTENT PROOF — SOUL/IDENTITY integrity (encrypted on-chain)");
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    let soul = b"# SOUL.md\nI am Helix, an optimization specialist...".to_vec();
    let identity = b"# IDENTITY.md\nName: Helix\nRole: Genetic Engineer".to_vec();
    let expected_hash = sha256(&[soul.clone(), identity.clone()].concat());

    let receipt = prove(ProofRequest::Content(ContentProofInput {
        token_id: 3,
        soul_content: soul.clone(),
        identity_content: identity.clone(),
        expected_hash,
        encryption_key_hash: [0x55; 32],
    }));
    if let ProofOutput::Content(r) = verify_and_decode(&receipt) {
        println!("   ✅ Content Valid: {}", r.valid);
        println!("   🔑 Key Verified: {}", r.key_verified);
        println!("   📄 SOUL.md Size: {} bytes", r.soul_size);
        println!("   📄 IDENTITY.md Size: {} bytes", r.identity_size);
        println!("   🔐 Content Hash: 0x{}...", hex::encode(&r.content_hash[..8]));
    }

    // 7. EVOLUTION PROOF
    println!("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!("7️⃣  EVOLUTION PROOF — State transition verification");
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    let old_state = AgentState {
        token_id: 1, traits: Traits { intelligence: 50, creativity: 50, empathy: 50, resilience: 50, curiosity: 50, humor: 50, wisdom: 50, charisma: 50 },
        experience: 900, level: 1, last_action_timestamp: 1000,
    };
    let new_state = AgentState {
        token_id: 1, traits: Traits { intelligence: 55, creativity: 50, empathy: 50, resilience: 50, curiosity: 50, humor: 50, wisdom: 50, charisma: 50 },
        experience: 950, level: 1, last_action_timestamp: 2000,
    };

    let receipt = prove(ProofRequest::Evolution(EvolutionProofInput {
        old_state,
        action: EvolutionAction::Train { trait_index: 0, intensity: 5 },
        new_state,
        timestamp: 2000,
    }));
    if let ProofOutput::Evolution(r) = verify_and_decode(&receipt) {
        println!("   ✅ Evolution Valid: {}", r.valid);
        println!("   📈 Traits Changed: {}", r.traits_changed);
        println!("   🎯 Level Changed: {}", r.level_changed);
        println!("   ⭐ XP Gained: {}", r.experience_gained);
        println!("   📊 Old State: 0x{}...", hex::encode(&r.old_state_hash[..8]));
        println!("   📊 New State: 0x{}...", hex::encode(&r.new_state_hash[..8]));
    }

    // IMAGE ID
    println!("\n╔════════════════════════════════════════════════════════════════╗");
    println!("║                    📋 SOLIDITY IMAGE ID                        ║");
    println!("╠════════════════════════════════════════════════════════════════╣");
    println!("║ bytes32 constant GENOMAD_IMAGE_ID =                            ║");
    println!("║   0x{};", hex::encode(bytemuck::bytes_of(&GENOMAD_PROOF_ID)));
    println!("╚════════════════════════════════════════════════════════════════╝\n");
}
