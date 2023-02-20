// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";

interface IBanana is IERC721Upgradeable {
  function resetBalance(address clown) external;
}
