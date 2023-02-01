const CircusDAO = artifacts.require("CircusDao");

module.exports = async function (_deployer) {
  await _deployer.deploy(CircusDAO);
};
