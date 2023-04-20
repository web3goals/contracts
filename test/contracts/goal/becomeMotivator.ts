import { expect } from "chai";
import { BigNumber } from "ethers";
import {
  createProfiles,
  goalContract,
  goalParams,
  goalMotivatorExtraDataUris,
  makeSuiteCleanRoom,
  userOne,
  userThree,
  userThreeAddress,
  userTwo,
  userTwoAddress,
} from "../../setup";

makeSuiteCleanRoom("Goal Become Motivator", function () {
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
        goalParams.one.extraDataUri,
        {
          value: goalParams.one.stake,
        }
      );
    goal = await goalContract.connect(userOne).getCurrentCounter();
  });

  it("Not goal author and not motivator should be able to become a goal motivator", async function () {
    // Become a goal motivator by users two, three
    await expect(
      goalContract
        .connect(userTwo)
        .becomeMotivator(goal, goalMotivatorExtraDataUris.one)
    ).to.be.not.reverted;
    await expect(
      goalContract
        .connect(userThree)
        .becomeMotivator(goal, goalMotivatorExtraDataUris.one)
    ).to.be.not.reverted;
    // Check goal motivators
    const motivators = await goalContract.getMotivators(goal);
    expect(motivators.length).to.be.equal(2);
    expect(motivators[0].accountAddress).to.be.equal(userTwoAddress);
    expect(motivators[1].accountAddress).to.be.equal(userThreeAddress);
  });

  it("Goal author should not be able to become a goal motivator", async function () {
    await expect(
      goalContract
        .connect(userOne)
        .becomeMotivator(goal, goalMotivatorExtraDataUris.one)
    ).to.be.reverted;
  });

  it("Goal motivator should not be able to become a goal motivator", async function () {
    // First attempt to motivator a goal by user two
    await expect(
      goalContract
        .connect(userTwo)
        .becomeMotivator(goal, goalMotivatorExtraDataUris.one)
    ).to.be.not.reverted;
    // Second attempt to motivator a goal by user two
    await expect(
      goalContract
        .connect(userTwo)
        .becomeMotivator(goal, goalMotivatorExtraDataUris.one)
    ).to.be.reverted;
  });
});
