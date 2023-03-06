import { expect } from "chai";
import {
  createProfiles,
  goalContract,
  goalParams,
  makeSuiteCleanRoom,
  userOne,
} from "../../setup";

makeSuiteCleanRoom("Goal Verifying", function () {
  beforeEach(async function () {
    await createProfiles();
  });

  it("User should be able to set a goal and verify it with any proof uri", async function () {
    // Set goal
    await expect(
      goalContract
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
        )
    ).to.be.not.reverted;
    // Get goal id
    const goalId = await goalContract.connect(userOne).getCurrentCounter();
    // Verify goal
    await expect(
      goalContract
        .connect(userOne)
        .addVerificationDataAndVerify(
          goalId,
          goalParams.one.additionalVerificationDataKeys,
          goalParams.one.additionalVerificationDataValues
        )
    ).to.be.not.reverted;
    // Check goal verification status
    const verificationStatus = await goalContract.getVerificationStatus(goalId);
    expect(verificationStatus.isAchieved).to.equal(true);
    expect(verificationStatus.isFailed).to.equal(false);
  });
});
