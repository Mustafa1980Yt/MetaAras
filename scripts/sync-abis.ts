/**
 * sync-abis.ts
 *
 * Compiled Hardhat artifact'larından frontend ABI JSON dosyalarını günceller.
 * Kontrat değiştiğinde `npm run sync-abis` çalıştır.
 *
 * Kullanım: npm run sync-abis
 */

import * as fs   from "fs";
import * as path from "path";

const ARTIFACTS_DIR = path.join(__dirname, "../artifacts/contracts");
const ABI_OUT_DIR   = path.join(__dirname, "../frontend/src/lib/contracts");

const CONTRACTS: Array<{ name: string; artifactPath: string }> = [
  { name: "MTAToken",    artifactPath: "core/MTAToken.sol/MTAToken.json" },
  { name: "MTAStaking",  artifactPath: "core/MTAStaking.sol/MTAStaking.json" },
  { name: "MTAVesting",  artifactPath: "core/MTAVesting.sol/MTAVesting.json" },
  { name: "MTAGovernor", artifactPath: "governance/MTAGovernor.sol/MTAGovernor.json" },
];

let updated = 0;
let failed  = 0;

for (const { name, artifactPath } of CONTRACTS) {
  const src = path.join(ARTIFACTS_DIR, artifactPath);
  const dst = path.join(ABI_OUT_DIR,   `${name}.abi.json`);

  if (!fs.existsSync(src)) {
    console.error(`  ✗ Artifact bulunamadı: ${src}`);
    console.error(`    Önce 'npm run compile' çalıştırın.`);
    failed++;
    continue;
  }

  const artifact = JSON.parse(fs.readFileSync(src, "utf-8"));
  const abi      = artifact.abi;

  if (!Array.isArray(abi) || abi.length === 0) {
    console.error(`  ✗ ${name}: ABI boş veya geçersiz`);
    failed++;
    continue;
  }

  fs.writeFileSync(dst, JSON.stringify(abi, null, 2) + "\n", "utf-8");
  console.log(`  ✓ ${name}.abi.json → ${abi.length} entries`);
  updated++;
}

console.log(`\n${updated} ABI güncellendi${failed > 0 ? `, ${failed} hata` : ""}.`);
if (failed > 0) process.exitCode = 1;
