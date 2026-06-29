import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Reward pool cüzdanı staking kontratını approve eder.
 * MTAStaking ödülleri için TREASURY_WALLET'ın bu tx'i çalıştırması gerekir.
 *
 * Kullanım:
 *   TREASURY_WALLET_KEY=0x... npx hardhat run scripts/utils/approve_rewards.ts --network sepolia
 */
async function main() {
  const filePath = path.join(__dirname, `../../deployments/${(await ethers.provider.getNetwork()).name}.json`);
  const dep = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const [signer] = await ethers.getSigners();
  const token = await ethers.getContractAt("MTAToken", dep.contracts.MTAToken, signer);

  console.log(`Signer       : ${signer.address}`);
  console.log(`Token        : ${dep.contracts.MTAToken}`);
  console.log(`Staking      : ${dep.contracts.MTAStaking}`);

  const currentAllowance = await token.allowance(signer.address, dep.contracts.MTAStaking);
  if (currentAllowance === ethers.MaxUint256) {
    console.log("✓ Zaten approve edilmiş (MaxUint256)");
    return;
  }

  const tx = await token.approve(dep.contracts.MTAStaking, ethers.MaxUint256);
  await tx.wait();
  console.log(`✓ Approve TX: ${tx.hash}`);
  console.log("✓ Staking reward pool approve tamamlandı");
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
