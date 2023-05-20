import { expect } from "chai";
import { BigNumber } from "ethers";
import { ERRORS } from "../../helpers/errors";
import { EVENTS } from "../../helpers/events";
import {
  createProfiles,
  goalContract,
  goalParams,
  goalProofExtraDataUris,
  makeSuiteCleanRoom,
  userOne,
  userTwo,
} from "../../setup";

makeSuiteCleanRoom("Goal Proofing", function () {
  let goal: BigNumber;

  beforeEach(async function () {
    // Create profiles
    await createProfiles();
    // Set goal
    await goalContract
      .connect(userOne)
      .set(
        goalParams.one.description,
        goalParams.one.stake,
        goalParams.one.deadlineTimestamp,
        goalParams.one.extraDataUri,
        {
          value: goalParams.one.stake,
        }
      );
    goal = await goalContract.connect(userOne).getCurrentCounter();
  });

  it("Goal author must successfully post a proof", async function () {
    // Post proof
    await expect(
      goalContract.connect(userOne).postProof(goal, goalProofExtraDataUris.one)
    ).to.emit(goalContract, EVENTS.proofPosted);
    // Check proof
    const proofs = await goalContract.getProofs(goal);
    expect(proofs.length).to.equal(1);
    expect(proofs[0].extraDataURI).to.equal(goalProofExtraDataUris.one);
  });

  it("Not goal author must unsuccessfully post a proof", async function () {
    await expect(
      goalContract.connect(userTwo).postProof(goal, goalProofExtraDataUris.one)
    ).to.be.revertedWithCustomError(goalContract, ERRORS.notAuthor);
  });
});
