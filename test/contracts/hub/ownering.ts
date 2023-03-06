import { expect } from "chai";
import { ethers } from "hardhat";
import {
  deployer,
  goalContract,
  hubContract,
  makeSuiteCleanRoom,
  userOne,
} from "../../setup";

makeSuiteCleanRoom("Hub Ownering", function () {
  it("Hub contract owner should be able to use owner functions", async function () {
    await expect(
      hubContract.connect(deployer).setGoalAddress(ethers.constants.AddressZero)
    ).to.be.not.reverted;
    await expect(
      hubContract
        .connect(deployer)
        .setKeeperAddress(ethers.constants.AddressZero)
    ).to.be.not.reverted;
    await expect(
      hubContract
        .connect(deployer)
        .setProfileAddress(ethers.constants.AddressZero)
    ).to.be.not.reverted;
    await expect(
      hubContract
        .connect(deployer)
        .setVerifierAddress("", ethers.constants.AddressZero)
    ).to.be.not.reverted;
  });

  it("Not hub contract owner should not be able to use owner functions", async function () {
    await expect(
      hubContract.connect(userOne).setGoalAddress(ethers.constants.AddressZero)
    ).to.be.reverted;
    await expect(
      hubContract
        .connect(userOne)
        .setKeeperAddress(ethers.constants.AddressZero)
    ).to.be.reverted;
    await expect(
      hubContract
        .connect(userOne)
        .setProfileAddress(ethers.constants.AddressZero)
    ).to.be.reverted;
    await expect(
      hubContract
        .connect(userOne)
        .setVerifierAddress("", ethers.constants.AddressZero)
    ).to.be.reverted;
  });
});
