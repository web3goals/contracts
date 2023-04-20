import { expect } from "chai";
import { BigNumber } from "ethers";
import {
  createProfiles,
  goalContract,
  goalMotivatorExtraDataUris,
  goalParams,
  makeSuiteCleanRoom,
  userFourAddress,
  userOne,
  userThree,
  userThreeAddress,
  userTwo,
  userTwoAddress,
} from "../../setup";

makeSuiteCleanRoom("Goal Accepting Motivator", function () {
  let goal: BigNumber;

  beforeEach(async function () {
    // Create profiles
    await createProfiles();
    // Set goal and add motivators by user one
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
    await goalContract
      .connect(userTwo)
      .becomeMotivator(goal, goalMotivatorExtraDataUris.two);
    await goalContract
      .connect(userThree)
      .becomeMotivator(goal, goalMotivatorExtraDataUris.three);
  });

  it("Goal author should be able to accept a motivator", async function () {
    // Check before
    const motivatorsBefore = await goalContract.getMotivators(goal);
    expect(motivatorsBefore[0].isAccepted).to.be.equal(false);
    expect(motivatorsBefore[1].isAccepted).to.be.equal(false);
    // Accept second motivator by user one
    await expect(
      goalContract.connect(userOne).acceptMotivator(goal, userThreeAddress)
    ).to.be.not.reverted;
    // Check after
    const motivatorsAfter = await goalContract.getMotivators(goal);
    expect(motivatorsAfter[0].isAccepted).to.be.equal(false);
    expect(motivatorsAfter[1].isAccepted).to.be.equal(true);
  });

  it("Goal author should not be able to accept a not existing motivator", async function () {
    await expect(
      goalContract.connect(userOne).acceptMotivator(goal, userFourAddress)
    ).to.be.reverted;
  });

  it("Not goal author should not be able to accept a motivator", async function () {
    await expect(
      goalContract.connect(userTwo).acceptMotivator(goal, userTwoAddress)
    ).to.be.reverted;
  });
});
