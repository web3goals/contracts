import { expect } from "chai";
import { ethers } from "hardhat";
import {
  goalContract,
  goalParams,
  makeSuiteCleanRoom,
  profileContract,
  profileUris,
  userOne,
  userOneAddress,
} from "../../setup";

makeSuiteCleanRoom("Goal Setting", function () {
  beforeEach(async function () {
    await profileContract.connect(userOne).setURI(profileUris.one);
  });

  it("User should be able to set a goal", async function () {
    // Set goal
    const tx = goalContract
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
    await expect(tx).to.be.not.reverted;
    await expect(tx).to.changeEtherBalances(
      [userOne, goalContract.address],
      [
        goalParams.one.stake.mul(ethers.constants.NegativeOne),
        goalParams.one.stake,
      ]
    );
    // Get set goal id
    const setGoalId = await goalContract.connect(userOne).getCurrentCounter();
    // Check goal params
    const params = await goalContract.getParams(setGoalId);
    expect(params.authorAddress).to.equal(userOneAddress);
    expect(params.authorStake).to.equal(goalParams.one.stake);
    expect(params.deadlineTimestamp).to.equal(goalParams.one.deadlineTimestamp);
  });
});
