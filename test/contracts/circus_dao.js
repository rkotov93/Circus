const CircusDao = artifacts.require("CircusDao");

contract("CircusDao", (accounts) => {
  let deployer = accounts[0];
  let circusDao;

  async function addClown(clownAddress) {
    await circusDao.nominateClown(clownAddress);
    await circusDao.approveClown(clownAddress);
    await circusDao.joinCircus({ from: clownAddress });
  }

  beforeEach(async () => {
    circusDao = await CircusDao.new({ from: deployer });
  });

  describe("#nominateClown", () => {
    let clownToBeNominated = accounts[1];

    it("creates ClownNomination", async () => {
      await circusDao.nominateClown(clownToBeNominated);

      const nomination = await circusDao.clownNominations(clownToBeNominated);
      assert.equal(nomination.nominated, true);
    });

    context("when clowns is already a part of Circus", () => {
      it("raises an error", async () => {
        try {
          await circusDao.nominateClown(accounts[0]);
          assert.ok(false);
        } catch (error) {
          assert.equal(error.reason, "This clown is aldready a part of Circus");
        }
      });
    });

    context("when called not by clown", () => {
      it("raises an error", async () => {
        try {
          await circusDao.nominateClown(clownToBeNominated, {
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
        await circusDao.nominateClown(clownToBeNominated);
      });

      it("raises an error", async () => {
        try {
          await circusDao.nominateClown(clownToBeNominated);
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
          await circusDao.approveClown(nominatedClown, { from: accounts[1] });
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
          await circusDao.approveClown(nominatedClown);
          assert.ok(false);
        } catch (error) {
          assert.equal(error.reason, "Clown has to be nominated before");
        }
      });
    });

    context("with nomiated clown", () => {
      beforeEach(async () => {
        await circusDao.nominateClown(nominatedClown);
      });

      context("when clown was already approved by this clown", () => {
        beforeEach(async () => {
          circusDao.approveClown(nominatedClown);
        });

        it("raises an error", async () => {
          try {
            await circusDao.approveClown(nominatedClown);
            assert.ok(false);
          } catch (error) {
            assert.equal(error.reason, "You have already approved this clown!");
          }
        });
      });

      it("approves the clown", async () => {
        await circusDao.approveClown(nominatedClown);
        const nomination = await circusDao.clownNominations(nominatedClown);
        assert.equal(nomination.approvalsCount, 1);
        assert.equal(
          await circusDao.isNominationApprovedByMe(nominatedClown),
          true
        );
      });
    });
  });

  describe("#joinCircus", () => {
    context("when clown is already a part of Circus", () => {
      it("raises an error", async () => {
        try {
          await circusDao.joinCircus();
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
          await circusDao.joinCircus({ from: notNominatedClown });
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

        await circusDao.nominateClown(nominatedClown);
        await circusDao.approveClown(nominatedClown);
      });

      it("raises an error", async () => {
        try {
          await circusDao.joinCircus({ from: nominatedClown });
        } catch (error) {
          assert.equal(error.reason, "You were not approved by all clowns yet");
        }
      });
    });

    context("when all conditions are satisfied", () => {
      const nominatedClown = accounts[1];

      beforeEach(async () => {
        await circusDao.nominateClown(nominatedClown);
        await circusDao.approveClown(nominatedClown);
      });

      it("adds nominated clown to clowns", async () => {
        await circusDao.joinCircus({ from: nominatedClown });

        const nomination = await circusDao.clownNominations(nominatedClown);
        assert.equal(nomination.completed, true);

        assert.equal(await circusDao.clownsCount(), 2);
        assert.equal(await circusDao.clowns(nominatedClown), true);
      });
    });
  });
});
