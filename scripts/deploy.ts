import hre, { ethers } from "hardhat";
import {
  Bio__factory,
  Goal__factory,
  Hub__factory,
  Usage__factory,
} from "../typechain-types";
import {
  deployedContracts,
  goalContractUsagePercent as goalContractUsageFeePercent,
} from "./helpers/constants";
import { deployProxyWithLogs, upgradeProxyWithLogs } from "./helpers/utils";

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

  // Deploy or upgrade hub contract
  if (!chainContracts.hub.proxy) {
    const contract = await deployProxyWithLogs(
      chain,
      chainContracts.hub.name,
      new Hub__factory(deployerWallet),
      [
        chainContracts.goal.proxy || ethers.constants.AddressZero,
        chainContracts.usage.proxy || ethers.constants.AddressZero,
        chainContracts.bio.proxy || ethers.constants.AddressZero,
      ]
    );
    chainContracts.hub.proxy = contract.address;
    if (chainContracts.goal.proxy) {
      console.log("⚡ Send hub address to goal contract");
      await Goal__factory.connect(
        chainContracts.goal.proxy,
        deployerWallet
      ).setHubAddress(chainContracts.hub.proxy);
    }
  } else if (!chainContracts.hub.impl) {
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

  // Deploy or upgrade goal contract
  if (!chainContracts.goal.proxy) {
    const contract = await deployProxyWithLogs(
      chain,
      chainContracts.goal.name,
      new Goal__factory(deployerWallet),
      [chainContracts.hub.proxy, goalContractUsageFeePercent]
    );
    chainContracts.goal.proxy = contract.address;
    console.log("⚡ Send contract address to hub");
    await Hub__factory.connect(
      chainContracts.hub.proxy,
      deployerWallet
    ).setGoalAddress(contract.address);
  } else if (!chainContracts.goal.impl) {
    await upgradeProxyWithLogs(
      chain,
      chainContracts.goal.name,
      chainContracts.goal.proxy,
      new Goal__factory(deployerWallet)
    );
  }

  // Deploy or upgrade usage contract
  if (!chainContracts.usage.proxy) {
    const contract = await deployProxyWithLogs(
      chain,
      chainContracts.usage.name,
      new Usage__factory(deployerWallet)
    );
    chainContracts.usage.proxy = contract.address;
    console.log("⚡ Send contract address to hub");
    await Hub__factory.connect(
      chainContracts.hub.proxy,
      deployerWallet
    ).setUsageAddress(contract.address);
  } else if (!chainContracts.usage.impl) {
    await upgradeProxyWithLogs(
      chain,
      chainContracts.usage.name,
      chainContracts.usage.proxy,
      new Usage__factory(deployerWallet)
    );
  }

  // Deploy or upgrade bio contract
  if (!chainContracts.bio.proxy) {
    const contract = await deployProxyWithLogs(
      chain,
      chainContracts.bio.name,
      new Bio__factory(deployerWallet)
    );
    chainContracts.bio.proxy = contract.address;
    console.log("⚡ Send contract address to hub");
    await Hub__factory.connect(
      chainContracts.hub.proxy,
      deployerWallet
    ).setBioAddress(contract.address);
  } else if (!chainContracts.bio.impl) {
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
