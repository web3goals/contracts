import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { SECONDS_PER_DAY } from "../../helpers/constants";
import {
  createProfiles,
  goalContract,
  goalMessageExtraDataUris,
  goalParams,
  goalProofExtraDataUris,
  keeperContract,
  makeSuiteCleanRoom,
  userFour,
  userOne,
  userOneAddress,
  userThree,
  userTwo,
} from "../../setup";

makeSuiteCleanRoom("Goal Closing", function () {
  let goalWithoutProofs: BigNumber;
  let goalWithProofs: BigNumber;
  let goalWithProofsAndMotivators: BigNumber;

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
        goalParams.one.extraDataUri,
        {
          value: goalParams.one.stake,
        }
      );
    goalWithoutProofs = await goalContract.connect(userOne).getCurrentCounter();
    // Set goal and post proof by user one
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
    goalWithProofs = await goalContract.connect(userOne).getCurrentCounter();
    await goalContract
      .connect(userOne)
      .postProof(goalWithProofs, goalProofExtraDataUris.one);
    // Set goal, post proof, add messages from motivators and evaluate them by user one
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
    goalWithProofsAndMotivators = await goalContract
      .connect(userOne)
      .getCurrentCounter();
    await goalContract
      .connect(userOne)
      .postProof(goalWithProofsAndMotivators, goalProofExtraDataUris.one);
    await goalContract
      .connect(userTwo)
      .postMessage(goalWithProofsAndMotivators, goalMessageExtraDataUris.two);
    await goalContract
      .connect(userThree)
      .postMessage(goalWithProofsAndMotivators, goalMessageExtraDataUris.three);
    await goalContract
      .connect(userFour)
      .postMessage(goalWithProofsAndMotivators, goalMessageExtraDataUris.four);
    await goalContract
      .connect(userOne)
      .evaluateMessage(goalWithProofsAndMotivators, 0, true, false);
    await goalContract
      .connect(userOne)
      .evaluateMessage(goalWithProofsAndMotivators, 2, false, true);
  });

  it("Goal author should be able to close a goal with proofs before deadline and return stake", async function () {
    // Close goal
    await expect(
      goalContract.connect(userOne).close(goalWithProofs)
    ).to.changeEtherBalances(
      [userOne, goalContract.address],
      [
        goalParams.one.stake,
        goalParams.one.stake.mul(ethers.constants.NegativeOne),
      ]
    );
    // Check goal params
    const params = await goalContract.getParams(goalWithProofs);
    expect(params.isClosed).to.equal(true);
    expect(params.isAchieved).to.equal(true);
    // Check reputation
    const reputation = await goalContract.getReputation(userOneAddress);
    expect(reputation[0]).to.equal(3);
    expect(reputation[1]).to.equal(1);
    expect(reputation[2]).to.equal(0);
  });

  it("Goal author should be able to close a goal with proofs and motivators before deadline and return stake", async function () {
    // Close goal
    await expect(
      goalContract.connect(userOne).close(goalWithProofsAndMotivators)
    ).to.changeEtherBalances(
      [userOne, goalContract.address],
      [
        goalParams.one.stake,
        goalParams.one.stake.mul(ethers.constants.NegativeOne),
      ]
    );
    // Check goal params
    const params = await goalContract.getParams(goalWithProofsAndMotivators);
    expect(params.isClosed).to.equal(true);
    expect(params.isAchieved).to.equal(true);
    // Check reputation
    const reputation = await goalContract.getReputation(userOneAddress);
    expect(reputation[0]).to.equal(3);
    expect(reputation[1]).to.equal(1);
    expect(reputation[2]).to.equal(0);
  });

  it("Goal author should not be able to close a goal without proofs before deadline", async function () {
    await expect(
      goalContract.connect(userOne).close(goalWithoutProofs)
    ).to.be.reverted;
  });

  it("Not goal author should not be able to close a goal with proofs before deadline", async function () {
    await expect(
      goalContract.connect(userTwo).close(goalWithProofs)
    ).to.be.reverted;
  });

  it("Not goal author should be able to close a goal after deadline and stake should be send to keeper", async function () {
    // Increase network time
    await time.increase(3 * SECONDS_PER_DAY);
    // Close goal
    await expect(
      goalContract.connect(userTwo).close(goalWithProofs)
    ).to.changeEtherBalances(
      [userOne, keeperContract.address, goalContract.address],
      [
        ethers.constants.Zero,
        goalParams.one.stake,
        goalParams.one.stake.mul(ethers.constants.NegativeOne),
      ]
    );
    // Check goal params
    const params = await goalContract.getParams(goalWithProofs);
    expect(params.isClosed).to.equal(true);
    expect(params.isAchieved).to.equal(false);
    // Check reputation
    const reputation = await goalContract.getReputation(userOneAddress);
    expect(reputation[0]).to.equal(3);
    expect(reputation[1]).to.equal(0);
    expect(reputation[2]).to.equal(1);
  });

  it("Not goal author should be able to close a goal with motivators after deadline and stake should be send to keeper and motivators", async function () {
    // Increase network time
    await time.increase(3 * SECONDS_PER_DAY);
    // Close goal
    await expect(
      goalContract.connect(userTwo).close(goalWithProofsAndMotivators)
    ).to.changeEtherBalances(
      [
        userTwo,
        userThree,
        userFour,
        keeperContract.address,
        goalContract.address,
      ],
      [
        goalParams.one.stakeForMotivators.div(BigNumber.from("4")),
        ethers.constants.Zero,
        goalParams.one.stakeForMotivators
          .div(BigNumber.from("4"))
          .mul(BigNumber.from("3")),
        goalParams.one.stakeForKeeper,
        goalParams.one.stake.mul(ethers.constants.NegativeOne),
      ]
    );
    // Check goal params
    const params = await goalContract.getParams(goalWithProofsAndMotivators);
    expect(params.isClosed).to.equal(true);
    expect(params.isAchieved).to.equal(false);
    // Check reputation
    const reputation = await goalContract.getReputation(userOneAddress);
    expect(reputation[0]).to.equal(3);
    expect(reputation[1]).to.equal(0);
    expect(reputation[2]).to.equal(1);
  });
});
