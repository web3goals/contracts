import { BigNumber, Signer } from "ethers";
import { ethers } from "hardhat";
import {
  AnyProofVerifier,
  AnyProofVerifier__factory,
  Goal,
  Goal__factory,
  Hub,
  Hub__factory,
  Profile,
  Profile__factory,
} from "../typechain-types";
import {
  getEpochSeconds,
  revertToSnapshot,
  takeSnapshot,
} from "./helpers/utils";
import { expect } from "chai";
import { SECONDS_PER_DAY } from "./helpers/constants";
import { Keeper } from "../typechain-types/contracts";
import { Keeper__factory } from "../typechain-types/factories/contracts";

export const goalContractParams = {
  usageFeePercent: 10,
};

export const goalVerificationRequirements = {
  anyProof: "ANY_PROOF",
};

export const goalVerificationDataKeys = {
  anyUri: "ANY_URI",
};

export const goalParams = {
  one: {
    description: "Train every week for 3 months",
    deadlineTimestamp: BigNumber.from(getEpochSeconds() + 2 * SECONDS_PER_DAY),
    stake: BigNumber.from("50000000000000000"),
    verificationRequirement: goalVerificationRequirements.anyProof,
    verificationDataKeys: [],
    verificationDataValues: [],
    additionalVerificationDataKeys: [goalVerificationDataKeys.anyUri],
    additionalVerificationDataValues: ["ipfs://..."],
  },
};

export const goalWatcherExtraDataUris = {
  one: "ipfs://one",
  two: "ipfs://two",
};

export const profileUris = {
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

export let hubContract: Hub;
export let anyProofVerifier: AnyProofVerifier;
export let goalContract: Goal;
export let keeperContract: Keeper;
export let profileContract: Profile;

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

  // Deploy hub contract
  hubContract = await new Hub__factory(deployer).deploy();
  await hubContract.initialize(
    ethers.constants.AddressZero,
    ethers.constants.AddressZero,
    ethers.constants.AddressZero,
    [],
    []
  );

  // Deploy verifiers contracts
  anyProofVerifier = await new AnyProofVerifier__factory(deployer).deploy(
    hubContract.address
  );

  // Deploy goal contract
  goalContract = await new Goal__factory(deployer).deploy();
  await goalContract.initialize(
    hubContract.address,
    goalContractParams.usageFeePercent
  );

  // Deploy keeper contract
  keeperContract = await new Keeper__factory(deployer).deploy();
  await keeperContract.initialize();

  // Deploy profile contract
  profileContract = await new Profile__factory(deployer).deploy();
  await profileContract.initialize();

  // Set hub addresses
  await expect(
    hubContract.setVerifierAddress(
      goalVerificationRequirements.anyProof,
      anyProofVerifier.address
    )
  ).to.be.not.reverted;
  await expect(
    hubContract.setGoalAddress(goalContract.address)
  ).to.be.not.reverted;
  await expect(
    hubContract.setKeeperAddress(keeperContract.address)
  ).to.be.not.reverted;
  await expect(
    hubContract.setProfileAddress(profileContract.address)
  ).to.be.not.reverted;
});
