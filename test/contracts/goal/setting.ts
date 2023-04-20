import { expect } from "chai";
import { ethers } from "hardhat";
import {
  createProfiles,
  goalContract,
  goalParams,
  makeSuiteCleanRoom,
  userOne,
  userOneAddress,
} from "../../setup";

makeSuiteCleanRoom("Goal Setting", function () {
  it("User should be able to set a goal", async function () {
    // Create profiles
    await createProfiles();
    // Set goal
    await expect(
      goalContract
        .connect(userOne)
        .set(
          goalParams.one.description,
          goalParams.one.stake,
          goalParams.one.deadlineTimestamp,
          goalParams.one.extraDataUri,
          {
            value: goalParams.one.stake,
          }
        )
    ).to.changeEtherBalances(
      [userOne, goalContract.address],
      [
        goalParams.one.stake.mul(ethers.constants.NegativeOne),
        goalParams.one.stake,
      ]
    );
    // Get goal id
    const goalId = await goalContract.connect(userOne).getCurrentCounter();
    // Check goal params
    const params = await goalContract.getParams(goalId);
    expect(params.description).to.equal(goalParams.one.description);
    expect(params.authorAddress).to.equal(userOneAddress);
    expect(params.authorStake).to.equal(goalParams.one.stake);
    expect(params.deadlineTimestamp).to.equal(goalParams.one.deadlineTimestamp);
    expect(params.isClosed).to.equal(false);
    expect(params.isAchieved).to.equal(false);
  });

  it("User should not be able to set a goal without profile", async function () {
    // Set goal
    await expect(
      goalContract
        .connect(userOne)
        .set(
          goalParams.one.description,
          goalParams.one.stake,
          goalParams.one.deadlineTimestamp,
          goalParams.one.extraDataUri
        )
    ).to.be.reverted;
  });
});
