// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/GenomadNFT.sol";
import "../src/BreedingFactory.sol";
import "../src/TraitVerifier.sol";

contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();

        // Deploy TraitVerifier (placeholder - returns true for all proofs)
        TraitVerifier verifier = new TraitVerifier();
        console.log("TraitVerifier deployed at:", address(verifier));

        // Deploy NFT contract
        GenomadNFT nft = new GenomadNFT();
        console.log("GenomadNFT deployed at:", address(nft));

        // Link verifier to NFT
        nft.setTraitVerifier(address(verifier));
        console.log("TraitVerifier linked to NFT");

        // Deploy Breeding Factory
        BreedingFactory breeding = new BreedingFactory(address(nft));
        console.log("BreedingFactory deployed at:", address(breeding));

        // Link breeding factory to NFT
        nft.setBreedingFactory(address(breeding));
        console.log("BreedingFactory linked to NFT");

        vm.stopBroadcast();

        // Output for easy copy
        console.log("");
        console.log("=== DEPLOYMENT COMPLETE ===");
        console.log("VERIFIER_ADDRESS=", address(verifier));
        console.log("NFT_ADDRESS=", address(nft));
        console.log("BREEDING_ADDRESS=", address(breeding));
    }
}
