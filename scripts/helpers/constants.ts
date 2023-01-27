export const deployedContracts: {
  [key: string]: {
    hub: {
      name: string;
      proxy: string;
      proxyAdmin: string;
      impl: string;
    };
    goal: {
      name: string;
      proxy: string;
      proxyAdmin: string;
      impl: string;
    };
    usage: { name: string; proxy: string; proxyAdmin: string; impl: string };
    bio: {
      name: string;
      proxy: string;
      proxyAdmin: string;
      impl: string;
    };
  };
} = {
  mumbai: {
    hub: {
      name: "Hub",
      proxy: "0x7b1ed866D9112DC5Bb9D449721f63cFFd12198f2",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x6532367989e2456D577f9Ee7C7E0B1Fe52Accc0a",
    },
    goal: {
      name: "Goal",
      proxy: "0x44EAe6f0C8E0714B8d8676eA803Dec04B492Ba16",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0xba07b819C350478c03b7a02cF08a486D758f3AA2",
    },
    usage: {
      name: "Usage",
      proxy: "0xc49A17BBA8d6cBD12fB500190603f235575B7d36",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x4E0F7e80BE66571ACBaF8C7410a55f91f41D10B0",
    },
    bio: {
      name: "Bio",
      proxy: "0xBfd1b773C4Af9C430883EDC9e70D4b4a4BF8E4d2",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x99c5Cd2dF6BE0b6410bb9b870A004932bAa31F33",
    },
  },
};

export const deployedContractsData: {
  [key: string]: {
    goal: {
      usageFeePercent: number;
    };
  };
} = {
  mumbai: {
    goal: {
      usageFeePercent: 10,
    },
  },
};
