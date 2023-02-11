# Web3 Goals Contracts

## Commands

- Install dependencies - `npm install`
- Clean project - `npx hardhat clean`
- Compile contracts and generate TypeChain - `npx hardhat compile`
- Run tests - `npx hardhat test`
- Deploy contracts - `npx hardhat run scripts/deploy.ts --network mumbai`
- Verify contract - `npx hardhat verify --network mumbai 0xE78Ec547bdE5697c1Dd2B32524c9a51F4385CC08`
- Run sandbox script - `npx hardhat run scripts/sandbox.ts --network mumbai`

## How to enable notifications in the goal contract for mumbai network?

1. Deploy goal contract.
2. Set `epnsCommContractAddress` (`0xb3971bcef2d791bc4027bbfedfb47319a4aaaaaa`)
3. Set `epnsChannelAddress` (`0x4306d7a79265d2cb85db0c5a55ea5f4f6f73c4b1`)
4. Add proxy address of goal contract to channel delegates on the [EPNS dashboard](https://staging.push.org/#/dashboard)

## Links

- Debugging with hardhat - https://hardhat.org/tutorial/debugging-with-hardhat-network
