import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { SECONDS_PER_DAY } from "../../helpers/constants";
import {
  createProfiles,
  goalContract,
  goalParams,
  goalProofExtraDataUris,
  makeSuiteCleanRoom,
  treasuryContract,
  userOne,
  userOneAddress,
  userTwo,
} from "../../setup";

makeSuiteCleanRoom("Goal Closing", function () {
  let goalWithoutProofs: BigNumber;
  let goalWithProofs: BigNumber;

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
  });

  it("Goal author must successfully close a goal with proofs before deadline and return stake", async function () {
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
    expect(reputation[0]).to.equal(2);
    expect(reputation[1]).to.equal(1);
    expect(reputation[2]).to.equal(0);
  });

  it("Goal author must unsuccessfully close a goal without proofs before deadline", async function () {
    await expect(
      goalContract.connect(userOne).close(goalWithoutProofs)
    ).to.be.reverted;
  });

  it("Not goal author must unsuccessfully close a goal with proofs before deadline", async function () {
    await expect(
      goalContract.connect(userTwo).close(goalWithProofs)
    ).to.be.reverted;
  });

  it("Goal author must successfully close a goal after deadline and stake must be send to treasury", async function () {
    // Increase network time
    await time.increase(3 * SECONDS_PER_DAY);
    // Close goal
    await expect(
      goalContract.connect(userOne).close(goalWithProofs)
    ).to.changeEtherBalances(
      [userOne, treasuryContract.address, goalContract.address],
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
    expect(reputation[0]).to.equal(2);
    expect(reputation[1]).to.equal(0);
    expect(reputation[2]).to.equal(1);
  });

  it("Not goal author must successfully close a goal after deadline and stake must be send to treasury", async function () {
    // Increase network time
    await time.increase(3 * SECONDS_PER_DAY);
    // Close goal
    await expect(
      goalContract.connect(userTwo).close(goalWithProofs)
    ).to.changeEtherBalances(
      [userOne, treasuryContract.address, goalContract.address],
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
    expect(reputation[0]).to.equal(2);
    expect(reputation[1]).to.equal(0);
    expect(reputation[2]).to.equal(1);
  });
});
