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
      version: "0.2",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0xA10fF24BE349475F539cc8E123251E31305d7Fe2",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x244fD9faCC2c3A73745222Bb6862d4c0Bbb07b0D",
    },
    treasury: {
      name: "Treasury",
      version: "0.5-preview",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0x5B904De659B5d649460e870C9c9a9cA17D0a062A",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x860c58c01b068E9A67633cb202Ebb614443f3F67",
    },
    indieGoal: {
      name: "Indie Goal",
      version: "0.5-preview",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0xe9084fF29F4c96885f642c2Ea97C5dFd2793A6cC",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0xe239Ab4BfCB2689Bfde3578ad9d475B6E4fE0f63",
    },
  },
  mumbaiProduction: {
    profile: {
      name: "Profile",
      version: "0.3",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0xD67EA1d21c374DfB6618F35B0e40426ac42cE557",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x244fD9faCC2c3A73745222Bb6862d4c0Bbb07b0D",
    },
    treasury: {
      name: "Treasury",
      version: "0.5",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0xCc343ACF95115f089664134E8e0A80984f8314f7",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x860c58c01b068E9A67633cb202Ebb614443f3F67",
    },
    indieGoal: {
      name: "Indie Goal",
      version: "0.5",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0x4B3F5C22ddd497955010481585db704F7Fe35885",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0xe239Ab4BfCB2689Bfde3578ad9d475B6E4fE0f63",
    },
  },
};
