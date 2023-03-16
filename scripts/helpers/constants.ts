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
      version: "0.2",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0x7205f2969e55e39b0d4b3EC6D337771c5dAb8489",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x01f2b35AdE133A03cA34d7b614C91579D6d28583",
    },
    goal: {
      name: "Goal",
      version: "0.3",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0x4659fAA8DA43AF058D34d8fb956f89BEFf7ef60c",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x8CbE15faeE3A8F6796506fCe15Ad6B1961E85191",
    },
    keeper: {
      name: "Keeper",
      version: "0.2",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0x3FcF65dFD7Bb2Fd8D81235aa04ad0E7f75110386",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x860c58c01b068E9A67633cb202Ebb614443f3F67",
    },
    profile: {
      name: "Profile",
      version: "0.2",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0xA10fF24BE349475F539cc8E123251E31305d7Fe2",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x244fD9faCC2c3A73745222Bb6862d4c0Bbb07b0D",
    },
    verifiers: [
      {
        verificationRequirement: "ANY_PROOF_URI",
        contract: {
          name: "TrustingVerifier",
          version: "0.3",
          isUpgreadable: false,
          isInitializable: false,
          proxy: "0x5b93282ebD6d40BE5804B3d7679feCcb42e9D4bc",
          impl: "0x5b93282ebD6d40BE5804B3d7679feCcb42e9D4bc",
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
