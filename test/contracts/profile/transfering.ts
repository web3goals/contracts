import { expect } from "chai";
import {
  makeSuiteCleanRoom,
  profileContract,
  profileUris,
  userThreeAddress,
  userTwo,
  userTwoAddress,
} from "../../setup";

makeSuiteCleanRoom("Profile Transfering", function () {
  it("User should fail to transfer token", async function () {
    // Set uri
    await expect(
      profileContract.connect(userTwo).setURI(profileUris.one)
    ).to.be.not.reverted;
    // Get token id
    const tokenId = await profileContract.getTokenId(userTwoAddress);
    // Transfer
    await expect(
      profileContract
        .connect(userTwo)
        .transferFrom(userTwoAddress, userThreeAddress, tokenId)
    ).to.be.reverted;
  });
});
