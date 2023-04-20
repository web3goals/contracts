import { BigNumber, Signer } from "ethers";
import { ethers } from "hardhat";
import {
  Goal,
  Goal__factory,
  Profile,
  Profile__factory,
} from "../typechain-types";
import { Keeper } from "../typechain-types/contracts";
import { Keeper__factory } from "../typechain-types/factories/contracts";
import { SECONDS_PER_DAY } from "./helpers/constants";
import {
  getEpochSeconds,
  revertToSnapshot,
  takeSnapshot,
} from "./helpers/utils";

export const profileUris = {
  one: "ipfs://abc",
  two: "ipfs://def",
  three: "ipfs://123",
  four: "ipfs://456",
};

export const goalContractParams = {
  usageFeePercent: 10,
};

export const goalParams = {
  one: {
    description: "Train every week for 3 months",
    deadlineTimestamp: BigNumber.from(getEpochSeconds() + 2 * SECONDS_PER_DAY),
    stake: BigNumber.from("50000000000000000"),
    stakeForKeeper: BigNumber.from("5000000000000000"),
    stakeForMotivators: BigNumber.from("45000000000000000"),
  },
};

export const goalProofExtraDataUris = {
  one: "ipfs://abc",
  two: "ipfs://def",
  three: "ipfs://123",
  four: "ipfs://456",
};

export const goalMotivatorExtraDataUris = {
  one: "ipfs://abc",
  two: "ipfs://def",
  three: "ipfs://123",
  four: "ipfs://456",
};

export const goalMessageExtraDataUris = {
  one: "ipfs://abc",
  two: "ipfs://def",
  three: "ipfs://123",
  four: "ipfs://456",
};

export let accounts: Array<Signer>;
export let deployer: Signer;
export let userOne: Signer;
export let userTwo: Signer;
export let userThree: Signer;
export let userFour: Signer;

export let deployerAddress: string;
export let userOneAddress: string;
export let userTwoAddress: string;
export let userThreeAddress: string;
export let userFourAddress: string;

export let profileContract: Profile;
export let keeperContract: Keeper;
export let goalContract: Goal;

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

export async function createProfiles() {
  await profileContract.connect(userOne).setURI(profileUris.one);
  await profileContract.connect(userTwo).setURI(profileUris.two);
  await profileContract.connect(userThree).setURI(profileUris.three);
  await profileContract.connect(userFour).setURI(profileUris.four);
}

before(async function () {
  // Init accounts
  accounts = await ethers.getSigners();
  deployer = accounts[0];
  userOne = accounts[1];
  userTwo = accounts[2];
  userThree = accounts[3];
  userFour = accounts[4];

  // Init addresses
  deployerAddress = await deployer.getAddress();
  userOneAddress = await userOne.getAddress();
  userTwoAddress = await userTwo.getAddress();
  userThreeAddress = await userThree.getAddress();
  userFourAddress = await userFour.getAddress();

  // Deploy profile contract
  profileContract = await new Profile__factory(deployer).deploy();
  await profileContract.initialize();

  // Deploy keeper contract
  keeperContract = await new Keeper__factory(deployer).deploy();
  await keeperContract.initialize();

  // Deploy goal contract
  goalContract = await new Goal__factory(deployer).deploy();
  await goalContract.initialize(
    profileContract.address,
    keeperContract.address,
    goalContractParams.usageFeePercent
  );
});
