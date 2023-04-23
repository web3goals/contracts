interface DeployedContract {
  name: string;
  version: string; // Contracts version specified in package.json
  isUpgreadable: boolean;
  isInitializable: boolean;
  proxy?: string; // Or "impl" if contract deployed without proxy
  proxyAdmin?: string;
  impl?: string;
}

export const contracts: {
  [key: string]: {
    profile: DeployedContract;
    keeper: DeployedContract;
    indieGoal: DeployedContract;
  };
} = {
  mumbai: {
    profile: {
      name: "Profile",
      version: "0.2",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0xA10fF24BE349475F539cc8E123251E31305d7Fe2",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x244fD9faCC2c3A73745222Bb6862d4c0Bbb07b0D",
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
    indieGoal: {
      name: "Indie Goal",
      version: "0.4-preview",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0xdA7cCE9ed38695589436735A40011Cc4C91532ef",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0xF6Aee0B41Bdc6A4A43B194366F7c2E46b30D9eFd",
    },
  },
};

export const obsoleteContracts: {
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
      version: "0.3",
      isUpgreadable: false,
      isInitializable: true,
      proxy: "0x30C78bB0E789095ff0995d5Ea5CC1f4B357417c6",
      impl: "0x30C78bB0E789095ff0995d5Ea5CC1f4B357417c6",
    },
    goal: {
      name: "Goal",
      version: "0.3",
      isUpgreadable: false,
      isInitializable: true,
      proxy: "0xBBae3088AaF60c44Fb932ba82fd0b3dbb2d67C6F",
      impl: "0xBBae3088AaF60c44Fb932ba82fd0b3dbb2d67C6F",
    },
    keeper: {
      name: "Keeper",
      version: "0.3",
      isUpgreadable: false,
      isInitializable: true,
      proxy: "0x54f8aA5F76236af430102759F969Fa12422c7B42",
      impl: "0x54f8aA5F76236af430102759F969Fa12422c7B42",
    },
    profile: {
      name: "Profile",
      version: "0.3",
      isUpgreadable: false,
      isInitializable: true,
      proxy: "0x389133Be626AAF192D66765FF30Bef724841C492",
      impl: "0x389133Be626AAF192D66765FF30Bef724841C492",
    },
    verifiers: [
      {
        verificationRequirement: "ANY_PROOF_URI",
        contract: {
          name: "TrustingVerifier",
          version: "0.3",
          isUpgreadable: false,
          isInitializable: false,
          proxy: "0x38DCFdF916e5C5DB97B8d9818e1Babc7C7253270",
          impl: "0x38DCFdF916e5C5DB97B8d9818e1Babc7C7253270",
        },
      },
    ],
  },
  filecoin: {
    hub: {
      name: "Hub",
      version: "0.3",
      isUpgreadable: false,
      isInitializable: true,
      proxy: "0x2168609301437822c7AD3f35114B10941866F20a",
      impl: "0x2168609301437822c7AD3f35114B10941866F20a",
    },
    goal: {
      name: "Goal",
      version: "0.3",
      isUpgreadable: false,
      isInitializable: true,
      proxy: "0x96a5281959d962bA18481BEAfBe25C6c98316C95",
      impl: "0x96a5281959d962bA18481BEAfBe25C6c98316C95",
    },
    keeper: {
      name: "Keeper",
      version: "0.3",
      isUpgreadable: false,
      isInitializable: true,
      proxy: "0x02008a8dbc938bd7930bf370617065b6b0c1221a",
      impl: "0x02008a8dbc938bd7930bf370617065b6b0c1221a",
    },
    profile: {
      name: "Profile",
      version: "0.3",
      isUpgreadable: false,
      isInitializable: true,
      proxy: "0x9cAAb0Bf70BD0e71307BfaBeb1E8eC092c81e493",
      impl: "0x9cAAb0Bf70BD0e71307BfaBeb1E8eC092c81e493",
    },
    verifiers: [
      {
        verificationRequirement: "ANY_PROOF_URI",
        contract: {
          name: "TrustingVerifier",
          version: "0.3",
          isUpgreadable: false,
          isInitializable: false,
          proxy: "0xdfE15Cc65697c04C083982B8a053E2FE4cf54669",
          impl: "0xdfE15Cc65697c04C083982B8a053E2FE4cf54669",
        },
      },
    ],
  },
  mumbaiProduction: {
    hub: {
      name: "Hub",
      version: "0.3",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0x8BEcC725883CF49a9655a707A08E94211721093B",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x01f2b35AdE133A03cA34d7b614C91579D6d28583",
    },
    goal: {
      name: "Goal",
      version: "0.3",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0x93d3a8C97E4F08fA709AaAfB65AbEDCcC00a2C83",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x8CbE15faeE3A8F6796506fCe15Ad6B1961E85191",
    },
    keeper: {
      name: "Keeper",
      version: "0.3",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0x198C2E3A15f77c3eF976c2A8b419096b7A80b084",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x860c58c01b068E9A67633cb202Ebb614443f3F67",
    },
    profile: {
      name: "Profile",
      version: "0.3",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0xD67EA1d21c374DfB6618F35B0e40426ac42cE557",
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
          proxy: "0xC74BA44fa161FAf37aDa76517bDF8a61119E98bb",
          impl: "0xC74BA44fa161FAf37aDa76517bDF8a61119E98bb",
        },
      },
    ],
  },
};
