import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Adım 5: Post-deploy yapılandırma.
 * - Admin rollerini multisig'e transfer et
 * - Deployer yetkilerini iptal et
 * - Deployment özeti yaz
 *
 * Kullanım: npx hardhat run scripts/deploy/05_post_deploy.ts --network sepolia
 * UYARI: Bu adım geri alınamaz. Multisig adresini doğruladıktan sonra çalıştır.
 */
async function main() {
  const [deployer] = await ethers.getSigners();

  const filePath = path.join(__dirname, `../../deployments/${network.name}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error("Önce 01–04 adımlarını çalıştırın.");
  }

  const deployments = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const { MTAToken, MTAVesting, MTAStaking, MTAGovernor, MTATimelock } = deployments.contracts;

  const multisig = process.env.MULTISIG_ADDRESS;
  if (!multisig || multisig === "0x0000000000000000000000000000000000000000") {
    throw new Error("MULTISIG_ADDRESS env değişkeni ayarlanmamış! .env dosyasını kontrol edin.");
  }

  console.log("═══════════════════════════════════════════");
  console.log(" MetaAras (MTA) — Post-Deploy Config");
  console.log("═══════════════════════════════════════════");
  console.log(`Network  : ${network.name}`);
  console.log(`Deployer : ${deployer.address}`);
  console.log(`Multisig : ${multisig}`);
  console.log("───────────────────────────────────────────");

  const token   = await ethers.getContractAt("MTAToken",   MTAToken);
  const staking = await ethers.getContractAt("MTAStaking", MTAStaking);

  // DEFAULT_ADMIN_ROLE
  const ADMIN_ROLE = ethers.ZeroHash; // 0x000...000

  // 1. Token admin'i multisig'e ver
  await (await token.grantRole(ADMIN_ROLE, multisig)).wait();
  console.log("✓ Token DEFAULT_ADMIN_ROLE → multisig");

  // 2. Staking admin'i multisig'e ver
  await (await staking.grantRole(ADMIN_ROLE, multisig)).wait();
  console.log("✓ Staking DEFAULT_ADMIN_ROLE → multisig");

  // 3. Deployer'ın token admin rolünü iptal et
  await (await token.renounceRole(ADMIN_ROLE, deployer.address)).wait();
  console.log("✓ Deployer token admin rolü iptal edildi");

  // 4. Deployer'ın staking admin rolünü iptal et
  await (await staking.renounceRole(ADMIN_ROLE, deployer.address)).wait();
  console.log("✓ Deployer staking admin rolü iptal edildi");

  // 5. Frontend env dosyası oluştur
  const wcProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id";
  const networkEnv  = network.name === "mainnet" || network.name === "bsc" ? "mainnet" : "testnet";

  const envContent = `# MetaAras Frontend — ${network.name} Deployment
# Generated: ${new Date().toISOString()}
# Source: scripts/deploy/05_post_deploy.ts
# DO NOT COMMIT this file to version control

NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=${wcProjectId}
NEXT_PUBLIC_NETWORK_ENV=${networkEnv}

NEXT_PUBLIC_MTA_TOKEN_ADDRESS=${MTAToken}
NEXT_PUBLIC_MTA_STAKING_ADDRESS=${MTAStaking}
NEXT_PUBLIC_MTA_VESTING_ADDRESS=${MTAVesting || ""}
NEXT_PUBLIC_MTA_GOVERNOR_ADDRESS=${MTAGovernor || ""}
NEXT_PUBLIC_MTA_TIMELOCK_ADDRESS=${MTATimelock || ""}
`;

  const frontendEnvPath = path.join(__dirname, "../../frontend/.env.local");
  fs.writeFileSync(frontendEnvPath, envContent);
  console.log(`✓ Frontend .env.local oluşturuldu: ${frontendEnvPath}`);

  // 6. Deployment özeti
  const summary = {
    ...deployments,
    postDeploy: {
      multisig,
      adminTransferred: new Date().toISOString(),
      deployer: deployer.address,
    },
  };
  fs.writeFileSync(filePath, JSON.stringify(summary, null, 2));

  // 7. Kontrat adresleri özeti
  const addressSummary = `# MetaAras Contract Addresses — ${network.name}
# Generated: ${new Date().toISOString()}

MTAToken:   ${MTAToken}
MTAVesting: ${MTAVesting || "N/A"}
MTAStaking: ${MTAStaking || "N/A"}
MTAGovernor: ${MTAGovernor || "N/A"}
MTATimelock: ${MTATimelock || "N/A"}
Multisig:   ${multisig}
`;
  const addressPath = path.join(__dirname, `../../deployments/${network.name}_addresses.txt`);
  fs.writeFileSync(addressPath, addressSummary);
  console.log(`✓ Adres özeti kaydedildi: ${addressPath}`);

  console.log("═══════════════════════════════════════════");
  console.log(" Post-deploy yapılandırma tamamlandı!");
  console.log(" Admin yetkileri multisig'e devredildi.");
  console.log("═══════════════════════════════════════════");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
