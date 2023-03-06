import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { SECONDS_PER_DAY } from "../../helpers/constants";
import {
  createProfiles,
  goalContract,
  goalParams,
  goalWatcherExtraDataUris,
  keeperContract,
  makeSuiteCleanRoom,
  userFour,
  userFourAddress,
  userOne,
  userOneAddress,
  userThree,
  userTwo,
  userTwoAddress,
} from "../../setup";

makeSuiteCleanRoom("Goal Closing", function () {
  let goalNotVerified: BigNumber;
  let goalVerified: BigNumber;
  let goalVerifiedWithWatchers: BigNumber;

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
    goalNotVerified = await goalContract.connect(userOne).getCurrentCounter();
    // Set and verify goal by user one
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
    goalVerified = await goalContract.connect(userOne).getCurrentCounter();
    await goalContract
      .connect(userOne)
      .addVerificationDataAndVerify(
        goalVerified,
        goalParams.one.additionalVerificationDataKeys,
        goalParams.one.additionalVerificationDataValues
      );
    // Set and verify goal, add and accept watchers by user one
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
    goalVerifiedWithWatchers = await goalContract
      .connect(userOne)
      .getCurrentCounter();
    await goalContract
      .connect(userOne)
      .addVerificationDataAndVerify(
        goalVerifiedWithWatchers,
        goalParams.one.additionalVerificationDataKeys,
        goalParams.one.additionalVerificationDataValues
      );
    await goalContract
      .connect(userTwo)
      .watch(goalVerifiedWithWatchers, goalWatcherExtraDataUris.two);
    await goalContract
      .connect(userThree)
      .watch(goalVerifiedWithWatchers, goalWatcherExtraDataUris.three);
    await goalContract
      .connect(userFour)
      .watch(goalVerifiedWithWatchers, goalWatcherExtraDataUris.four);
    await goalContract
      .connect(userOne)
      .acceptWatcher(goalVerifiedWithWatchers, userTwoAddress);
    await goalContract
      .connect(userOne)
      .acceptWatcher(goalVerifiedWithWatchers, userFourAddress);
  });

  it("Goal author should be able to close a goal verified as achieved before deadline and return stake", async function () {
    // Close goal
    await expect(
      goalContract.connect(userOne).close(goalVerified)
    ).to.changeEtherBalances(
      [userOne, goalContract.address],
      [
        goalParams.one.stake,
        goalParams.one.stake.mul(ethers.constants.NegativeOne),
      ]
    );
    // Check goal params
    const params = await goalContract.getParams(goalVerified);
    expect(params.isClosed).to.equal(true);
    expect(params.isAchieved).to.equal(true);
    // Check account reputation
    expect(
      (await goalContract.getAccountReputation(userOneAddress)).achievedGoals
    ).to.equal(1);
  });

  it("Goal author should be able to close a goal verified as achieved with watchers before deadline and return stake", async function () {
    // Close goal
    await expect(
      goalContract.connect(userOne).close(goalVerifiedWithWatchers)
    ).to.changeEtherBalances(
      [userOne, goalContract.address],
      [
        goalParams.one.stake,
        goalParams.one.stake.mul(ethers.constants.NegativeOne),
      ]
    );
    // Check goal params
    const params = await goalContract.getParams(goalVerifiedWithWatchers);
    expect(params.isClosed).to.equal(true);
    expect(params.isAchieved).to.equal(true);
    // Check account reputation
    expect(
      (await goalContract.getAccountReputation(userOneAddress)).achievedGoals
    ).to.equal(1);
    expect(
      (await goalContract.getAccountReputation(userTwoAddress)).motivatedGoals
    ).to.equal(1);
    expect(
      (await goalContract.getAccountReputation(userFourAddress)).motivatedGoals
    ).to.equal(1);
  });

  it("Goal author should not be able to close a not verified goal before deadline", async function () {
    await expect(
      goalContract.connect(userOne).close(goalNotVerified)
    ).to.be.reverted;
  });

  it("Not goal author should not be able to close a goal verified as achieved before deadline", async function () {
    await expect(
      goalContract.connect(userTwo).close(goalVerified)
    ).to.be.reverted;
  });

  it("Not goal author should be able to close a goal after deadline and stake should be send to keeper", async function () {
    // Increase network time
    await time.increase(3 * SECONDS_PER_DAY);
    // Close goal
    await expect(
      goalContract.connect(userTwo).close(goalVerified)
    ).to.changeEtherBalances(
      [userOne, keeperContract.address, goalContract.address],
      [
        ethers.constants.Zero,
        goalParams.one.stake,
        goalParams.one.stake.mul(ethers.constants.NegativeOne),
      ]
    );
    // Check goal params
    const params = await goalContract.getParams(goalVerified);
    expect(params.isClosed).to.equal(true);
    expect(params.isAchieved).to.equal(false);
    // Check account reputation
    expect(
      (await goalContract.getAccountReputation(userOneAddress)).failedGoals
    ).to.equal(1);
  });

  it("Not goal author should be able to close a goal with watchers after deadline and stake should be send to keeper and accepted watchers", async function () {
    // Increase network time
    await time.increase(3 * SECONDS_PER_DAY);
    // Close goal
    await expect(
      goalContract.connect(userTwo).close(goalVerifiedWithWatchers)
    ).to.changeEtherBalances(
      [userTwo, userFour, keeperContract.address, goalContract.address],
      [
        goalParams.one.stakeForWatchers.div(BigNumber.from("2")),
        goalParams.one.stakeForWatchers.div(BigNumber.from("2")),
        goalParams.one.stakeForKeeper,
        goalParams.one.stake.mul(ethers.constants.NegativeOne),
      ]
    );
    // Check goal params
    const params = await goalContract.getParams(goalVerifiedWithWatchers);
    expect(params.isClosed).to.equal(true);
    expect(params.isAchieved).to.equal(false);
    // Check accounts reputation
    expect(
      (await goalContract.getAccountReputation(userOneAddress)).failedGoals
    ).to.equal(1);
    expect(
      (await goalContract.getAccountReputation(userTwoAddress)).motivatedGoals
    ).to.equal(0);
    expect(
      (await goalContract.getAccountReputation(userFourAddress)).motivatedGoals
    ).to.equal(0);
  });
});
