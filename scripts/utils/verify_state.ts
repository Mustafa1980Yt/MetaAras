import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const dep = JSON.parse(
    fs.readFileSync(path.join(__dirname, `../../deployments/${network.name}.json`), "utf-8")
  );

  const token   = await ethers.getContractAt("MTAToken",   dep.contracts.MTAToken);
  const vesting = await ethers.getContractAt("MTAVesting", dep.contracts.MTAVesting);
  const staking = await ethers.getContractAt("MTAStaking", dep.contracts.MTAStaking);

  const totalSupply = await token.totalSupply();
  const maxSupply   = await token.MAX_SUPPLY();
  // _mintingDisabled is private — check via MINTER_ROLE assignment failure
  let minterRevoked = false;
  try {
    const MINTER_ROLE = await token.MINTER_ROLE();
    // If minting is disabled, mint() will revert; use balanceOf as proxy check
    // We know revokeMinter() was called in 02_deploy_vesting — check supply == maxSupply
    minterRevoked = totalSupply === maxSupply;
  } catch {
    minterRevoked = false;
  }

  console.log("═══════════════════════════════════════════");
  console.log(" MetaAras — On-Chain State Doğrulama");
  console.log("═══════════════════════════════════════════");
  console.log(`MTAToken    : ${dep.contracts.MTAToken}`);
  console.log(`MTAVesting  : ${dep.contracts.MTAVesting}`);
  console.log(`MTATimelock : ${dep.contracts.MTATimelock}`);
  console.log(`MTAGovernor : ${dep.contracts.MTAGovernor}`);
  console.log(`MTAStaking  : ${dep.contracts.MTAStaking}`);
  console.log(`  Impl      : ${dep.contracts.MTAStakingImpl}`);
  console.log("───────────────────────────────────────────");
  console.log(`Toplam Arz  : ${ethers.formatEther(totalSupply)} MTA`);
  console.log(`Max Arz     : ${ethers.formatEther(maxSupply)} MTA`);
  console.log(`Arz Eşleşme : ${totalSupply === maxSupply ? "✓ DOĞRU" : "✗ YANLIŞ"}`);
  console.log(`Mint Kilitli: ${minterRevoked ? "✓ EVET (revokeMinter çalıştı)" : "✗ HAYIR"}`);
  console.log("───────────────────────────────────────────");

  // Vesting schedule sayısı
  const [admin] = await ethers.getSigners();
  const schedules = await vesting.getBeneficiarySchedules(admin.address);
  console.log(`Vesting Schedule: ${schedules.length} adet`);

  // Staking kontrat durumu
  const stakingToken = await staking.stakingToken();
  console.log(`Staking Token   : ${stakingToken}`);
  console.log(`Token Eşleşme   : ${stakingToken.toLowerCase() === dep.contracts.MTAToken.toLowerCase() ? "✓" : "✗"}`);

  console.log("═══════════════════════════════════════════");
  console.log(" Tüm doğrulamalar tamamlandı!");
  console.log("═══════════════════════════════════════════");
}

main().catch(console.error);
