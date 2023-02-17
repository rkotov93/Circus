const { deployProxy } = require("@openzeppelin/truffle-upgrades");

const Banana = artifacts.require("Banana");

module.exports = async function (deployer) {
  await deployProxy(Banana, { deployer, initializer: false });
};
