import { ethers, run, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { parseEther } from "ethers";

/**
 * Adım 2: MTAVesting deploy et + token dağılımını gerçekleştir.
 * Kullanım: npx hardhat run scripts/deploy/02_deploy_vesting.ts --network sepolia
 */
async function main() {
  const [deployer] = await ethers.getSigners();

  const filePath = path.join(__dirname, `../../deployments/${network.name}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Önce 01_deploy_token.ts çalıştırın. ${filePath} bulunamadı.`);
  }

  const deployments = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const tokenAddress = deployments.contracts.MTAToken;

  console.log("═══════════════════════════════════════════");
  console.log(" MetaAras (MTA) — Vesting Deployment");
  console.log("═══════════════════════════════════════════");
  console.log(`Token    : ${tokenAddress}`);

  const ZERO = "0x0000000000000000000000000000000000000000";
  const resolveAddr = (v: string | undefined) => (!v || v === ZERO) ? deployer.address : v;
  const treasuryWallet   = resolveAddr(process.env.TREASURY_WALLET);
  const teamWallet       = resolveAddr(process.env.TEAM_WALLET);
  const seedWallet       = resolveAddr(process.env.SEED_WALLET);
  const ecosystemWallet  = resolveAddr(process.env.ECOSYSTEM_WALLET);
  const liquidityWallet  = resolveAddr(process.env.LIQUIDITY_WALLET);
  const publicSaleWallet = resolveAddr(process.env.PUBLIC_SALE_WALLET);

  // Tokenomics miktarları
  const TEAM_AMOUNT        = parseEther("15000000");   // %15
  const SEED_AMOUNT        = parseEther("10000000");   // %10
  const ECOSYSTEM_AMOUNT   = parseEther("35000000");   // %35
  const LIQUIDITY_AMOUNT   = parseEther("20000000");   // %20
  const TREASURY_AMOUNT    = parseEther("15000000");   // %15
  const PUBLIC_SALE_AMOUNT = parseEther("5000000");    //  %5

  // Vesting süreler (saniye)
  const TEAM_CLIFF    = 12 * 30 * 24 * 3600; // 12 ay
  const TEAM_VESTING  = 36 * 30 * 24 * 3600; // 36 ay
  const SEED_CLIFF    =  6 * 30 * 24 * 3600; //  6 ay
  const SEED_VESTING  = 18 * 30 * 24 * 3600; // 18 ay

  // Kontrat bağlantısı
  const token = await ethers.getContractAt("MTAToken", tokenAddress);

  // MTAVesting deploy
  const VestingFactory = await ethers.getContractFactory("MTAVesting");
  const vesting = await VestingFactory.deploy(
    tokenAddress,
    treasuryWallet,
    deployer.address
  );
  await vesting.waitForDeployment();
  const vestingAddress = await vesting.getAddress();
  console.log(`✓ MTAVesting deployed: ${vestingAddress}`);

  // Mint: Vesting kontratına
  console.log("⏳ Vesting tokenları mint ediliyor...");
  const vestingTotal = TEAM_AMOUNT + SEED_AMOUNT;
  await (await token.mint(vestingAddress, vestingTotal)).wait();
  console.log(`✓ Vesting kontratına ${ethers.formatEther(vestingTotal)} MTA mint edildi`);

  // Mint: Doğrudan cüzdanlar
  await (await token.mint(ecosystemWallet, ECOSYSTEM_AMOUNT)).wait();
  console.log(`✓ Ecosystem: ${ethers.formatEther(ECOSYSTEM_AMOUNT)} MTA`);

  await (await token.mint(liquidityWallet, LIQUIDITY_AMOUNT)).wait();
  console.log(`✓ Liquidity: ${ethers.formatEther(LIQUIDITY_AMOUNT)} MTA`);

  await (await token.mint(treasuryWallet, TREASURY_AMOUNT)).wait();
  console.log(`✓ Treasury: ${ethers.formatEther(TREASURY_AMOUNT)} MTA`);

  await (await token.mint(publicSaleWallet, PUBLIC_SALE_AMOUNT)).wait();
  console.log(`✓ Public Sale: ${ethers.formatEther(PUBLIC_SALE_AMOUNT)} MTA`);

  // Vesting schedule'ları oluştur
  console.log("⏳ Vesting schedule'ları oluşturuluyor...");

  const teamScheduleTx = await vesting.createSchedule(
    teamWallet,
    TEAM_AMOUNT,
    0,
    TEAM_CLIFF,
    TEAM_VESTING,
    true
  );
  await teamScheduleTx.wait();
  console.log(`✓ Takım vesting: ${teamWallet} — 12ay cliff, 36ay lineer`);

  const seedScheduleTx = await vesting.createSchedule(
    seedWallet,
    SEED_AMOUNT,
    0,
    SEED_CLIFF,
    SEED_VESTING,
    true
  );
  await seedScheduleTx.wait();
  console.log(`✓ Seed vesting: ${seedWallet} — 6ay cliff, 18ay lineer`);

  // Mint'i kalıcı olarak kilitle
  console.log("⏳ Minter yetkisi iptal ediliyor...");
  await (await token.revokeMinter()).wait();
  console.log("✓ Minting kalıcı olarak devre dışı bırakıldı");

  // Toplam arz doğrula
  const totalSupply = await token.totalSupply();
  const maxSupply = await token.MAX_SUPPLY();
  console.log(`✓ Toplam arz: ${ethers.formatEther(totalSupply)} / ${ethers.formatEther(maxSupply)} MTA`);

  // Deployment kaydını güncelle
  deployments.contracts.MTAVesting = vestingAddress;
  fs.writeFileSync(filePath, JSON.stringify(deployments, null, 2));
  console.log("✓ Deployment kaydı güncellendi");

  // Etherscan doğrulama
  if (network.name !== "hardhat" && network.name !== "localhost") {
    await vesting.deploymentTransaction()?.wait(5);
    try {
      await run("verify:verify", {
        address: vestingAddress,
        constructorArguments: [tokenAddress, treasuryWallet, deployer.address],
      });
      console.log("✓ MTAVesting Etherscan doğrulandı");
    } catch (err: any) {
      if (!err.message.includes("Already Verified")) {
        console.error("✗ Doğrulama hatası:", err.message);
      }
    }
  }

  console.log("═══════════════════════════════════════════");
  console.log(" Token dağılımı tamamlandı!");
  console.log("═══════════════════════════════════════════");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
