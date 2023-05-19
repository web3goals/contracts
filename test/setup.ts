import { BigNumber, Signer } from "ethers";
import { ethers } from "hardhat";
import {
  IndieGoal,
  IndieGoal__factory,
  Treasury,
  Treasury__factory,
  Profile,
  Profile__factory,
} from "../typechain-types";
import { SECONDS_PER_DAY } from "./helpers/constants";
import { EARLY_ADOPTER_ROLE } from "./helpers/roles";
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

export const goalParams = {
  one: {
    description: "Train every week for 3 months",
    deadlineTimestamp: BigNumber.from(getEpochSeconds() + 2 * SECONDS_PER_DAY),
    stake: BigNumber.from("50000000000000000"),
    extraDataUri: "ipfs://abc",
  },
};

export const goalProofExtraDataUris = {
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
export let treasuryContract: Treasury;
export let goalContract: IndieGoal;

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
  // Grant roles
  await profileContract
    .connect(deployer)
    .grantRole(EARLY_ADOPTER_ROLE, userOneAddress);
  await profileContract
    .connect(deployer)
    .grantRole(EARLY_ADOPTER_ROLE, userTwoAddress);
  await profileContract
    .connect(deployer)
    .grantRole(EARLY_ADOPTER_ROLE, userThreeAddress);
  await profileContract
    .connect(deployer)
    .grantRole(EARLY_ADOPTER_ROLE, userFourAddress);
  // Create profiles
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

  // Deploy treasury contract
  treasuryContract = await new Treasury__factory(deployer).deploy();
  await treasuryContract.initialize();

  // Deploy goal contract
  goalContract = await new IndieGoal__factory(deployer).deploy();
  await goalContract.initialize(
    profileContract.address,
    treasuryContract.address
  );
});
