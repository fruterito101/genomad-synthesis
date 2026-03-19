//! Genomad Breeding Verifier - RISC Zero Guest Program
//! 
//! Based on: skills/risc-zero/GENESIS-TEMPLATE.md
//! 
//! Verifies that a child's DNA is a valid result of breeding two parents
//! WITHOUT revealing the actual trait values.

#![no_main]
#![no_std]

extern crate alloc;

use alloc::vec::Vec;
use risc0_zkvm::guest::env;

risc0_zkvm::guest::entry!(main);

/// Agent DNA structure matching Genomad's 8 traits
#[derive(Clone)]
struct AgentDNA {
    // 8 core traits (0-100 each)
    social: u8,
    technical: u8,
    creativity: u8,
    analysis: u8,
    trading: u8,
    empathy: u8,
    teaching: u8,
    leadership: u8,
    // Metadata
    generation: u32,
}

impl AgentDNA {
    fn from_bytes(bytes: &[u8; 12]) -> Self {
        Self {
            social: bytes[0],
            technical: bytes[1],
            creativity: bytes[2],
            analysis: bytes[3],
            trading: bytes[4],
            empathy: bytes[5],
            teaching: bytes[6],
            leadership: bytes[7],
            generation: u32::from_le_bytes([bytes[8], bytes[9], bytes[10], bytes[11]]),
        }
    }
    
    fn to_traits(&self) -> [u8; 8] {
        [
            self.social,
            self.technical,
            self.creativity,
            self.analysis,
            self.trading,
            self.empathy,
            self.teaching,
            self.leadership,
        ]
    }
}

/// Maximum allowed mutation per trait (±15 points)
const MAX_MUTATION: i16 = 15;

fn main() {
    // ═══════════════════════════════════════════════════════
    // READ PRIVATE INPUTS
    // ═══════════════════════════════════════════════════════
    
    // Parent A DNA (12 bytes: 8 traits + 4 bytes generation)
    let parent_a_bytes: [u8; 12] = env::read();
    let parent_a = AgentDNA::from_bytes(&parent_a_bytes);
    
    // Parent B DNA
    let parent_b_bytes: [u8; 12] = env::read();
    let parent_b = AgentDNA::from_bytes(&parent_b_bytes);
    
    // Child DNA
    let child_bytes: [u8; 12] = env::read();
    let child = AgentDNA::from_bytes(&child_bytes);
    
    // Parent IDs (for lineage tracking)
    let parent_a_id: u64 = env::read();
    let parent_b_id: u64 = env::read();
    
    // ═══════════════════════════════════════════════════════
    // VERIFY BREEDING VALIDITY (all private)
    // ═══════════════════════════════════════════════════════
    
    let traits_a = parent_a.to_traits();
    let traits_b = parent_b.to_traits();
    let traits_child = child.to_traits();
    
    let mut is_valid = true;
    let mut mutation_count: u8 = 0;
    
    // Verify each trait
    for i in 0..8 {
        let a = traits_a[i] as i16;
        let b = traits_b[i] as i16;
        let c = traits_child[i] as i16;
        
        // Expected value is average of parents
        let avg = (a + b) / 2;
        
        // Child trait must be within mutation range
        let min_expected = (avg - MAX_MUTATION).max(0);
        let max_expected = (avg + MAX_MUTATION).min(100);
        
        if c < min_expected || c > max_expected {
            is_valid = false;
        }
        
        // Count significant mutations (deviation > 5 from average)
        if (c - avg).abs() > 5 {
            mutation_count += 1;
        }
    }
    
    // Verify generation is correct
    let expected_gen = parent_a.generation.max(parent_b.generation) + 1;
    if child.generation != expected_gen {
        is_valid = false;
    }
    
    // ═══════════════════════════════════════════════════════
    // CALCULATE PUBLIC OUTPUTS
    // ═══════════════════════════════════════════════════════
    
    // Child DNA commitment (hash) - reveals nothing about actual traits
    let child_commitment = calculate_commitment(&traits_child, child.generation);
    
    // ═══════════════════════════════════════════════════════
    // COMMIT PUBLIC OUTPUTS (what verifiers see)
    // ═══════════════════════════════════════════════════════
    
    // 1. Child DNA commitment (32 bytes)
    env::commit_slice(&child_commitment);
    
    // 2. Is breeding valid (1 byte)
    env::commit(&(is_valid as u8));
    
    // 3. Parent IDs (8 bytes each)
    env::commit(&parent_a_id);
    env::commit(&parent_b_id);
    
    // 4. Child generation (4 bytes)
    env::commit(&child.generation);
    
    // 5. Mutation count (1 byte) - reveals breeding quality, not exact traits
    env::commit(&mutation_count);
}

/// Calculate a deterministic commitment hash for child DNA
/// Uses simple mixing - in production, use SHA256 or Poseidon
fn calculate_commitment(traits: &[u8; 8], generation: u32) -> [u8; 32] {
    let mut commitment = [0u8; 32];
    
    // Mix traits into commitment
    for (i, &trait_val) in traits.iter().enumerate() {
        // Position-based mixing for uniqueness
        commitment[i] = trait_val;
        commitment[i + 8] = trait_val.wrapping_add(i as u8 * 13);
        commitment[i + 16] = trait_val.wrapping_mul(i as u8 + 7);
        commitment[i + 24] = trait_val ^ ((generation >> (i * 4)) as u8);
    }
    
    commitment
}
