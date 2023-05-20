import { ethers } from "hardhat";
import { Profile__factory } from "../typechain-types";

async function main() {
  // Define contract deployer
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];

  // Execute transaction
  const transaction = await Profile__factory.connect(
    "0xBfd1b773C4Af9C430883EDC9e70D4b4a4BF8E4d2",
    deployer
  ).name();
  console.log("Transaction result:", transaction);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
