const { deployProxy } = require("@openzeppelin/truffle-upgrades");

const CircusCoin = artifacts.require("CircusCoin");

module.exports = async function (deployer) {
  await deployProxy(CircusCoin, { deployer, initializer: false });
};
