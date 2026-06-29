# MetaAras Deployments

This directory contains deployment records generated automatically by the deploy scripts.
JSON files and address text files are **gitignored** — only this README is tracked.

## Files

| File | Description | Committed? |
|------|-------------|-----------|
| `sepolia.json` | Sepolia testnet deployment addresses | No |
| `bscTestnet.json` | BSC Testnet deployment addresses | No |
| `mainnet.json` | Ethereum mainnet (post-audit only) | No |
| `*_addresses.txt` | Human-readable address summaries | No |
| `README.md` | This file | Yes |

## Deploy Order

```
01_deploy_token.ts       MTAToken (ERC-20)
02_deploy_vesting.ts     MTAVesting + token distribution + mint lock
03_deploy_governance.ts  MTATimelock + MTAGovernor + role setup
04_deploy_staking.ts     MTAStaking (UUPS proxy via deployProxy)
05_post_deploy.ts        Transfer admin → multisig, generate .env.local
```

## Quick Start (Testnet)

```bash
# 1. Configure environment
cp .env.example .env
# Fill in: PRIVATE_KEY, ALCHEMY_API_KEY, ETHERSCAN_API_KEY
# Optional: MULTISIG_ADDRESS, TEAM_WALLET, SEED_WALLET, TREASURY_WALLET

# 2. Full deploy pipeline (Sepolia)
npm run deploy:sepolia
# Or: npm run deploy:bscTestnet

# 3. Verify contracts on Etherscan/BscScan
npm run verify:sepolia

# 4. Transfer admin roles to Gnosis Safe multisig
# Set MULTISIG_ADDRESS in .env first!
npx hardhat run scripts/deploy/05_post_deploy.ts --network sepolia
```

## Security Notes

- **Never commit `.env`** to version control — it's gitignored
- Use a **dedicated deployment wallet** funded with test ETH/BNB only
- Verify `MULTISIG_ADDRESS` is correct before running `05_post_deploy.ts` — this action is irreversible
- For mainnet: complete external audit first. See `MAINNET_READINESS.md`

## Deployment JSON Structure

After deploy, each network file (`sepolia.json`, etc.) has this structure:

```json
{
  "network": "sepolia",
  "chainId": "11155111",
  "deployer": "0x...",
  "contracts": {
    "MTAToken":        "0x...",
    "MTAVesting":      "0x...",
    "MTATimelock":     "0x...",
    "MTAGovernor":     "0x...",
    "MTAStaking":      "0x...",
    "MTAStakingImpl":  "0x..."
  },
  "deployedAt": "2026-...",
  "blockNumber": 12345678,
  "postDeploy": {
    "multisig": "0x...",
    "adminTransferred": "2026-..."
  }
}
```
