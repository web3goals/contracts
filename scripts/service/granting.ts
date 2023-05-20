import { ethers } from "hardhat";
import { Profile__factory } from "../../typechain-types";

async function main() {
  console.log("👟 Start granting service");

  // Init account
  const accountWallet = new ethers.Wallet(
    process.env.PRIVATE_KEY_1 || "",
    ethers.provider
  );

  // Define params
  const profileContractAddress = "";
  const adopterRole =
    "0xda6932890fdef07b36a62305c028a643afd06243ecfcbff56464bc65c1309d50";
  const userAddress = "";

  // Execute transactions
  const txOne = await Profile__factory.connect(
    profileContractAddress,
    accountWallet
  ).hasRole(adopterRole, userAddress);
  console.log("txOne:", txOne);

  const txTwo = await Profile__factory.connect(
    profileContractAddress,
    accountWallet
  ).grantRole(adopterRole, userAddress);
  console.log("txTwo:", txTwo);
  await txTwo.wait();

  const txThree = await Profile__factory.connect(
    profileContractAddress,
    accountWallet
  ).hasRole(adopterRole, userAddress);
  console.log("txThree:", txThree);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
