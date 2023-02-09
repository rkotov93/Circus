const CircusDAO = artifacts.require("CircusDAO");

module.exports = async function (_deployer) {
  await _deployer.deploy(CircusDAO);

  const circusDAO = await CircusDAO.deployed();
  await circusDAO.initialize();
};
