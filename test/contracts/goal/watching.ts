import { expect } from "chai";
import { BigNumber } from "ethers";
import {
  createProfiles,
  goalContract,
  goalParams,
  goalWatcherExtraDataUris,
  makeSuiteCleanRoom,
  userOne,
  userThree,
  userThreeAddress,
  userTwo,
  userTwoAddress,
} from "../../setup";

makeSuiteCleanRoom("Goal Watching", function () {
  let goal: BigNumber;

  beforeEach(async function () {
    // Create profiles
    await createProfiles();
    // Set goal by user one
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
  });

  it("Not goal author and not watcher should be able to watch a goal", async function () {
    // Watch goal by users two, three
    await expect(
      goalContract.connect(userTwo).watch(goal, goalWatcherExtraDataUris.one)
    ).to.be.not.reverted;
    await expect(
      goalContract.connect(userThree).watch(goal, goalWatcherExtraDataUris.one)
    ).to.be.not.reverted;
    // Check goal watchers
    const watchers = await goalContract.getWatchers(goal);
    expect(watchers.length).to.be.equal(2);
    expect(watchers[0].accountAddress).to.be.equal(userTwoAddress);
    expect(watchers[1].accountAddress).to.be.equal(userThreeAddress);
  });

  it("Goal author should not be able to watch a goal", async function () {
    await expect(
      goalContract.connect(userOne).watch(goal, goalWatcherExtraDataUris.one)
    ).to.be.reverted;
  });

  it("Goal watcher should not be able to watch a goal", async function () {
    // First attempt to watch a goal by user two
    await expect(
      goalContract.connect(userTwo).watch(goal, goalWatcherExtraDataUris.one)
    ).to.be.not.reverted;
    // Second attempt to watch a goal by user two
    await expect(
      goalContract.connect(userTwo).watch(goal, goalWatcherExtraDataUris.one)
    ).to.be.reverted;
  });
});
