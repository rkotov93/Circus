const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { circusDeploymentFixture } = require("../fixtures/circus");
const { addClown } = require("../support/helpers");

describe("CircusCoin", () => {
  let owner;
  let accounts;
  let circusDAO;
  let circusCoin;

  beforeEach(async () => {
    ({ circusDAO, circusCoin, owner, accounts } = await loadFixture(
      circusDeploymentFixture
    ));
  });

  describe("#transfer", () => {
    let recipient;

    beforeEach(() => {
      recipient = accounts[1];
    });

    context("when recipient is a clown", () => {
      beforeEach(async () => {
        await addClown(circusDAO, recipient);
      });

      it("transfers money", async () => {
        await circusCoin.transfer(recipient.address, 100);

        const senderBalance = await circusCoin.balanceOf(owner.address);
        expect(senderBalance).to.be.eq(100000000 - 100);

        const recipientBalance = await circusCoin.balanceOf(recipient.address);
        expect(recipientBalance).to.be.eq(100000000 + 100);
      });
    });

    context("when recipient is not a clown", () => {
      it("raises an error", async () => {
        await expect(
          circusCoin.transfer(recipient.address, 100)
        ).to.be.revertedWith("Circus Coins can belong to clowns only");

        const balance = await circusCoin.balanceOf(recipient.address);
        expect(balance).to.be.eq(0);
      });
    });
  });

  describe("#transferFrom", () => {
    let sender;
    let recipient;
    let spender;

    beforeEach(async () => {
      sender = accounts[0];
      recipient = accounts[1];
      spender = accounts[2];

      await circusCoin.approve(spender.address, 100);
    });

    context("when recipient is a clown", () => {
      beforeEach(async () => {
        await addClown(circusDAO, recipient);
      });

      it("transfers money", async () => {
        await circusCoin
          .connect(spender)
          .transferFrom(sender.address, recipient.address, 100);

        const senderBalance = await circusCoin.balanceOf(sender.address);
        expect(senderBalance).to.be.eq(100000000 - 100);

        const recipientBalance = await circusCoin.balanceOf(recipient.address);
        expect(recipientBalance).to.be.eq(100000000 + 100);
      });
    });

    context("when recipient is not a clown", () => {
      it("raises an error", async () => {
        await expect(
          circusCoin
            .connect(spender)
            .transferFrom(sender.address, recipient.address, 100)
        ).to.be.revertedWith("Circus Coins can belong to clowns only");

        const balance = await circusCoin.balanceOf(recipient.address);
        expect(balance).to.be.eq(0);
      });
    });
  });

  describe("#resetBalance", () => {
    let clown;

    beforeEach(async () => {
      clown = accounts[1];
      await addClown(circusDAO, clown);
    });

    context("when sender is not a DAO", () => {
      it("raises an error", async () => {
        await expect(circusCoin.resetBalance(clown.address)).to.be.revertedWith(
          "Only DAO can reset the balance"
        );
      });
    });

    // context("when sender is a DAO", () => {
    //   it("moves all the coins to the DAO balance", async () => {
    //     const initialBalance = await circusCoin.balanceOf(clown.address);
    //     expect(initialBalance).to.be.eq(1000_00000);

    //     await circusCoin.connect(circusDAO).resetBalance(clown.address);
    //     const currentBalance = await circusCoin.balanceOf(clown.address);
    //     expect(initialBalance).to.be.eq(0);
    //   });
    // });
  });
});
