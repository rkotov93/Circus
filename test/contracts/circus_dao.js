const { deployProxy } = require("@openzeppelin/truffle-upgrades");

const CircusDAO = artifacts.require("CircusDAO");
const CircusCoin = artifacts.require("CircusCoin");

contract("CircusDAO", (accounts) => {
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

    await circusCoin.initialize(circusDAO.address, 1_000_000_000_00000);
    await circusDAO.initialize(circusCoin.address);
  });

  it("adds first clown and transfers 1000 circus coins to him", async () => {
    assert.ok(await circusDAO.isClown(deployer));
    assert.equal(await circusCoin.balanceOf(deployer), 100000000);
  });

  describe("#nominateClown", () => {
    let clownToBeNominated = accounts[1];

    it("creates ClownNomination", async () => {
      await circusDAO.nominateClown(clownToBeNominated);

      const nomination = await circusDAO.clownNominations(clownToBeNominated);
      assert.equal(nomination.nominated, true);
    });

    context("when clowns is already a part of Circus", () => {
      it("raises an error", async () => {
        try {
          await circusDAO.nominateClown(accounts[0]);
          assert.ok(false);
        } catch (error) {
          assert.equal(error.reason, "This clown is aldready a part of Circus");
        }
      });
    });

    context("when called not by clown", () => {
      it("raises an error", async () => {
        try {
          await circusDAO.nominateClown(clownToBeNominated, {
            from: accounts[1],
          });
          assert.ok(false);
        } catch (error) {
          assert.equal(
            error.reason,
            "This method can be called by one of the clowns only"
          );
        }
      });
    });

    context("when clown was already nominated", async () => {
      beforeEach(async () => {
        await circusDAO.nominateClown(clownToBeNominated);
      });

      it("raises an error", async () => {
        try {
          await circusDAO.nominateClown(clownToBeNominated);
          assert.ok(false);
        } catch (error) {
          assert.equal(error.reason, "Clown was already nominated");
        }
      });
    });
  });

  describe("#approveClown", () => {
    let nominatedClown = accounts[1];

    context("when called not by clown", () => {
      it("raises an error", async () => {
        try {
          await circusDAO.approveClown(nominatedClown, { from: accounts[1] });
          assert.ok(false);
        } catch (error) {
          assert.equal(
            error.reason,
            "This method can be called by one of the clowns only"
          );
        }
      });
    });

    context("when clown was not nominated yet", () => {
      it("raises an error", async () => {
        try {
          await circusDAO.approveClown(nominatedClown);
          assert.ok(false);
        } catch (error) {
          assert.equal(error.reason, "Clown has to be nominated before");
        }
      });
    });

    context("with nomiated clown", () => {
      beforeEach(async () => {
        await circusDAO.nominateClown(nominatedClown);
      });

      context("when clown was already approved by this clown", () => {
        beforeEach(async () => {
          circusDAO.approveClown(nominatedClown);
        });

        it("raises an error", async () => {
          try {
            await circusDAO.approveClown(nominatedClown);
            assert.ok(false);
          } catch (error) {
            assert.equal(error.reason, "You have already approved this clown!");
          }
        });
      });

      it("approves the clown", async () => {
        await circusDAO.approveClown(nominatedClown);
        const nomination = await circusDAO.clownNominations(nominatedClown);
        assert.equal(nomination.approvalsCount, 1);
        assert.equal(
          await circusDAO.isNominationApprovedByMe(nominatedClown),
          true
        );
      });
    });
  });

  describe("#joinCircus", () => {
    context("when clown is already a part of Circus", () => {
      it("raises an error", async () => {
        try {
          await circusDAO.joinCircus();
          assert.ok(false);
        } catch (error) {
          assert.equal(error.reason, "You are already a part of Circus");
        }
      });
    });

    context("when clown was not nomiated yet", () => {
      const notNominatedClown = accounts[1];

      it("raises an error", async () => {
        try {
          await circusDAO.joinCircus({ from: notNominatedClown });
          assert.ok(false);
        } catch (error) {
          assert.equal(error.reason, "You were not nominated yet");
        }
      });
    });

    context("when nomiated clown was not approved by all clowns", () => {
      const secondClown = accounts[1];
      const nominatedClown = accounts[2];

      beforeEach(async () => {
        await addClown(secondClown);

        await circusDAO.nominateClown(nominatedClown);
        await circusDAO.approveClown(nominatedClown);
      });

      it("raises an error", async () => {
        try {
          await circusDAO.joinCircus({ from: nominatedClown });
        } catch (error) {
          assert.equal(error.reason, "You were not approved by all clowns yet");
        }
      });
    });

    context("when all conditions are satisfied", () => {
      const nominatedClown = accounts[1];

      beforeEach(async () => {
        await circusDAO.nominateClown(nominatedClown);
        await circusDAO.approveClown(nominatedClown);
      });

      it("adds nominated clown to clowns", async () => {
        await circusDAO.joinCircus({ from: nominatedClown });

        const nomination = await circusDAO.clownNominations(nominatedClown);
        assert.equal(nomination.completed, true);

        assert.equal(await circusDAO.clownsCount(), 2);
        assert.equal(await circusDAO.clowns(nominatedClown), true);

        assert.equal(await circusCoin.balanceOf(nominatedClown), 100000000);
      });
    });
  });
});
