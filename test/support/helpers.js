// const { deployProxy } = require("@openzeppelin/truffle-upgrades");

// const CircusDAO = artifacts.require("CircusDAO");
// const CircusCoin = artifacts.require("CircusCoin");

// async function addClownContext(clownAddress) {
//   await circusDAO.nominateClown(clownAddress);
//   await circusDAO.approveClown(clownAddress);
//   await circusDAO.joinCircus({ from: clownAddress });
// }

// function initializeCircus() {
//   beforeEach(async () => {
//     circusDAO = await deployProxy(CircusDAO, { initializer: false });
//     circusCoin = await deployProxy(CircusCoin, { initializer: false });

//     await circusCoin.initialize(circusDAO.address, 1_000_000_000_00000);
//     await circusDAO.initialize(circusCoin.address);
//   });
// }

// module.exports = { addClownContext };

// const { deployProxy } = require("@openzeppelin/truffle-upgrades");

// async function addClown(clownAddress) {
//   await circusDAO.nominateClown(clownAddress);
//   await circusDAO.approveClown(clownAddress);
//   await circusDAO.joinCircus({ from: clownAddress });
// }

// async function deployContracts() {
//   const circusDAO = await deployProxy(CircusDAO, { initializer: false });
//   const circusCoin = await deployProxy(CircusCoin, { initializer: false });

//   await circusCoin.initialize(circusDAO.address, 1_000_000_000_00000);
//   await circusDAO.initialize(circusCoin.address);

//   return [circusDAO, circusCoin];
// }

// module.exports = { addClown, deployContracts };
