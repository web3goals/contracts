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
      version: "0.6-preview",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0xd741699cACFE7a368EA0481EDCe157833314D815",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x50E07bC56F825597F5c85F34864b1fBc414a6559",
    },
    treasury: {
      name: "Treasury",
      version: "0.6-preview",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0x1C9EdF55f951a28BBd5A873d47C8d3dEef371989",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0x860c58c01b068E9A67633cb202Ebb614443f3F67",
    },
    indieGoal: {
      name: "Indie Goal",
      version: "0.6-preview",
      isUpgreadable: true,
      isInitializable: true,
      proxy: "0x4aB978BFe68FBfc097D37D01D417736Ef6FFf450",
      proxyAdmin: "0x575Ea23695370920464910103b542A9c63bC36F8",
      impl: "0xe239Ab4BfCB2689Bfde3578ad9d475B6E4fE0f63",
    },
  },
};
