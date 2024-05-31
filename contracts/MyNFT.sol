// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract FiredGuys is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    // Mapping to store metadata for each token ID
    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC721("FiredGuys", "FYR") {}

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://";
    }

    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return _tokenURIs[tokenId];
    }

    function _setTokenURI(
        uint256 tokenId,
        string memory uri
    ) internal override {
        _tokenURIs[tokenId] = uri;
    }

    function isContentOwned(string memory uri) public view returns (bool) {
        for (uint256 i = 0; i < _tokenIdCounter.current(); i++) {
            if (
                keccak256(abi.encodePacked(_tokenURIs[i])) ==
                keccak256(abi.encodePacked(uri))
            ) {
                return true;
            }
        }
        return false;
    }

    function payToMint(
        address recipient,
        string memory metadataURI
    ) public payable returns (uint256) {
        require(!isContentOwned(metadataURI), "NFT already minted!");
        require(msg.value >= 0.001 ether, "Need to pay up!");

        uint256 newItemId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _mint(recipient, newItemId);
        _setTokenURI(newItemId, metadataURI);

        return newItemId;
    }

    function count() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
}
