import { expect } from "chai";
import { BigNumber } from "ethers";
import {
  createProfiles,
  goalContract,
  goalParams,
  makeSuiteCleanRoom,
  userOne,
  userOneAddress,
  userTwoAddress,
} from "../../setup";

makeSuiteCleanRoom("Goal Transfering", function () {
  let goal: BigNumber;

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
    goal = await goalContract.connect(userOne).getCurrentCounter();
  });

  it("Goal token owner should fail to transfer token", async function () {
    await expect(
      goalContract
        .connect(userOne)
        .transferFrom(userOneAddress, userTwoAddress, goal)
    ).to.be.reverted;
  });
});
