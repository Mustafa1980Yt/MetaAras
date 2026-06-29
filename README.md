# MetaAras (MTA)

**Multichain Web3 DeFi Protocol — Governance · Staking · Vesting**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue)](contracts/)
[![Tests](https://img.shields.io/badge/Tests-97%2F97-brightgreen)](test/)
[![Chains](https://img.shields.io/badge/Chains-Ethereum%20%2B%20BNB-yellow)](docs/)
[![Version](https://img.shields.io/badge/version-1.1.0--rc1-orange)](CHANGELOG.md)

---

## Overview

MetaAras (MTA) is a production-ready, multichain DeFi governance protocol featuring:

- **ERC-20 Token** — 100M MTA hard cap, EIP-2612 Permit, EIP-5805 Votes, pause, and blacklist
- **Vesting** — linear schedules with cliff periods and admin-revocable allocations
- **Staking** — 4-tier APY system (8%–40%), per-position isolation, UUPS upgradeable
- **Governance** — on-chain DAO with 48-hour timelock, 4% quorum, 500K MTA proposal threshold
- **Multichain** — native deployment on Ethereum + BNB Smart Chain (identical contract bytecode)
- **Frontend** — Next.js 16 App Router + RainbowKit + wagmi v2, auto-detects chain

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+

### Smart Contracts

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run unit tests (97 tests)
npm run test:unit

# Run coverage report
npm run coverage

# Start local node
npm run node

# Deploy to local hardhat node
npm run deploy:local
```

### Frontend

```bash
cd frontend
npm install

# Configure environment
cp ../.env.example .env.local
# Edit .env.local with your values

# Development (use next start, not next dev — see AGENTS.md)
npm run build
npm run start

# Run E2E tests (900 tests, 5 browsers)
npx playwright test
```

---

## Project Structure

```
metaaras/
├── contracts/
│   ├── core/
│   │   ├── MTAToken.sol          ERC-20 + Permit + Votes + Pause + Blacklist
│   │   ├── MTAVesting.sol        Linear vesting with cliff
│   │   └── MTAStaking.sol        4-tier staking (UUPS upgradeable)
│   ├── governance/
│   │   ├── MTAGovernor.sol       OpenZeppelin Governor v5
│   │   └── MTATimelock.sol       48-hour timelock
│   └── interfaces/
│       └── IMTAToken.sol
├── scripts/
│   ├── deploy/
│   │   ├── 00_deploy_all.ts      Master pipeline (testnet only)
│   │   ├── 01_deploy_token.ts    Deploy MTAToken
│   │   ├── 02_deploy_vesting.ts  Deploy MTAVesting + token distribution
│   │   ├── 03_deploy_governance.ts  Deploy Governor + Timelock
│   │   ├── 04_deploy_staking.ts  Deploy MTAStaking (UUPS proxy)
│   │   └── 05_post_deploy.ts     Transfer admin roles to multisig
│   └── verify/
│       └── verify_all.ts         Verify all contracts on Etherscan/BscScan
├── test/
│   ├── unit/                     97 unit tests
│   └── integration/              (planned)
├── deployments/                  Deploy output JSON files (gitignored)
├── frontend/                     Next.js 16 frontend
├── .env.example                  Environment variable template
├── SECURITY_CHECKLIST.md         60-item pre-mainnet security review
├── MAINNET_READINESS.md          Go/no-go criteria for mainnet
└── RELEASE_NOTES_v1.0.0-RC1.md  Release candidate notes
```

---

## Tokenomics

| Allocation | Amount | % | Schedule |
|------------|--------|---|---------|
| Ecosystem | 35,000,000 | 35% | Immediate |
| Liquidity | 20,000,000 | 20% | Immediate |
| Treasury | 15,000,000 | 15% | DAO-controlled |
| Team | 15,000,000 | 15% | 12m cliff + 36m linear |
| Seed | 10,000,000 | 10% | 6m cliff + 18m linear |
| Public Sale | 5,000,000 | 5% | Immediate |
| **Total** | **100,000,000** | **100%** | Hard cap · No inflation |

---

## Staking Tiers

| Tier | APY | Lock Period | Early Exit |
|------|-----|-------------|-----------|
| Bronze | 8% | 30 days | 20% of principal |
| Silver | 15% | 90 days | 20% of principal |
| Gold | 25% | 180 days | 20% of principal |
| Platinum | 40% | 365 days | 20% of principal |

---

## Deployment (Testnet)

### Ethereum Sepolia

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env — set PRIVATE_KEY, ALCHEMY_API_KEY, ETHERSCAN_API_KEY

# 2. Preflight check (balance, RPC, key validation)
npm run preflight:sepolia

# 3. Full deploy pipeline
npm run deploy:sepolia

# 4. Verify on Etherscan
npm run verify:sepolia

# 5. Sync addresses to frontend
npm run sync-env:sepolia
```

### BNB Smart Chain Testnet

```bash
# Configure BSC keys in .env (BSCSCAN_API_KEY, optional BSC_TESTNET_RPC_URL)
npm run preflight:bsc-testnet
npm run deploy:bsc-testnet
npm run verify:bsc-testnet
npm run sync-env:bsc-testnet
```

> **MAINNET DEPLOY IS BLOCKED** until external security audit is complete.  
> See [MAINNET_READINESS.md](MAINNET_READINESS.md) for go/no-go criteria.

---

## Security

- [Security Checklist](SECURITY_CHECKLIST.md) — 60-item pre-mainnet review
- [Mainnet Readiness](MAINNET_READINESS.md) — blocking requirements
- External audit: Trail of Bits / Certik (Q3 2026)
- Bug reports: GitHub Issues (security@metaaras.io — not yet active)

---

## License

MIT — see [LICENSE](LICENSE)

---

*MetaAras Team · v1.0.0-RC1 · 2026-06-29*
