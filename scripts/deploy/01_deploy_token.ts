import { ethers, run, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Adım 1: MTAToken'ı deploy et ve Etherscan'da doğrula.
 * Kullanım: npx hardhat run scripts/deploy/01_deploy_token.ts --network sepolia
 */
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("═══════════════════════════════════════════");
  console.log(" MetaAras (MTA) — Token Deployment");
  console.log("═══════════════════════════════════════════");
  console.log(`Network  : ${network.name}`);
  console.log(`Deployer : ${deployer.address}`);
  console.log(`Balance  : ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);
  console.log("───────────────────────────────────────────");

  // Env kontrolleri
  const multisig  = process.env.MULTISIG_ADDRESS  || deployer.address;
  const minter    = deployer.address; // Geçici — dağılım sonrası revoke

  console.log(`Admin    : ${deployer.address}`);
  console.log(`Minter   : ${minter}`);
  console.log(`Multisig : ${multisig}`);
  console.log("───────────────────────────────────────────");

  // Deploy
  const MTAToken = await ethers.getContractFactory("MTAToken");
  const token = await MTAToken.deploy(
    deployer.address,  // admin
    minter,            // minter
    multisig,          // pauser
    multisig           // blacklister
  );

  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  console.log(`✓ MTAToken deployed: ${tokenAddress}`);

  // Deployment kaydı
  const deploymentData = {
    network: network.name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    contracts: {
      MTAToken: tokenAddress,
    },
    deployedAt: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
  };

  const deploymentsDir = path.join(__dirname, "../../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filePath = path.join(deploymentsDir, `${network.name}.json`);
  let existing: any = {};
  if (fs.existsSync(filePath)) {
    existing = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  fs.writeFileSync(
    filePath,
    JSON.stringify({ ...existing, ...deploymentData }, null, 2)
  );
  console.log(`✓ Deployment kaydedildi: ${filePath}`);

  // Etherscan doğrulama (testnet/mainnet)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("───────────────────────────────────────────");
    console.log("⏳ Etherscan doğrulama için bekleniyor (15 blok)...");
    await token.deploymentTransaction()?.wait(15);

    try {
      await run("verify:verify", {
        address: tokenAddress,
        constructorArguments: [
          deployer.address,
          minter,
          multisig,
          multisig,
        ],
      });
      console.log("✓ Etherscan doğrulandı");
    } catch (err: any) {
      if (err.message.includes("Already Verified")) {
        console.log("✓ Zaten doğrulanmış");
      } else {
        console.error("✗ Doğrulama hatası:", err.message);
      }
    }
  }

  console.log("═══════════════════════════════════════════");
  console.log(" MTAToken deployment tamamlandı!");
  console.log("═══════════════════════════════════════════");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
