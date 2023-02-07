import hre, { ethers } from "hardhat";
import {
  Bio__factory,
  Goal__factory,
  Hub__factory,
  Usage__factory,
} from "../typechain-types";
import { deployedContracts, deployedContractsData } from "./helpers/constants";
import { deployProxyWithLogs, upgradeProxyWithLogs } from "./helpers/utils";

async function main() {
  // Define chain
  const chain = hre.hardhatArguments.network;
  if (!chain) {
    console.log("\n❌ Chain is not defined");
    return;
  }
  console.log(`\n🌎 Running on chain '${chain}'`);

  // Define deployer
  const signers = await ethers.getSigners();
  const deployer = signers[0];

  // Define chain data
  const chainContracts = deployedContracts[chain];
  const chainContractsData = deployedContractsData[chain];

  // Deploy or upgrade hub contract
  if (!chainContracts.hub.proxy) {
    const contract = await deployProxyWithLogs(
      chain,
      chainContracts.hub.name,
      new Hub__factory(deployer),
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
        deployer
      ).setHubAddress(chainContracts.hub.proxy);
    }
  } else if (!chainContracts.hub.impl) {
    await upgradeProxyWithLogs(
      chain,
      chainContracts.hub.name,
      chainContracts.hub.proxy,
      new Hub__factory(deployer)
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
      new Goal__factory(deployer),
      [chainContracts.hub.proxy, chainContractsData.goal.usageFeePercent]
    );
    chainContracts.goal.proxy = contract.address;
    console.log("⚡ Send contract address to hub");
    await Hub__factory.connect(
      chainContracts.hub.proxy,
      deployer
    ).setGoalAddress(contract.address);
  } else if (!chainContracts.goal.impl) {
    await upgradeProxyWithLogs(
      chain,
      chainContracts.goal.name,
      chainContracts.goal.proxy,
      new Goal__factory(deployer)
    );
  }

  // Deploy or upgrade usage contract
  if (!chainContracts.usage.proxy) {
    const contract = await deployProxyWithLogs(
      chain,
      chainContracts.usage.name,
      new Usage__factory(deployer)
    );
    chainContracts.usage.proxy = contract.address;
    console.log("⚡ Send contract address to hub");
    await Hub__factory.connect(
      chainContracts.hub.proxy,
      deployer
    ).setUsageAddress(contract.address);
  } else if (!chainContracts.usage.impl) {
    await upgradeProxyWithLogs(
      chain,
      chainContracts.usage.name,
      chainContracts.usage.proxy,
      new Usage__factory(deployer)
    );
  }

  // Deploy or upgrade bio contract
  if (!chainContracts.bio.proxy) {
    const contract = await deployProxyWithLogs(
      chain,
      chainContracts.bio.name,
      new Bio__factory(deployer)
    );
    chainContracts.bio.proxy = contract.address;
    console.log("⚡ Send contract address to hub");
    await Hub__factory.connect(
      chainContracts.hub.proxy,
      deployer
    ).setBioAddress(contract.address);
  } else if (!chainContracts.bio.impl) {
    await upgradeProxyWithLogs(
      chain,
      chainContracts.bio.name,
      chainContracts.bio.proxy,
      new Bio__factory(deployer)
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
