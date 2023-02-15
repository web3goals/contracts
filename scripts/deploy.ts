import hre, { ethers } from "hardhat";
import {
  Bio__factory,
  Goal__factory,
  Hub__factory,
  Usage__factory,
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

  // Deploy or upgrade hub contract
  if (!chainContracts.hub.proxy) {
    const contract = await deployWithLogs({
      chainName: chain,
      contractName: chainContracts.hub.name,
      contractFactory: new Hub__factory(deployerWallet),
      contractArgs: [
        chainContracts.goal.proxy || ethers.constants.AddressZero,
        chainContracts.usage.proxy || ethers.constants.AddressZero,
        chainContracts.bio.proxy || ethers.constants.AddressZero,
      ],
      isProxyRequired: chainContracts.hub.isUpgreadable,
      isInitializeRequired: !chainContracts.hub.isUpgreadable,
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

  // TODO: Deploy verifiers supported by chain and add it to hub

  // Deploy or upgrade goal contract
  if (!chainContracts.goal.proxy) {
    const contract = await deployWithLogs({
      chainName: chain,
      contractName: chainContracts.goal.name,
      contractFactory: new Goal__factory(deployerWallet),
      contractArgs: [
        chainContracts.hub.proxy,
        chainContractsData.goalContractUsagePercent,
      ],
      isProxyRequired: chainContracts.goal.isUpgreadable,
      isInitializeRequired: !chainContracts.goal.isUpgreadable,
    });
    chainContracts.goal.proxy = contract.address;
    if (
      chainContractsData.goalContractEpnsCommContractAddress &&
      chainContractsData.goalContractEpnsChannelAddress
    ) {
      console.log("⚡ Set epns contract and channel addresses");
      console.log(
        "🔓 Don't forget to add this contract to epns channel delegates"
      );
      await Goal__factory.connect(
        chainContracts.goal.proxy,
        deployerWallet
      ).setEpnsCommContractAddress(
        chainContractsData.goalContractEpnsCommContractAddress
      );
      await Goal__factory.connect(
        chainContracts.goal.proxy,
        deployerWallet
      ).setEpnsChannelAddress(
        chainContractsData.goalContractEpnsChannelAddress
      );
    }
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

  // Deploy or upgrade usage contract
  if (!chainContracts.usage.proxy) {
    const contract = await deployWithLogs({
      chainName: chain,
      contractName: chainContracts.usage.name,
      contractFactory: new Usage__factory(deployerWallet),
      isProxyRequired: chainContracts.usage.isUpgreadable,
      isInitializeRequired: !chainContracts.usage.isUpgreadable,
    });
    chainContracts.usage.proxy = contract.address;
    console.log("⚡ Send contract address to hub");
    await Hub__factory.connect(
      chainContracts.hub.proxy,
      deployerWallet
    ).setUsageAddress(contract.address);
  } else if (chainContracts.usage.isUpgreadable && !chainContracts.usage.impl) {
    await upgradeProxyWithLogs(
      chain,
      chainContracts.usage.name,
      chainContracts.usage.proxy,
      new Usage__factory(deployerWallet)
    );
  }

  // Deploy or upgrade bio contract
  if (!chainContracts.bio.proxy) {
    const contract = await deployWithLogs({
      chainName: chain,
      contractName: chainContracts.bio.name,
      contractFactory: new Bio__factory(deployerWallet),
      isProxyRequired: chainContracts.bio.isUpgreadable,
      isInitializeRequired: !chainContracts.bio.isUpgreadable,
    });
    chainContracts.bio.proxy = contract.address;
    console.log("⚡ Send contract address to hub");
    await Hub__factory.connect(
      chainContracts.hub.proxy,
      deployerWallet
    ).setBioAddress(contract.address);
  } else if (chainContracts.bio.isUpgreadable && !chainContracts.bio.impl) {
    await upgradeProxyWithLogs(
      chain,
      chainContracts.bio.name,
      chainContracts.bio.proxy,
      new Bio__factory(deployerWallet)
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
