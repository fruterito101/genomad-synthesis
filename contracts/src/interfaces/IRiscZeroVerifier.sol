// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

/// @notice RISC Zero Verifier interface
interface IRiscZeroVerifier {
    /// @notice Verify a RISC Zero proof
    /// @param seal The proof seal (Groth16 proof bytes)
    /// @param imageId The image ID of the guest program
    /// @param journalDigest SHA256 hash of the journal
    function verify(
        bytes calldata seal,
        bytes32 imageId,
        bytes32 journalDigest
    ) external view;
}
