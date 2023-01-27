import {
  goalContract,
  goalParams,
  makeSuiteCleanRoom,
  userOne,
  userOneAddress,
  userThree,
  userTwo,
} from "../../setup";
import { expect } from "chai";
import { ethers } from "hardhat";

makeSuiteCleanRoom("Goal Watching", function () {
  it("User should be able to watch a goal", async function () {
    // Set a goal by user one
    await expect(
      goalContract
        .connect(userOne)
        .set(
          goalParams.one.uri,
          goalParams.one.stake,
          goalParams.one.deadlineTimestamp,
          {
            value: goalParams.one.stake,
          }
        )
    ).to.be.not.reverted;
    // Get set goal id
    const setGoalId = await goalContract.connect(userOne).getCurrentCounter();
    // Watch goal by user two
    await expect(
      goalContract.connect(userTwo).watch(setGoalId)
    ).to.be.not.reverted;
    // Watch goal by user three
    await expect(
      goalContract.connect(userThree).watch(setGoalId)
    ).to.be.not.reverted;
    // Check goal watchers
    const watchers = await goalContract.getWatchers(setGoalId);
    expect(watchers.length).to.be.equal(2);
  });
});
