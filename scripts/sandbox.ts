import { ethers } from "hardhat";
import { Profile__factory } from "../typechain-types";

async function main() {
  // Init account
  const accountWallet = new ethers.Wallet(
    process.env.PRIVATE_KEY_1 || "",
    ethers.provider
  );

  // Execute transaction
  const transaction = await Profile__factory.connect(
    "0xBfd1b773C4Af9C430883EDC9e70D4b4a4BF8E4d2",
    accountWallet
  ).name();
  console.log("Transaction result:", transaction);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
