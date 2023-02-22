const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { circusDeploymentFixture } = require("../fixtures/circus");
const { addClown, pickBanana } = require("../support/helpers");

describe("CircusDAO", () => {
  let owner;
  let accounts;
  let circusDAO;
  let circusCoin;
  let banana;

  beforeEach(async () => {
    ({ circusDAO, circusCoin, banana, accounts, owner } = await loadFixture(
      circusDeploymentFixture
    ));
  });

  it("adds first clown and transfers 1000 circus coins to them", async () => {
    expect(await circusDAO.isClown(owner.address)).to.be.true;
    expect(await circusCoin.balanceOf(owner.address)).to.be.eq(100000000);
  });

  describe("#nominateClown", () => {
    let clownToBeNominated;

    before(() => {
      clownToBeNominated = accounts[1];
    });

    it("creates ClownNomination", async () => {
      await circusDAO.nominateClown(clownToBeNominated.address);
      const nomination = await circusDAO.clownNominations(
        clownToBeNominated.address
      );
      expect(nomination.nominated).to.be.true;
    });

    context("when clowns is already a part of Circus", () => {
      it("raises an error", async () => {
        await expect(circusDAO.nominateClown(owner.address)).to.be.revertedWith(
          "This clown is aldready a part of Circus"
        );
      });
    });

    context("when called not by clown", () => {
      it("raises an error", async () => {
        await expect(
          circusDAO
            .connect(clownToBeNominated)
            .nominateClown(clownToBeNominated.address)
        ).to.be.revertedWith(
          "This method can be called by one of the clowns only"
        );
      });
    });

    context("when clown was already nominated", async () => {
      beforeEach(async () => {
        await circusDAO.nominateClown(clownToBeNominated.address);
      });

      it("raises an error", async () => {
        await expect(
          circusDAO.nominateClown(clownToBeNominated.address)
        ).to.be.revertedWith("Clown was already nominated");
      });
    });
  });

  describe("#approveClown", () => {
    let nominatedClown;

    before(() => {
      nominatedClown = accounts[1];
    });

    context("when called not by clown", () => {
      it("raises an error", async () => {
        await expect(
          circusDAO.connect(nominatedClown).approveClown(nominatedClown.address)
        ).to.be.revertedWith(
          "This method can be called by one of the clowns only"
        );
      });
    });

    context("when clown was not nominated yet", () => {
      it("raises an error", async () => {
        await expect(
          circusDAO.approveClown(nominatedClown.address)
        ).to.be.revertedWith("Clown has to be nominated before");
      });
    });

    context("with nomiated clown", () => {
      beforeEach(async () => {
        await circusDAO.nominateClown(nominatedClown.address);
      });

      context("when clown was already approved by this clown", () => {
        beforeEach(async () => {
          await circusDAO.approveClown(nominatedClown.address);
        });

        it("raises an error", async () => {
          await expect(
            circusDAO.approveClown(nominatedClown.address)
          ).to.be.revertedWith("You have already approved this clown!");
        });
      });

      it("approves the clown", async () => {
        await circusDAO.approveClown(nominatedClown.address);
        const nomination = await circusDAO.clownNominations(
          nominatedClown.address
        );

        expect(nomination.approvalsCount).to.be.eq(1);
        expect(await circusDAO.isNominationApprovedByMe(nominatedClown.address))
          .to.be.true;
      });
    });
  });

  describe("#joinCircus", () => {
    context("when clown is already a part of Circus", () => {
      it("raises an error", async () => {
        await expect(circusDAO.joinCircus()).to.be.revertedWith(
          "You are already a part of Circus"
        );
      });
    });

    context("when clown was not nomiated yet", () => {
      it("raises an error", async () => {
        const notNominatedClown = accounts[1];

        await expect(
          circusDAO.connect(notNominatedClown).joinCircus()
        ).to.be.revertedWith("You were not nominated yet");
      });
    });

    context("when nomiated clown was not approved by all clowns", () => {
      let nominateClown;

      beforeEach(async () => {
        const secondClown = accounts[1];
        nominatedClown = accounts[2];

        await addClown(circusDAO, secondClown);
        await circusDAO.nominateClown(nominatedClown.address);
        await circusDAO.approveClown(nominatedClown.address);
      });

      it("raises an error", async () => {
        await expect(
          circusDAO.connect(nominatedClown).joinCircus()
        ).to.be.revertedWith("You were not approved by all clowns yet");
      });
    });

    context("when all conditions are satisfied", () => {
      let nominatedClown;

      beforeEach(async () => {
        nominatedClown = accounts[1];

        await circusDAO.nominateClown(nominatedClown.address);
        await circusDAO.approveClown(nominatedClown.address);
      });

      it("adds nominated clown to clowns", async () => {
        await circusDAO.connect(nominatedClown).joinCircus();
        const nomination = await circusDAO.clownNominations(
          nominatedClown.address
        );

        expect(nomination.completed).to.be.true;
        expect(await circusDAO.clownsCount()).to.be.eq(2);
        expect(await circusDAO.clowns(nominatedClown.address)).to.be.true;
        expect(await circusCoin.balanceOf(nominatedClown.address)).to.be.eq(
          100000000
        );
      });
    });
  });

  describe("#leaveCircus", () => {
    let sender;

    beforeEach(async () => {
      sender = accounts[0];

      await pickBanana(banana, sender);
      await pickBanana(banana, sender);
    });

    it("removes froms clowns and moves balances to DAO", async () => {
      await circusDAO.connect(sender).leaveCircus();

      expect(await circusDAO.clownsCount()).to.be.eq(0);
      expect(await circusCoin.balanceOf(circusDAO.address)).to.be.eq(
        1_000_000_000_00000
      );
      expect(await banana.balanceOf(circusDAO.address)).to.be.eq(2);
    });
  });
});
