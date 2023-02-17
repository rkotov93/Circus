const CircusDAO = artifacts.require("CircusDAO");
const CircusCoin = artifacts.require("CircusCoin");
const Banana = artifacts.require("Banana");

module.exports = async function (_deployer) {
  const circusDAO = await CircusDAO.deployed();
  const circusCoin = await CircusCoin.deployed();
  const banana = await Banana.deployed();

  console.log("Initializing CircusCoin...");
  await circusCoin.initialize(circusDAO.address, 1_000_000_000_00000);

  console.log("Initializing Banana...");
  await banana.initialize(circusDAO.address);

  console.log("Initializing CircusDAO...");
  await circusDAO.initialize(circusCoin.address);
};
