import { expect } from "chai";
import { ADMIN_ROLE, EARLY_ADOPTER_ROLE } from "../../helpers/roles";
import {
  deployer,
  deployerAddress,
  makeSuiteCleanRoom,
  profileContract,
  userOne,
  userOneAddress,
} from "../../setup";

makeSuiteCleanRoom("Profile Setting", function () {
  it("User with an admin role must successfully grant an adopter role", async function () {
    expect(
      await profileContract
        .connect(deployer)
        .hasRole(ADMIN_ROLE, deployerAddress)
    ).to.equal(true);
    await expect(
      profileContract
        .connect(deployer)
        .grantRole(EARLY_ADOPTER_ROLE, userOneAddress)
    ).to.be.not.reverted;
    expect(
      await profileContract
        .connect(deployer)
        .hasRole(EARLY_ADOPTER_ROLE, userOneAddress)
    ).to.equal(true);
  });

  it("User without an admin role must unsuccessfully grant an adopter role", async function () {
    expect(
      await profileContract.connect(userOne).hasRole(ADMIN_ROLE, userOneAddress)
    ).to.equal(false);
    await expect(
      profileContract
        .connect(userOne)
        .grantRole(EARLY_ADOPTER_ROLE, userOneAddress)
    ).to.be.reverted;
  });
});
