import { expect } from "chai";
import { BigNumber } from "ethers";
import {
  createProfiles,
  goalContract,
  goalParams,
  goalWatcherExtraDataUris,
  makeSuiteCleanRoom,
  userFour,
  userFourAddress,
  userOne,
  userThree,
  userThreeAddress,
  userTwo,
  userTwoAddress,
} from "../../setup";

makeSuiteCleanRoom("Goal Accepting Watchers", function () {
  let goal: BigNumber;

  beforeEach(async function () {
    // Create profiles
    await createProfiles();
    // Set goal and add watchers by user one
    await goalContract
      .connect(userOne)
      .set(
        goalParams.one.description,
        goalParams.one.stake,
        goalParams.one.deadlineTimestamp,
        goalParams.one.verificationRequirement,
        goalParams.one.verificationDataKeys,
        goalParams.one.verificationDataValues,
        {
          value: goalParams.one.stake,
        }
      );
    goal = await goalContract.connect(userOne).getCurrentCounter();
    await goalContract
      .connect(userTwo)
      .watch(goal, goalWatcherExtraDataUris.two);
    await goalContract
      .connect(userThree)
      .watch(goal, goalWatcherExtraDataUris.three);
  });

  it("Goal author should be able to accept a watcher", async function () {
    // Check before
    const watchersBefore = await goalContract.getWatchers(goal);
    expect(watchersBefore[0].isAccepted).to.be.equal(false);
    expect(watchersBefore[1].isAccepted).to.be.equal(false);
    // Accept second watcher by user one
    await expect(
      goalContract.connect(userOne).acceptWatcher(goal, userThreeAddress)
    ).to.be.not.reverted;
    // Check after
    const watchersAfter = await goalContract.getWatchers(goal);
    expect(watchersAfter[0].isAccepted).to.be.equal(false);
    expect(watchersAfter[1].isAccepted).to.be.equal(true);
  });

  it("Goal author should not be able to accept a not existing watcher", async function () {
    await expect(
      goalContract.connect(userOne).acceptWatcher(goal, userFourAddress)
    ).to.be.reverted;
  });

  it("Not goal author should not be able to accept a watcher", async function () {
    await expect(
      goalContract.connect(userTwo).acceptWatcher(goal, userTwoAddress)
    ).to.be.reverted;
  });
});
