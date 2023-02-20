const { deployProxy } = require("@openzeppelin/truffle-upgrades");

const CircusDAO = artifacts.require("CircusDAO");
const CircusCoin = artifacts.require("CircusCoin");
const Banana = artifacts.require("Banana");

contract("CircusCoin", (accounts) => {
  let circusDAO;
  let circusCoin;
  let banana;

  async function addClown(clownAddress) {
    await circusDAO.nominateClown(clownAddress);
    await circusDAO.approveClown(clownAddress);
    await circusDAO.joinCircus({ from: clownAddress });
  }

  async function pickBanana(sender) {
    const metadataURI = "https://url.local/metadata.json";
    const result = await banana.pick(metadataURI, { from: sender });
    return result.logs[0].args.tokenId;
  }

  beforeEach(async () => {
    circusDAO = await deployProxy(CircusDAO, { initializer: false });
    circusCoin = await deployProxy(CircusCoin, { initializer: false });
    banana = await deployProxy(Banana, { initializer: false });

    await circusCoin.initialize(circusDAO.address, 1_000_000_000_00000);
    await banana.initialize(circusDAO.address);
    await circusDAO.initialize(circusCoin.address, banana.address);
  });

  describe("#pick", () => {
    context("when sender is not a clown", () => {
      const sender = accounts[1];

      it("raises an error", async () => {
        try {
          await pickBanana(sender);
          assert.ok(false);
        } catch (error) {
          assert.equal(error.reason, "NFT can be transfered only to clowns");
        }
      });
    });

    context("when sender is a clown", () => {
      const sender = accounts[0];

      it("mints banana", async () => {
        const tokenId = await pickBanana(sender);
        assert.equal(await banana.balanceOf(sender), 1);
        assert.equal(await banana.ownerOf(tokenId), sender);
      });
    });
  });

  describe("#transferFrom", () => {
    const sender = accounts[0];
    const recipient = accounts[1];
    const spender = accounts[2];
    let tokenId;

    beforeEach(async () => {
      tokenId = await pickBanana(sender);
      await banana.approve(spender, tokenId);
    });

    context("when recipient is a clown", () => {
      beforeEach(async () => {
        await addClown(recipient);
      });

      it("transfers banana", async () => {
        await banana.transferFrom(sender, recipient, tokenId, {
          from: spender,
        });

        const senderBalance = await banana.balanceOf(sender);
        assert.equal(senderBalance, 0);

        const recipientBalance = await banana.balanceOf(recipient);
        assert.equal(recipientBalance, 1);
      });
    });

    context("when recipient is not a clown", () => {
      it("raises an error", async () => {
        try {
          await banana.transferFrom(sender, recipient, tokenId, {
            from: spender,
          });
          assert.ok(false);
        } catch (error) {
          assert.equal(error.reason, "NFT can be transfered only to clowns");

          const balance = await banana.balanceOf(recipient);
          assert.equal(balance, 0);
        }
      });
    });
  });

  describe("#resetBalance", () => {
    const clown = accounts[1];

    beforeEach(async () => {
      await addClown(clown);
      await pickBanana(clown);
    });

    context("when sender is not a DAO", () => {
      it("raises an error", async () => {
        try {
          await banana.resetBalance(clown);
          assert.ok(false);
        } catch (error) {
          assert.equal(error.reason, "Only DAO can reset the balance");
        }
      });
    });
  });
});
