const CircusCoin = artifacts.require("CircusCoin");

contract("CircusCoin", (accounts) => {
  let initialClown = accounts[0];
  let contract;

  async function addClown(clownAddress) {
    await contract.nominateClown(clownAddress);
    await contract.approveClown(clownAddress);
    await contract.joinCircus({ from: clownAddress });
  }

  beforeEach(async () => {
    contract = await CircusCoin.new(1000000000 * Math.pow(10, 5), {
      from: initialClown,
    });
  });

  describe("#nominateClown", () => {
    let clownToBeNominated = accounts[1];

    it("creates ClownNomination", async () => {
      await contract.nominateClown(clownToBeNominated);

      const nomination = await contract.clownNominations(clownToBeNominated);
      assert.equal(nomination.nominated, true);
    });

    context("when clowns is already a part of Circus", () => {
      it("raises an error", async () => {
        try {
          await contract.nominateClown(accounts[0]);
          assert.ok(false);
        } catch (error) {
          assert.equal(error.reason, "This clown is aldready a part of Circus");
        }
      });
    });

    context("when called not by clown", () => {
      it("raises an error", async () => {
        try {
          await contract.nominateClown(clownToBeNominated, {
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
        await contract.nominateClown(clownToBeNominated);
      });

      it("raises an error", async () => {
        try {
          await contract.nominateClown(clownToBeNominated);
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
          await contract.approveClown(nominatedClown, { from: accounts[1] });
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
          await contract.approveClown(nominatedClown);
          assert.ok(false);
        } catch (error) {
          assert.equal(error.reason, "Clown has to be nominated before");
        }
      });
    });

    context("with nomiated clown", () => {
      beforeEach(async () => {
        await contract.nominateClown(nominatedClown);
      });

      context("when clown was already approved by this clown", () => {
        beforeEach(async () => {
          contract.approveClown(nominatedClown);
        });

        it("raises an error", async () => {
          try {
            await contract.approveClown(nominatedClown);
            assert.ok(false);
          } catch (error) {
            assert.equal(error.reason, "You have already approved this clown!");
          }
        });
      });

      it("approves the clown", async () => {
        await contract.approveClown(nominatedClown);
        const nomination = await contract.clownNominations(nominatedClown);
        assert.equal(nomination.approvalsCount, 1);
        assert.equal(
          await contract.isNominationApprovedByMe(nominatedClown),
          true
        );
      });
    });
  });

  describe("#joinCircus", () => {
    context("when clown is already a part of Circus", () => {
      it("raises an error", async () => {
        try {
          await contract.joinCircus();
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
          await contract.joinCircus({ from: notNominatedClown });
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

        await contract.nominateClown(nominatedClown);
        await contract.approveClown(nominatedClown);
      });

      it("raises an error", async () => {
        try {
          await contract.joinCircus({ from: nominatedClown });
        } catch (error) {
          assert.equal(error.reason, "You were not approved by all clowns yet");
        }
      });
    });

    context("when all conditions are satisfied", () => {
      const nominatedClown = accounts[1];

      beforeEach(async () => {
        await contract.nominateClown(nominatedClown);
        await contract.approveClown(nominatedClown);
      });

      it("adds nominated clown to clowns", async () => {
        await contract.joinCircus({ from: nominatedClown });

        const nomination = await contract.clownNominations(nominatedClown);
        assert.equal(nomination.completed, true);

        assert.equal(await contract.clownsCount(), 2);
        assert.equal(await contract.clowns(nominatedClown), true);
      });
    });
  });

  describe("#transfer", () => {
    const recipient = accounts[1];

    context("when recipient is a clown", () => {
      beforeEach(async () => {
        await addClown(recipient);
      });

      it("transfers money", async () => {
        await contract.transfer(recipient, 100);
        const balance = await contract.balanceOf(recipient);

        assert.equal(balance, 100);
      });
    });

    context("when recipient is not a clown", () => {
      it("transfers money", async () => {
        try {
          await contract.transfer(recipient, 100);
          assert.ok(false);
        } catch (error) {
          assert.equal(error.reason, "Circus Coins can belong to clowns only");

          const balance = await contract.balanceOf(recipient);
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
      await contract.approve(spender, 100);
    });

    context("when recipient is a clown", () => {
      beforeEach(async () => {
        await addClown(recipient);
      });

      it("transfers money", async () => {
        await contract.transferFrom(sender, recipient, 100, {
          from: spender,
        });
        const balance = await contract.balanceOf(recipient);

        assert.equal(balance, 100);
      });
    });

    context("when recipient is not a clown", () => {
      it("transfers money", async () => {
        try {
          await contract.transferFrom(sender, recipient, 100, {
            from: spender,
          });
          assert.ok(false);
        } catch (error) {
          assert.equal(error.reason, "Circus Coins can belong to clowns only");

          const balance = await contract.balanceOf(recipient);
          assert.equal(balance, 0);
        }
      });
    });
  });
});
