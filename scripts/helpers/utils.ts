import { Contract, ContractFactory } from "ethers";
import { upgrades } from "hardhat";

export async function deployWithLogs(args: {
  chainName: string;
  contractName: string;
  contractFactory: ContractFactory;
  contractArgs?: Array<any>;
  isProxyRequired?: boolean;
  isInitializeRequired?: boolean;
}): Promise<Contract> {
  let contract;
  // Deploy with proxy
  if (args.isProxyRequired) {
    console.log(`\n👟 Start deploy '${args.contractName}' contract with proxy`);
    contract = await upgrades.deployProxy(
      args.contractFactory,
      args.contractArgs,
      {
        timeout: 180000,
      }
    );
    await contract.deployed();
  }
  // Deploy without proxy
  else {
    console.log(`\n👟 Start deploy '${args.contractName}' contract`);
    contract = await args.contractFactory.deploy();
    await contract.deployed();
    // Use initialize function
    if (args.isInitializeRequired) {
      if (args.contractArgs) {
        await contract.initialize(...args.contractArgs);
      } else {
        await contract.initialize();
      }
    }
  }
  console.log("✅ Contract deployed to " + contract.address);
  console.log(
    "👉 Command for vefifying: " +
      `npx hardhat verify --network ${args.chainName} ${contract.address}`
  );
  return contract;
}

export async function upgradeProxyWithLogs(
  chainName: string,
  contractName: string,
  contractAddress: string,
  contractFactory: ContractFactory
): Promise<Contract> {
  console.log(`\n👟 Start upgrade ${contractName} contract`);
  const contract = await upgrades.upgradeProxy(
    contractAddress,
    contractFactory
  );
  await contract.deployed();
  console.log("✅ Contract upgraded");
  console.log(
    "👉 Command for vefifying: " +
      `npx hardhat verify --network ${chainName} ${contract.address}`
  );
  return contract;
}
