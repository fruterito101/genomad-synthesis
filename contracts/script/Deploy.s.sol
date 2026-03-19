// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/GenomadNFT.sol";
import "../src/BreedingFactory.sol";

contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();

        // Deploy NFT contract
        GenomadNFT nft = new GenomadNFT();
        console.log("GenomadNFT deployed at:", address(nft));

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
        console.log("NFT_ADDRESS=", address(nft));
        console.log("BREEDING_ADDRESS=", address(breeding));
    }
}
