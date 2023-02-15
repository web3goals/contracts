import { expect } from "chai";
import {
  goalContract,
  goalParams,
  goalWatcherExtraDataUris,
  makeSuiteCleanRoom,
  userOne,
  userThree,
  userThreeAddress,
  userTwo,
} from "../../setup";

makeSuiteCleanRoom("Goal Accepting Watchers", function () {
  it("Goal author should be able to accept a watcher", async function () {
    // Set a goal by user one
    await expect(
      goalContract
        .connect(userOne)
        .set(
          goalParams.one.uri,
          goalParams.one.stake,
          goalParams.one.deadlineTimestamp,
          goalParams.one.verificationRequirement,
          goalParams.one.verificationDataKeys,
          goalParams.one.verificationDataValues,
          {
            value: goalParams.one.stake,
          }
        )
    ).to.be.not.reverted;
    // Get set goal id
    const setGoalId = await goalContract.connect(userOne).getCurrentCounter();
    // Watch goal by user two
    await expect(
      goalContract
        .connect(userTwo)
        .watch(setGoalId, goalWatcherExtraDataUris.one)
    ).to.be.not.reverted;
    // Watch goal by user three
    await expect(
      goalContract
        .connect(userThree)
        .watch(setGoalId, goalWatcherExtraDataUris.two)
    ).to.be.not.reverted;
    // Check goal watchers before
    const watchersBefore = await goalContract.getWatchers(setGoalId);
    expect(watchersBefore[0].isAccepted).to.be.equal(false);
    expect(watchersBefore[1].isAccepted).to.be.equal(false);
    // Accept second watcher by user one
    await expect(
      goalContract.connect(userOne).acceptWatcher(setGoalId, userThreeAddress)
    ).to.be.not.reverted;
    // Check goal watchers after
    const watchersAfter = await goalContract.getWatchers(setGoalId);
    expect(watchersAfter[0].isAccepted).to.be.equal(false);
    expect(watchersAfter[1].isAccepted).to.be.equal(true);
  });
});
