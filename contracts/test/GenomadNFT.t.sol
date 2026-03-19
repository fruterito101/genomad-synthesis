// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/GenomadNFT.sol";

contract GenomadNFTTest is Test {
    GenomadNFT public nft;
    address public alice = address(0x1);
    address public bob = address(0x2);

    function setUp() public {
        nft = new GenomadNFT();
    }

    // ═══════════════════════════════════════════════════════
    // BASIC REGISTRATION TESTS
    // ═══════════════════════════════════════════════════════

    function test_RegisterAgent() public {
        vm.prank(alice);
        uint256 tokenId = nft.registerAgent(bytes32("test_dna"));
        
        assertEq(tokenId, 1);
        assertEq(nft.ownerOf(tokenId), alice);
        
        IGenomad.AgentData memory data = nft.getAgentData(tokenId);
        assertEq(data.dnaCommitment, bytes32("test_dna"));
        assertEq(data.generation, 0);
        assertEq(data.isActive, false);
    }

    // ═══════════════════════════════════════════════════════
    // FASE 4: FULL DATA REGISTRATION TESTS
    // ═══════════════════════════════════════════════════════

    function test_RegisterAgentWithData() public {
        uint8[8] memory traits = [uint8(75), 60, 80, 45, 90, 30, 55, 70];
        bytes memory encryptedSoul = hex"deadbeefcafe";
        bytes memory encryptedIdentity = hex"cafebabe1234";
        bytes32 contentHash = keccak256("test_content");

        vm.prank(alice);
        uint256 tokenId = nft.registerAgentWithData(
            bytes32("dna_with_data"),
            traits,
            encryptedSoul,
            encryptedIdentity,
            contentHash
        );

        assertEq(tokenId, 1);
        assertEq(nft.ownerOf(tokenId), alice);

        // Check traits
        uint8[8] memory storedTraits = nft.getTraits(tokenId);
        for (uint8 i = 0; i < 8; i++) {
            assertEq(storedTraits[i], traits[i]);
        }

        // Check encrypted data
        IGenomad.EncryptedData memory encData = nft.getEncryptedData(tokenId);
        assertEq(encData.encryptedSoul, encryptedSoul);
        assertEq(encData.encryptedIdentity, encryptedIdentity);
        assertEq(encData.contentHash, contentHash);
    }

    function test_RegisterAgentWithData_TraitValidation() public {
        uint8[8] memory invalidTraits = [uint8(75), 60, 101, 45, 90, 30, 55, 70];

        vm.prank(alice);
        vm.expectRevert("Trait must be 0-100");
        nft.registerAgentWithData(
            bytes32("invalid"),
            invalidTraits,
            hex"00",
            hex"00",
            bytes32(0)
        );
    }

    // ═══════════════════════════════════════════════════════
    // ENCRYPTED DATA UPDATE TESTS
    // ═══════════════════════════════════════════════════════

    function test_UpdateEncryptedData() public {
        vm.prank(alice);
        uint256 tokenId = nft.registerAgent(bytes32("test"));

        bytes memory newSoul = hex"aabbccddeeff00112233";
        bytes memory newIdentity = hex"11223344556677889900";
        bytes32 newHash = keccak256("new_content");

        vm.prank(alice);
        nft.updateEncryptedData(tokenId, newSoul, newIdentity, newHash);

        IGenomad.EncryptedData memory encData = nft.getEncryptedData(tokenId);
        assertEq(encData.encryptedSoul, newSoul);
        assertEq(encData.encryptedIdentity, newIdentity);
        assertEq(encData.contentHash, newHash);
    }

    function test_UpdateEncryptedData_OnlyOwner() public {
        vm.prank(alice);
        uint256 tokenId = nft.registerAgent(bytes32("test"));

        vm.prank(bob);
        vm.expectRevert("Not token owner");
        nft.updateEncryptedData(tokenId, hex"00", hex"00", bytes32(0));
    }

    // ═══════════════════════════════════════════════════════
    // TRAITS UPDATE TESTS
    // ═══════════════════════════════════════════════════════

    function test_SetTraits() public {
        vm.prank(alice);
        uint256 tokenId = nft.registerAgent(bytes32("test"));

        uint8[8] memory newTraits = [uint8(50), 50, 50, 50, 50, 50, 50, 50];

        vm.prank(alice);
        nft.setTraits(tokenId, newTraits);

        uint8[8] memory storedTraits = nft.getTraits(tokenId);
        for (uint8 i = 0; i < 8; i++) {
            assertEq(storedTraits[i], 50);
        }
    }

    function test_SetTraits_OnlyOwner() public {
        vm.prank(alice);
        uint256 tokenId = nft.registerAgent(bytes32("test"));

        uint8[8] memory newTraits = [uint8(50), 50, 50, 50, 50, 50, 50, 50];

        vm.prank(bob);
        vm.expectRevert("Not token owner");
        nft.setTraits(tokenId, newTraits);
    }

    // ═══════════════════════════════════════════════════════
    // ACTIVATION TESTS
    // ═══════════════════════════════════════════════════════

    function test_ActivateDeactivate() public {
        vm.prank(alice);
        uint256 tokenId = nft.registerAgent(bytes32("test"));

        assertEq(nft.getAgentData(tokenId).isActive, false);

        vm.prank(alice);
        nft.activateAgent(tokenId);
        assertEq(nft.getAgentData(tokenId).isActive, true);

        vm.prank(alice);
        nft.deactivateAgent(tokenId);
        assertEq(nft.getAgentData(tokenId).isActive, false);
    }

    // ═══════════════════════════════════════════════════════
    // GAS ESTIMATION
    // ═══════════════════════════════════════════════════════

    function test_GasEstimate_RegisterWithData() public {
        uint8[8] memory traits = [uint8(75), 60, 80, 45, 90, 30, 55, 70];
        
        // Simulate ~2KB encrypted data
        bytes memory encryptedSoul = new bytes(2048);
        bytes memory encryptedIdentity = new bytes(1024);

        bytes32 contentHash = keccak256("test");

        uint256 gasBefore = gasleft();
        
        vm.prank(alice);
        nft.registerAgentWithData(
            bytes32("gas_test"),
            traits,
            encryptedSoul,
            encryptedIdentity,
            contentHash
        );

        uint256 gasUsed = gasBefore - gasleft();
        
        emit log_named_uint("Gas used for 3KB encrypted data", gasUsed);
        
        // Should be reasonable (< 500k gas)
        assertLt(gasUsed, 500000);
    }
}
