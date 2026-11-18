// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @notice Minimal interface of the Binance Agent ID registry (SPACE ID Agent ID).
/// @dev Real registry on BNB Chain: 0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F (ERC-721, non-transferable).
///      balanceOf(address) > 0 means the address holds an Agent ID.
interface IAgentIdRegistry {
    function balanceOf(address owner) external view returns (uint256);
}

/**
 * @title AgentBadge
 * @notice A free-mint badge NFT for Agent ID holders. Exactly one badge per wallet,
 *         only if the caller holds an Agent ID (checked on-chain against the registry).
 * @dev Genuine Agent ID use case: access control. No fees, no royalties, no pause,
 *      no owner mint. The owner (deployer) can only set an optional external baseURI;
 *      by default every token's metadata is fully on-chain (SVG + JSON, data URI).
 */
contract AgentBadge is ERC721, Ownable {
    using Strings for uint256;

    /// @notice Binance Agent ID registry on BNB Chain.
    IAgentIdRegistry public immutable agentIdRegistry;

    /// @notice Maximum number of badges that can ever exist.
    uint256 public constant MAX_SUPPLY = 10_000;

    /// @notice Next token id to mint (starts at 1).
    uint256 public nextTokenId = 1;

    /// @notice True once an address has minted its one badge.
    mapping(address => bool) public hasMinted;

    /// @notice Optional external metadata base URI (empty = fully on-chain metadata).
    string public baseURI;

    event BadgeMinted(address indexed holder, uint256 indexed tokenId);

    error NoAgentId();
    error AlreadyMinted();
    error MaxSupplyReached();

    constructor(address _agentIdRegistry) ERC721("AgentBadge", "AGBADGE") Ownable(msg.sender) {
        require(_agentIdRegistry != address(0), "AgentBadge: registry is zero address");
        agentIdRegistry = IAgentIdRegistry(_agentIdRegistry);
    }

    /**
     * @notice Mint one free badge. Caller must hold an Agent ID and must not have minted before.
     * @dev Payable only so a mistaken BNB payment can be rejected with a clear error
     *      instead of failing opaquely; any sent value reverts and nothing is kept.
     */
    function mint() external payable {
        if (msg.value != 0) revert("AgentBadge: mint is free, do not send BNB");
        if (agentIdRegistry.balanceOf(msg.sender) == 0) revert NoAgentId();
        if (hasMinted[msg.sender]) revert AlreadyMinted();
        uint256 tokenId = nextTokenId;
        if (tokenId > MAX_SUPPLY) revert MaxSupplyReached();

        hasMinted[msg.sender] = true;
        nextTokenId = tokenId + 1;
        _safeMint(msg.sender, tokenId);
        emit BadgeMinted(msg.sender, tokenId);
    }

    /// @notice Total number of badges minted so far.
    function totalSupply() external view returns (uint256) {
        return nextTokenId - 1;
    }

    /// @notice Owner-only: point metadata at an external base URI (e.g. IPFS/HTTPS).
    ///         Leave empty to keep the fully on-chain SVG metadata.
    function setBaseURI(string calldata _baseURI) external onlyOwner {
        baseURI = _baseURI;
    }

    /// @notice Token metadata. On-chain SVG badge by default; baseURI + tokenId if set by owner.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        if (bytes(baseURI).length > 0) {
            return string.concat(baseURI, tokenId.toString());
        }
        string memory svg = string.concat(
            '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">',
            '<rect width="512" height="512" rx="48" fill="#0b0f1a"/>',
            '<rect x="24" y="24" width="464" height="464" rx="36" fill="none" stroke="#f0b90b" stroke-width="6"/>',
            '<circle cx="256" cy="190" r="86" fill="none" stroke="#f0b90b" stroke-width="8"/>',
            '<text x="256" y="212" font-family="sans-serif" font-size="72" font-weight="bold" fill="#f0b90b" text-anchor="middle">A</text>',
            '<text x="256" y="330" font-family="sans-serif" font-size="44" font-weight="bold" fill="#ffffff" text-anchor="middle">AGENT BADGE</text>',
            '<text x="256" y="378" font-family="sans-serif" font-size="26" fill="#9aa4b2" text-anchor="middle">Agent ID Holder</text>',
            '<text x="256" y="436" font-family="sans-serif" font-size="24" fill="#f0b90b" text-anchor="middle">#',
            tokenId.toString(),
            '</text></svg>'
        );
        string memory json = Base64.encode(
            bytes(
                string.concat(
                    '{"name":"AgentBadge #',
                    tokenId.toString(),
                    '","description":"A free badge proving the holder owns a Binance Agent ID. One per wallet, minted free on BNB Chain.","image":"data:image/svg+xml;base64,',
                    Base64.encode(bytes(svg)),
                    '","attributes":[{"trait_type":"Type","value":"Agent ID Badge"},{"trait_type":"Token","value":"',
                    tokenId.toString(),
                    '"}]}'
                )
            )
        );
        return string.concat("data:application/json;base64,", json);
    }
}
