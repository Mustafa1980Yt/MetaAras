# MetaAras — Mainnet Launch Checklist

> **Status**: Pre-Launch · External audit required before mainnet deploy  
> **Target**: Q3 2026 · Ethereum Mainnet + BSC Mainnet

---

## Phase A: Pre-Deploy Infrastructure

### Multi-Sig Setup
- [ ] Create Gnosis Safe (3-of-5) on Ethereum Mainnet for MULTISIG_ADDRESS
- [ ] Create Gnosis Safe (3-of-5) on BSC Mainnet for MULTISIG_ADDRESS
- [ ] Confirm all 5 signers have secure key storage (hardware wallets)
- [ ] Test multi-sig with a small test transaction on both chains

### Wallet Separation
- [ ] Set TREASURY_WALLET — separate from deployer
- [ ] Set TEAM_WALLET — controlled by team multi-sig
- [ ] Set SEED_WALLET — controlled by seed investors
- [ ] Set ECOSYSTEM_WALLET — DAO-controlled Gnosis Safe
- [ ] Set LIQUIDITY_WALLET — DEX liquidity management multi-sig
- [ ] Set PUBLIC_SALE_WALLET — exchange/launchpad wallet

### Environment Configuration
- [ ] Root `.env` — all variables set with real mainnet values
- [ ] PRIVATE_KEY — deployer wallet (hardware wallet preferred)
- [ ] ALCHEMY_API_KEY — production Alchemy endpoint
- [ ] ETHERSCAN_API_KEY — verified and working
- [ ] BSCSCAN_API_KEY — verified and working
- [ ] WALLETCONNECT_PROJECT_ID — production project (not demo-project-id)
- [ ] All wallet addresses verified on-chain (not zero address)

---

## Phase B: Security Audit

- [ ] External audit completed (Trail of Bits, Certik, or equivalent)
- [ ] All Critical / High findings resolved
- [ ] Medium findings reviewed — accept or resolve
- [ ] Audit report published publicly
- [ ] Re-audit of any modified code post-findings
- [ ] Static analysis: Slither passing with no high-severity outputs
- [ ] Solhint clean (zero warnings)
- [ ] All 119+ unit tests passing
- [ ] Gas report generated and reviewed
- [ ] Foundry fuzz testing (100K+ runs) — bonus

---

## Phase C: Deployment

### Ethereum Mainnet
- [ ] `npm run preflight:mainnet` — passes (minimum ETH balance, API keys)
- [ ] `npm run deploy:mainnet` — all 5 contracts deployed
- [ ] Etherscan verification complete (5/5 contracts)
- [ ] `npm run state:mainnet` — all on-chain state verified
- [ ] Admin roles transferred to Gnosis Safe
- [ ] Timelock admin role renounced
- [ ] `revokeMinter()` called on MTAToken
- [ ] Vesting schedules created for Team + Seed allocations

### BSC Mainnet
- [ ] `npm run preflight:bsc` — passes
- [ ] `npm run deploy:bsc` — all 5 contracts deployed
- [ ] BscScan verification complete (5/5 contracts)
- [ ] `npm run state:bsc` — verified
- [ ] Same role setup as Ethereum (separate multisig)

---

## Phase D: Frontend

- [ ] `npm run sync-env:mainnet` — `.env.local` updated with mainnet addresses
- [ ] `npm run sync-env:bsc` — BSC addresses synced
- [ ] `npm run build` — 0 TypeScript errors
- [ ] `npm run start` — production build runs
- [ ] Lighthouse audit: Performance ≥90, Accessibility ≥90
- [ ] Cross-browser test (Chrome, Firefox, Safari)
- [ ] Mobile responsive test (iOS + Android)
- [ ] ConnectButton wallet test on mainnet
- [ ] End-to-end: stake → claim → unstake flow
- [ ] End-to-end: governance proposal creation
- [ ] End-to-end: vesting release (or testnet simulation)

---

## Phase E: Token Distribution (Mainnet)

- [ ] Liquidity (20M MTA) sent to LIQUIDITY_WALLET
- [ ] Treasury (15M MTA) sent to TREASURY_WALLET
- [ ] Public sale (5M MTA) sent to exchange/launchpad
- [ ] Ecosystem (35M MTA) sent to ECOSYSTEM_WALLET (DAO-controlled)
- [ ] Team vesting schedule created → 15M → TEAM_WALLET
- [ ] Seed vesting schedule created → 10M → SEED_WALLET
- [ ] Total supply verification: 100,000,000 MTA ✓
- [ ] Minting disabled permanently

---

## Phase F: Liquidity

- [ ] Uniswap V3 pool created (ETH chain): MTA/ETH
- [ ] Initial liquidity: minimum $50K equivalent
- [ ] LP tokens locked (Unicrypt or equivalent)
- [ ] PancakeSwap V3 pool created (BSC chain): MTA/BNB
- [ ] Price impact analysis verified (<5% for $10K trade)

---

## Phase G: Exchange Listings

- [ ] CoinGecko listing submitted (listing/coingecko_info.json)
- [ ] CoinMarketCap listing submitted (listing/coinmarketcap_info.json)
- [ ] DexScreener auto-detected (happens on first trade)
- [ ] DexTools listing (auto-detected)
- [ ] PancakeSwap token list PR submitted

---

## Phase H: Community & Communications

- [ ] Official announcement blog post
- [ ] Twitter/X launch thread
- [ ] Telegram announcement
- [ ] Discord community server launched
- [ ] GitHub repository made public (if private)
- [ ] Audit report linked from README
- [ ] Immunefi bug bounty program launched ($50K+ pool)

---

## Emergency Contacts & Procedures

### If Exploit Detected
1. Multisig signers vote to `pause()` token and staking immediately
2. Revoke any suspicious approvals
3. Notify Immunefi if in scope
4. Communicate transparently with community
5. Engage audit firm for emergency review
6. Timelock allows 48h to cancel any queued malicious proposals

### Key Roles (Mainnet)
| Role | Holder |
|------|--------|
| MTAToken DEFAULT_ADMIN | Gnosis Safe (3/5) |
| MTAToken PAUSER_ROLE | Gnosis Safe (3/5) |
| MTAToken BLACKLISTER_ROLE | Gnosis Safe (3/5) |
| MTAStaking DEFAULT_ADMIN | Gnosis Safe (3/5) |
| MTAStaking PAUSER_ROLE | Gnosis Safe (3/5) |
| MTAGovernor PROPOSER_ROLE | MTAGovernor contract only |
| MTATimelock DEFAULT_ADMIN | Renounced |

---

*Last updated: June 2026 · MetaAras Production Team*
