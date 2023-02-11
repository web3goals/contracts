interface DeployedContract {
  name: string;
  isUpgreadable: boolean;
  proxy?: string;
  proxyAdmin?: string;
  impl?: string;
}

export const deployedContracts: {
  [key: string]: {
    hub: DeployedContract;
    goal: DeployedContract;
    usage: DeployedContract;
    bio: DeployedContract;
  };
} = {
  mumbai: {
    hub: {
      name: "Hub",
      isUpgreadable: true,
      proxy: "0x7b1ed866D9112DC5Bb9D449721f63cFFd12198f2",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x6532367989e2456D577f9Ee7C7E0B1Fe52Accc0a",
    },
    goal: {
      name: "Goal",
      isUpgreadable: true,
      proxy: "0xB9EFE9729120D7C94a8c8032ef2606c13d7cf0FF",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x2Cd686c90a1527d6A5133D2D80F1b7ec1abF4c55",
    },
    usage: {
      name: "Usage",
      isUpgreadable: true,
      proxy: "0xc49A17BBA8d6cBD12fB500190603f235575B7d36",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x4E0F7e80BE66571ACBaF8C7410a55f91f41D10B0",
    },
    bio: {
      name: "Bio",
      isUpgreadable: true,
      proxy: "0xBfd1b773C4Af9C430883EDC9e70D4b4a4BF8E4d2",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x99c5Cd2dF6BE0b6410bb9b870A004932bAa31F33",
    },
  },
  hyperspace: {
    hub: {
      name: "Hub",
      isUpgreadable: false,
      proxy: "0x02e1A2a943E6Ce63a89d40EFAE63bf6AcDFEc268",
      impl: "0x02e1A2a943E6Ce63a89d40EFAE63bf6AcDFEc268",
    },
    goal: {
      name: "Goal",
      isUpgreadable: false,
      proxy: "0x63a465e2C7Ca890430f81B7cE8Ad86bc9A4512DD",
      impl: "0x63a465e2C7Ca890430f81B7cE8Ad86bc9A4512DD",
    },
    usage: {
      name: "Usage",
      isUpgreadable: false,
      proxy: "0x9b18515b74eF6115A673c6D01C454D8F72f84177",
      impl: "0x9b18515b74eF6115A673c6D01C454D8F72f84177",
    },
    bio: {
      name: "Bio",
      isUpgreadable: false,
      proxy: "0x2823Cf9c96deccE8DF6a7b0e4513fB5aFEC58B7a",
      impl: "0x2823Cf9c96deccE8DF6a7b0e4513fB5aFEC58B7a",
    },
  },
  mantleTestnet: {
    hub: {
      name: "Hub",
      isUpgreadable: false,
      proxy: "0x02008a8DBc938bd7930bf370617065B6B0c1221a",
      impl: "0x02008a8DBc938bd7930bf370617065B6B0c1221a",
    },
    goal: {
      name: "Goal",
      isUpgreadable: false,
      proxy: "0x1e4712A93beEc0aa26151CF44061eE91DD56f921",
      impl: "0x1e4712A93beEc0aa26151CF44061eE91DD56f921",
    },
    usage: {
      name: "Usage",
      isUpgreadable: false,
      proxy: "0xdfE15Cc65697c04C083982B8a053E2FE4cf54669",
      impl: "0xdfE15Cc65697c04C083982B8a053E2FE4cf54669",
    },
    bio: {
      name: "Bio",
      isUpgreadable: false,
      proxy: "0xD9fEAbe16BAb684B5537eb6cbB43C8A4e6a90F47",
      impl: "0xD9fEAbe16BAb684B5537eb6cbB43C8A4e6a90F47",
    },
  },
};

export const goalContractUsagePercent = 10;
