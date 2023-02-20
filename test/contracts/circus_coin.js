const { deployProxy } = require("@openzeppelin/truffle-upgrades");

const CircusDAO = artifacts.require("CircusDAO");
const CircusCoin = artifacts.require("CircusCoin");
const Banana = artifacts.require("Banana");

contract("CircusCoin", (accounts) => {
  let deployer = accounts[0];
  let circusDAO;
  let circusCoin;

  async function addClown(clownAddress) {
    await circusDAO.nominateClown(clownAddress);
    await circusDAO.approveClown(clownAddress);
    await circusDAO.joinCircus({ from: clownAddress });
  }

  beforeEach(async () => {
    circusDAO = await deployProxy(CircusDAO, { initializer: false });
    circusCoin = await deployProxy(CircusCoin, { initializer: false });
    banana = await deployProxy(Banana, { initializer: false });

    await circusCoin.initialize(circusDAO.address, 1_000_000_000_00000);
    await banana.initialize(circusDAO.address);
    await circusDAO.initialize(circusCoin.address, banana.address);
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

  describe("#resetBalance", () => {
    const clown = accounts[1];

    beforeEach(async () => {
      await addClown(clown);
    });

    context("when sender is not a DAO", () => {
      it("raises an error", async () => {
        try {
          await circusCoin.resetBalance(clown);
          assert.ok(false);
        } catch (error) {
          assert.equal(error.reason, "Only DAO can reset the balance");
        }
      });
    });

    // context("when sender is a DAO", () => {
    //   it("moves all the coins to the DAO balance", async () => {
    //     const initialBalance = await circusCoin.balanceOf(clown);
    //     assert.equal(initialBalance, 1000_00000);

    //     await circusCoin.resetBalance(clown, { from: circusDAO.address });
    //     const currentBalance = await circusCoin.balanceOf(clown);
    //     assert.equal(initialBalance, 0);
    //   });
    // });
  });
});
