import { ethers, run, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Adım 3: MTATimelock + MTAGovernor deploy et.
 * Kullanım: npx hardhat run scripts/deploy/03_deploy_governance.ts --network sepolia
 */
async function main() {
  const [deployer] = await ethers.getSigners();

  const filePath = path.join(__dirname, `../../deployments/${network.name}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error("Önce 01 ve 02 adımlarını çalıştırın.");
  }

  const deployments = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const tokenAddress = deployments.contracts.MTAToken;

  console.log("═══════════════════════════════════════════");
  console.log(" MetaAras (MTA) — Governance Deployment");
  console.log("═══════════════════════════════════════════");

  // 1. Timelock deploy
  const TimelockFactory = await ethers.getContractFactory("MTATimelock");
  const timelock = await TimelockFactory.deploy(
    [],              // proposers — sonra Governor eklenir
    [],              // executors — sonra Governor eklenir
    deployer.address // geçici admin
  );
  await timelock.waitForDeployment();
  const timelockAddress = await timelock.getAddress();
  console.log(`✓ MTATimelock deployed: ${timelockAddress}`);

  // 2. Governor deploy
  const GovernorFactory = await ethers.getContractFactory("MTAGovernor");
  const governor = await GovernorFactory.deploy(tokenAddress, timelockAddress);
  await governor.waitForDeployment();
  const governorAddress = await governor.getAddress();
  console.log(`✓ MTAGovernor deployed: ${governorAddress}`);

  // 3. Timelock rollerini yapılandır
  const PROPOSER_ROLE  = await timelock.PROPOSER_ROLE();
  const EXECUTOR_ROLE  = await timelock.EXECUTOR_ROLE();
  const CANCELLER_ROLE = await timelock.CANCELLER_ROLE();
  const ADMIN_ROLE     = await timelock.DEFAULT_ADMIN_ROLE();

  // Governor → Proposer yetkisi
  await (await timelock.grantRole(PROPOSER_ROLE, governorAddress)).wait();
  console.log("✓ Governor PROPOSER_ROLE alındı");

  // Herkese executor yetkisi (address(0) = open)
  await (await timelock.grantRole(EXECUTOR_ROLE, ethers.ZeroAddress)).wait();
  console.log("✓ EXECUTOR_ROLE herkese açıldı");

  // Deployer admin yetkisini bırak
  await (await timelock.renounceRole(ADMIN_ROLE, deployer.address)).wait();
  console.log("✓ Deployer Timelock admin yetkisini bıraktı");

  // Deployment kaydını güncelle
  deployments.contracts.MTATimelock  = timelockAddress;
  deployments.contracts.MTAGovernor  = governorAddress;
  fs.writeFileSync(filePath, JSON.stringify(deployments, null, 2));
  console.log("✓ Deployment kaydı güncellendi");

  if (network.name !== "hardhat" && network.name !== "localhost") {
    await governor.deploymentTransaction()?.wait(5);

    for (const [name, address, args] of [
      ["MTATimelock", timelockAddress, [[], [], deployer.address]],
      ["MTAGovernor", governorAddress, [tokenAddress, timelockAddress]],
    ] as [string, string, any[]][]) {
      try {
        await run("verify:verify", { address, constructorArguments: args });
        console.log(`✓ ${name} Etherscan doğrulandı`);
      } catch (err: any) {
        if (!err.message.includes("Already Verified")) {
          console.error(`✗ ${name} doğrulama hatası:`, err.message);
        }
      }
    }
  }

  console.log("═══════════════════════════════════════════");
  console.log(" Governance deployment tamamlandı!");
  console.log(" DAO artık tamamen on-chain.");
  console.log("═══════════════════════════════════════════");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
