interface DeployedContract {
  name: string;
  version: string; // Contracts version specified in package.json
  isUpgreadable: boolean;
  isInitializable: boolean;
  proxy?: string; // Or "impl" if contract deployed without proxy
  proxyAdmin?: string;
  impl?: string;
}

export const deployedContracts: {
  [key: string]: {
    hub: DeployedContract;
    goal: DeployedContract;
    keeper: DeployedContract;
    profile: DeployedContract;
    verifiers: Array<{
      verificationRequirement: "ANY_PROOF_URI";
      contract: DeployedContract;
    }>;
  };
} = {
  mumbai: {
    hub: {
      name: "Hub",
      version: "0.1",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0x0d00Be3E0Fe16cD263b63cbBa3e88cf372317683",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x347F6E974940bcD60BdA415c6ca06Bd3aC852173",
    },
    goal: {
      name: "Goal",
      version: "0.1",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0x226bEd02252BAB7b161a3762614d8e3Ec5012862",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x73Ba60093e1b7208831FbA9160aFA4A15E773686",
    },
    keeper: {
      name: "Keeper",
      version: "0.1",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0xc49A17BBA8d6cBD12fB500190603f235575B7d36",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x4E0F7e80BE66571ACBaF8C7410a55f91f41D10B0",
    },
    profile: {
      name: "Profile",
      version: "0.1",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0xBfd1b773C4Af9C430883EDC9e70D4b4a4BF8E4d2",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x99c5Cd2dF6BE0b6410bb9b870A004932bAa31F33",
    },
    verifiers: [
      {
        verificationRequirement: "ANY_PROOF_URI",
        contract: {
          name: "TrustingVerifier",
          version: "0.1",
          isUpgreadable: false,
          isInitializable: false,
          proxy: "0xb03f6ca9A4565b6B11AF059883ACCA10FBD17462",
          impl: "0xb03f6ca9A4565b6B11AF059883ACCA10FBD17462",
        },
      },
    ],
  },
  hyperspace: {
    hub: {
      name: "Hub",
      version: "0.1",
      isUpgreadable: false,
      isInitializable: true,
      proxy: "0xFB22c49674E4482C22D4499392a8e2f760D84f8d",
      impl: "0xFB22c49674E4482C22D4499392a8e2f760D84f8d",
    },
    goal: {
      name: "Goal",
      version: "0.1",
      isUpgreadable: false,
      isInitializable: true,
      proxy: "0x1F2c31D5034F27A4352Bc6ca0fc72cdC32809808",
      impl: "0x1F2c31D5034F27A4352Bc6ca0fc72cdC32809808",
    },
    keeper: {
      name: "Keeper",
      version: "0.1",
      isUpgreadable: false,
      isInitializable: true,
      proxy: "0x9b18515b74eF6115A673c6D01C454D8F72f84177",
      impl: "0x9b18515b74eF6115A673c6D01C454D8F72f84177",
    },
    profile: {
      name: "Profile",
      version: "0.1",
      isUpgreadable: false,
      isInitializable: true,
      proxy: "0x2823Cf9c96deccE8DF6a7b0e4513fB5aFEC58B7a",
      impl: "0x2823Cf9c96deccE8DF6a7b0e4513fB5aFEC58B7a",
    },
    verifiers: [
      {
        verificationRequirement: "ANY_PROOF_URI",
        contract: {
          name: "TrustingVerifier",
          version: "0.1",
          isUpgreadable: false,
          isInitializable: false,
          proxy: "0x7A4ba8c3eA0524D4b1240d4eEbdDa3e2bfE4c87B",
          impl: "0x7A4ba8c3eA0524D4b1240d4eEbdDa3e2bfE4c87B",
        },
      },
    ],
  },
};

export const contractsData: {
  [key: string]: {
    goalContract: {
      usagePercent: number;
    };
  };
} = {
  mumbai: {
    goalContract: {
      usagePercent: 10,
    },
  },
  hyperspace: { goalContract: { usagePercent: 10 } },
};
