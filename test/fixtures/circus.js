async function circusDeploymentFixture() {
  const accounts = await ethers.getSigners();
  const owner = accounts[0];

  const CircusDAO = await ethers.getContractFactory("CircusDAO");
  circusDAO = await upgrades.deployProxy(CircusDAO, { initializer: false });
  await circusDAO.deployed();

  const CircusCoin = await ethers.getContractFactory("CircusCoin");
  circusCoin = await upgrades.deployProxy(CircusCoin, { initializer: false });
  await circusCoin.deployed();

  const Banana = await ethers.getContractFactory("Banana");
  banana = await upgrades.deployProxy(Banana, { initializer: false });
  await banana.deployed();

  await circusCoin.initialize(circusDAO.address, 1_000_000_000_00000);
  await banana.initialize(circusDAO.address);
  await circusDAO.initialize(circusCoin.address, banana.address);

  return { circusDAO, circusCoin, banana, accounts, owner };
}

module.exports = { circusDeploymentFixture };
