/**
 * preflight.ts
 *
 * Deploy öncesi ortam değişkenlerini ve ağ bağlantısını doğrular.
 *
 * Kullanım:
 *   npm run preflight:sepolia
 *   npm run preflight:bscTestnet
 */

import { ethers, network } from "hardhat";

const IS_BSC = network.name === "bsc" || network.name === "bscTestnet";

const REQUIRED_VARS: Record<string, string> = {
  PRIVATE_KEY:       "Deployer private key",
  ...(IS_BSC
    ? { BSCSCAN_API_KEY: "BSC kontrat doğrulama için" }
    : { ALCHEMY_API_KEY: "Ethereum/Sepolia RPC endpoint için",
        ETHERSCAN_API_KEY: "Kontrat doğrulama için" }),
};

const PLACEHOLDER_PATTERNS = [
  "DEĞİŞTİR",
  "your_",
  "BURAYA",
  "0x000000000000000000000000000000000000000",
];

function isPlaceholder(val: string): boolean {
  return PLACEHOLDER_PATTERNS.some((p) => val.includes(p));
}

const MIN_BALANCE: Record<string, string> = {
  sepolia:    "0.05",
  bscTestnet: "0.05",
  mainnet:    "0.30",
  bsc:        "0.10",
};

const FAUCETS: Record<string, string> = {
  sepolia:    "https://sepoliafaucet.com",
  bscTestnet: "https://testnet.binance.org/faucet-smart",
};

async function main() {
  console.log("╔═══════════════════════════════════════════╗");
  console.log("║  MetaAras — Deploy Preflight Kontrolü    ║");
  console.log("╚═══════════════════════════════════════════╝");
  console.log(`Network : ${network.name}`);
  console.log("");

  if (network.name === "mainnet" || network.name === "bsc") {
    console.error("🚫 MAINNET DEPLOY ENGELLENDI!");
    console.error("   Audit tamamlanmadan mainnet'e deploy yapılamaz.");
    console.error("   Bkz: MAINNET_READINESS.md");
    process.exitCode = 1;
    return;
  }

  const errors:   string[] = [];
  const warnings: string[] = [];

  // ── Zorunlu env değişkenleri ──────────────────────────────────────────────
  console.log("[ 1/4 ] Ortam Değişkenleri Kontrolü");
  for (const [key, desc] of Object.entries(REQUIRED_VARS)) {
    const val = process.env[key] || "";
    if (!val) {
      errors.push(`${key} ayarlanmamış (${desc})`);
    } else if (isPlaceholder(val)) {
      errors.push(`${key} hâlâ placeholder değer içeriyor`);
    } else {
      console.log(`  ✓ ${key}`);
    }
  }

  const multisig = process.env.MULTISIG_ADDRESS || "";
  if (!multisig || multisig === "0x0000000000000000000000000000000000000000") {
    warnings.push("MULTISIG_ADDRESS ayarlanmamış — deployer adresi fallback olarak kullanılacak");
  } else {
    console.log(`  ✓ MULTISIG_ADDRESS: ${multisig}`);
  }

  // ── Private key format ────────────────────────────────────────────────────
  console.log("\n[ 2/4 ] Private Key Format Kontrolü");
  const pk = process.env.PRIVATE_KEY || "";
  if (pk && !isPlaceholder(pk)) {
    if (!pk.startsWith("0x") || pk.length !== 66) {
      errors.push("PRIVATE_KEY formatı hatalı (0x + 64 hex karakter olmalı)");
    } else {
      try {
        const wallet = new ethers.Wallet(pk);
        console.log(`  ✓ Deployer adresi: ${wallet.address}`);
      } catch {
        errors.push("PRIVATE_KEY geçersiz");
      }
    }
  }

  // ── Ağ bağlantısı ─────────────────────────────────────────────────────────
  console.log("\n[ 3/4 ] Ağ Bağlantısı Kontrolü");
  try {
    const [deployer] = await ethers.getSigners();
    const balance    = await ethers.provider.getBalance(deployer.address);
    const chainId    = (await ethers.provider.getNetwork()).chainId;
    const block      = await ethers.provider.getBlockNumber();
    const currency   = IS_BSC ? "BNB" : "ETH";

    console.log(`  ✓ Bağlı: chainId ${chainId}, blok ${block}`);
    console.log(`  ✓ Deployer bakiye: ${ethers.formatEther(balance)} ${currency}`);

    const minBal = MIN_BALANCE[network.name] ?? "0.15";
    if (balance < ethers.parseEther(minBal)) {
      errors.push(`Yetersiz bakiye! En az ${minBal} ${currency} gerekli (mevcut: ${ethers.formatEther(balance)})`);
      const faucet = FAUCETS[network.name];
      if (faucet) errors.push(`  Faucet: ${faucet}`);
    }
  } catch (e: any) {
    errors.push(`Ağa bağlanılamadı: ${e.message}`);
    if (IS_BSC) {
      errors.push("  BSC Testnet RPC: https://data-seed-prebsc-1-s1.binance.org:8545");
    } else {
      errors.push("  ALCHEMY_API_KEY kontrolü yap: https://dashboard.alchemy.com");
    }
  }

  // ── Deployment çakışma kontrolü ───────────────────────────────────────────
  console.log("\n[ 4/4 ] Deployment Çakışma Kontrolü");
  const fs   = require("fs");
  const path = require("path");
  const depFile = path.join(__dirname, `../deployments/${network.name}.json`);

  if (fs.existsSync(depFile)) {
    const existing = JSON.parse(fs.readFileSync(depFile, "utf-8"));
    warnings.push(`deployments/${network.name}.json mevcut (${existing.deployedAt})`);
    warnings.push("  Deploy scriptleri mevcut dosyanın üzerine yazar.");
    if (existing.contracts?.MTAToken) {
      warnings.push(`  Mevcut MTAToken: ${existing.contracts.MTAToken}`);
    }
  } else {
    console.log(`  ✓ deployments/${network.name}.json yok — temiz deploy`);
  }

  // ── Sonuç ─────────────────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════");
  if (warnings.length > 0) {
    console.log("UYARILAR:");
    warnings.forEach((w) => console.log(`  ⚠ ${w}`));
  }

  if (errors.length > 0) {
    console.log("\nHATALAR (düzeltilmeden deploy yapılamaz):");
    errors.forEach((e) => console.error(`  ✗ ${e}`));
    console.log("\n✗ Preflight başarısız. .env dosyasını kontrol et.");
    process.exitCode = 1;
  } else {
    console.log(`\n✓ Preflight geçti! Deploy için hazır.`);
    console.log(`  Komut: npm run deploy:${network.name}`);
  }
  console.log("═══════════════════════════════════════════");
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
