import { expect } from "chai";
import { BigNumber } from "ethers";
import {
  makeSuiteCleanRoom,
  profileContract,
  profileUris,
  userOne,
  userOneAddress,
  userTwoAddress,
} from "../../setup";

makeSuiteCleanRoom("Profile Transfering", function () {
  let profile: BigNumber;

  beforeEach(async function () {
    // Set uri by user one
    await expect(
      profileContract.connect(userOne).setURI(profileUris.one)
    ).to.be.not.reverted;
    profile = await profileContract.getTokenId(userOneAddress);
  });

  it("Profile token owner should fail to transfer token", async function () {
    await expect(
      profileContract
        .connect(userOne)
        .transferFrom(userOneAddress, userTwoAddress, profile)
    ).to.be.reverted;
  });
});
