import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeployVaultModule = buildModule("DeployVaultModule", (m) => {
  // Deploy VaultBTC first
  const vaultBTC = m.contract("VaultBTC");

  // Deploy AIVault with VaultBTC address
  const aiVault = m.contract("AIVault", [vaultBTC]);

  return { vaultBTC, aiVault };
});

export default DeployVaultModule;

