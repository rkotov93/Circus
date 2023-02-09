pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./CircusDao.sol";

contract CircusCoin is ERC20 {
  CircusDao dao;

  constructor(address _dao, uint256 initialSupply) ERC20("CircusCoin", "CIRCUS") {
    dao = CircusDao(_dao);
    _mint(_dao, initialSupply);
  }

  function decimals() public view virtual override returns (uint8) {
    return 5;
  }

  function _beforeTokenTransfer(address from, address to, uint256 value) internal virtual override {
    require(dao.clowns(to) || to == address(dao), "Circus Coins can belong to clowns only");

    super._beforeTokenTransfer(from, to, value);
  }
}
