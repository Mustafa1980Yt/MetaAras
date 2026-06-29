# MetaAras — Final Testnet Deployment Report

**Date:** June 29, 2026  
**Network:** Ethereum Sepolia (chainId 11155111)  
**Deployer:** `0x5804830838Fe67ef184E1d1051EDdbD93976743A`  
**Deploy Block:** 11164753  
**Status:** ✅ ALL CONTRACTS DEPLOYED & VERIFIED

---

## Contract Addresses

| Contract | Address | Etherscan |
|----------|---------|-----------|
| MTAToken | `0x27315C3bF2370E933C376A7982CBDA77FF122376` | [View](https://sepolia.etherscan.io/address/0x27315C3bF2370E933C376A7982CBDA77FF122376#code) |
| MTAVesting | `0x98fC5324F5f110B4f707Ee5444335B64f4640465` | [View](https://sepolia.etherscan.io/address/0x98fC5324F5f110B4f707Ee5444335B64f4640465#code) |
| MTATimelock | `0x572FAb358dE3322286BD05E8F9AeAF349c41Ab5e` | [View](https://sepolia.etherscan.io/address/0x572FAb358dE3322286BD05E8F9AeAF349c41Ab5e#code) |
| MTAGovernor | `0x9924B7c4fa59113e99748095a6af41eb9406730b` | [View](https://sepolia.etherscan.io/address/0x9924B7c4fa59113e99748095a6af41eb9406730b#code) |
| MTAStaking (proxy) | `0xd82f1c0f0AF107CDB25FB189575Ee60A6ce12D35` | [View](https://sepolia.etherscan.io/address/0xd82f1c0f0AF107CDB25FB189575Ee60A6ce12D35) |
| MTAStaking (impl) | `0x926C246196dAaC255653c3d7ea7278a4C05c45ba` | [View](https://sepolia.etherscan.io/address/0x926C246196dAaC255653c3d7ea7278a4C05c45ba#code) |

---

## On-Chain State Verification

| Check | Result |
|-------|--------|
| Total Supply | 100,000,000 MTA ✓ |
| Max Supply match | ✓ DOĞRU (totalSupply === MAX_SUPPLY) |
| Minting permanently disabled | ✓ revokeMinter() confirmed |
| Vesting schedules created | 2 adet (Team 15M + Seed 10M) |
| Staking token match | ✓ MTAStaking.stakingToken() === MTAToken |

---

## Token Distribution (executed on-chain)

| Allocation | Amount | Recipient | Notes |
|-----------|--------|-----------|-------|
| Team | 15,000,000 MTA | Deployer (testnet) | 12-month cliff, 36-month linear vesting |
| Seed | 10,000,000 MTA | Deployer (testnet) | 6-month cliff, 18-month linear vesting |
| Ecosystem | 35,000,000 MTA | Deployer (testnet) | Direct mint |
| Liquidity | 20,000,000 MTA | Deployer (testnet) | Direct mint |
| Treasury | 15,000,000 MTA | Deployer (testnet) | Direct mint |
| Public Sale | 5,000,000 MTA | Deployer (testnet) | Direct mint |
| **Total** | **100,000,000 MTA** | | Matches MAX_SUPPLY |

> Testnet: all wallets fallback to deployer address (MULTISIG_ADDRESS = 0x000 → deployer). Mainnet requires separate multisig wallets.

---

## Etherscan Verification

| Contract | Status |
|----------|--------|
| MTAToken | ✅ Verified |
| MTAVesting | ✅ Verified |
| MTATimelock | ✅ Verified |
| MTAGovernor | ✅ Verified |
| MTAStaking (implementation) | ✅ Verified |

---

## Governance Configuration

| Parameter | Value |
|-----------|-------|
| PROPOSER_ROLE | MTAGovernor ✓ |
| EXECUTOR_ROLE | address(0) — open ✓ |
| Timelock admin | Renounced by deployer ✓ |
| Proposal threshold | 500,000 MTA (0.5%) |
| Voting delay | 7,200 blocks (~24h) |
| Voting period | 50,400 blocks (~7 days) |
| Quorum | 4% (4,000,000 MTA) |
| Timelock delay | 48 hours |

---

## Frontend Sync

- **sync-env:sepolia** → `frontend/.env.local` güncellendi  
- **Prefix:** `NEXT_PUBLIC_ETH_SEPOLIA_MTA_*`  
- **Build:** 22/22 routes — 0 TypeScript errors ✓

---

## Issues Found & Fixed During Deploy

| # | Issue | Fix |
|---|-------|-----|
| 1 | `MULTISIG_ADDRESS=0x000...000` string truthy, zero-address check bypass | Added explicit zero-address guard in 01, 04, verify scripts |
| 2 | `TREASURY_WALLET=0x000...000` same issue in vesting + staking | Added `resolveAddr()` helper in 02; explicit guard in 04 |
| 3 | Etherscan V1 API deprecated (EOL May 2025) — verify failed | Migrated `hardhat.config.ts` to single-key V2 format |
| 4 | `verify_state.ts` hardcoded `localhost.json` | Fixed to use `network.name` (prior commit `9082f15`) |
| 5 | `preflight.ts` minimum balance 0.15 ETH (actual cost ~0.029 ETH at 2.66 gwei) | Updated minimum to 0.05 ETH with gas analysis |

---

## Gas Usage

| Category | Estimate | Notes |
|----------|---------|-------|
| Total gas consumed | ~11M gas | All 5 contracts + setup txs |
| Gas price | ~2.66 gwei | Sepolia at deploy time |
| **Total cost** | **~0.029 ETH** | Within 0.05 ETH budget |

---

## Next Steps

### Immediate (Testnet)
- [ ] Run `npm run approve-rewards:sepolia` — reward pool wallet must approve staking contract
- [ ] Test staking flow end-to-end on Sepolia via frontend
- [ ] Test governance proposal lifecycle
- [ ] Test vesting release after cliff period (testnet time manipulation or wait)

### Before Mainnet
- [ ] External security audit (Trail of Bits / Certik)
- [ ] Create Gnosis Safe (3-of-5 multisig) for MULTISIG_ADDRESS
- [ ] Set separate TEAM_WALLET, SEED_WALLET, TREASURY_WALLET, ECOSYSTEM_WALLET, LIQUIDITY_WALLET, PUBLIC_SALE_WALLET
- [ ] Obtain real WalletConnect project ID (replace demo-project-id)
- [ ] Run Lighthouse audit on production URL
- [ ] Re-run full deploy pipeline on mainnet

---

*Report generated: June 29, 2026. All contract addresses verified on Sepolia Etherscan.*
