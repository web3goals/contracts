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
    treasury: DeployedContract;
    indieGoal: DeployedContract;
  };
} = {
  mumbai: {
    profile: {
      name: "Profile",
      version: "1.0-preview",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0x3bF65fD1C19Bb46da8378bd41576b70aDBD40EA0",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x50E07bC56F825597F5c85F34864b1fBc414a6559",
    },
    treasury: {
      name: "Treasury",
      version: "1.0-preview",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0xCDBc85b139924A1D2968A9ef0cd2d8cfB8859011",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x860c58c01b068E9A67633cb202Ebb614443f3F67",
    },
    indieGoal: {
      name: "Indie Goal",
      version: "1.0-preview",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0xAFA21ef551C0D64A9Fe70cBb6c8160B7A42D3c2d",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0xaC1b7E2D5E46909eba20a7958068C04744502fbB",
    },
  },
  polygon: {
    profile: {
      name: "Profile",
      version: "1.0",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0xa261503DE7f822E985878c1415CF17b9168f923E",
      proxyAdmin: "0x1EFd7AaDCCc11B3503D42703958cc543C9DCF680",
      impl: "0x53200724496237D82802d61520E01918C468954b",
    },
    treasury: {
      name: "Treasury",
      version: "1.0",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0x58de57b6f4Cb1bBF9BaDD939181a2D26E92f1C44",
      proxyAdmin: "0x1EFd7AaDCCc11B3503D42703958cc543C9DCF680",
      impl: "0xb0B726e1B41F46805B26CE9f43Fa1A371EC174FC",
    },
    indieGoal: {
      name: "Indie Goal",
      version: "1.0",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0x96BE97Face3FBb9a18489818c4114F58102dCE55",
      proxyAdmin: "0x1EFd7AaDCCc11B3503D42703958cc543C9DCF680",
      impl: "0xBe6738622aDEAC3f60b267Cbb5884268bc188c99",
    },
  },
};
