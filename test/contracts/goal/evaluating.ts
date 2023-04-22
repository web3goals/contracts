import { expect } from "chai";
import { BigNumber } from "ethers";
import { ERRORS } from "../../helpers/errors";
import { EVENTS } from "../../helpers/events";
import {
  createProfiles,
  goalContract,
  goalMessageExtraDataUris,
  goalParams,
  makeSuiteCleanRoom,
  userOne,
  userThree,
  userThreeAddress,
  userTwo,
  userTwoAddress,
} from "../../setup";

makeSuiteCleanRoom("Goal Evaluating for Messages", function () {
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
    // Post messages
    await goalContract
      .connect(userOne)
      .postMessage(goal, goalMessageExtraDataUris.one);
    await goalContract
      .connect(userTwo)
      .postMessage(goal, goalMessageExtraDataUris.two);
    await goalContract
      .connect(userThree)
      .postMessage(goal, goalMessageExtraDataUris.three);
  });

  it("Goal author should be able evaluate messages posted by not goal author", async function () {
    // Evaluate
    await expect(
      goalContract.connect(userOne).evaluateMessage(goal, 1, true, false)
    ).to.emit(goalContract, EVENTS.messageEvaluated);
    await expect(
      goalContract.connect(userOne).evaluateMessage(goal, 2, false, true)
    ).to.emit(goalContract, EVENTS.messageEvaluated);
    // Check messages
    const messages = await goalContract.getMessages(goal);
    expect(messages[1].isMotivating).to.equal(true);
    expect(messages[1].isSuperMotivating).to.equal(false);
    expect(messages[2].isMotivating).to.equal(false);
    expect(messages[2].isSuperMotivating).to.equal(true);
    // Check motivators
    const motivators = await goalContract.getMotivators(goal);
    expect(motivators[0].motivations).to.equal(1);
    expect(motivators[0].superMotivations).to.equal(0);
    expect(motivators[1].motivations).to.equal(0);
    expect(motivators[1].superMotivations).to.equal(1);
    // Check motivator reputations
    const motivatorOneReputation = await goalContract.getMotivatorReputation(
      userTwoAddress
    );
    expect(motivatorOneReputation[0]).to.equal(1);
    expect(motivatorOneReputation[1]).to.equal(0);
    const motivatorTwoReputation = await goalContract.getMotivatorReputation(
      userThreeAddress
    );
    expect(motivatorTwoReputation[0]).to.equal(0);
    expect(motivatorTwoReputation[1]).to.equal(1);
  });

  it("Goal author should not be able evaluate a message posted by goal author", async function () {
    await expect(
      goalContract.connect(userOne).evaluateMessage(goal, 0, true, false)
    ).to.be.revertedWithCustomError(
      goalContract,
      ERRORS.authorCannotEvaluateOwnMessage
    );
  });

  it("Not goal author should not be able evaluate a message", async function () {
    await expect(
      goalContract.connect(userTwo).evaluateMessage(goal, 1, true, false)
    ).to.be.revertedWithCustomError(goalContract, ERRORS.notAuthor);
  });

  it("Goal author should not be able evaluate a not existing message", async function () {
    await expect(
      goalContract.connect(userOne).evaluateMessage(goal, 3, true, false)
    ).to.be.revertedWithCustomError(goalContract, ERRORS.messageNotExists);
  });

  it("Goal author should not be able evaluate a message posted by not goal author twice", async function () {
    await expect(
      goalContract.connect(userOne).evaluateMessage(goal, 1, true, false)
    ).to.be.not.reverted;
    await expect(
      goalContract.connect(userOne).evaluateMessage(goal, 1, true, false)
    ).to.be.revertedWithCustomError(
      goalContract,
      ERRORS.messageAlreadyEvaluated
    );
  });
});
