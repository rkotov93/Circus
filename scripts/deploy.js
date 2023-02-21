// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const CircusDAO = await ethers.getContractFactory("CircusDAO");
  const circusDAO = await upgrades.deployProxy(CircusDAO, {
    initializer: false,
  });
  await circusDAO.deployed();
  console.log("CircusDAO deployed at ", circusDAO.address);

  const CircusCoin = await ethers.getContractFactory("CircusCoin");
  const circusCoin = await upgrades.deployProxy(CircusCoin, {
    initializer: false,
  });
  await circusCoin.deployed();
  console.log("CircusCoin deployed at ", circusCoin.address);

  const Banana = await ethers.getContractFactory("Banana");
  const banana = await upgrades.deployProxy(Banana, {
    initializer: false,
  });
  await banana.deployed();
  console.log("Banana deployed at ", banana.address);

  await circusCoin.initialize(circusDAO.address, 1_000_000_000_00000);
  console.log("CircusCoin initialized");

  await banana.initialize(circusDAO.address);
  console.log("Banana initialized");

  await circusDAO.initialize(circusCoin.address, banana.address);
  console.log("CircusDAO initialized");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
