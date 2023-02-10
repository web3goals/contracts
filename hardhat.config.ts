import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config();

const accounts = [];
if (process.env.PRIVATE_KEY_1) {
  accounts.push(process.env.PRIVATE_KEY_1);
}
if (process.env.PRIVATE_KEY_2) {
  accounts.push(process.env.PRIVATE_KEY_2);
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    mumbai: {
      url: process.env.RPC_URL_MUMBAI || "",
      accounts: accounts,
    },
    hyperspace: {
      chainId: 3141,
      url: process.env.RPC_URL_HYPERSPACE || "",
      accounts: accounts,
    },
    mantleTestnet: {
      chainId: 5001,
      url: process.env.RPC_URL_MANTLE_TESTNET || "",
      accounts: accounts,
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.ETHERSCAN_API_KEY_MUMBAI || "",
    },
  },
};

export default config;
