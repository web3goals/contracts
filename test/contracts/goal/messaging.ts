import { expect } from "chai";
import { BigNumber } from "ethers";
import { EVENTS } from "../../helpers/events";
import {
  createProfiles,
  goalContract,
  goalMessageExtraDataUris,
  goalParams,
  makeSuiteCleanRoom,
  userOne,
  userOneAddress,
  userThree,
  userThreeAddress,
  userTwo,
  userTwoAddress,
} from "../../setup";

makeSuiteCleanRoom("Goal Messaging", function () {
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

  it("Goal author must successfully post a message", async function () {
    // Post message
    await expect(
      goalContract
        .connect(userOne)
        .postMessage(goal, goalMessageExtraDataUris.one)
    ).to.emit(goalContract, EVENTS.messagePosted);
    // Check messages
    const messages = await goalContract.getMessages(goal);
    expect(messages.length).to.equal(1);
    expect(messages[0].authorAddress).to.equal(userOneAddress);
    expect(messages[0].extraDataURI).to.equal(goalMessageExtraDataUris.one);
    // Check motivators
    const motivators = await goalContract.getMotivators(goal);
    expect(motivators.length).to.equal(0);
  });

  it("Not goal authors must successfully post a message", async function () {
    // Post messages
    await expect(
      goalContract
        .connect(userTwo)
        .postMessage(goal, goalMessageExtraDataUris.two)
    ).to.emit(goalContract, EVENTS.messagePosted);
    await expect(
      goalContract
        .connect(userThree)
        .postMessage(goal, goalMessageExtraDataUris.three)
    ).to.emit(goalContract, EVENTS.messagePosted);
    // Check messages
    const messages = await goalContract.getMessages(goal);
    expect(messages.length).to.equal(2);
    expect(messages[0].authorAddress).to.equal(userTwoAddress);
    expect(messages[0].extraDataURI).to.equal(goalMessageExtraDataUris.two);
    expect(messages[1].authorAddress).to.equal(userThreeAddress);
    expect(messages[1].extraDataURI).to.equal(goalMessageExtraDataUris.three);
    // Check motivators
    const motivators = await goalContract.getMotivators(goal);
    expect(motivators.length).to.equal(2);
    expect(motivators[0].accountAddress).to.equal(userTwoAddress);
    expect(motivators[1].accountAddress).to.equal(userThreeAddress);
  });
});
