const { deployProxy } = require("@openzeppelin/truffle-upgrades");

const CircusDAO = artifacts.require("CircusDAO");

module.exports = async function (deployer) {
  await deployProxy(CircusDAO, { deployer, initializer: false });
};
