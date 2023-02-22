const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const circusFixture = require("../fixtures/circus");

describe("Banana", () => {
  let accounts;
  let circusDAO;
  let banana;

  async function addClown(clown) {
    await circusDAO.nominateClown(clown.address);
    await circusDAO.approveClown(clown.address);
    await circusDAO.connect(clown).joinCircus();
  }

  // async function pickBanana(sender) {
  //   const metadataURI = "https://url.local/metadata.json";
  //   const result = await banana.pick(metadataURI, { from: sender });
  //   return result.logs[0].args.tokenId;
  // }

  async function pickBanana(sender) {
    const metadataURI = "https://url.local/metadata.json";
    const tx = await banana.connect(sender).pick(metadataURI);

    return tx;
  }

  async function getTokenId(tx) {
    const receipt = await tx.wait(0);
    const transferEvent = receipt.events.pop();

    return transferEvent.args.tokenId;
  }

  beforeEach(async () => {
    ({ circusDAO, banana, accounts } = await loadFixture(circusFixture));
  });

  describe("#pick", () => {
    context("when sender is not a clown", () => {
      it("raises an error", async () => {
        const sender = accounts[1];

        expect(pickBanana(sender)).to.be.revertedWith(
          "NFT can be transfered only to clowns"
        );
      });
    });

    context("when sender is a clown", () => {
      it("mints banana", async () => {
        const sender = accounts[0];
        const tokenId = await getTokenId(await pickBanana(sender));

        expect(await banana.balanceOf(sender.address)).to.be.eq(1);
        expect(await banana.ownerOf(tokenId)).to.be.eq(sender.address);
      });
    });
  });

  describe("#transferFrom", () => {
    let sender;
    let recipient;
    let spender;
    let tokenId;

    beforeEach(async () => {
      sender = accounts[0];
      recipient = accounts[1];
      spender = accounts[2];

      tokenId = await getTokenId(await pickBanana(sender));
      await banana.approve(spender.address, tokenId);
    });

    context("when recipient is a clown", () => {
      beforeEach(async () => {
        await addClown(recipient);
      });

      it("transfers banana", async () => {
        await banana
          .connect(spender)
          .transferFrom(sender.address, recipient.address, tokenId);

        const senderBalance = await banana.balanceOf(sender.address);
        expect(senderBalance).to.be.eq(0);

        const recipientBalance = await banana.balanceOf(recipient.address);
        expect(recipientBalance).to.be.eq(1);
      });
    });

    context("when recipient is not a clown", () => {
      it("raises an error", async () => {
        await expect(
          banana
            .connect(spender)
            .transferFrom(sender.address, recipient.address, tokenId)
        ).to.be.revertedWith("NFT can be transfered only to clowns");

        const balance = await banana.balanceOf(recipient.address);
        expect(balance).to.be.eq(0);
      });
    });
  });

  describe("#resetBalance", () => {
    let clown;

    beforeEach(async () => {
      clown = accounts[1];

      await addClown(clown);
      await pickBanana(clown);
    });

    context("when sender is not a DAO", () => {
      it("raises an error", async () => {
        await expect(banana.resetBalance(clown.address)).to.be.revertedWith(
          "Only DAO can reset the balance"
        );
      });
    });
  });
});
