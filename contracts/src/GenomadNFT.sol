// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IGenomad.sol";

/**
 * @title GenomadNFT
 * @notice ERC-721 NFT for AI Agents with on-chain DNA and encrypted storage
 * @dev FASE 4: Full on-chain architecture with custody system
 */
contract GenomadNFT is IGenomad {
    // ═══════════════════════════════════════════════════════
    // CONSTANTS
    // ═══════════════════════════════════════════════════════
    
    uint256 public constant BASIS_POINTS = 10000; // 100% = 10000

    // ═══════════════════════════════════════════════════════
    // STORAGE
    // ═══════════════════════════════════════════════════════

    string public name = "Genomad";
    string public symbol = "GENO";

    uint256 private _tokenIdCounter;
    address public breedingFactory;
    address public owner;

    // Token data (ERC-721)
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // Agent data (public traits, generation, parents)
    mapping(uint256 => AgentData) private _agents;
    
    // Encrypted data (SOUL.md, IDENTITY.md - only owners can decrypt)
    mapping(uint256 => EncryptedData) private _encryptedData;

    // Custody system: tokenId => owner => basis points (10000 = 100%)
    mapping(uint256 => mapping(address => uint256)) private _custody;
    
    // Track all custody holders for a token
    mapping(uint256 => address[]) private _custodyHolders;

    // ═══════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════

    event CustodyTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 amount
    );

    event CustodyDivided(
        uint256 indexed tokenId,
        address indexed holderA,
        address indexed holderB,
        uint256 shareA,
        uint256 shareB
    );

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

    modifier hasCustody(uint256 tokenId, uint256 minBasisPoints) {
        require(_custody[tokenId][msg.sender] >= minBasisPoints, "Insufficient custody");
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
    // CUSTODY FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /// @notice Get custody percentage for an address (in basis points)
    function getCustody(uint256 tokenId, address holder) external view returns (uint256) {
        return _custody[tokenId][holder];
    }

    /// @notice Get all custody holders for a token
    function getCustodyHolders(uint256 tokenId) external view returns (address[] memory) {
        return _custodyHolders[tokenId];
    }

    /// @notice Check if address has at least threshold custody
    function hasCustodyThreshold(uint256 tokenId, address holder, uint256 threshold) external view returns (bool) {
        return _custody[tokenId][holder] >= threshold;
    }

    /// @notice Transfer custody to another address
    function transferCustody(uint256 tokenId, address to, uint256 amount) external {
        require(to != address(0), "Cannot transfer to zero");
        require(to != msg.sender, "Cannot transfer to self");
        require(_custody[tokenId][msg.sender] >= amount, "Insufficient custody");
        require(amount > 0, "Amount must be positive");

        _custody[tokenId][msg.sender] -= amount;
        
        // Add to holders if new
        if (_custody[tokenId][to] == 0) {
            _custodyHolders[tokenId].push(to);
        }
        
        _custody[tokenId][to] += amount;

        // Remove from holders if zero
        if (_custody[tokenId][msg.sender] == 0) {
            _removeCustodyHolder(tokenId, msg.sender);
        }

        emit CustodyTransferred(tokenId, msg.sender, to, amount);
    }

    /// @notice Internal: Set initial custody (100% to creator)
    function _setInitialCustody(uint256 tokenId, address holder) internal {
        _custody[tokenId][holder] = BASIS_POINTS;
        _custodyHolders[tokenId].push(holder);
    }

    /// @notice Internal: Divide custody 50/50 for breeding
    function _divideCustody(uint256 tokenId, address holderA, address holderB) internal {
        uint256 halfShare = BASIS_POINTS / 2; // 5000 each
        
        _custody[tokenId][holderA] = halfShare;
        _custody[tokenId][holderB] = halfShare;
        
        _custodyHolders[tokenId].push(holderA);
        if (holderA != holderB) {
            _custodyHolders[tokenId].push(holderB);
        } else {
            // Same owner = 100%
            _custody[tokenId][holderA] = BASIS_POINTS;
        }

        emit CustodyDivided(tokenId, holderA, holderB, halfShare, halfShare);
    }

    /// @notice Internal: Remove address from custody holders array
    function _removeCustodyHolder(uint256 tokenId, address holder) internal {
        address[] storage holders = _custodyHolders[tokenId];
        for (uint256 i = 0; i < holders.length; i++) {
            if (holders[i] == holder) {
                holders[i] = holders[holders.length - 1];
                holders.pop();
                break;
            }
        }
    }

    // ═══════════════════════════════════════════════════════
    // AGENT FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /// @notice Register agent with just DNA commitment (legacy/simple)
    function registerAgent(bytes32 dnaCommitment) external returns (uint256 tokenId) {
        tokenId = ++_tokenIdCounter;

        _mint(msg.sender, tokenId);
        _setInitialCustody(tokenId, msg.sender);

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
        _setInitialCustody(tokenId, msg.sender);

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
        
        // Get parent owners for custody division
        address ownerA = _owners[parentA];
        address ownerB = _owners[parentB];
        _divideCustody(tokenId, ownerA, ownerB);

        _agents[tokenId] = AgentData({
            dnaCommitment: dnaCommitment,
            traits: [uint8(0), 0, 0, 0, 0, 0, 0, 0],
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
        
        // Get parent owners for custody division
        address ownerA = _owners[parentA];
        address ownerB = _owners[parentB];
        _divideCustody(tokenId, ownerA, ownerB);

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

    function activateAgent(uint256 tokenId) external hasCustody(tokenId, 5000) {
        _agents[tokenId].isActive = true;
        emit AgentActivated(tokenId, msg.sender);
    }

    function deactivateAgent(uint256 tokenId) external hasCustody(tokenId, 5001) {
        // Deactivation requires >50% (majority)
        _agents[tokenId].isActive = false;
        emit AgentDeactivated(tokenId);
    }

    /// @notice Update encrypted data (for agent evolution/updates)
    function updateEncryptedData(
        uint256 tokenId,
        bytes calldata encryptedSoul,
        bytes calldata encryptedIdentity,
        bytes32 contentHash
    ) external hasCustody(tokenId, BASIS_POINTS) {
        // Requires 100% custody to update data
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

        // Transfer full custody to new owner
        uint256 fromCustody = _custody[tokenId][from];
        if (fromCustody > 0) {
            _custody[tokenId][from] = 0;
            _removeCustodyHolder(tokenId, from);
            
            if (_custody[tokenId][to] == 0) {
                _custodyHolders[tokenId].push(to);
            }
            _custody[tokenId][to] += fromCustody;
        }

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
