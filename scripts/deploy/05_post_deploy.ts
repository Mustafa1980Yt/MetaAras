import { ethers, network } from "hardhat";
import { Contract } from "ethers";
import * as fs from "fs";
import * as path from "path";

/**
 * Adım 5: Post-deploy yapılandırma.
 *
 * Transferler:
 *   MTAToken:
 *     DEFAULT_ADMIN_ROLE  → multisig
 *     PAUSER_ROLE         → multisig
 *     BLACKLISTER_ROLE    → multisig
 *     (Deployer tüm token rollerini bırakır)
 *
 *   MTAStaking:
 *     DEFAULT_ADMIN_ROLE  → multisig
 *     PAUSER_ROLE         → multisig
 *     (Deployer staking rollerini bırakır)
 *
 *   MTAVesting:
 *     DEFAULT_ADMIN_ROLE  → multisig
 *     (Deployer vesting rolünü bırakır)
 *
 * UYARI: Bu adım geri alınamaz.
 *        Multisig adresinin Gnosis Safe olduğundan ve eşik imzalı
 *        olduğundan emin ol. Yanlış adres girilirse kontratlar kilitleniр.
 *
 * Kullanım: npx hardhat run scripts/deploy/05_post_deploy.ts --network mainnet
 */

const PAUSER_ROLE      = ethers.keccak256(ethers.toUtf8Bytes("PAUSER_ROLE"));
const BLACKLISTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BLACKLISTER_ROLE"));
const ADMIN_ROLE       = ethers.ZeroHash; // DEFAULT_ADMIN_ROLE = 0x000...000

const MTA_TOKEN_ABI = [
  "function grantRole(bytes32 role, address account) external",
  "function renounceRole(bytes32 role, address callerConfirmation) external",
  "function hasRole(bytes32 role, address account) external view returns (bool)",
];

const MTA_VESTING_ABI = [
  "function grantRole(bytes32 role, address account) external",
  "function renounceRole(bytes32 role, address callerConfirmation) external",
  "function hasRole(bytes32 role, address account) external view returns (bool)",
];

const MTA_STAKING_ABI = [
  "function grantRole(bytes32 role, address account) external",
  "function renounceRole(bytes32 role, address callerConfirmation) external",
  "function hasRole(bytes32 role, address account) external view returns (bool)",
];

async function grantAndLog(
  contract: Contract,
  role: string,
  roleName: string,
  target: string,
  label: string
) {
  const already = await contract.hasRole(role, target);
  if (already) {
    console.log(`  ✓ ${label} ${roleName} → zaten verilmiş`);
    return;
  }
  await (await contract.grantRole(role, target)).wait();
  console.log(`  ✓ ${label} ${roleName} → ${target}`);
}

async function renounceAndLog(
  contract: Contract,
  role: string,
  roleName: string,
  deployer: string,
  label: string
) {
  const has = await contract.hasRole(role, deployer);
  if (!has) {
    console.log(`  ✓ ${label} ${roleName} → deployer zaten sahip değil`);
    return;
  }
  await (await contract.renounceRole(role, deployer)).wait();
  console.log(`  ✓ ${label} ${roleName} → deployer rolü bıraktı`);
}

async function main() {
  const [deployer] = await ethers.getSigners();

  const filePath = path.join(__dirname, `../../deployments/${network.name}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error("Önce 01–04 adımlarını çalıştırın. Deployment dosyası bulunamadı: " + filePath);
  }

  const deployments = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const { MTAToken: tokenAddr, MTAVesting: vestingAddr, MTAStaking: stakingAddr } = deployments.contracts;

  const multisig = process.env.MULTISIG_ADDRESS;
  if (!multisig || multisig === "0x0000000000000000000000000000000000000000") {
    throw new Error(
      "MULTISIG_ADDRESS ayarlanmamış!\n" +
      "Mainnet'te Gnosis Safe 3/5 adresi girilmesi zorunludur.\n" +
      "Testnet'te bile farklı bir adres kullanılması önerilir."
    );
  }

  // Multisig kodu kontrol et (EOA değil, kontrat olmalı — mainnet'te)
  const code = await ethers.provider.getCode(multisig);
  if (network.name === "mainnet" || network.name === "bsc") {
    if (code === "0x") {
      throw new Error(
        `MULTISIG_ADDRESS (${multisig}) bir EOA görünüyor (kod yok).\n` +
        "Mainnet'te Gnosis Safe gibi bir multi-sig kontrat kullanılmalı."
      );
    }
  }

  console.log("═══════════════════════════════════════════");
  console.log(" MetaAras (MTA) — Post-Deploy Rol Transferi");
  console.log("═══════════════════════════════════════════");
  console.log(`Network  : ${network.name}`);
  console.log(`Deployer : ${deployer.address}`);
  console.log(`Multisig : ${multisig}`);
  if (code !== "0x") console.log(`           (kontrat doğrulandı ✓)`);
  console.log("───────────────────────────────────────────");

  const token   = new ethers.Contract(tokenAddr,   MTA_TOKEN_ABI,   deployer);
  const vesting = new ethers.Contract(vestingAddr, MTA_VESTING_ABI, deployer);
  const staking = new ethers.Contract(stakingAddr, MTA_STAKING_ABI, deployer);

  // ── 1. MTAToken Rol Transferleri ──────────────────────────────────────────
  console.log("\n[1/3] MTAToken:");
  await grantAndLog(token,  ADMIN_ROLE,       "DEFAULT_ADMIN_ROLE",  multisig, "Token");
  await grantAndLog(token,  PAUSER_ROLE,      "PAUSER_ROLE",         multisig, "Token");
  await grantAndLog(token,  BLACKLISTER_ROLE, "BLACKLISTER_ROLE",    multisig, "Token");

  await renounceAndLog(token, ADMIN_ROLE,       "DEFAULT_ADMIN_ROLE",  deployer.address, "Token");
  await renounceAndLog(token, PAUSER_ROLE,      "PAUSER_ROLE",         deployer.address, "Token");
  await renounceAndLog(token, BLACKLISTER_ROLE, "BLACKLISTER_ROLE",    deployer.address, "Token");

  // ── 2. MTAVesting Rol Transferi ──────────────────────────────────────────
  console.log("\n[2/3] MTAVesting:");
  await grantAndLog(vesting,  ADMIN_ROLE, "DEFAULT_ADMIN_ROLE", multisig, "Vesting");
  await renounceAndLog(vesting, ADMIN_ROLE, "DEFAULT_ADMIN_ROLE", deployer.address, "Vesting");

  // ── 3. MTAStaking Rol Transferleri ───────────────────────────────────────
  console.log("\n[3/3] MTAStaking:");
  await grantAndLog(staking,  ADMIN_ROLE,  "DEFAULT_ADMIN_ROLE", multisig, "Staking");
  await grantAndLog(staking,  PAUSER_ROLE, "PAUSER_ROLE",        multisig, "Staking");
  await renounceAndLog(staking, ADMIN_ROLE,  "DEFAULT_ADMIN_ROLE", deployer.address, "Staking");
  await renounceAndLog(staking, PAUSER_ROLE, "PAUSER_ROLE",        deployer.address, "Staking");

  // ── Deployment kaydını güncelle ──────────────────────────────────────────
  deployments.postDeploy = {
    multisig,
    adminTransferred: new Date().toISOString(),
    deployer: deployer.address,
    rolesTransferred: [
      "MTAToken:DEFAULT_ADMIN_ROLE",
      "MTAToken:PAUSER_ROLE",
      "MTAToken:BLACKLISTER_ROLE",
      "MTAVesting:DEFAULT_ADMIN_ROLE",
      "MTAStaking:DEFAULT_ADMIN_ROLE",
      "MTAStaking:PAUSER_ROLE",
    ],
  };
  fs.writeFileSync(filePath, JSON.stringify(deployments, null, 2));

  // ── Adres özeti ───────────────────────────────────────────────────────────
  const currency  = network.name === "bsc" || network.name === "bscTestnet" ? "BNB" : "ETH";
  const explorer  = {
    mainnet:    "https://etherscan.io/address",
    sepolia:    "https://sepolia.etherscan.io/address",
    bsc:        "https://bscscan.com/address",
    bscTestnet: "https://testnet.bscscan.com/address",
  }[network.name] ?? "";

  const addressSummary = [
    `# MetaAras Contract Addresses — ${network.name}`,
    `# Generated: ${new Date().toISOString()}`,
    `# Admin: ${multisig}`,
    ``,
    `MTAToken:    ${tokenAddr}`,
    `MTAVesting:  ${vestingAddr}`,
    `MTAStaking:  ${stakingAddr}`,
    `MTAGovernor: ${deployments.contracts.MTAGovernor ?? "N/A"}`,
    `MTATimelock: ${deployments.contracts.MTATimelock ?? "N/A"}`,
    `Multisig:    ${multisig}`,
    explorer ? `` : ``,
    explorer ? `# Explorer:` : ``,
    ...(explorer ? Object.entries(deployments.contracts).map(
      ([k, v]) => `#   ${k.padEnd(15)}: ${explorer}/${v}`
    ) : []),
  ].join("\n");

  const addrPath = path.join(__dirname, `../../deployments/${network.name}_addresses.txt`);
  fs.writeFileSync(addrPath, addressSummary);

  console.log("\n═══════════════════════════════════════════");
  console.log(" Post-deploy yapılandırma tamamlandı!");
  console.log("───────────────────────────────────────────");
  console.log(` Multisig      : ${multisig}`);
  console.log(` Adres özeti   : deployments/${network.name}_addresses.txt`);
  console.log("");
  console.log(" Sonraki adımlar:");
  console.log(`   npm run sync-env:${network.name}`);
  console.log("   cd frontend && npm run build && npm run start");
  if (network.name === "mainnet" || network.name === "bsc") {
    console.log(`   npm run approve-rewards:${network.name}`);
  }
  console.log("═══════════════════════════════════════════");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
