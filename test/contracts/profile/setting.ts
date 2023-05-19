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
  userTwo,
} from "../../setup";

makeSuiteCleanRoom("Profile Setting", function () {
  beforeEach(async function () {
    // Grant role for user one
    await profileContract
      .connect(deployer)
      .grantRole(EARLY_ADOPTER_ROLE, userOneAddress);
  });

  it("User with a role must successfully set a token uri", async function () {
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

  it("User with a role must to own only one token after several uri changes", async function () {
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

  it("User without a role must unsuccessfully set a token uri", async function () {
    await expect(
      profileContract.connect(userTwo).setURI(profileUris.one)
    ).to.be.reverted;
  });
});
