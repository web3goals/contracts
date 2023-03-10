import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { SECONDS_PER_DAY } from "../../helpers/constants";
import {
  createProfiles,
  goalContract,
  goalParams,
  goalMotivatorExtraDataUris,
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
  let goalVerifiedWithMotivators: BigNumber;

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
    // Set and verify goal, add and accept motivators by user one
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
    goalVerifiedWithMotivators = await goalContract
      .connect(userOne)
      .getCurrentCounter();
    await goalContract
      .connect(userOne)
      .addVerificationDataAndVerify(
        goalVerifiedWithMotivators,
        goalParams.one.additionalVerificationDataKeys,
        goalParams.one.additionalVerificationDataValues
      );
    await goalContract
      .connect(userTwo)
      .becomeMotivator(
        goalVerifiedWithMotivators,
        goalMotivatorExtraDataUris.two
      );
    await goalContract
      .connect(userThree)
      .becomeMotivator(
        goalVerifiedWithMotivators,
        goalMotivatorExtraDataUris.three
      );
    await goalContract
      .connect(userFour)
      .becomeMotivator(
        goalVerifiedWithMotivators,
        goalMotivatorExtraDataUris.four
      );
    await goalContract
      .connect(userOne)
      .acceptMotivator(goalVerifiedWithMotivators, userTwoAddress);
    await goalContract
      .connect(userOne)
      .acceptMotivator(goalVerifiedWithMotivators, userFourAddress);
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

  it("Goal author should be able to close a goal verified as achieved with motivator before deadline and return stake", async function () {
    // Close goal
    await expect(
      goalContract.connect(userOne).close(goalVerifiedWithMotivators)
    ).to.changeEtherBalances(
      [userOne, goalContract.address],
      [
        goalParams.one.stake,
        goalParams.one.stake.mul(ethers.constants.NegativeOne),
      ]
    );
    // Check goal params
    const params = await goalContract.getParams(goalVerifiedWithMotivators);
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

  it("Not goal author should be able to close a goal with motivator after deadline and stake should be send to keeper and accepted motivators", async function () {
    // Increase network time
    await time.increase(3 * SECONDS_PER_DAY);
    // Close goal
    await expect(
      goalContract.connect(userTwo).close(goalVerifiedWithMotivators)
    ).to.changeEtherBalances(
      [userTwo, userFour, keeperContract.address, goalContract.address],
      [
        goalParams.one.stakeForMotivators.div(BigNumber.from("2")),
        goalParams.one.stakeForMotivators.div(BigNumber.from("2")),
        goalParams.one.stakeForKeeper,
        goalParams.one.stake.mul(ethers.constants.NegativeOne),
      ]
    );
    // Check goal params
    const params = await goalContract.getParams(goalVerifiedWithMotivators);
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
