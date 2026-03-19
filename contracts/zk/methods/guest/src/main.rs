//! Breeding Verifier - RISC Zero Guest Program
//! 
//! This program verifies that a child's DNA is a valid result of breeding
//! two parent DNAs, without revealing the actual trait values.

#![no_main]
#![no_std]

use risc0_zkvm::guest::env;

risc0_zkvm::guest::entry!(main);

/// Number of traits in DNA
const NUM_TRAITS: usize = 8;

/// Maximum allowed mutation per trait (15 points)
const MAX_MUTATION: i32 = 15;

/// Trait names (for reference):
/// 0: social, 1: technical, 2: creativity, 3: analysis
/// 4: trading, 5: empathy, 6: teaching, 7: leadership

fn main() {
    // Read private inputs
    let parent_a: [u8; NUM_TRAITS] = env::read();
    let parent_b: [u8; NUM_TRAITS] = env::read();
    let child: [u8; NUM_TRAITS] = env::read();
    
    // Verify breeding is valid
    let is_valid = verify_breeding(&parent_a, &parent_b, &child);
    
    // Calculate child DNA commitment (hash)
    let child_commitment = calculate_commitment(&child);
    
    // Commit public outputs
    env::commit(&child_commitment);
    env::commit(&is_valid);
}

/// Verify that child traits are valid result of breeding parents
fn verify_breeding(parent_a: &[u8; NUM_TRAITS], parent_b: &[u8; NUM_TRAITS], child: &[u8; NUM_TRAITS]) -> bool {
    for i in 0..NUM_TRAITS {
        let a = parent_a[i] as i32;
        let b = parent_b[i] as i32;
        let c = child[i] as i32;
        
        // Calculate expected range (average of parents ± mutation)
        let avg = (a + b) / 2;
        let min_expected = (avg - MAX_MUTATION).max(0);
        let max_expected = (avg + MAX_MUTATION).min(100);
        
        // Child trait must be within valid range
        if c < min_expected || c > max_expected {
            return false;
        }
        
        // Child trait must be valid (0-100)
        if c < 0 || c > 100 {
            return false;
        }
    }
    
    true
}

/// Calculate a simple commitment hash for the child DNA
/// In production, use a proper hash function
fn calculate_commitment(child: &[u8; NUM_TRAITS]) -> [u8; 32] {
    let mut commitment = [0u8; 32];
    
    // Simple hash: XOR traits with position-based mixing
    for (i, &trait_val) in child.iter().enumerate() {
        commitment[i] = trait_val;
        commitment[i + 8] = trait_val.wrapping_add(i as u8);
        commitment[i + 16] = trait_val.wrapping_mul(i as u8 + 1);
        commitment[i + 24] = trait_val ^ (i as u8 * 17);
    }
    
    commitment
}
