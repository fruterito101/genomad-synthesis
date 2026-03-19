# Genomad ZK Circuits

Zero-knowledge proof circuits for Genomad agent verification.

## Prerequisites

- Circom 2.x
- snarkjs
- Node.js 18+

## Installation

```bash
# Install Circom (if not already installed)
git clone https://github.com/iden3/circom.git
cd circom
cargo build --release
cargo install --path circom

# Install dependencies
cd circuits
npm install
```

## Circuits

### TraitProof (`trait-proof/`)
Proves that 8 traits were calculated correctly from content.

**Public inputs:**
- `traits[8]` - The 8 trait values (0-100)
- `contentHash` - Hash of the original content

**Private inputs:**
- `content[N]` - The actual content bytes (private)

### BreedProof (`breed-proof/`)
Proves that child traits are a valid crossover of parents.

**Public inputs:**
- `parentATraits[8]`
- `parentBTraits[8]`
- `childTraits[8]`

**Private inputs:**
- `crossoverSeed` - Random seed for crossover point
- `mutationSeed` - Random seed for mutations

### CustodyProof (`custody-proof/`)
Proves custody threshold without revealing exact percentage.

**Public inputs:**
- `tokenId`
- `claimer` (address)
- `threshold` (minimum custody required)

**Private inputs:**
- `actualCustody` - The real custody percentage

## Usage

```bash
# Compile all circuits
npm run compile:all

# Generate proving keys (requires Powers of Tau ceremony file)
npm run setup:trait

# Export Solidity verifier
npm run solidity:trait
```

## Powers of Tau

Download a Powers of Tau file:
```bash
wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau -O pot12_final.ptau
```

## Integration

The generated Solidity verifiers replace the placeholder functions in 
`contracts/src/TraitVerifier.sol`.
