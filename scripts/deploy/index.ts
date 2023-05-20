import hre, { ethers } from "hardhat";
import {
  IndieGoal__factory,
  Profile__factory,
  Treasury__factory,
} from "../../typechain-types";
import { contracts } from "./contracts";
import { deployWithLogs, upgradeProxyWithLogs } from "./utils";

async function main() {
  // Define chain
  const chain = hre.hardhatArguments.network;
  if (!chain) {
    console.log("\n❌ Chain is not defined");
    return;
  }
  console.log(`\n🌎 Running on chain '${chain}'`);

  // Define contract deployer
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];

  // Define chain data
  const chainContracts = contracts[chain];
  if (!chainContracts) {
    console.log("\n❌ Chain data or chain contracts data is undefined");
    return;
  }

  // Deploy or upgrade profile contract
  if (!chainContracts.profile.proxy) {
    const contract = await deployWithLogs({
      chainName: chain,
      contractName: chainContracts.profile.name,
      contractFactory: new Profile__factory(deployer),
      isProxyRequired: chainContracts.profile.isUpgreadable,
      isInitializeRequired: chainContracts.profile.isInitializable,
    });
    chainContracts.profile.proxy = contract.address;
    // TODO: Send address to indie goal contract if defined
  } else if (
    chainContracts.profile.isUpgreadable &&
    !chainContracts.profile.impl
  ) {
    await upgradeProxyWithLogs(
      chain,
      chainContracts.profile.name,
      chainContracts.profile.proxy,
      new Profile__factory(deployer)
    );
  }

  // Deploy or upgrade treasury contract
  if (!chainContracts.treasury.proxy) {
    const contract = await deployWithLogs({
      chainName: chain,
      contractName: chainContracts.treasury.name,
      contractFactory: new Treasury__factory(deployer),
      isProxyRequired: chainContracts.treasury.isUpgreadable,
      isInitializeRequired: chainContracts.treasury.isInitializable,
    });
    chainContracts.treasury.proxy = contract.address;
    // TODO: Send address to indie goal contract if defined
  } else if (
    chainContracts.treasury.isUpgreadable &&
    !chainContracts.treasury.impl
  ) {
    await upgradeProxyWithLogs(
      chain,
      chainContracts.treasury.name,
      chainContracts.treasury.proxy,
      new Treasury__factory(deployer)
    );
  }

  // Deploy or upgrade indie goal contract
  if (!chainContracts.indieGoal.proxy) {
    const contract = await deployWithLogs({
      chainName: chain,
      contractName: chainContracts.indieGoal.name,
      contractFactory: new IndieGoal__factory(deployer),
      contractInitializeArgs: [
        chainContracts.profile.proxy,
        chainContracts.treasury.proxy,
      ],
      isProxyRequired: chainContracts.indieGoal.isUpgreadable,
      isInitializeRequired: chainContracts.indieGoal.isInitializable,
    });
    chainContracts.indieGoal.proxy = contract.address;
  } else if (
    chainContracts.indieGoal.isUpgreadable &&
    !chainContracts.indieGoal.impl
  ) {
    await upgradeProxyWithLogs(
      chain,
      chainContracts.indieGoal.name,
      chainContracts.indieGoal.proxy,
      new IndieGoal__factory(deployer)
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
