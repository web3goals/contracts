import { expect } from "chai";
import { BigNumber } from "ethers";
import { EARLY_ADOPTER_ROLE } from "../../helpers/roles";
import {
  deployer,
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
    // Grant role for user one
    await profileContract
      .connect(deployer)
      .grantRole(EARLY_ADOPTER_ROLE, userOneAddress);
    // Create profile by user one
    await expect(
      profileContract.connect(userOne).setURI(profileUris.one)
    ).to.be.not.reverted;
    profile = await profileContract.getTokenId(userOneAddress);
  });

  it("Profile token owner must unsuccessfully transfer token", async function () {
    await expect(
      profileContract
        .connect(userOne)
        .transferFrom(userOneAddress, userTwoAddress, profile)
    ).to.be.reverted;
  });
});
