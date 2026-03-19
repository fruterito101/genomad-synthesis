// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/GenomadNFT.sol";
import "../src/TraitVerifier.sol";

contract GenomadNFTTest is Test {
    GenomadNFT public nft;
    address public alice = address(0x1);
    address public bob = address(0x2);

    function setUp() public {
        nft = new GenomadNFT();
    }

    function test_RegisterAgent() public {
        vm.prank(alice);
        uint256 tokenId = nft.registerAgent(bytes32("test_dna"));
        assertEq(tokenId, 1);
        assertEq(nft.ownerOf(tokenId), alice);
    }

    function test_RegisterAgentWithData() public {
        uint8[8] memory traits = [uint8(75), 60, 80, 45, 90, 30, 55, 70];
        vm.prank(alice);
        uint256 tokenId = nft.registerAgentWithData(
            bytes32("dna"),
            traits,
            hex"deadbeefcafe",
            hex"cafebabe1234",
            keccak256("content")
        );
        assertEq(tokenId, 1);
        uint8[8] memory stored = nft.getTraits(tokenId);
        assertEq(stored[0], 75);
    }

    function test_RegisterAgentWithData_TraitValidation() public {
        uint8[8] memory invalid = [uint8(75), 60, 101, 45, 90, 30, 55, 70];
        vm.prank(alice);
        vm.expectRevert("Trait must be 0-100");
        nft.registerAgentWithData(bytes32("x"), invalid, hex"00", hex"00", bytes32(0));
    }

    function test_InitialCustody() public {
        vm.prank(alice);
        uint256 tokenId = nft.registerAgent(bytes32("test"));
        assertEq(nft.getCustody(tokenId, alice), 10000);
    }

    function test_TransferCustody() public {
        vm.prank(alice);
        uint256 tokenId = nft.registerAgent(bytes32("test"));
        vm.prank(alice);
        nft.transferCustody(tokenId, bob, 3000);
        assertEq(nft.getCustody(tokenId, alice), 7000);
        assertEq(nft.getCustody(tokenId, bob), 3000);
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

    function test_TransferMovesToNewOwner() public {
        vm.prank(alice);
        uint256 tokenId = nft.registerAgent(bytes32("test"));
        vm.prank(alice);
        nft.transferFrom(alice, bob, tokenId);
        assertEq(nft.getCustody(tokenId, alice), 0);
        assertEq(nft.getCustody(tokenId, bob), 10000);
    }

    function test_RegisterAgentWithProof_NoVerifier() public {
        uint8[8] memory traits = [uint8(75), 60, 80, 45, 90, 30, 55, 70];
        vm.prank(alice);
        uint256 tokenId = nft.registerAgentWithProof(
            bytes32("dna"),
            traits,
            hex"deadbeef",
            hex"cafebabe",
            keccak256("content"),
            hex""
        );
        assertEq(tokenId, 1);
        assertEq(nft.getCustody(tokenId, alice), 10000);
    }

    function test_RegisterAgentWithProof_WithVerifier() public {
        TraitVerifier verifier = new TraitVerifier();
        nft.setTraitVerifier(address(verifier));

        uint8[8] memory traits = [uint8(75), 60, 80, 45, 90, 30, 55, 70];
        vm.prank(alice);
        uint256 tokenId = nft.registerAgentWithProof(
            bytes32("dna_verified"),
            traits,
            hex"aabbccdd",
            hex"11223344",
            keccak256("content"),
            hex"00112233"
        );
        assertEq(tokenId, 1);
        IGenomad.EncryptedData memory enc = nft.getEncryptedData(tokenId);
        assertEq(enc.contentHash, keccak256("content"));
    }

    function test_GasEstimate_RegisterWithData() public {
        uint8[8] memory traits = [uint8(75), 60, 80, 45, 90, 30, 55, 70];
        bytes memory soul = new bytes(2048);
        bytes memory identity = new bytes(1024);
        uint256 gasBefore = gasleft();
        vm.prank(alice);
        nft.registerAgentWithData(bytes32("gas"), traits, soul, identity, keccak256("x"));
        uint256 gasUsed = gasBefore - gasleft();
        emit log_named_uint("Gas for 3KB", gasUsed);
        assertLt(gasUsed, 600000);
    }
}
