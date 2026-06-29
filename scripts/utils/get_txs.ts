import { ethers } from "hardhat";

async function main() {
  const provider = ethers.provider;
  const blockCount = await provider.getBlockNumber();
  console.log("Son blok:", blockCount);

  const deployments = require("../../deployments/localhost.json");
  const contractAddresses = new Set(
    Object.values(deployments.contracts as Record<string, string>).map((a: string) => a.toLowerCase())
  );

  for (let i = 1; i <= blockCount; i++) {
    const block = await provider.getBlock(i, true);
    if (!block) continue;
    for (const tx of (block as any).prefetchedTransactions ?? []) {
      const receipt = await provider.getTransactionReceipt(tx.hash);
      const created = receipt?.contractAddress?.toLowerCase();
      const label = created && contractAddresses.has(created)
        ? Object.entries(deployments.contracts).find(([, v]) => (v as string).toLowerCase() === created)?.[0] ?? "unknown"
        : null;
      if (label || (!tx.to)) {
        console.log(`Block ${i} | ${label ?? "deploy"} | TX: ${tx.hash} | Contract: ${receipt?.contractAddress ?? tx.to}`);
      }
    }
  }
}

main().catch(console.error);
