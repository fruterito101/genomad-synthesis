// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IGenomad.sol";

/**
 * @title GenomadNFT
 * @notice ERC-721 NFT for AI Agents with on-chain DNA commitment
 * @dev Minimal ERC-721 implementation for hackathon
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

    // Agent data
    mapping(uint256 => AgentData) private _agents;

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

    function registerAgent(bytes32 dnaCommitment) external returns (uint256 tokenId) {
        tokenId = ++_tokenIdCounter;

        _mint(msg.sender, tokenId);

        _agents[tokenId] = AgentData({
            dnaCommitment: dnaCommitment,
            generation: 0,
            parentA: 0,
            parentB: 0,
            createdAt: block.timestamp,
            isActive: false
        });

        emit AgentRegistered(tokenId, msg.sender, dnaCommitment, 0);
    }

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

        _agents[tokenId] = AgentData({
            dnaCommitment: dnaCommitment,
            generation: generation,
            parentA: parentA,
            parentB: parentB,
            createdAt: block.timestamp,
            isActive: false
        });

        emit AgentRegistered(tokenId, to, dnaCommitment, generation);
    }

    function getAgentData(uint256 tokenId) external view returns (AgentData memory) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        return _agents[tokenId];
    }

    function activateAgent(uint256 tokenId) external onlyOwnerOf(tokenId) {
        _agents[tokenId].isActive = true;
        emit AgentActivated(tokenId, msg.sender);
    }

    function deactivateAgent(uint256 tokenId) external onlyOwnerOf(tokenId) {
        _agents[tokenId].isActive = false;
        emit AgentDeactivated(tokenId);
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
