const CircusDao = artifacts.require("CircusDao");
const CircusCoin = artifacts.require("CircusCoin");

contract("CircusCoin", (accounts) => {
  let deployer = accounts[0];
  let circusDao;
  let circusCoin;

  async function addClown(clownAddress) {
    await circusDao.nominateClown(clownAddress);
    await circusDao.approveClown(clownAddress);
    await circusDao.joinCircus({ from: clownAddress });
  }

  beforeEach(async () => {
    circusDao = await CircusDao.new({ from: deployer });
    await circusDao.initialize();
    circusCoin = await CircusCoin.at(await circusDao.circusCoin());
  });

  describe("#transfer", () => {
    const recipient = accounts[1];

    context("when recipient is a clown", () => {
      beforeEach(async () => {
        await addClown(recipient);
      });

      it("transfers money", async () => {
        await circusCoin.transfer(recipient, 100);

        const senderBalance = await circusCoin.balanceOf(deployer);
        assert.equal(senderBalance, 100000000 - 100);

        const recipientBalance = await circusCoin.balanceOf(recipient);
        assert.equal(recipientBalance, 100000000 + 100);
      });
    });

    context("when recipient is not a clown", () => {
      it("raises an error", async () => {
        try {
          await circusCoin.transfer(recipient, 100);
          assert.ok(false);
        } catch (error) {
          assert.equal(error.reason, "Circus Coins can belong to clowns only");

          const balance = await circusCoin.balanceOf(recipient);
          assert.equal(balance, 0);
        }
      });
    });
  });

  describe("#transferFrom", () => {
    const sender = accounts[0];
    const recipient = accounts[1];
    const spender = accounts[2];

    beforeEach(async () => {
      await circusCoin.approve(spender, 100);
    });

    context("when recipient is a clown", () => {
      beforeEach(async () => {
        await addClown(recipient);
      });

      it("transfers money", async () => {
        await circusCoin.transferFrom(sender, recipient, 100, {
          from: spender,
        });

        const senderBalance = await circusCoin.balanceOf(sender);
        assert.equal(senderBalance, 100000000 - 100);

        const recipientBalance = await circusCoin.balanceOf(recipient);
        assert.equal(recipientBalance, 100000000 + 100);
      });
    });

    context("when recipient is not a clown", () => {
      it("raises an error", async () => {
        try {
          await circusCoin.transferFrom(sender, recipient, 100, {
            from: spender,
          });
          assert.ok(false);
        } catch (error) {
          assert.equal(error.reason, "Circus Coins can belong to clowns only");

          const balance = await circusCoin.balanceOf(recipient);
          assert.equal(balance, 0);
        }
      });
    });
  });
});
