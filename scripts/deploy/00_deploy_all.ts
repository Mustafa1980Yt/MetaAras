import { run, network } from "hardhat";
import * as path from "path";

/**
 * Master deploy script — tüm adımları sırayla çalıştırır.
 *
 * Kullanım:
 *   npx hardhat run scripts/deploy/00_deploy_all.ts --network sepolia
 *   npx hardhat run scripts/deploy/00_deploy_all.ts --network bscTestnet
 *
 * Gereksinimler:
 *   - .env dosyasında PRIVATE_KEY, ALCHEMY_API_KEY (Sepolia için) set edilmiş olmalı
 *   - Deployer wallet'ında yeterli test ETH/BNB olmalı
 *
 * UYARI: Mainnet deploy için bu script değil, adım adım scriptleri kullan.
 */
async function main() {
  console.log("╔═══════════════════════════════════════════╗");
  console.log("║  MetaAras (MTA) — Full Deploy Pipeline   ║");
  console.log("╚═══════════════════════════════════════════╝");
  console.log(`Network: ${network.name}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log("");

  if (network.name === "mainnet" || network.name === "bsc") {
    throw new Error(
      "🚫 MAINNET DEPLOY ENGELLENDI! Adım adım scriptleri kullanın ve önce audit tamamlayın."
    );
  }

  const scripts = [
    "scripts/deploy/01_deploy_token.ts",
    "scripts/deploy/02_deploy_vesting.ts",
    "scripts/deploy/03_deploy_governance.ts",
    "scripts/deploy/04_deploy_staking.ts",
  ];

  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    console.log(`\n[${i + 1}/${scripts.length}] Running: ${script}`);
    console.log("─".repeat(50));
    try {
      await run("run", { script, noCompile: true });
    } catch (err: any) {
      console.error(`\n✗ Hata: ${script}`);
      console.error(err.message);
      process.exitCode = 1;
      return;
    }
  }

  console.log("\n╔═══════════════════════════════════════════╗");
  console.log("║  Tüm kontratlar başarıyla deploy edildi!  ║");
  console.log("╚═══════════════════════════════════════════╝");
  console.log("\nSonraki adım (opsiyonel):");
  console.log("  npx hardhat run scripts/deploy/05_post_deploy.ts --network " + network.name);
  console.log("  (Admin rollerini multisig'e devretmek için)");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
