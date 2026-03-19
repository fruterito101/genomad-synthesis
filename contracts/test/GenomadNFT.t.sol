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

        uint8[8] memory storedTraits = nft.getTraits(tokenId);
        for (uint8 i = 0; i < 8; i++) {
            assertEq(storedTraits[i], traits[i]);
        }

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
    // CUSTODY TESTS (Ticket 4.2)
    // ═══════════════════════════════════════════════════════

    function test_InitialCustody() public {
        vm.prank(alice);
        uint256 tokenId = nft.registerAgent(bytes32("test"));

        assertEq(nft.getCustody(tokenId, alice), 10000);
        
        address[] memory holders = nft.getCustodyHolders(tokenId);
        assertEq(holders.length, 1);
        assertEq(holders[0], alice);
    }

    function test_TransferCustody() public {
        vm.prank(alice);
        uint256 tokenId = nft.registerAgent(bytes32("test"));

        vm.prank(alice);
        nft.transferCustody(tokenId, bob, 3000);

        assertEq(nft.getCustody(tokenId, alice), 7000);
        assertEq(nft.getCustody(tokenId, bob), 3000);

        address[] memory holders = nft.getCustodyHolders(tokenId);
        assertEq(holders.length, 2);
    }

    function test_TransferCustody_InsufficientCustody() public {
        vm.prank(alice);
        uint256 tokenId = nft.registerAgent(bytes32("test"));

        vm.prank(alice);
        vm.expectRevert("Insufficient custody");
        nft.transferCustody(tokenId, bob, 15000);
    }

    function test_CustodyThreshold() public {
        vm.prank(alice);
        uint256 tokenId = nft.registerAgent(bytes32("test"));

        assertTrue(nft.hasCustodyThreshold(tokenId, alice, 5000));
        assertTrue(nft.hasCustodyThreshold(tokenId, alice, 10000));
        assertFalse(nft.hasCustodyThreshold(tokenId, bob, 1));
    }

    function test_ActivateRequires50Percent() public {
        vm.prank(alice);
        uint256 tokenId = nft.registerAgent(bytes32("test"));

        vm.prank(alice);
        nft.transferCustody(tokenId, bob, 6000);

        vm.prank(alice);
        vm.expectRevert("Insufficient custody");
        nft.activateAgent(tokenId);

        vm.prank(bob);
        nft.activateAgent(tokenId);

        assertTrue(nft.getAgentData(tokenId).isActive);
    }

    function test_DeactivateRequiresMajority() public {
        vm.prank(alice);
        uint256 tokenId = nft.registerAgent(bytes32("test"));

        vm.prank(alice);
        nft.activateAgent(tokenId);

        vm.prank(alice);
        nft.transferCustody(tokenId, bob, 5000);

        vm.prank(alice);
        vm.expectRevert("Insufficient custody");
        nft.deactivateAgent(tokenId);

        vm.prank(alice);
        nft.transferCustody(tokenId, bob, 1);

        vm.prank(bob);
        nft.deactivateAgent(tokenId);

        assertFalse(nft.getAgentData(tokenId).isActive);
    }

    function test_UpdateDataRequires100Percent() public {
        vm.prank(alice);
        uint256 tokenId = nft.registerAgent(bytes32("test"));

        vm.prank(alice);
        nft.transferCustody(tokenId, bob, 100);

        vm.prank(alice);
        vm.expectRevert("Insufficient custody");
        nft.updateEncryptedData(tokenId, hex"00", hex"00", bytes32(0));
    }

    function test_TransferMovesToNewOwner() public {
        vm.prank(alice);
        uint256 tokenId = nft.registerAgent(bytes32("test"));

        vm.prank(alice);
        nft.transferFrom(alice, bob, tokenId);

        assertEq(nft.getCustody(tokenId, alice), 0);
        assertEq(nft.getCustody(tokenId, bob), 10000);
    }

    // ═══════════════════════════════════════════════════════
    // GAS ESTIMATION
    // ═══════════════════════════════════════════════════════

    function test_GasEstimate_RegisterWithData() public {
        uint8[8] memory traits = [uint8(75), 60, 80, 45, 90, 30, 55, 70];
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
        assertLt(gasUsed, 600000);
    }
}
