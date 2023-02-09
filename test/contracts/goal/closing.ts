import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { SECONDS_PER_DAY } from "../../helpers/constants";
import {
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

makeSuiteCleanRoom("Goal Closing", function () {
  it("Goal author should be able to close a goal as achieved and return stake", async function () {
    // Set goal
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
    // Close goal
    await expect(
      goalContract
        .connect(userOne)
        .closeAsAchieved(setGoalId, goalParams.one.proofUri)
    ).to.changeEtherBalances(
      [userOne, goalContract.address],
      [
        goalParams.one.stake,
        goalParams.one.stake.mul(ethers.constants.NegativeOne),
      ]
    );
    // Check goal params
    const params = await goalContract.getParams(setGoalId);
    expect(params.isClosed).to.equal(true);
    expect(params.isAchieved).to.equal(true);
    expect(params.proofURI).to.equal(goalParams.one.proofUri);
  });

  it("Goal author should be able to close a goal as failed and not return stake", async function () {
    // Set goal
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
    // Close goal
    await expect(
      goalContract.connect(userOne).closeAsFailed(setGoalId)
    ).to.changeEtherBalances(
      [userOne, goalContract.address],
      [ethers.constants.Zero, ethers.constants.Zero]
    );
    // Check goal params
    const params = await goalContract.getParams(setGoalId);
    expect(params.isClosed).to.equal(true);
    expect(params.isAchieved).to.equal(false);
  });

  it("Accepted goal watcher should be able to close a goal as failed and receive a part of stake", async function () {
    // Set goal by user onw
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
    // Accept all watchers by user one
    await expect(
      goalContract.connect(userOne).acceptWatcher(setGoalId, userTwoAddress)
    ).to.be.not.reverted;
    await expect(
      goalContract.connect(userOne).acceptWatcher(setGoalId, userThreeAddress)
    ).to.be.not.reverted;
    // Increase network time
    await time.increase(3 * SECONDS_PER_DAY);
    // Close goal by user two
    await expect(
      goalContract.connect(userTwo).closeAsFailed(setGoalId)
    ).to.changeEtherBalances(
      [userTwo, userThree, goalContract.address],
      [
        goalParams.one.stake.div(BigNumber.from("2")),
        goalParams.one.stake.div(BigNumber.from("2")),
        goalParams.one.stake.mul(ethers.constants.NegativeOne),
      ]
    );
    // Check goal params
    const params = await goalContract.getParams(setGoalId);
    expect(params.isClosed).to.equal(true);
    expect(params.isAchieved).to.equal(false);
  });
});
