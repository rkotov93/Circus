// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

import "./CircusDAO.sol";

contract Banana is ERC721URIStorageUpgradeable, ERC721EnumerableUpgradeable {
  using CountersUpgradeable for CountersUpgradeable.Counter;
  CountersUpgradeable.Counter private _tokenIds;

  CircusDAO dao;

  function initialize(address _dao) initializer public {
    __ERC721_init("Banana", "CIRCBNN");

    dao = CircusDAO(_dao);
  }

  function pick(string memory _tokenURI) public returns (uint256) {
    require(dao.isClown(msg.sender), "Only clowns can pick bananas");

    uint256 newItemId = _tokenIds.current();
    _mint(msg.sender, newItemId);
    _setTokenURI(newItemId, _tokenURI);

    _tokenIds.increment();
    return newItemId;
  }

  function _beforeTokenTransfer(address from, address to, uint256 firstTokenId, uint256 batchSize) internal virtual override(ERC721Upgradeable, ERC721EnumerableUpgradeable) {
    require(dao.isClown(to) || to == address(dao), "NFT can be transfered only to clowns");

    super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
  }

  function resetBalance(address clown) external {
    address _dao = address(dao);
    require(msg.sender == _dao, "Only DAO can reset the balance");

    uint256 amount = balanceOf(clown);
    while (amount > 0) {
      uint256 tokenId = tokenOfOwnerByIndex(clown, 0);
      _transfer(clown, _dao, tokenId);
      unchecked { amount--; }
    }
  }

  function _burn(uint256 tokenId) internal virtual override(ERC721Upgradeable, ERC721URIStorageUpgradeable) {
    super._burn(tokenId);
  }

  function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Upgradeable, ERC721EnumerableUpgradeable) returns (bool) {
    return super.supportsInterface(interfaceId);
  }

  function tokenURI(uint256 tokenId) public view virtual override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (string memory) {
    return super.tokenURI(tokenId);
  }
}
