const CircusDAO = artifacts.require("CircusDAO");
const CircusCoin = artifacts.require("CircusCoin");

module.exports = async function (_deployer) {
  const circusDAO = await CircusDAO.deployed();
  const circusCoin = await CircusCoin.deployed();

  console.log("Initializing CircusCoin...");
  await circusCoin.initialize(circusDAO.address, 1_000_000_000_00000);

  console.log("Initializing CircusDAO...");
  await circusDAO.initialize(circusCoin.address);
};
