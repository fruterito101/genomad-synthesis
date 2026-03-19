// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IGenomad.sol";

/**
 * @title GenomadNFT
 * @notice ERC-721 NFT for AI Agents with on-chain DNA and encrypted storage
 * @dev FASE 4: Full on-chain architecture
 */
contract GenomadNFT is IGenomad {
    // ═══════════════════════════════════════════════════════
    // STORAGE
    // ═══════════════════════════════════════════════════════

    string public name = "Genomad";
    string public symbol = "GENO";

    uint256 private _tokenIdCounter;
    address public breedingFactory;
    address public owner;

    // Token data
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // Agent data (public traits, generation, parents)
    mapping(uint256 => AgentData) private _agents;
    
    // Encrypted data (SOUL.md, IDENTITY.md - only owners can decrypt)
    mapping(uint256 => EncryptedData) private _encryptedData;

    // ═══════════════════════════════════════════════════════
    // MODIFIERS
    // ═══════════════════════════════════════════════════════

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyOwnerOf(uint256 tokenId) {
        require(_owners[tokenId] == msg.sender, "Not token owner");
        _;
    }

    // ═══════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════

    constructor() {
        owner = msg.sender;
    }

    // ═══════════════════════════════════════════════════════
    // ADMIN
    // ═══════════════════════════════════════════════════════

    function setBreedingFactory(address _factory) external onlyOwner {
        breedingFactory = _factory;
    }

    // ═══════════════════════════════════════════════════════
    // AGENT FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /// @notice Register agent with just DNA commitment (legacy/simple)
    function registerAgent(bytes32 dnaCommitment) external returns (uint256 tokenId) {
        tokenId = ++_tokenIdCounter;

        _mint(msg.sender, tokenId);

        _agents[tokenId] = AgentData({
            dnaCommitment: dnaCommitment,
            traits: [uint8(0), 0, 0, 0, 0, 0, 0, 0],
            generation: 0,
            parentA: 0,
            parentB: 0,
            createdAt: block.timestamp,
            isActive: false
        });

        emit AgentRegistered(tokenId, msg.sender, dnaCommitment, 0);
    }

    /// @notice Register agent with full on-chain data (FASE 4)
    function registerAgentWithData(
        bytes32 dnaCommitment,
        uint8[8] calldata traits,
        bytes calldata encryptedSoul,
        bytes calldata encryptedIdentity,
        bytes32 contentHash
    ) external returns (uint256 tokenId) {
        // Validate traits are in range
        for (uint8 i = 0; i < 8; i++) {
            require(traits[i] <= 100, "Trait must be 0-100");
        }

        tokenId = ++_tokenIdCounter;

        _mint(msg.sender, tokenId);

        _agents[tokenId] = AgentData({
            dnaCommitment: dnaCommitment,
            traits: traits,
            generation: 0,
            parentA: 0,
            parentB: 0,
            createdAt: block.timestamp,
            isActive: false
        });

        _encryptedData[tokenId] = EncryptedData({
            encryptedSoul: encryptedSoul,
            encryptedIdentity: encryptedIdentity,
            contentHash: contentHash
        });

        emit AgentRegistered(tokenId, msg.sender, dnaCommitment, 0);
        emit EncryptedDataStored(tokenId, contentHash);
    }

    /// @notice Register bred agent (called by BreedingFactory)
    function registerBredAgent(
        address to,
        bytes32 dnaCommitment,
        uint256 generation,
        uint256 parentA,
        uint256 parentB
    ) external returns (uint256 tokenId) {
        require(msg.sender == breedingFactory, "Only breeding factory");

        tokenId = ++_tokenIdCounter;

        _mint(to, tokenId);

        // Inherit traits through crossover (done off-chain, stored here)
        _agents[tokenId] = AgentData({
            dnaCommitment: dnaCommitment,
            traits: [uint8(0), 0, 0, 0, 0, 0, 0, 0], // Set via setChildTraits
            generation: generation,
            parentA: parentA,
            parentB: parentB,
            createdAt: block.timestamp,
            isActive: false
        });

        emit AgentRegistered(tokenId, to, dnaCommitment, generation);
    }

    /// @notice Register bred agent with full data (FASE 4)
    function registerBredAgentWithData(
        address to,
        bytes32 dnaCommitment,
        uint8[8] calldata traits,
        uint256 generation,
        uint256 parentA,
        uint256 parentB,
        bytes calldata encryptedSoul,
        bytes calldata encryptedIdentity,
        bytes32 contentHash
    ) external returns (uint256 tokenId) {
        require(msg.sender == breedingFactory, "Only breeding factory");

        // Validate traits
        for (uint8 i = 0; i < 8; i++) {
            require(traits[i] <= 100, "Trait must be 0-100");
        }

        tokenId = ++_tokenIdCounter;

        _mint(to, tokenId);

        _agents[tokenId] = AgentData({
            dnaCommitment: dnaCommitment,
            traits: traits,
            generation: generation,
            parentA: parentA,
            parentB: parentB,
            createdAt: block.timestamp,
            isActive: false
        });

        _encryptedData[tokenId] = EncryptedData({
            encryptedSoul: encryptedSoul,
            encryptedIdentity: encryptedIdentity,
            contentHash: contentHash
        });

        emit AgentRegistered(tokenId, to, dnaCommitment, generation);
        emit EncryptedDataStored(tokenId, contentHash);
    }

    // ═══════════════════════════════════════════════════════
    // GETTERS
    // ═══════════════════════════════════════════════════════

    function getAgentData(uint256 tokenId) external view returns (AgentData memory) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        return _agents[tokenId];
    }

    function getEncryptedData(uint256 tokenId) external view returns (EncryptedData memory) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        return _encryptedData[tokenId];
    }

    function getTraits(uint256 tokenId) external view returns (uint8[8] memory) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        return _agents[tokenId].traits;
    }

    // ═══════════════════════════════════════════════════════
    // STATE CHANGES
    // ═══════════════════════════════════════════════════════

    function activateAgent(uint256 tokenId) external onlyOwnerOf(tokenId) {
        _agents[tokenId].isActive = true;
        emit AgentActivated(tokenId, msg.sender);
    }

    function deactivateAgent(uint256 tokenId) external onlyOwnerOf(tokenId) {
        _agents[tokenId].isActive = false;
        emit AgentDeactivated(tokenId);
    }

    /// @notice Update encrypted data (for agent evolution/updates)
    function updateEncryptedData(
        uint256 tokenId,
        bytes calldata encryptedSoul,
        bytes calldata encryptedIdentity,
        bytes32 contentHash
    ) external onlyOwnerOf(tokenId) {
        _encryptedData[tokenId] = EncryptedData({
            encryptedSoul: encryptedSoul,
            encryptedIdentity: encryptedIdentity,
            contentHash: contentHash
        });

        emit EncryptedDataStored(tokenId, contentHash);
    }

    /// @notice Set traits for an agent (used after breeding calculation)
    function setTraits(uint256 tokenId, uint8[8] calldata traits) external onlyOwnerOf(tokenId) {
        for (uint8 i = 0; i < 8; i++) {
            require(traits[i] <= 100, "Trait must be 0-100");
        }
        _agents[tokenId].traits = traits;
    }

    // ═══════════════════════════════════════════════════════
    // ERC-721 IMPLEMENTATION
    // ═══════════════════════════════════════════════════════

    function balanceOf(address account) external view returns (uint256) {
        require(account != address(0), "Zero address");
        return _balances[account];
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        address tokenOwner = _owners[tokenId];
        require(tokenOwner != address(0), "Token does not exist");
        return tokenOwner;
    }

    function approve(address to, uint256 tokenId) external {
        address tokenOwner = _owners[tokenId];
        require(msg.sender == tokenOwner || _operatorApprovals[tokenOwner][msg.sender], "Not authorized");
        _tokenApprovals[tokenId] = to;
        emit Approval(tokenOwner, to, tokenId);
    }

    function getApproved(uint256 tokenId) external view returns (address) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        return _tokenApprovals[tokenId];
    }

    function setApprovalForAll(address operator, bool approved) external {
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address account, address operator) external view returns (bool) {
        return _operatorApprovals[account][operator];
    }

    function transferFrom(address from, address to, uint256 tokenId) external {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not authorized");
        _transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) external {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not authorized");
        _transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata) external {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not authorized");
        _transfer(from, to, tokenId);
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        return string(abi.encodePacked("https://genomad.vercel.app/api/agents/", _toString(tokenId)));
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    // ═══════════════════════════════════════════════════════
    // INTERNAL
    // ═══════════════════════════════════════════════════════

    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "Mint to zero address");
        _balances[to]++;
        _owners[tokenId] = to;
        emit Transfer(address(0), to, tokenId);
    }

    function _transfer(address from, address to, uint256 tokenId) internal {
        require(_owners[tokenId] == from, "Not owner");
        require(to != address(0), "Transfer to zero address");

        delete _tokenApprovals[tokenId];
        _balances[from]--;
        _balances[to]++;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address tokenOwner = _owners[tokenId];
        return (spender == tokenOwner ||
            _tokenApprovals[tokenId] == spender ||
            _operatorApprovals[tokenOwner][spender]);
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + value % 10));
            value /= 10;
        }
        return string(buffer);
    }

    // ═══════════════════════════════════════════════════════
    // ERC-721 EVENTS
    // ═══════════════════════════════════════════════════════

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
}
