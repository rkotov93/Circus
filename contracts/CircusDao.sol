pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";

contract CircusDAO is Initializable {
  struct ClownNomination {
    bool completed;
    bool nominated;
    uint approvalsCount;
    mapping (address => bool) approvals;
  }

  uint public clownsCount;
  mapping (address => bool) public clowns;
  mapping (address => ClownNomination) public clownNominations;

  IERC20Upgradeable public circusCoin;
  // IERC721Upgradeable public banana;

  modifier onlyClown() {
    require(clowns[msg.sender], "This method can be called by one of the clowns only");
    _;
  }

  function initialize(address _circusCoin) initializer public {
    clowns[msg.sender] = true;
    clownsCount = 1;

    circusCoin = IERC20Upgradeable(_circusCoin);
    circusCoin.transfer(msg.sender, 100000000);

    // banana = IERC721Upgradeable(_banana);
  }

  function nominateClown(address clownAddress) external onlyClown {
    require(!clowns[clownAddress], "This clown is aldready a part of Circus");
    require(!clownNominations[clownAddress].nominated, "Clown was already nominated");

    ClownNomination storage nomination = clownNominations[clownAddress];
    nomination.nominated = true;
  }

  function approveClown(address clownAddress) external onlyClown {
    require(clownNominations[clownAddress].nominated, "Clown has to be nominated before");

    ClownNomination storage nomination = clownNominations[clownAddress];
    require(!nomination.approvals[msg.sender], "You have already approved this clown!");

    nomination.approvalsCount += 1;
    nomination.approvals[msg.sender] = true;
  }

  function isNominationApprovedByMe(address nominatedClown) public view returns (bool) {
    return clownNominations[nominatedClown].approvals[msg.sender];
  }

  function joinCircus() external {
    require(!clowns[msg.sender], "You are already a part of Circus");

    ClownNomination storage nomination = clownNominations[msg.sender];
    require(nomination.nominated, "You were not nominated yet");
    require(nomination.approvalsCount == clownsCount, "You were not approved by all clowns yet");

    nomination.completed = true;
    clowns[msg.sender] = true;
    clownsCount += 1;

    circusCoin.transfer(msg.sender, 100000000);
  }

  function isClown(address addr) public view returns (bool) {
    return clowns[addr];
  }
}
