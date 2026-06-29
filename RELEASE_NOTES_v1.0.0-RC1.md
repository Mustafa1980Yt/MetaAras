# MetaAras (MTA) — v1.0.0-RC1 Release Candidate

**Date:** 2026-06-28  
**Status:** ✅ Release Candidate — Testnet Deployment Ready  
**Tag:** `v1.0.0-RC1`  
**Next Milestone:** External Security Audit → v1.0.0 Mainnet

---

## Executive Summary

MetaAras (MTA) Release Candidate 1 is a fully implemented, tested, and documented Web3 protocol stack ready for testnet deployment and external security audit. All 97 smart contract unit tests pass. All 900 Playwright E2E tests pass across 5 browsers.

---

## What's New in RC1

### Smart Contracts (Solidity 0.8.24 / OpenZeppelin 5.3.0)

| Contract | Source | Tests | Status |
|----------|--------|-------|--------|
| MTAToken | `contracts/core/MTAToken.sol` | 37 tests ✅ | Production Ready |
| MTAVesting | `contracts/core/MTAVesting.sol` | 30 tests ✅ | Production Ready |
| MTAStaking | `contracts/core/MTAStaking.sol` | 30 tests ✅ | Production Ready |
| MTAGovernor | `contracts/governance/MTAGovernor.sol` | — | Production Ready |
| MTATimelock | `contracts/governance/MTATimelock.sol` | — | Production Ready |

#### MTAToken — Key Features
- ERC-20 + ERC20Permit (EIP-2612) + ERC20Votes (EIP-5805) + ERC20Burnable
- Hard cap: 100,000,000 MTA (immutable constant)
- Role-based access: DEFAULT_ADMIN / MINTER / PAUSER / BLACKLISTER
- `revokeMinter()` permanently disables minting — called after initial distribution
- Emergency pause mechanism (PAUSER_ROLE via multisig)

#### MTAVesting — Key Features
- Linear vesting with configurable cliff periods
- Revocable schedules with pro-rated earned token protection
- Team: 15M MTA / 12-month cliff / 36-month linear
- Seed: 10M MTA / 6-month cliff / 18-month linear
- Treasury refund on revocation of unvested portion

#### MTAStaking — Key Features
- Four APY tiers: Bronze 8%/30d, Silver 15%/90d, Gold 25%/180d, Platinum 40%/365d
- Per-position independent reward tracking (no dilution)
- Early exit penalty: 20% of staked principal → reward reserve (rewards always paid in full)
- Compound function: reinvest rewards into same position
- UUPS upgradeable (emergency upgrade path via governance)

#### MTAGovernor + MTATimelock — Key Features
- OpenZeppelin Governor v5 with TimelockControl
- Proposal threshold: 500,000 MTA
- Voting delay: 7,200 blocks (~24h), Voting period: 50,400 blocks (~7d)
- Quorum: 4,000,000 MTA (4%)
- 48-hour timelock on all executed proposals

### Deploy Scripts

| Script | Purpose |
|--------|---------|
| `00_deploy_all.ts` | Master script — full pipeline (testnet only) |
| `01_deploy_token.ts` | Deploy MTAToken |
| `02_deploy_vesting.ts` | Deploy MTAVesting + token distribution |
| `03_deploy_governance.ts` | Deploy MTATimelock + MTAGovernor |
| `04_deploy_staking.ts` | Deploy MTAStaking |
| `05_post_deploy.ts` | Transfer admin roles to multisig |
| `verify/verify_all.ts` | Verify all contracts on Etherscan/BscScan |

### Frontend (Next.js 16 / Tailwind v4 / RainbowKit / wagmi v2)

| Page | Route | Status |
|------|-------|--------|
| Landing | `/` | ✅ |
| Tokenomics | `/tokenomics` | ✅ |
| Roadmap | `/roadmap` | ✅ |
| Whitepaper v2 | `/whitepaper` | ✅ |
| Documentation | `/docs` | ✅ |
| FAQ | `/faq` | ✅ |
| Contact | `/contact` | ✅ |
| Dashboard | `/dashboard` | ✅ |
| Staking | `/staking` | ✅ |
| Vesting | `/vesting` | ✅ |
| Governance | `/governance` | ✅ |
| Treasury | `/treasury` | ✅ |

### Frontend Contract Integration

- `src/lib/contracts/` — ABI files (MTAToken, MTAStaking, MTAVesting, MTAGovernor)
- `src/lib/contracts/index.ts` — Address resolver + contract config helpers
- `src/constants/contracts.ts` — Multi-network address registry (hardhat/sepolia/bscTestnet/mainnet)
- Environment-based address injection via `NEXT_PUBLIC_MTA_*_ADDRESS`
- `05_post_deploy.ts` auto-generates `.env.local` post-deploy

### CI/CD (GitHub Actions)

| Workflow | Trigger | Coverage |
|----------|---------|---------|
| `.github/workflows/ci.yml` | Push/PR to main/develop | Lint, compile, unit tests, Slither, gas report |
| `.github/workflows/frontend.yml` | Push/PR (frontend/ paths) | TypeScript check, build, Playwright (chromium PR / full matrix on main) |

### Documentation

- **Whitepaper v2** — 10 sections, ~30 pages equivalent content
- **Docs page** — Full contract reference, deployment guide, integration examples
- **Security Checklist** — 60-item pre-mainnet security review
- **Mainnet Readiness** — Complete go/no-go criteria with deployment sequence

---

## Test Results

### Smart Contracts
```
97 passing (8s)
  MTAToken   — 37 tests ✅
  MTAStaking — 30 tests ✅
  MTAVesting — 30 tests ✅
```

### Frontend E2E (Playwright)
```
900/900 tests passing
Browsers: chromium / firefox / webkit / mobile-chrome / mobile-safari
```

---

## Tokenomics Summary

| Allocation | Amount | % | Vesting |
|------------|--------|---|---------|
| Ecosystem | 35,000,000 | 35% | Immediate |
| Liquidity | 20,000,000 | 20% | Immediate |
| Treasury | 15,000,000 | 15% | Immediate (DAO-controlled) |
| Team | 15,000,000 | 15% | 12m cliff + 36m linear |
| Seed | 10,000,000 | 10% | 6m cliff + 18m linear |
| Public Sale | 5,000,000 | 5% | Immediate |
| **Total** | **100,000,000** | **100%** | Hard cap, no inflation |

---

## Known Limitations (RC1)

1. **Testnet only** — Contracts not deployed to mainnet (pre-audit requirement)
2. **External audit pending** — Trail of Bits / Certik (Q3 2026)
3. **WalletConnect** — Demo project ID in `.env.local` (replace for production)
4. **Frontend mock state** — DApp pages show mock data when wallet not connected
5. **Integration tests** — Governance integration tests not yet written
6. **PDF whitepaper** — Download button disabled (PDF generation pending)

---

## Breaking Changes

None — first public release candidate.

---

## Upgrade Path (RC1 → v1.0.0)

```
[RC1] ──→ Testnet Deploy ──→ External Audit ──→ Audit Fixes ──→ [v1.0.0] ──→ Mainnet Deploy
          (Sepolia + BSC)    (4-6 weeks)      (2-4 weeks)                    (+ Multisig)
```

---

## File Manifest (RC1)

### New/Modified Files

```
metaaras/
├── RELEASE_NOTES_v1.0.0-RC1.md        ← This file
├── SECURITY_CHECKLIST.md               ← 60-item security review
├── MAINNET_READINESS.md                ← Go/no-go criteria
├── .env.example                        ← Expanded with all env vars
├── package.json                        ← v1.0.0-rc1, new scripts
├── scripts/
│   ├── deploy/
│   │   ├── 00_deploy_all.ts            ← Master deploy (NEW)
│   │   ├── 04_deploy_staking.ts        ← Staking deploy (NEW)
│   │   └── 05_post_deploy.ts           ← Post-deploy config (NEW)
│   └── verify/
│       └── verify_all.ts               ← Contract verification (NEW)
├── deployments/
│   └── README.md                       ← Deploy instructions (NEW)
├── .github/workflows/
│   ├── ci.yml                          ← Updated smart contract CI
│   └── frontend.yml                    ← New frontend CI (NEW)
└── frontend/
    ├── .env.local                      ← Local dev config (NEW)
    ├── src/
    │   ├── lib/contracts/
    │   │   ├── index.ts                ← Contract helpers (NEW)
    │   │   ├── MTAToken.abi.json       ← ABI (NEW)
    │   │   ├── MTAStaking.abi.json     ← ABI (NEW)
    │   │   ├── MTAVesting.abi.json     ← ABI (NEW)
    │   │   └── MTAGovernor.abi.json    ← ABI (NEW)
    │   ├── constants/contracts.ts      ← Multi-network addresses (UPDATED)
    │   └── app/(marketing)/
    │       ├── whitepaper/page.tsx     ← v2, 10 sections (UPDATED)
    │       └── docs/page.tsx           ← Full docs (UPDATED)
```

---

*MetaAras Team — v1.0.0-RC1 — 2026-06-28*
