import { expect } from "chai";
import { BigNumber } from "ethers";
import { ERRORS } from "../../helpers/errors";
import { EVENTS } from "../../helpers/events";
import {
  createProfiles,
  goalContract,
  goalMessageExtraDataUris,
  goalMotivatorExtraDataUris,
  goalParams,
  makeSuiteCleanRoom,
  userOne,
  userThree,
  userTwo,
  userTwoAddress,
} from "../../setup";

makeSuiteCleanRoom("Goal Accepting Motivator", function () {
  let goal: BigNumber;

  beforeEach(async function () {
    // Create profiles
    await createProfiles();
    // Set goal, add and accept motivators by user one
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
    await goalContract
      .connect(userTwo)
      .becomeMotivator(goal, goalMotivatorExtraDataUris.two);
    await goalContract
      .connect(userThree)
      .becomeMotivator(goal, goalMotivatorExtraDataUris.three);
    await goalContract.connect(userOne).acceptMotivator(goal, userTwoAddress);
  });

  it("Goal author should be able to post a message", async function () {
    await expect(
      goalContract
        .connect(userOne)
        .postMessage(goal, goalMessageExtraDataUris.one)
    ).to.emit(goalContract, EVENTS.messagePosted);
  });

  it("Accepted motivator should be able to post a message", async function () {
    await expect(
      goalContract
        .connect(userTwo)
        .postMessage(goal, goalMessageExtraDataUris.two)
    ).to.emit(goalContract, EVENTS.messagePosted);
  });

  it("Not accepted motivator should not be able to post a message", async function () {
    await expect(
      goalContract
        .connect(userThree)
        .postMessage(goal, goalMessageExtraDataUris.three)
    ).to.be.revertedWithCustomError(
      goalContract,
      ERRORS.notAuthorNotAcceptedMotivator
    );
  });
});
