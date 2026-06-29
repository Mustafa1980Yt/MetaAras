import { ethers, run, network, upgrades } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Adım 4: MTAStaking deploy et (UUPS Upgradeable Proxy).
 * Kullanım: npx hardhat run scripts/deploy/04_deploy_staking.ts --network sepolia
 *
 * MTAStaking bir UUPS proxy kontratıdır — doğrudan deploy edilmez,
 * OpenZeppelin upgrades.deployProxy() ile deploy edilir.
 */
async function main() {
  const [deployer] = await ethers.getSigners();

  const filePath = path.join(__dirname, `../../deployments/${network.name}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error("Önce 01–03 adımlarını çalıştırın. Deployment dosyası bulunamadı: " + filePath);
  }

  const deployments = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const tokenAddress = deployments.contracts.MTAToken;
  if (!tokenAddress) {
    throw new Error("MTAToken adresi deployment dosyasında bulunamadı.");
  }

  const _msRaw       = process.env.MULTISIG_ADDRESS || "";
  const multisig     = (!_msRaw || _msRaw === "0x0000000000000000000000000000000000000000")
    ? deployer.address : _msRaw;
  const _twRaw       = process.env.TREASURY_WALLET || "";
  const rewardWallet = (!_twRaw || _twRaw === "0x0000000000000000000000000000000000000000")
    ? deployer.address : _twRaw;

  console.log("═══════════════════════════════════════════");
  console.log(" MetaAras (MTA) — Staking Deployment (UUPS)");
  console.log("═══════════════════════════════════════════");
  console.log(`Network      : ${network.name}`);
  console.log(`Deployer     : ${deployer.address}`);
  console.log(`Token        : ${tokenAddress}`);
  console.log(`Reward Pool  : ${rewardWallet}`);
  console.log(`Admin/Pauser : ${multisig}`);
  console.log("───────────────────────────────────────────");

  const StakingFactory = await ethers.getContractFactory("MTAStaking");

  // UUPS proxy deploy — initialize(stakingToken, rewardsPool, admin, pauser)
  const staking = await upgrades.deployProxy(
    StakingFactory,
    [
      tokenAddress,   // _stakingToken
      rewardWallet,   // _rewardsPool (external wallet that approves staking contract)
      multisig,       // _admin
      multisig,       // _pauser
    ],
    { kind: "uups", initializer: "initialize" }
  );
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log(`✓ MTAStaking (proxy) deployed: ${stakingAddress}`);

  // Implementation adresini kaydet (doğrulama için)
  const implAddress = await upgrades.erc1967.getImplementationAddress(stakingAddress);
  console.log(`✓ MTAStaking (implementation): ${implAddress}`);

  // Deployment kaydı güncelle
  deployments.contracts.MTAStaking           = stakingAddress;
  deployments.contracts.MTAStakingImpl       = implAddress;
  fs.writeFileSync(filePath, JSON.stringify(deployments, null, 2));
  console.log("✓ Deployment kaydı güncellendi");

  console.log("");
  console.log("⚠  Önemli: Reward pool wallet'ının staking kontratını approve etmesi gerekiyor:");
  console.log(`   token.approve(${stakingAddress}, MAX_UINT256) — ${rewardWallet} adresinden`);

  // Etherscan doğrulama — UUPS proxy için implementation doğrulanır
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("───────────────────────────────────────────");
    console.log("⏳ Etherscan doğrulama için bekleniyor (5 blok)...");
    const deployTx = staking.deploymentTransaction();
    if (deployTx) await deployTx.wait(5);

    try {
      // Proxy adresini doğrula — OZ plugin otomatik impl'i de doğrular
      await run("verify:verify", {
        address: stakingAddress,
        constructorArguments: [],
      });
      console.log("✓ MTAStaking proxy doğrulandı");
    } catch (err: any) {
      if (err.message.includes("Already Verified")) {
        console.log("✓ Zaten doğrulanmış");
      } else {
        // Implementation'ı doğrulamayı dene
        try {
          await run("verify:verify", {
            address: implAddress,
            constructorArguments: [],
          });
          console.log("✓ MTAStaking implementation doğrulandı");
        } catch (implErr: any) {
          if (!implErr.message.includes("Already Verified")) {
            console.error("✗ Doğrulama hatası:", implErr.message);
          }
        }
      }
    }
  }

  console.log("═══════════════════════════════════════════");
  console.log(" MTAStaking deployment tamamlandı!");
  console.log("═══════════════════════════════════════════");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
