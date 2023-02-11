pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "./CircusDAO.sol";

contract CircusCoin is ERC20Upgradeable {
  CircusDAO dao;

  function initialize(address _dao, uint256 initialSupply) initializer public {
    __ERC20_init("CircusCoin", "CIRCUS");

    dao = CircusDAO(_dao);
    _mint(_dao, initialSupply);
  }

  function decimals() public view virtual override returns (uint8) {
    return 5;
  }

  function _beforeTokenTransfer(address from, address to, uint256 value) internal virtual override {
    require(dao.isClown(to) || to == address(dao), "Circus Coins can belong to clowns only");

    super._beforeTokenTransfer(from, to, value);
  }
}
