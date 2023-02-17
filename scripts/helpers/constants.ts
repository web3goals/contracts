interface DeployedContract {
  name: string;
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
    usage: DeployedContract;
    bio: DeployedContract;
    verifiers: Array<{
      verificationRequirement: "ANY_PROOF_URI" | "GITHUB_ACTIVITY";
      contract: DeployedContract;
    }>;
  };
} = {
  mumbai: {
    hub: {
      name: "Hub",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0x0d00Be3E0Fe16cD263b63cbBa3e88cf372317683",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x347F6E974940bcD60BdA415c6ca06Bd3aC852173",
    },
    goal: {
      name: "Goal",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0xc2D858Bec57a6daCF206eA78e5DA3F05428A29fe",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x5948b9750e99A48371c8F3cF9584470E0C28A2a3",
    },
    usage: {
      name: "Usage",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0xc49A17BBA8d6cBD12fB500190603f235575B7d36",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x4E0F7e80BE66571ACBaF8C7410a55f91f41D10B0",
    },
    bio: {
      name: "Bio",
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
          name: "AnyProofURIVerifier",
          isUpgreadable: false,
          isInitializable: false,
          proxy: "0x32A5425CDA456BF7162eC42300FeCd344b20F941",
          impl: "0x32A5425CDA456BF7162eC42300FeCd344b20F941",
        },
      },
      {
        verificationRequirement: "GITHUB_ACTIVITY",
        contract: {
          name: "GithubActivityVerifier",
          isUpgreadable: false,
          isInitializable: false,
          proxy: "0xDaf6a0FA0a70307B43A499BDC7d32F7A6f6fF234",
          impl: "0xDaf6a0FA0a70307B43A499BDC7d32F7A6f6fF234",
        },
      },
    ],
  },
  hyperspace: {
    hub: {
      name: "Hub",
      isUpgreadable: false,
      isInitializable: true,
      proxy: "0xFB22c49674E4482C22D4499392a8e2f760D84f8d",
      impl: "0xFB22c49674E4482C22D4499392a8e2f760D84f8d",
    },
    goal: {
      name: "Goal",
      isUpgreadable: false,
      isInitializable: true,
      proxy: "0xc254cDd94b834966DB91e99bb6aE073Df3F55Bd7",
      impl: "0xc254cDd94b834966DB91e99bb6aE073Df3F55Bd7",
    },
    usage: {
      name: "Usage",
      isUpgreadable: false,
      isInitializable: true,
      proxy: "0x9b18515b74eF6115A673c6D01C454D8F72f84177",
      impl: "0x9b18515b74eF6115A673c6D01C454D8F72f84177",
    },
    bio: {
      name: "Bio",
      isUpgreadable: false,
      isInitializable: true,
      proxy: "0x2823Cf9c96deccE8DF6a7b0e4513fB5aFEC58B7a",
      impl: "0x2823Cf9c96deccE8DF6a7b0e4513fB5aFEC58B7a",
    },
    verifiers: [
      {
        verificationRequirement: "ANY_PROOF_URI",
        contract: {
          name: "AnyProofURIVerifier",
          isUpgreadable: false,
          isInitializable: false,
          proxy: "0x4518BA8A80a1555402A4c75D631c36338b5b58c4",
          impl: "0x4518BA8A80a1555402A4c75D631c36338b5b58c4",
        },
      },
    ],
  },
  mantleTestnet: {
    hub: {
      name: "Hub",
      isUpgreadable: false,
      isInitializable: true,
      proxy: "0x02e1A2a943E6Ce63a89d40EFAE63bf6AcDFEc268",
      impl: "0x02e1A2a943E6Ce63a89d40EFAE63bf6AcDFEc268",
    },
    goal: {
      name: "Goal",
      isUpgreadable: false,
      isInitializable: true,
      proxy: "0x306FC512C947c66b00b3436C74c85d163a89C5Aa",
      impl: "0x306FC512C947c66b00b3436C74c85d163a89C5Aa",
    },
    usage: {
      name: "Usage",
      isUpgreadable: false,
      isInitializable: true,
      proxy: "0xdfE15Cc65697c04C083982B8a053E2FE4cf54669",
      impl: "0xdfE15Cc65697c04C083982B8a053E2FE4cf54669",
    },
    bio: {
      name: "Bio",
      isUpgreadable: false,
      isInitializable: true,
      proxy: "0xD9fEAbe16BAb684B5537eb6cbB43C8A4e6a90F47",
      impl: "0xD9fEAbe16BAb684B5537eb6cbB43C8A4e6a90F47",
    },
    verifiers: [
      {
        verificationRequirement: "ANY_PROOF_URI",
        contract: {
          name: "AnyProofURIVerifier",
          isUpgreadable: false,
          isInitializable: false,
          proxy: "0x2823Cf9c96deccE8DF6a7b0e4513fB5aFEC58B7a",
          impl: "0x2823Cf9c96deccE8DF6a7b0e4513fB5aFEC58B7a",
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
    epnsContract?: {
      address: string;
      channelAddress: string;
    };
    gitHubActivityVerifierContract?: {
      chainlinkTokenAddress: string;
      chainlinkOracleAddress: string;
      chainlinkJobId: string;
    };
  };
} = {
  mumbai: {
    goalContract: {
      usagePercent: 10,
    },
    epnsContract: {
      address: "0xb3971bcef2d791bc4027bbfedfb47319a4aaaaaa",
      channelAddress: "0x4306d7a79265d2cb85db0c5a55ea5f4f6f73c4b1",
    },
    gitHubActivityVerifierContract: {
      chainlinkTokenAddress: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
      chainlinkOracleAddress: "0x40193c8518BB267228Fc409a613bDbD8eC5a97b3",
      chainlinkJobId: "c1c5e92880894eb6b27d3cae19670aa3",
    },
  },
  hyperspace: { goalContract: { usagePercent: 10 } },
  mantleTestnet: { goalContract: { usagePercent: 10 } },
};
