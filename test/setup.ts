import { Signer } from "ethers";
import { ethers } from "hardhat";
import { Bio, Bio__factory } from "../typechain-types";
import { revertToSnapshot, takeSnapshot } from "./helpers/utils";

export const bioUris = {
  one: "ipfs://one",
  two: "ipfs://two",
};

export let accounts: Array<Signer>;
export let deployer: Signer;
export let userOne: Signer;
export let userTwo: Signer;
export let userThree: Signer;

export let deployerAddress: string;
export let userOneAddress: string;
export let userTwoAddress: string;
export let userThreeAddress: string;

export let bioContract: Bio;

export function makeSuiteCleanRoom(name: string, tests: () => void) {
  return describe(name, () => {
    beforeEach(async function () {
      await takeSnapshot();
    });
    tests();
    afterEach(async function () {
      await revertToSnapshot();
    });
  });
}

before(async function () {
  // Init accounts
  accounts = await ethers.getSigners();
  deployer = accounts[0];
  userOne = accounts[1];
  userTwo = accounts[2];
  userThree = accounts[3];

  // Init addresses
  deployerAddress = await deployer.getAddress();
  userOneAddress = await userOne.getAddress();
  userTwoAddress = await userTwo.getAddress();
  userThreeAddress = await userThree.getAddress();

  // Deploy bio contract
  bioContract = await new Bio__factory(deployer).deploy();
  await bioContract.initialize();
});
