import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * verify_state.ts
 *
 * Deploy sonrası on-chain durumu doğrular.
 * Mainnet deploy sonrası bu scripti çalıştırmadan frontend'i canlıya alma.
 *
 * Kullanım:
 *   npm run state:sepolia
 *   npm run state:mainnet
 */

const PAUSER_ROLE      = ethers.keccak256(ethers.toUtf8Bytes("PAUSER_ROLE"));
const BLACKLISTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BLACKLISTER_ROLE"));
const MINTER_ROLE      = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
const UPGRADER_ROLE    = ethers.keccak256(ethers.toUtf8Bytes("UPGRADER_ROLE"));
const ADMIN_ROLE       = ethers.ZeroHash;

const TOKEN_ABI = [
  "function totalSupply() external view returns (uint256)",
  "function MAX_SUPPLY() external view returns (uint256)",
  "function mintingDisabled() external view returns (bool)",
  "function paused() external view returns (bool)",
  "function hasRole(bytes32 role, address account) external view returns (bool)",
  "function circulatingSupply() external view returns (uint256)",
];

const STAKING_ABI = [
  "function stakingToken() external view returns (address)",
  "function globalTotalStaked() external view returns (uint256)",
  "function paused() external view returns (bool)",
  "function hasRole(bytes32 role, address account) external view returns (bool)",
];

const VESTING_ABI = [
  "function token() external view returns (address)",
  "function hasRole(bytes32 role, address account) external view returns (bool)",
];

const TIMELOCK_ABI = [
  "function getMinDelay() external view returns (uint256)",
  "function hasRole(bytes32 role, address account) external view returns (bool)",
  "function PROPOSER_ROLE() external view returns (bytes32)",
  "function EXECUTOR_ROLE() external view returns (bytes32)",
];

const GOVERNOR_ABI = [
  "function token() external view returns (address)",
  "function timelock() external view returns (address)",
  "function votingDelay() external view returns (uint256)",
  "function votingPeriod() external view returns (uint256)",
  "function proposalThreshold() external view returns (uint256)",
];

function check(label: string, ok: boolean, detail = "") {
  const icon = ok ? "✓" : "✗";
  const suffix = detail ? ` (${detail})` : "";
  if (!ok) {
    console.error(`  ${icon} HATA: ${label}${suffix}`);
  } else {
    console.log(`  ${icon} ${label}${suffix}`);
  }
  return ok;
}

async function main() {
  const [deployer] = await ethers.getSigners();

  const filePath = path.join(__dirname, `../../deployments/${network.name}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Deployment dosyası bulunamadı: ${filePath}`);
  }

  const dep = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const { MTAToken: tokenAddr, MTAVesting: vestingAddr, MTATimelock: timelockAddr, MTAGovernor: govAddr, MTAStaking: stakingAddr } = dep.contracts;
  const multisig  = dep.postDeploy?.multisig ?? null;
  const currency  = network.name === "bsc" || network.name === "bscTestnet" ? "BNB" : "ETH";

  const token    = new ethers.Contract(tokenAddr,    TOKEN_ABI,    deployer);
  const staking  = new ethers.Contract(stakingAddr,  STAKING_ABI,  deployer);
  const vesting  = new ethers.Contract(vestingAddr,  VESTING_ABI,  deployer);
  const timelock = new ethers.Contract(timelockAddr, TIMELOCK_ABI, deployer);
  const governor = new ethers.Contract(govAddr,      GOVERNOR_ABI, deployer);

  let errors = 0;

  console.log("═══════════════════════════════════════════════════");
  console.log(" MetaAras — On-Chain State Doğrulama");
  console.log("═══════════════════════════════════════════════════");
  console.log(` Network   : ${network.name}`);
  console.log(` Deployer  : ${deployer.address}`);
  console.log(` Multisig  : ${multisig ?? "(postDeploy yapılmadı)"}`);
  console.log("───────────────────────────────────────────────────");

  // ── 1. Kontrat Adresleri ──────────────────────────────────────────────────
  console.log("\n[1/6] Kontrat Adresleri:");
  for (const [name, addr] of Object.entries(dep.contracts)) {
    const code = await ethers.provider.getCode(addr as string);
    const ok = code !== "0x";
    if (!check(`${name}: ${addr}`, ok, ok ? "kod var" : "KOD YOK!")) errors++;
  }

  // ── 2. Token Durumu ───────────────────────────────────────────────────────
  console.log("\n[2/6] MTAToken Durumu:");
  const totalSupply = await token.totalSupply();
  const maxSupply   = await token.MAX_SUPPLY();
  const mintingOff  = await token.mintingDisabled();
  const tokenPaused = await token.paused();
  const circulating = await token.circulatingSupply();

  check(`Toplam Arz: ${ethers.formatEther(totalSupply)} MTA`, true);
  check(`Max Arz: ${ethers.formatEther(maxSupply)} MTA`, maxSupply === 100_000_000n * 10n**18n, "100M");
  if (!check("Minting kapalı (mintingDisabled = true)", mintingOff)) errors++;
  if (!check("Token pause değil", !tokenPaused)) errors++;
  check(`Dolaşımdaki: ${ethers.formatEther(circulating)} MTA`, true);

  // ── 3. Rol Kontrolleri ────────────────────────────────────────────────────
  console.log("\n[3/6] Rol Kontrolleri:");
  if (multisig) {
    // Token rolleri multisig'de
    const tokenAdminOk  = await token.hasRole(ADMIN_ROLE, multisig);
    const tokenPauserOk = await token.hasRole(PAUSER_ROLE, multisig);
    const tokenBlackOk  = await token.hasRole(BLACKLISTER_ROLE, multisig);
    if (!check("MTAToken DEFAULT_ADMIN → multisig", tokenAdminOk)) errors++;
    if (!check("MTAToken PAUSER_ROLE → multisig", tokenPauserOk)) errors++;
    if (!check("MTAToken BLACKLISTER_ROLE → multisig", tokenBlackOk)) errors++;

    // Deployer rolleri bırakmış mı?
    const deployerAdmin = await token.hasRole(ADMIN_ROLE, deployer.address);
    if (!check("MTAToken DEFAULT_ADMIN deployer'da YOK", !deployerAdmin, deployerAdmin ? "deployer hâlâ admin!" : "")) errors++;

    // Staking rolleri
    const stakingAdminOk  = await staking.hasRole(ADMIN_ROLE, multisig);
    const stakingPauserOk = await staking.hasRole(PAUSER_ROLE, multisig);
    if (!check("MTAStaking DEFAULT_ADMIN → multisig", stakingAdminOk)) errors++;
    if (!check("MTAStaking PAUSER_ROLE → multisig", stakingPauserOk)) errors++;

    // Vesting
    const vestingAdminOk = await vesting.hasRole(ADMIN_ROLE, multisig);
    if (!check("MTAVesting DEFAULT_ADMIN → multisig", vestingAdminOk)) errors++;
  } else {
    console.log("  ⚠ postDeploy tamamlanmadı — rol kontrolleri atlanıyor");
    console.log("    Çalıştır: npm run deploy:post:" + network.name);
  }

  // Minter herkeste yok mu?
  const deployerMinter = await token.hasRole(MINTER_ROLE, deployer.address);
  if (!check("MTAToken MINTER_ROLE kimseye verilmemiş", !deployerMinter)) errors++;

  // ── 4. Timelock ───────────────────────────────────────────────────────────
  console.log("\n[4/6] MTATimelock Durumu:");
  const minDelay    = await timelock.getMinDelay();
  const PROPOSER    = await timelock.PROPOSER_ROLE();
  const EXECUTOR    = await timelock.EXECUTOR_ROLE();
  const govIsProposer = await timelock.hasRole(PROPOSER, govAddr);
  const zeroIsExecutor = await timelock.hasRole(EXECUTOR, ethers.ZeroAddress);
  const adminRenounced = !(await timelock.hasRole(ADMIN_ROLE, deployer.address));

  check(`MIN_DELAY: ${minDelay}s (${Number(minDelay)/3600}h)`, minDelay >= 172800n, "≥48h");
  if (!check("PROPOSER_ROLE → Governor", govIsProposer)) errors++;
  if (!check("EXECUTOR_ROLE → address(0) (open execution)", zeroIsExecutor)) errors++;
  if (!check("DEFAULT_ADMIN renounced (deployer'da yok)", adminRenounced)) errors++;

  // ── 5. Governor ───────────────────────────────────────────────────────────
  console.log("\n[5/6] MTAGovernor Durumu:");
  const govToken    = await governor.token();
  const govTimelock = await governor.timelock();
  const votingDelay = await governor.votingDelay();
  const votingPeriod = await governor.votingPeriod();
  const threshold   = await governor.proposalThreshold();

  if (!check("Governor token → MTAToken", govToken.toLowerCase() === tokenAddr.toLowerCase())) errors++;
  if (!check("Governor timelock → MTATimelock", govTimelock.toLowerCase() === timelockAddr.toLowerCase())) errors++;
  check(`Voting Delay: ${votingDelay} blocks`, true);
  check(`Voting Period: ${votingPeriod} blocks`, true);
  check(`Threshold: ${ethers.formatEther(threshold)} MTA`, true);

  // ── 6. Staking ───────────────────────────────────────────────────────────
  console.log("\n[6/6] MTAStaking Durumu:");
  const stakingTokenAddr = await staking.stakingToken();
  const globalStaked     = await staking.globalTotalStaked();
  const stakingPaused    = await staking.paused();

  if (!check("Staking token → MTAToken", stakingTokenAddr.toLowerCase() === tokenAddr.toLowerCase())) errors++;
  check(`Global Staked: ${ethers.formatEther(globalStaked)} MTA`, true);
  if (!check("Staking pause değil", !stakingPaused)) errors++;

  // ── Sonuç ─────────────────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════");
  if (errors === 0) {
    console.log(" ✓ Tüm kontroller GEÇTI — Deploy güvenli");
  } else {
    console.error(` ✗ ${errors} HATA BULUNDU — Frontend'i canlıya almadan önce düzelt!`);
    process.exitCode = 1;
  }
  console.log("═══════════════════════════════════════════════════");
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
