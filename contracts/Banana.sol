pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

import "./CircusDAO.sol";

contract Banana is ERC721URIStorageUpgradeable {
  using CountersUpgradeable for CountersUpgradeable.Counter;
  CountersUpgradeable.Counter private _tokenIds;

  CircusDAO dao;

  function initialize(address _dao) initializer public {
    __ERC721_init("Banana", "CIRCBNN");

    dao = CircusDAO(_dao);
  }

  function pick(string memory tokenURI) public returns (uint256) {
    uint256 newItemId = _tokenIds.current();
    _mint(msg.sender, newItemId);
    _setTokenURI(newItemId, tokenURI);

    _tokenIds.increment();
    return newItemId;
  }

  function _beforeTokenTransfer(address from, address to, uint256 firstTokenId, uint256 batchSize) internal virtual override {
    require(dao.clowns(to), "NFT can be transfered only to clowns");

    super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
  }
}
