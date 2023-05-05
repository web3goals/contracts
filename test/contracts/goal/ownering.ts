import { expect } from "chai";
import { ethers } from "hardhat";
import {
  deployer,
  goalContract,
  makeSuiteCleanRoom,
  userOne,
} from "../../setup";

makeSuiteCleanRoom("Goal Ownering", function () {
  it("Goal contract owner should be able to use owner functions", async function () {
    await expect(goalContract.connect(deployer).pause()).to.be.not.reverted;
    await expect(goalContract.connect(deployer).unpause()).to.be.not.reverted;
    await expect(
      goalContract
        .connect(deployer)
        .setProfileAddress(ethers.constants.AddressZero)
    ).to.be.not.reverted;
    await expect(
      goalContract
        .connect(deployer)
        .setTreasuryAddress(ethers.constants.AddressZero)
    ).to.be.not.reverted;
    await expect(
      goalContract.connect(deployer).setUsageFeePercent(0)
    ).to.be.not.reverted;
    await expect(
      goalContract.connect(deployer).setImageSVG("")
    ).to.be.not.reverted;
  });

  it("Not goal contract owner should not be able to use owner functions", async function () {
    await expect(goalContract.connect(userOne).pause()).to.be.reverted;
    await expect(goalContract.connect(userOne).unpause()).to.be.reverted;
    await expect(
      goalContract
        .connect(userOne)
        .setProfileAddress(ethers.constants.AddressZero)
    ).to.be.reverted;
    await expect(
      goalContract
        .connect(userOne)
        .setTreasuryAddress(ethers.constants.AddressZero)
    ).to.be.reverted;
    await expect(
      goalContract.connect(userOne).setUsageFeePercent(0)
    ).to.be.reverted;
    await expect(goalContract.connect(userOne).setImageSVG("")).to.be.reverted;
  });
});
