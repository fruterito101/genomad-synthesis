// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/ReputationRegistry.sol";

contract DeployReputationScript is Script {
    // GenomadNFT address on Base Mainnet
    address constant GENOMAD_NFT = 0x9f20494A0FbC929adAC553f4A2FCFa7D2b448Cf0;

    function run() external {
        vm.startBroadcast();

        // Deploy Reputation Registry
        ReputationRegistry reputation = new ReputationRegistry(GENOMAD_NFT);
        console.log("ReputationRegistry deployed at:", address(reputation));

        vm.stopBroadcast();

        console.log("");
        console.log("=== REPUTATION REGISTRY DEPLOYED ===");
        console.log("REPUTATION_ADDRESS=", address(reputation));
        console.log("IDENTITY_REGISTRY=", GENOMAD_NFT);
    }
}
