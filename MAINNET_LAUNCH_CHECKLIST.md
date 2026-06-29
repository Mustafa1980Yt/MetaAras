# MetaAras — Mainnet Launch Checklist

> **Status**: Pre-Launch · External audit required before mainnet deploy  
> **Target**: Q3 2026 · Ethereum Mainnet + BSC Mainnet  
> **Last code review**: 2026-06-29 — 170 tests passing · 0 TypeScript errors · 0 build errors

---

## Completed (Code Quality — 2026-06-29)

- [x] **StakePosition ABI mismatch** fixed in `frontend/src/app/(dapp)/staking/page.tsx` — `claimedRewards` field added, field order corrected, `lockEnd` → `unlockTime` renamed
- [x] **Early exit UX** — Unstake button now shows "Exit (−20%)" with amber warning dialog when locked; "Unstake" with red color when unlocked
- [x] **Governance page** — Mock data removed; real on-chain `castVote` / `hasVoted` / `proposalVotes` / `state` calls wired up; voting buttons enabled; manual proposal ID lookup added
- [x] **Integration tests** — `test/integration/MTAProtocol.test.ts` created (Flow 1: Vesting, Flow 2: Staking, Flow 3: Security, Flow 4: Max Supply, Flow 5: Governance, Flow 6: Vesting→Staking)
- [x] **Fuzz tests** — `test/fuzz/MTAStaking.fuzz.test.ts` created (reward formula, APY ordering, penalty exactness, TVL consistency, double-unstake, claim reset, zero-amount)
- [x] **All 166 tests passing** (`npx hardhat test` — 0 failures)
- [x] **Frontend build clean** (`npm run build` — 0 TypeScript errors, 24 routes generated)

---

## Completed (Session 3 — 2026-06-29)

- [x] **MTAStaking strict CEI in unstake()** — All state mutations (pos.active, pos.amount, claimedRewards, globalTotalStaked, totalPenaltiesCollected) moved before all external calls — audit-ready re-entrancy hardening
- [x] **Fake minAmount removed** — `STAKING_TIERS` in `tokenomics.ts` had non-existent on-chain minimums (100/1000/5000/10000 MTA); removed. UI updated: staking page shows "No minimum", tokenomics page updated
- [x] **Token distribution clarified** — `02_deploy_vesting.ts` now has explicit table comment mapping each allocation to its destination (vesting contract vs. direct wallet vs. TGE unlock)
- [x] **Staking page badge fix** — Removed misleading positionCount badge from "My Positions" tab (count includes inactive positions, causing user confusion)
- [x] **MTAStaking edge case tests** — 4 new tests added: (1) compound+early exit penalty on compounded amount, (2) retroactive APY change via updateTierConfig, (3) apyBps > 10000 boundary, (4) blacklisted user stake revert
- [x] **package.json** — MTAGovernor.test.ts added to coverage and gas-report scripts
- [x] **hardhat.config.ts** — PRIVATE_KEY validation guard for mainnet/BSC deploy tasks
- [x] **170 tests passing** (was 166)
- [x] **0 TypeScript errors**

---

## Completed (Session 2 — 2026-06-29)

- [x] **05_post_deploy.ts security gaps fixed** — Added `VESTING_ADMIN_ROLE` transfer to multisig, deployer renounce, `revokeMinter()` call post-distribution, and 7-check verification step
- [x] **CI/CD branch coverage** — Both `ci.yml` and `frontend.yml` now trigger on `mainnet-launch` branch (previously only `main/develop`)
- [x] **CI unit test completeness** — `MTAGovernor.test.ts` added to test/coverage/gas-report steps; integration and fuzz tests run unconditionally (no longer gated to `main` only)
- [x] **MTAToken EIP-6372 timestamp clock** — `clock()` and `CLOCK_MODE()` overridden in `MTAToken` to return `block.timestamp` / `"mode=timestamp"` — vote checkpoints stored by timestamp, consistent on all chains
- [x] **MTAGovernor EIP-6372 migration** — Voting delay/period changed from block numbers (7200/50400) to seconds (`1 days` = 86400 / `7 days` = 604800), ensuring 1-day/7-day governance windows on both Ethereum (12s/block) and BSC (3s/block)
- [x] **Governor tests updated** — `MTAGovernor.test.ts` migrated from `mine()` to `time.increase()`, 2 new tests for `clock()` and `CLOCK_MODE()` (24 tests total)
- [x] **Integration tests updated** — Governance flow in `MTAProtocol.test.ts` migrated from `mine()` to `time.increase()`; VOTING_DELAY/PERIOD corrected to seconds

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
- [x] All tests passing — 166 total (unit + integration + fuzz)
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
