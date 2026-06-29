/**
 * sync-env.ts
 *
 * deployments/{network}.json dosyasını okuyarak frontend/.env.local'a
 * ağa özgü env değişkenleri ekler. Birden fazla ağ deploy edildiğinde
 * her ağın adresleri aynı .env.local dosyasında bir arada bulunur.
 *
 * Env var prefix'leri:
 *   sepolia    → NEXT_PUBLIC_ETH_SEPOLIA_MTA_*
 *   bscTestnet → NEXT_PUBLIC_BSC_TESTNET_MTA_*
 *   mainnet    → NEXT_PUBLIC_ETH_MAINNET_MTA_*
 *   bsc        → NEXT_PUBLIC_BSC_MAINNET_MTA_*
 *   localhost  → .env.local'a yazılmaz (hardhat adresleri statik)
 *
 * Kullanım:
 *   npm run sync-env:sepolia
 *   npm run sync-env:bscTestnet
 */

import * as fs   from "fs";
import * as path from "path";

const NETWORK = process.argv[2] || "localhost";

const DEPLOYMENTS_DIR = path.join(__dirname, "../deployments");
const FRONTEND_ENV    = path.join(__dirname, "../frontend/.env.local");
const DEPLOYMENT_FILE = path.join(DEPLOYMENTS_DIR, `${NETWORK}.json`);

// ── Network → env prefix mapping ─────────────────────────────────────────────
const ENV_PREFIX: Record<string, string> = {
  sepolia:    "ETH_SEPOLIA",
  bscTestnet: "BSC_TESTNET",
  mainnet:    "ETH_MAINNET",
  bsc:        "BSC_MAINNET",
  localhost:  "HARDHAT",
};

const prefix = ENV_PREFIX[NETWORK];
if (!prefix) {
  console.error(`\n✗ Desteklenmeyen ağ: ${NETWORK}`);
  console.error(`  Desteklenenler: ${Object.keys(ENV_PREFIX).join(", ")}`);
  process.exit(1);
}

// ── Deployment dosyasını oku ──────────────────────────────────────────────────
if (!fs.existsSync(DEPLOYMENT_FILE)) {
  console.error(`\n✗ Deployment dosyası bulunamadı: ${DEPLOYMENT_FILE}`);
  console.error(`  Önce deploy edin: npm run deploy:${NETWORK}`);
  process.exit(1);
}

const dep       = JSON.parse(fs.readFileSync(DEPLOYMENT_FILE, "utf-8"));
const contracts = dep.contracts as Record<string, string>;

const required = ["MTAToken", "MTAVesting", "MTATimelock", "MTAGovernor", "MTAStaking"];
const missing  = required.filter((k) => !contracts[k]);
if (missing.length > 0) {
  console.error(`\n✗ Eksik kontrat adresleri: ${missing.join(", ")}`);
  console.error(`  Deployment tamamlanmamış olabilir.`);
  process.exit(1);
}

// ── Mevcut .env.local içeriğini oku ──────────────────────────────────────────
let existingContent = "";
if (fs.existsSync(FRONTEND_ENV)) {
  existingContent = fs.readFileSync(FRONTEND_ENV, "utf-8");
}

// Mevcut içerikten bu ağın satırlarını temizle (yeniden yaz)
const prefixPattern = new RegExp(
  `^NEXT_PUBLIC_${prefix}_MTA_[A-Z_]+=.*$\n?`,
  "gm"
);
let cleanedContent = existingContent.replace(prefixPattern, "");

// NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: env'den veya mevcut dosyadan al
let walletConnectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";
if (!walletConnectId) {
  const wcMatch = existingContent.match(/^NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=(.+)$/m);
  if (wcMatch) walletConnectId = wcMatch[1].trim();
}
if (!walletConnectId) {
  walletConnectId = "demo-project-id";
  console.warn("  ⚠ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ayarlanmamış — demo-project-id kullanılıyor");
}

// NEXT_PUBLIC_NETWORK_ENV hesapla
const networkEnv =
  NETWORK === "mainnet" || NETWORK === "bsc" ? "mainnet"     :
  NETWORK === "localhost"                     ? "development" :
                                               "testnet";

// Explorer URL'leri
const explorerBase: Record<string, string> = {
  sepolia:    "https://sepolia.etherscan.io/address",
  bscTestnet: "https://testnet.bscscan.com/address",
  mainnet:    "https://etherscan.io/address",
  bsc:        "https://bscscan.com/address",
};
const base = explorerBase[NETWORK];
const explorerLines = base
  ? required.map((k) => `# ${k.padEnd(15)}: ${base}/${contracts[k]}`).join("\n")
  : "# (localhost — block explorer yok)";

// ── Yeni blok oluştur ─────────────────────────────────────────────────────────
const newBlock = `
# ── ${NETWORK} Deployment (${new Date().toISOString().slice(0, 10)}) ─────────────────────────────────
NEXT_PUBLIC_${prefix}_MTA_TOKEN_ADDRESS=${contracts.MTAToken}
NEXT_PUBLIC_${prefix}_MTA_STAKING_ADDRESS=${contracts.MTAStaking}
NEXT_PUBLIC_${prefix}_MTA_VESTING_ADDRESS=${contracts.MTAVesting}
NEXT_PUBLIC_${prefix}_MTA_GOVERNOR_ADDRESS=${contracts.MTAGovernor}
NEXT_PUBLIC_${prefix}_MTA_TIMELOCK_ADDRESS=${contracts.MTATimelock}
# ${explorerLines.replace(/\n/g, "\n# ")}
`;

// Dosyanın başında gerekli ortak satırlar yoksa ekle
function ensureLine(content: string, line: string): string {
  if (content.includes(line.split("=")[0])) {
    return content.replace(new RegExp(`^${line.split("=")[0]}=.*$`, "m"), line);
  }
  return line + "\n" + content;
}

let finalContent = cleanedContent.trim();

// WalletConnect ve network env ekle / güncelle
finalContent = ensureLine(finalContent, `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=${walletConnectId}`);
finalContent = ensureLine(finalContent, `NEXT_PUBLIC_NETWORK_ENV=${networkEnv}`);

// Ağ bloğunu sona ekle
finalContent = finalContent + newBlock;

// Dosya başlığı yoksa ekle
if (!finalContent.startsWith("# MetaAras Frontend")) {
  finalContent = `# MetaAras Frontend — Multichain Env\n# Bu dosyayı elle düzenleme — sync-env komutlarıyla yenile.\n# Git'e commit etme.\n\n` + finalContent;
}

fs.writeFileSync(FRONTEND_ENV, finalContent.trim() + "\n", "utf-8");

// ── Özet ──────────────────────────────────────────────────────────────────────
console.log("\n╔═══════════════════════════════════════════╗");
console.log(`║  sync-env: ${NETWORK.padEnd(31)}║`);
console.log("╚═══════════════════════════════════════════╝");
console.log(`  Prefix  : NEXT_PUBLIC_${prefix}_MTA_*`);
console.log(`  Kaynak  : deployments/${NETWORK}.json`);
console.log(`  Hedef   : frontend/.env.local`);
console.log("");
for (const k of required) {
  console.log(`  ${k.padEnd(14)}: ${contracts[k]}`);
}
console.log("");
console.log("  Sonraki adım:");
console.log(`    cd frontend && npm run build`);
console.log("");
