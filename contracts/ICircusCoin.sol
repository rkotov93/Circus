// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

interface ICircusCoin is IERC20Upgradeable {
  function resetBalance(address clown) external;
}
