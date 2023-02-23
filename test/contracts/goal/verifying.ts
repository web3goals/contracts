import { expect } from "chai";
import {
  goalContract,
  goalParams,
  makeSuiteCleanRoom,
  userOne,
} from "../../setup";

makeSuiteCleanRoom("Goal Verifying", function () {
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
    // Get set goal id
    const setGoalId = await goalContract.connect(userOne).getCurrentCounter();
    // Verify goal
    await expect(
      goalContract
        .connect(userOne)
        .addVerificationDataAndVerify(
          setGoalId,
          goalParams.one.additionalVerificationDataKeys,
          goalParams.one.additionalVerificationDataValues
        )
    ).to.be.not.reverted;
    // Check goal verification status
    const verificationStatus = await goalContract.getVerificationStatus(
      setGoalId
    );
    expect(verificationStatus.isAchieved).to.equal(true);
    expect(verificationStatus.isFailed).to.equal(true);
  });
});
