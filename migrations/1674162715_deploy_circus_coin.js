const CircusCoin = artifacts.require("CircusCoin");

module.exports = function (_deployer) {
  _deployer.deploy(CircusCoin, 1000000000 * Math.pow(10, 5));
};
