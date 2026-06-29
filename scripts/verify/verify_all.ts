import { run, network, ethers, upgrades } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Tüm deploy edilmiş kontratları Etherscan/BscScan'da doğrular.
 *
 * Kullanım:
 *   npx hardhat run scripts/verify/verify_all.ts --network sepolia
 *   npx hardhat run scripts/verify/verify_all.ts --network bscTestnet
 *
 * Not: MTAStaking UUPS proxy olduğu için implementation adresi ayrıca doğrulanır.
 */
async function verifyContract(
  name: string,
  address: string,
  constructorArgs: unknown[]
): Promise<boolean> {
  console.log(`\n[Verify] ${name} @ ${address}`);
  try {
    await run("verify:verify", {
      address,
      constructorArguments: constructorArgs,
    });
    console.log(`  ✓ ${name} doğrulandı`);
    return true;
  } catch (err: any) {
    if (
      err.message.includes("Already Verified") ||
      err.message.includes("already verified")
    ) {
      console.log(`  ✓ ${name} zaten doğrulanmış`);
      return true;
    }
    console.error(`  ✗ ${name} doğrulama hatası: ${err.message}`);
    return false;
  }
}

async function main() {
  if (network.name === "hardhat" || network.name === "localhost") {
    console.error("Doğrulama yalnızca testnet/mainnet için çalışır.");
    process.exitCode = 1;
    return;
  }

  const filePath = path.join(__dirname, `../../deployments/${network.name}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Deployment dosyası bulunamadı: ${filePath}\nÖnce deploy scriptlerini çalıştırın.`
    );
  }

  const deployments = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const [deployer] = await ethers.getSigners();

  console.log("═══════════════════════════════════════════");
  console.log(" MetaAras — Kontrat Doğrulama");
  console.log("═══════════════════════════════════════════");
  console.log(`Network  : ${network.name}`);
  console.log(`Deployer : ${deployer.address}`);

  const multisig = process.env.MULTISIG_ADDRESS || deployer.address;
  const treasury = process.env.TREASURY_WALLET  || deployer.address;

  const results: Record<string, boolean> = {};

  // ── MTAToken ──────────────────────────────────────────────────────────────
  if (deployments.contracts.MTAToken) {
    results.MTAToken = await verifyContract(
      "MTAToken",
      deployments.contracts.MTAToken,
      [
        deployer.address, // admin
        deployer.address, // minter (dağılım sonrası revoke edilmiş)
        multisig,         // pauser
        multisig,         // blacklister
      ]
    );
  }

  // ── MTAVesting ────────────────────────────────────────────────────────────
  if (deployments.contracts.MTAVesting) {
    results.MTAVesting = await verifyContract(
      "MTAVesting",
      deployments.contracts.MTAVesting,
      [
        deployments.contracts.MTAToken,
        treasury,
        deployer.address,
      ]
    );
  }

  // ── MTATimelock ───────────────────────────────────────────────────────────
  if (deployments.contracts.MTATimelock) {
    results.MTATimelock = await verifyContract(
      "MTATimelock",
      deployments.contracts.MTATimelock,
      [
        [], // proposers (Governor sonradan eklendi)
        [], // executors (open — address(0))
        deployer.address,
      ]
    );
  }

  // ── MTAGovernor ───────────────────────────────────────────────────────────
  if (deployments.contracts.MTAGovernor) {
    results.MTAGovernor = await verifyContract(
      "MTAGovernor",
      deployments.contracts.MTAGovernor,
      [
        deployments.contracts.MTAToken,
        deployments.contracts.MTATimelock,
      ]
    );
  }

  // ── MTAStaking (UUPS Proxy) ───────────────────────────────────────────────
  // UUPS proxy: implementation contract doğrulanır, proxy değil.
  // Implementation adresi deployment dosyasında kaydedilmiş olmalı (04_deploy_staking.ts).
  if (deployments.contracts.MTAStaking) {
    const proxyAddr = deployments.contracts.MTAStaking;
    const implAddr  = deployments.contracts.MTAStakingImpl;

    if (implAddr) {
      // Implementation contract doğrula (constructor yok — proxy tarafından initialize edildi)
      console.log(`\n[Verify] MTAStaking proxy @ ${proxyAddr}`);
      console.log(`         MTAStaking impl  @ ${implAddr}`);
      results.MTAStaking = await verifyContract("MTAStaking (implementation)", implAddr, []);
    } else {
      // Fallback: doğrudan proxy adresini dene
      results.MTAStaking = await verifyContract("MTAStaking (proxy)", proxyAddr, []);
    }
  }

  // ── Özet ──────────────────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════");
  console.log(" Doğrulama Özeti");
  console.log("═══════════════════════════════════════════");
  const allPassed = Object.values(results).every(Boolean);
  for (const [name, ok] of Object.entries(results)) {
    console.log(`  ${ok ? "✓" : "✗"} ${name}`);
  }
  console.log("═══════════════════════════════════════════");

  if (!allPassed) {
    console.error("\n⚠ Bazı kontratlar doğrulanamadı. Yukarıdaki hataları kontrol edin.");
    process.exitCode = 1;
  } else {
    console.log("\n✓ Tüm kontratlar başarıyla doğrulandı!");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
