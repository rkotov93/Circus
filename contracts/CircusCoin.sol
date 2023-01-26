pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CircusCoin is ERC20 {
  struct ClownNomination {
    bool completed;
    bool nominated;
    uint approvalsCount;
    mapping (address => bool) approvals;
  }

  uint public clownsCount;
  mapping (address => bool) public clowns;
  mapping (address => ClownNomination) public clownNominations;

  modifier isClown() {
    require(clowns[msg.sender], "This method can be called by one of the clowns only");
    _;
  }

  constructor(uint256 initialSupply) ERC20("CircusCoin", "CIRCUS") {
    clowns[msg.sender] = true;
    clownsCount = 1;
    _mint(msg.sender, initialSupply);
  }

  function decimals() public view virtual override returns (uint8) {
    return 5;
  }

  function nominateClown(address clownAddress) public isClown {
    require(!clowns[clownAddress], "This clown is aldready a part of Circus");
    require(!clownNominations[clownAddress].nominated, "Clown was already nominated");

    ClownNomination storage nomination = clownNominations[clownAddress];
    nomination.nominated = true;
  }

  function approveClown(address clownAddress) public isClown {
    require(clownNominations[clownAddress].nominated, "Clown has to be nominated before");

    ClownNomination storage nomination = clownNominations[clownAddress];
    require(!nomination.approvals[msg.sender], "You have already approved this clown!");

    nomination.approvalsCount += 1;
    nomination.approvals[msg.sender] = true;
  }

  function isNominationApprovedByMe(address nominatedClown) public view returns (bool) {
    return clownNominations[nominatedClown].approvals[msg.sender];
  }

  function joinCircus() public {
    require(!clowns[msg.sender], "You are already a part of Circus");

    ClownNomination storage nomination = clownNominations[msg.sender];
    require(nomination.nominated, "You were not nominated yet");
    require(nomination.approvalsCount == clownsCount, "You were not approved by all clowns yet");

    nomination.completed = true;
    clowns[msg.sender] = true;
    clownsCount += 1;
  }

  function _beforeTokenTransfer(address from, address to, uint256 value) internal virtual override {
    require(clowns[to], "Circus Coins can belong to clowns only");

    super._beforeTokenTransfer(from, to, value);
  }
}
