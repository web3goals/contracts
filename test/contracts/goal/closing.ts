import { expect } from "chai";
import { ethers } from "hardhat";
import {
  goalContract,
  goalParams,
  makeSuiteCleanRoom,
  userOne,
} from "../../setup";

makeSuiteCleanRoom("Goal Closing", function () {
  it("User should be able to close a goal as achieved and return stake", async function () {
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
});
