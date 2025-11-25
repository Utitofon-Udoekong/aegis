import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy VaultBTC
  console.log("\nDeploying VaultBTC...");
  const VaultBTC = await ethers.getContractFactory("VaultBTC");
  const vaultBTC = await VaultBTC.deploy();
  await vaultBTC.waitForDeployment();
  const vaultBTCAddress = await vaultBTC.getAddress();
  console.log("VaultBTC deployed to:", vaultBTCAddress);

  // Deploy AIVault
  console.log("\nDeploying AIVault...");
  const AIVault = await ethers.getContractFactory("AIVault");
  const aiVault = await AIVault.deploy(vaultBTCAddress);
  await aiVault.waitForDeployment();
  const aiVaultAddress = await aiVault.getAddress();
  console.log("AIVault deployed to:", aiVaultAddress);

  console.log("\n=== Deployment Summary ===");
  console.log("VaultBTC Address:", vaultBTCAddress);
  console.log("AIVault Address:", aiVaultAddress);
  console.log("\nAdd these to your .env file:");
  console.log(`VAULTBTC_ADDRESS=${vaultBTCAddress}`);
  console.log(`VAULT_CONTRACT_ADDRESS=${aiVaultAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

