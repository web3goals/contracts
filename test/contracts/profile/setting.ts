import { expect } from "chai";
import { BigNumber } from "ethers";
import {
  makeSuiteCleanRoom,
  profileContract,
  profileUris,
  userOne,
  userOneAddress,
} from "../../setup";

makeSuiteCleanRoom("Profile Setting", function () {
  it("User must successfully set a token uri", async function () {
    await expect(
      profileContract.connect(userOne).setURI(profileUris.one)
    ).to.be.not.reverted;
    expect(await profileContract.balanceOf(userOneAddress)).to.equal(
      BigNumber.from(1)
    );
    expect(await profileContract.getURI(userOneAddress)).to.equal(
      profileUris.one
    );
  });

  it("User must to own only one token after several uri changes", async function () {
    // First change
    await expect(
      profileContract.connect(userOne).setURI(profileUris.one)
    ).to.be.not.reverted;
    expect(await profileContract.balanceOf(userOneAddress)).to.equal(
      BigNumber.from(1)
    );
    expect(await profileContract.getURI(userOneAddress)).to.equal(
      profileUris.one
    );
    // Second change
    await expect(
      profileContract.connect(userOne).setURI(profileUris.two)
    ).to.be.not.reverted;
    expect(await profileContract.balanceOf(userOneAddress)).to.equal(
      BigNumber.from(1)
    );
    expect(await profileContract.getURI(userOneAddress)).to.equal(
      profileUris.two
    );
  });
});
