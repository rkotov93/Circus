async function addClown(circusDAO, clown) {
  await circusDAO.nominateClown(clown.address);
  await circusDAO.approveClown(clown.address);
  await circusDAO.connect(clown).joinCircus();
}

async function pickBanana(banana, sender) {
  const metadataURI = "https://url.local/metadata.json";
  const tx = await banana.connect(sender).pick(metadataURI);

  return tx;
}

module.exports = { addClown, pickBanana };
