import hre, { ethers } from "hardhat";
import {
  Goal__factory,
  Hub__factory,
  Keeper__factory,
  Profile__factory,
  TrustingVerifier__factory,
} from "../typechain-types";
import { contractsData, deployedContracts } from "./helpers/constants";
import { deployWithLogs, upgradeProxyWithLogs } from "./helpers/utils";

async function main() {
  // Define chain
  const chain = hre.hardhatArguments.network;
  if (!chain) {
    console.log("\n❌ Chain is not defined");
    return;
  }
  console.log(`\n🌎 Running on chain '${chain}'`);

  // Define deployer wallet
  const deployerWallet = new ethers.Wallet(
    process.env.PRIVATE_KEY_1 || "",
    ethers.provider
  );

  // Define chain data
  const chainContracts = deployedContracts[chain];
  const chainContractsData = contractsData[chain];
  if (!chainContracts || !chainContractsData) {
    console.log("\n❌ Chain data or chain contracts data is undefined");
  }

  // Deploy or upgrade hub contract
  if (!chainContracts.hub.proxy) {
    const contract = await deployWithLogs({
      chainName: chain,
      contractName: chainContracts.hub.name,
      contractFactory: new Hub__factory(deployerWallet),
      contractInitializeArgs: [
        chainContracts.goal.proxy || ethers.constants.AddressZero,
        chainContracts.keeper.proxy || ethers.constants.AddressZero,
        chainContracts.profile.proxy || ethers.constants.AddressZero,
        [], // TODO: Add verifiers if already deployed
        [], // TODO: Add verifiers if already deployed
      ],
      isProxyRequired: chainContracts.hub.isUpgreadable,
      isInitializeRequired: chainContracts.hub.isInitializable,
    });
    chainContracts.hub.proxy = contract.address;
    if (chainContracts.goal.proxy) {
      console.log("⚡ Send hub address to goal contract");
      await Goal__factory.connect(
        chainContracts.goal.proxy,
        deployerWallet
      ).setHubAddress(chainContracts.hub.proxy);
    }
  } else if (chainContracts.hub.isUpgreadable && !chainContracts.hub.impl) {
    await upgradeProxyWithLogs(
      chain,
      chainContracts.hub.name,
      chainContracts.hub.proxy,
      new Hub__factory(deployerWallet)
    );
  }

  // Stop script with error if hub is not deployed
  if (!chainContracts.hub.proxy) {
    console.error(
      "\n❌ Failed deploy rest contracts because hub contract is not deployed"
    );
    return;
  }

  // Deploy verifier contracts
  for (let i = 0; i < chainContracts.verifiers.length; i++) {
    const verifier = chainContracts.verifiers[i];
    if (verifier.contract.proxy) {
      continue;
    }
    let contract;
    if (verifier.verificationRequirement === "ANY_PROOF_URI") {
      contract = await deployWithLogs({
        chainName: chain,
        contractName: verifier.contract.name,
        contractFactory: new TrustingVerifier__factory(deployerWallet),
        contractConstructorArgs: [chainContracts.hub.proxy],
        isProxyRequired: verifier.contract.isUpgreadable,
        isInitializeRequired: verifier.contract.isInitializable,
      });
    }
    if (contract) {
      console.log("⚡ Send contract address to hub");
      await Hub__factory.connect(
        chainContracts.hub.proxy,
        deployerWallet
      ).setVerifierAddress(verifier.verificationRequirement, contract.address);
    }
  }

  // Deploy or upgrade goal contract
  if (!chainContracts.goal.proxy) {
    const contract = await deployWithLogs({
      chainName: chain,
      contractName: chainContracts.goal.name,
      contractFactory: new Goal__factory(deployerWallet),
      contractInitializeArgs: [
        chainContracts.hub.proxy,
        chainContractsData.goalContract.usagePercent,
      ],
      isProxyRequired: chainContracts.goal.isUpgreadable,
      isInitializeRequired: chainContracts.goal.isInitializable,
    });
    chainContracts.goal.proxy = contract.address;
    console.log("⚡ Send contract address to hub");
    await Hub__factory.connect(
      chainContracts.hub.proxy,
      deployerWallet
    ).setGoalAddress(contract.address);
  } else if (chainContracts.goal.isUpgreadable && !chainContracts.goal.impl) {
    await upgradeProxyWithLogs(
      chain,
      chainContracts.goal.name,
      chainContracts.goal.proxy,
      new Goal__factory(deployerWallet)
    );
  }

  // Deploy or upgrade keeper contract
  if (!chainContracts.keeper.proxy) {
    const contract = await deployWithLogs({
      chainName: chain,
      contractName: chainContracts.keeper.name,
      contractFactory: new Keeper__factory(deployerWallet),
      isProxyRequired: chainContracts.keeper.isUpgreadable,
      isInitializeRequired: chainContracts.keeper.isInitializable,
    });
    chainContracts.keeper.proxy = contract.address;
    console.log("⚡ Send contract address to hub");
    await Hub__factory.connect(
      chainContracts.hub.proxy,
      deployerWallet
    ).setKeeperAddress(contract.address);
  } else if (
    chainContracts.keeper.isUpgreadable &&
    !chainContracts.keeper.impl
  ) {
    await upgradeProxyWithLogs(
      chain,
      chainContracts.keeper.name,
      chainContracts.keeper.proxy,
      new Keeper__factory(deployerWallet)
    );
  }

  // Deploy or upgrade profile contract
  if (!chainContracts.profile.proxy) {
    const contract = await deployWithLogs({
      chainName: chain,
      contractName: chainContracts.profile.name,
      contractFactory: new Profile__factory(deployerWallet),
      isProxyRequired: chainContracts.profile.isUpgreadable,
      isInitializeRequired: chainContracts.profile.isInitializable,
    });
    chainContracts.profile.proxy = contract.address;
    console.log("⚡ Send contract address to hub");
    await Hub__factory.connect(
      chainContracts.hub.proxy,
      deployerWallet
    ).setProfileAddress(contract.address);
  } else if (
    chainContracts.profile.isUpgreadable &&
    !chainContracts.profile.impl
  ) {
    await upgradeProxyWithLogs(
      chain,
      chainContracts.profile.name,
      chainContracts.profile.proxy,
      new Profile__factory(deployerWallet)
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
