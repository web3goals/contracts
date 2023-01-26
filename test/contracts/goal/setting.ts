import {
  goalContract,
  goalParams,
  makeSuiteCleanRoom,
  userOne,
  userOneAddress,
} from "../../setup";
import { expect } from "chai";
import { ethers } from "hardhat";

makeSuiteCleanRoom("Goal Setting", function () {
  it("User should be able to set a goal", async function () {
    // Set goal
    const tx = goalContract
      .connect(userOne)
      .set(
        goalParams.one.uri,
        goalParams.one.fee,
        goalParams.one.deadlineTimestamp,
        {
          value: goalParams.one.fee,
        }
      );
    await expect(tx).to.be.not.reverted;
    await expect(tx).to.changeEtherBalances(
      [userOne, goalContract.address],
      [goalParams.one.fee.mul(ethers.constants.NegativeOne), goalParams.one.fee]
    );
    // Get set goal id
    const setGoalId = await goalContract.connect(userOne).getCurrentCounter();
    // Check goal params
    const params = await goalContract.getParams(setGoalId);
    expect(params.authorAddress).to.equal(userOneAddress);
    expect(params.authorFee).to.equal(goalParams.one.fee);
    expect(params.deadlineTimestamp).to.equal(goalParams.one.deadlineTimestamp);
  });
});
