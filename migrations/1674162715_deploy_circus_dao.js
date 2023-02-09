const CircusDAO = artifacts.require("CircusDao");

module.exports = async function (_deployer) {
  await _deployer.deploy(CircusDAO);

  const circusDao = await CircusDAO.deployed();
  await circusDao.initialize();
};
