// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/TraitVerifier.sol";

contract TraitVerifierTest is Test {
    TraitVerifier public verifier;
    address public alice = address(0x1);

    function setUp() public {
        verifier = new TraitVerifier();
    }

    // ═══════════════════════════════════════════════════════
    // TRAIT PROOF TESTS
    // ═══════════════════════════════════════════════════════

    function test_VerifyTraitProof_BypassMode() public view {
        uint8[8] memory traits = [uint8(75), 60, 80, 45, 90, 30, 55, 70];
        bytes32 contentHash = keccak256("test");
        
        bool valid = verifier.verifyTraitProof(hex"", traits, contentHash);
        assertTrue(valid);
    }

    function test_VerifyTraitProof_InvalidTraits() public {
        // Disable bypass
        verifier.setBypassMode(false);
        
        uint8[8] memory invalidTraits = [uint8(75), 60, 101, 45, 90, 30, 55, 70];
        bytes32 contentHash = keccak256("test");
        
        bool valid = verifier.verifyTraitProof(hex"", invalidTraits, contentHash);
        assertFalse(valid);
    }

    // ═══════════════════════════════════════════════════════
    // BREED PROOF TESTS
    // ═══════════════════════════════════════════════════════

    function test_VerifyBreedProof_BypassMode() public view {
        uint8[8] memory parentA = [uint8(70), 60, 80, 40, 90, 30, 50, 70];
        uint8[8] memory parentB = [uint8(80), 50, 70, 50, 80, 40, 60, 60];
        uint8[8] memory child = [uint8(75), 55, 75, 45, 85, 35, 55, 65];
        
        bool valid = verifier.verifyBreedProof(hex"", parentA, parentB, child);
        assertTrue(valid);
    }

    function test_VerifyBreedProof_ValidCrossover() public {
        verifier.setBypassMode(false);
        
        uint8[8] memory parentA = [uint8(70), 60, 80, 40, 90, 30, 50, 70];
        uint8[8] memory parentB = [uint8(80), 50, 70, 50, 80, 40, 60, 60];
        // Child within range (parent min-10 to parent max+10)
        uint8[8] memory child = [uint8(75), 55, 75, 45, 85, 35, 55, 65];
        
        bool valid = verifier.verifyBreedProof(hex"", parentA, parentB, child);
        assertTrue(valid);
    }

    function test_VerifyBreedProof_InvalidCrossover() public {
        verifier.setBypassMode(false);
        
        uint8[8] memory parentA = [uint8(70), 60, 80, 40, 90, 30, 50, 70];
        uint8[8] memory parentB = [uint8(80), 50, 70, 50, 80, 40, 60, 60];
        // Child[0] = 50 is outside range (70-10 to 80+10 = 60-90)
        uint8[8] memory invalidChild = [uint8(50), 55, 75, 45, 85, 35, 55, 65];
        
        bool valid = verifier.verifyBreedProof(hex"", parentA, parentB, invalidChild);
        assertFalse(valid);
    }

    // ═══════════════════════════════════════════════════════
    // CUSTODY PROOF TESTS
    // ═══════════════════════════════════════════════════════

    function test_VerifyCustodyProof_BypassMode() public view {
        bool valid = verifier.verifyCustodyProof(hex"", 1, alice, 5000);
        assertTrue(valid);
    }

    // ═══════════════════════════════════════════════════════
    // ADMIN TESTS
    // ═══════════════════════════════════════════════════════

    function test_SetBypassMode() public {
        assertTrue(verifier.bypassVerification());
        
        verifier.setBypassMode(false);
        assertFalse(verifier.bypassVerification());
        
        verifier.setBypassMode(true);
        assertTrue(verifier.bypassVerification());
    }

    function test_SetVerifiers() public {
        address mockVerifier = address(0x123);
        
        verifier.setTraitVerifier(mockVerifier);
        verifier.setBreedVerifier(mockVerifier);
        verifier.setCustodyVerifier(mockVerifier);
        
        (bool bypass, address trait, address breed, address custody) = verifier.getVerifierStatus();
        
        assertTrue(bypass);
        assertEq(trait, mockVerifier);
        assertEq(breed, mockVerifier);
        assertEq(custody, mockVerifier);
    }

    function test_IsFullyConfigured() public {
        assertFalse(verifier.isFullyConfigured());
        
        address mockVerifier = address(0x123);
        verifier.setTraitVerifier(mockVerifier);
        verifier.setBreedVerifier(mockVerifier);
        verifier.setCustodyVerifier(mockVerifier);
        
        assertTrue(verifier.isFullyConfigured());
    }

    function test_OnlyOwnerCanSetVerifiers() public {
        vm.prank(alice);
        vm.expectRevert("Not owner");
        verifier.setTraitVerifier(address(0x123));
    }
}
