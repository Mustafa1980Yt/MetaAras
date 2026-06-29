/**
 * verify_bsc.ts
 *
 * BNB Smart Chain ağları için kontrat doğrulama (BscScan).
 * Desteklenen ağlar: bsc, bscTestnet
 *
 * Kullanım:
 *   npm run verify:bscTestnet
 *   npm run verify:bsc
 */

import { run, network, ethers } from "hardhat";
import * as fs   from "fs";
import * as path from "path";

const SUPPORTED = ["bsc", "bscTestnet"];

async function verifyContract(
  name: string,
  address: string,
  constructorArgs: unknown[]
): Promise<boolean> {
  console.log(`\n[Verify] ${name} @ ${address}`);
  try {
    await run("verify:verify", { address, constructorArguments: constructorArgs });
    console.log(`  ✓ ${name} doğrulandı`);
    return true;
  } catch (err: any) {
    if (err.message.toLowerCase().includes("already verified")) {
      console.log(`  ✓ ${name} zaten doğrulanmış`);
      return true;
    }
    console.error(`  ✗ ${name} doğrulama hatası: ${err.message}`);
    return false;
  }
}

async function main() {
  if (!SUPPORTED.includes(network.name)) {
    console.error(`Bu script yalnızca BSC ağları için: ${SUPPORTED.join(", ")}`);
    console.error(`Ethereum için: npm run verify:sepolia veya npm run verify:mainnet`);
    process.exitCode = 1;
    return;
  }

  if (!process.env.BSCSCAN_API_KEY) {
    console.error("BSCSCAN_API_KEY ayarlanmamış. .env dosyasını kontrol et.");
    process.exitCode = 1;
    return;
  }

  const filePath = path.join(__dirname, `../../deployments/${network.name}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Deployment dosyası bulunamadı: ${filePath}`);
  }

  const deployments = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const [deployer]  = await ethers.getSigners();
  const _msRaw   = process.env.MULTISIG_ADDRESS || "";
  const multisig = (!_msRaw || _msRaw === "0x0000000000000000000000000000000000000000") ? deployer.address : _msRaw;
  const treasury = process.env.TREASURY_WALLET || deployer.address;

  const explorerBase = network.name === "bsc"
    ? "https://bscscan.com"
    : "https://testnet.bscscan.com";

  console.log("═══════════════════════════════════════════");
  console.log(" MetaAras — BSC Kontrat Doğrulama");
  console.log("═══════════════════════════════════════════");
  console.log(`Network  : ${network.name} (chainId ${deployments.chainId})`);
  console.log(`Deployer : ${deployer.address}`);
  console.log(`Explorer : ${explorerBase}`);

  const results: Record<string, boolean> = {};

  if (deployments.contracts.MTAToken) {
    results.MTAToken = await verifyContract("MTAToken", deployments.contracts.MTAToken, [
      deployer.address,
      deployer.address,
      multisig,
      multisig,
    ]);
  }

  if (deployments.contracts.MTAVesting) {
    results.MTAVesting = await verifyContract("MTAVesting", deployments.contracts.MTAVesting, [
      deployments.contracts.MTAToken,
      treasury,
      deployer.address,
    ]);
  }

  if (deployments.contracts.MTATimelock) {
    results.MTATimelock = await verifyContract("MTATimelock", deployments.contracts.MTATimelock, [
      [], [], deployer.address,
    ]);
  }

  if (deployments.contracts.MTAGovernor) {
    results.MTAGovernor = await verifyContract("MTAGovernor", deployments.contracts.MTAGovernor, [
      deployments.contracts.MTAToken,
      deployments.contracts.MTATimelock,
    ]);
  }

  if (deployments.contracts.MTAStaking) {
    const implAddr = deployments.contracts.MTAStakingImpl;
    if (implAddr) {
      console.log(`\n[Verify] MTAStaking proxy  @ ${deployments.contracts.MTAStaking}`);
      console.log(`         MTAStaking impl   @ ${implAddr}`);
      results.MTAStaking = await verifyContract("MTAStaking (implementation)", implAddr, []);
    } else {
      results.MTAStaking = await verifyContract("MTAStaking", deployments.contracts.MTAStaking, []);
    }
  }

  console.log("\n═══════════════════════════════════════════");
  console.log(" Doğrulama Özeti");
  console.log("═══════════════════════════════════════════");
  const allPassed = Object.values(results).every(Boolean);
  for (const [name, ok] of Object.entries(results)) {
    console.log(`  ${ok ? "✓" : "✗"} ${name}`);
  }

  if (!allPassed) {
    console.error("\n⚠ Bazı kontratlar doğrulanamadı.");
    process.exitCode = 1;
  } else {
    console.log("\n✓ Tüm BSC kontratları doğrulandı!");
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
