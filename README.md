# MetaAras (MTA)

**Professional-Grade Multichain Web3 DeFi Protocol — Governance · Staking · Vesting**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue)](contracts/)
[![Tests](https://img.shields.io/badge/Tests-119%2F119-brightgreen)](test/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-v5.3-purple)](https://openzeppelin.com/)
[![Chains](https://img.shields.io/badge/Chains-Ethereum%20%2B%20BNB-yellow)](docs/)
[![Version](https://img.shields.io/badge/version-2.0.0--rc1-orange)](CHANGELOG.md)
[![Testnet](https://img.shields.io/badge/Testnet-Sepolia%20✓-brightgreen)](https://sepolia.etherscan.io/)

---

## Overview

MetaAras (MTA) is a production-ready, multichain DeFi governance protocol built with OpenZeppelin v5 contracts:

| Feature | Details |
|---------|---------|
| **Token (MTAToken)** | 100M hard cap · EIP-2612 Permit · EIP-5805 Votes · Pause · Blacklist |
| **Vesting (MTAVesting)** | Linear schedules · configurable cliff · admin-revocable |
| **Staking (MTAStaking)** | 4 tiers: 8%–40% APY · UUPS upgradeable · per-position isolation |
| **Governance (MTAGovernor)** | OZ Governor v5 · 4% quorum · 500K threshold · 7-day voting |
| **Timelock (MTATimelock)** | 48-hour delay · open execution · admin renounced |
| **Frontend** | Next.js 16 App Router · RainbowKit · wagmi v2 · 24 routes |

### Live on Ethereum Sepolia

| Contract | Address | Explorer |
|----------|---------|----------|
| MTAToken | `0x27315C3bF2370E933C376A7982CBDA77FF122376` | [Etherscan ↗](https://sepolia.etherscan.io/address/0x27315C3bF2370E933C376A7982CBDA77FF122376#code) |
| MTAVesting | `0x98fC5324F5f110B4f707Ee5444335B64f4640465` | [Etherscan ↗](https://sepolia.etherscan.io/address/0x98fC5324F5f110B4f707Ee5444335B64f4640465#code) |
| MTATimelock | `0x572FAb358dE3322286BD05E8F9AeAF349c41Ab5e` | [Etherscan ↗](https://sepolia.etherscan.io/address/0x572FAb358dE3322286BD05E8F9AeAF349c41Ab5e#code) |
| MTAGovernor | `0x9924B7c4fa59113e99748095a6af41eb9406730b` | [Etherscan ↗](https://sepolia.etherscan.io/address/0x9924B7c4fa59113e99748095a6af41eb9406730b#code) |
| MTAStaking (proxy) | `0xd82f1c0f0AF107CDB25FB189575Ee60A6ce12D35` | [Etherscan ↗](https://sepolia.etherscan.io/address/0xd82f1c0f0AF107CDB25FB189575Ee60A6ce12D35) |

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

# Run all tests (119 tests: Token + Staking + Vesting + Governor)
npm run test:unit

# Run test coverage
npm run coverage

# Local development node
npm run node

# Deploy to local Hardhat node
npm run deploy:local
```

### Frontend

```bash
cd frontend
npm install

# Copy and configure environment
cp .env.example .env.local
# Edit .env.local — set WalletConnect ID, API keys

# Build (required — do NOT use next dev for production testing)
npm run build
npm run start
```

> The frontend is configured for `next start` production mode to avoid Turbopack CSS issues in development.

---

## Project Structure

```
metaaras/
├── contracts/
│   ├── core/
│   │   ├── MTAToken.sol          # ERC-20 + Permit + Votes + Pause + Blacklist (224 LOC)
│   │   ├── MTAVesting.sol        # Linear vesting with cliff + revocation
│   │   └── MTAStaking.sol        # 4-tier staking, UUPS upgradeable (497 LOC)
│   ├── governance/
│   │   ├── MTAGovernor.sol       # OpenZeppelin Governor v5
│   │   └── MTATimelock.sol       # 48-hour TimelockController
│   ├── interfaces/
│   │   └── IMTAToken.sol         # Token interface
│   └── mocks/
│       └── MockERC20.sol         # Test mock (not deployed)
│
├── scripts/
│   ├── deploy/
│   │   ├── 00_deploy_all.ts      # Master pipeline (testnet only — mainnet blocked)
│   │   ├── 01_deploy_token.ts    # Token deploy
│   │   ├── 02_deploy_vesting.ts  # Vesting deploy + token distribution
│   │   ├── 03_deploy_governance.ts # Governor + Timelock deploy
│   │   ├── 04_deploy_staking.ts  # Staking deploy (UUPS proxy)
│   │   └── 05_post_deploy.ts     # Transfer all roles to multisig (irreversible)
│   ├── liquidity/
│   │   ├── add_pancakeswap_liquidity.ts  # PancakeSwap V3 MTA/WBNB (BSC)
│   │   └── add_uniswap_liquidity.ts      # Uniswap V3 MTA/WETH (Ethereum)
│   ├── verify/
│   │   ├── verify_ethereum.ts    # Etherscan verification
│   │   ├── verify_bsc.ts         # BscScan verification
│   │   └── verify_all.ts         # Both chains
│   ├── utils/
│   │   ├── approve_rewards.ts    # Approve reward pool allowance
│   │   ├── verify_state.ts       # On-chain state verification
│   │   └── get_txs.ts            # Transaction explorer helper
│   ├── sync-env.ts               # Sync deploy addresses → frontend .env.local
│   └── preflight.ts              # Pre-deploy safety checks
│
├── test/
│   ├── unit/
│   │   ├── MTAToken.test.ts      # 35 tests
│   │   ├── MTAVesting.test.ts    # 40 tests
│   │   ├── MTAStaking.test.ts    # 22 tests
│   │   └── MTAGovernor.test.ts   # 22 tests (new)
│   ├── fuzz/                     # Foundry fuzz tests (planned)
│   └── integration/              # Integration tests (planned)
│
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── (marketing)/      # Public pages: whitepaper, roadmap, tokenomics, etc.
│       │   └── (dapp)/           # DApp: dashboard, staking, vesting, governance,
│       │                         #        treasury, analytics, admin
│       ├── components/
│       │   ├── marketing/        # Hero, StakingTiers, Governance, Security, CTA sections
│       │   ├── layout/           # Navbar, Footer, NetworkGuard, Providers
│       │   └── ui/               # Badge, Button, Card, Skeleton, StatCard
│       ├── constants/
│       │   ├── contracts.ts      # Chain-aware address resolution
│       │   └── tokenomics.ts     # ALLOCATIONS, STAKING_TIERS
│       └── hooks/
│           └── useTokenData.ts   # wagmi read hooks
│
├── listing/
│   ├── coinmarketcap_info.json   # CMC listing submission data
│   ├── coingecko_info.json       # CoinGecko listing submission data
│   └── pancakeswap_listing_checklist.md
│
├── deployments/                  # Deploy output JSON (gitignored)
│   └── sepolia.json              # Current testnet deployment
│
├── MAINNET_LAUNCH_CHECKLIST.md   # 50+ item go-live checklist
├── MAINNET_RUNBOOK.md            # Step-by-step deployment runbook
├── LAUNCH_DAY_CHECKLIST.md       # Hour-by-hour launch day operations
├── ROLLBACK_PLAN.md              # Post-deploy rollback procedures
├── EMERGENCY_PROCEDURES.md       # Incident response playbook
├── PRE_MAINNET_VERIFICATION.md   # Everything-to-check before mainnet
├── AUDIT_CHECKLIST.md            # External audit preparation guide
├── TESTNET_DEPLOYMENT_REPORT.md  # Sepolia deployment documentation
├── SECURITY_CHECKLIST.md         # Internal security review
├── MAINNET_READINESS.md          # Go/no-go criteria
├── AUDIT_PREP.md                 # Architecture doc for auditors
├── FINAL_AUDIT_REPORT.md         # Internal pre-audit findings
└── hardhat.config.ts             # Hardhat + Etherscan V2 config
```

---

## Tokenomics

| Allocation | Amount | % | Vesting |
|------------|--------|---|---------|
| Ecosystem (Rewards + Grants) | 35,000,000 MTA | 35% | Unlocked at TGE — DAO-governed |
| Liquidity | 20,000,000 MTA | 20% | Unlocked at TGE |
| Treasury | 15,000,000 MTA | 15% | Timelock-controlled |
| Team | 15,000,000 MTA | 15% | 12-month cliff + 36-month linear |
| Seed Round | 10,000,000 MTA | 10% | 6-month cliff + 18-month linear |
| Public Sale | 5,000,000 MTA | 5% | Unlocked at TGE |
| **Total** | **100,000,000 MTA** | **100%** | Hard cap · No inflation ever |

---

## Staking Tiers

| Tier | APY | Lock Period | Min Amount | Early Exit |
|------|-----|-------------|-----------|------------|
| Bronze | 8% | 30 days | 100 MTA | 20% of principal |
| Silver | 15% | 90 days | 1,000 MTA | 20% of principal |
| Gold | 25% | 180 days | 5,000 MTA | 20% of principal |
| Platinum | 40% | 365 days | 10,000 MTA | 20% of principal |

> Rewards formula: `principal × apyBps × elapsed / (10_000 × 31_536_000)`
> Each position is independently tracked — no pool dilution. Rewards paid in full on early exit before penalty.

---

## Governance Parameters

| Parameter | Value |
|-----------|-------|
| Proposal Threshold | 500,000 MTA (0.5%) |
| Voting Delay | 7,200 blocks (~24 hours) |
| Voting Period | 50,400 blocks (~7 days) |
| Quorum | 4% of total supply (4,000,000 MTA) |
| Timelock Delay | 48 hours |
| Execution | Open (any address after timelock) |

---

## Testing

```bash
# Run all 119 unit tests
npm run test:unit

# Run specific test file
npx hardhat test test/unit/MTAGovernor.test.ts

# Gas report
REPORT_GAS=true npm run test:unit

# Coverage
npm run coverage
```

| Test Suite | Tests | Coverage |
|------------|-------|---------|
| MTAToken | 35 | Full |
| MTAVesting | 40 | Full |
| MTAStaking | 22 | Full |
| MTAGovernor | 22 | Full |
| **Total** | **119** | **Production-ready** |

---

## Deploy Pipeline

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
PRIVATE_KEY=          # 64-char hex, no 0x prefix (hardware wallet for mainnet)
ALCHEMY_API_KEY=      # Alchemy API key for Ethereum RPC
ETHERSCAN_API_KEY=    # Etherscan V2 key (covers mainnet + Sepolia)
BSCSCAN_API_KEY=      # BscScan key for BSC verification
MULTISIG_ADDRESS=     # Gnosis Safe (3/5) — deployer used on testnet
TREASURY_WALLET=      # Treasury address
TEAM_WALLET=          # Team vesting beneficiary
SEED_WALLET=          # Seed investor beneficiary
ECOSYSTEM_WALLET=     # Ecosystem fund address
LIQUIDITY_WALLET=     # DEX liquidity address
PUBLIC_SALE_WALLET=   # Public sale distributor
```

### Testnet Deployment

```bash
# Ethereum Sepolia
npm run preflight:sepolia       # Balance + RPC + API key check
npm run deploy:sepolia          # Full pipeline (5 contracts + distribution)
npm run verify:ethereum         # Etherscan verification
npm run sync-env:sepolia        # Update frontend .env.local
npm run state:sepolia           # On-chain state verification

# BSC Testnet
npm run preflight:bscTestnet
npm run deploy:bscTestnet
npm run verify:bsc
npm run sync-env:bscTestnet
```

### Mainnet Deployment

> **⛔ BLOCKED until external security audit is complete.**  
> Full operational package: see runbook files below.

```bash
# Step 1: Preflight (checks env, balance, RPC)
npm run preflight:mainnet

# Step 2: Deploy contracts (one by one, in order)
npm run deploy:token:mainnet
npm run deploy:vesting:mainnet
npm run deploy:governance:mainnet
npm run deploy:staking:mainnet

# Step 3: Etherscan verification
npm run verify:ethereum

# Step 4: Transfer roles to multisig (irreversible)
npm run deploy:post:mainnet

# Step 5: Sync contract addresses to frontend
npm run sync-env:mainnet

# Step 6: Liquidity (after all contracts verified)
npm run liquidity:pancakeswap   # BSC: PancakeSwap V3
npm run liquidity:uniswap       # ETH: Uniswap V3 (optional)
```

**Operational Runbooks:**
- [MAINNET_RUNBOOK.md](MAINNET_RUNBOOK.md) — Step-by-step deployment guide
- [LAUNCH_DAY_CHECKLIST.md](LAUNCH_DAY_CHECKLIST.md) — Launch day hour-by-hour
- [ROLLBACK_PLAN.md](ROLLBACK_PLAN.md) — Rollback procedures
- [EMERGENCY_PROCEDURES.md](EMERGENCY_PROCEDURES.md) — Incident response
- [PRE_MAINNET_VERIFICATION.md](PRE_MAINNET_VERIFICATION.md) — Pre-launch verification

---

## Security Architecture

| Layer | Mechanism |
|-------|-----------|
| **Access Control** | Role-based (RBAC) via OpenZeppelin AccessControl |
| **Reentrancy** | ReentrancyGuard on all state-mutating functions |
| **Flash Loan** | ERC20Votes checkpoints prevent block-of-proposal attacks |
| **Upgrade Safety** | UUPS with UPGRADER_ROLE locked to Timelock |
| **Emergency Pause** | Token + Staking pausable by PAUSER_ROLE (multisig) |
| **Governance Delay** | 48-hour Timelock on all parameter changes |
| **Supply Cap** | Hard cap enforced in `mint()`, permanently revokeable |

**Audit Status**: External audit by Trail of Bits / Certik — scheduled Q2 2026.  
**Bug Bounty**: Immunefi $50K+ pool — planned at audit launch.

---

## Architecture Decisions

### Why UUPS for MTAStaking?
MTAStaking uses UUPS upgradeable proxy so the community can vote to add features (e.g., new tiers, liquid staking tokens) through governance, without redeploying the contract or migrating user positions.

### Why No Cross-Chain Bridge?
Each chain maintains an independent MTA instance. This removes bridge exploit risk (e.g., Ronin, Wormhole). Future cross-chain governance will use LayerZero or Wormhole message passing if/when the DAO votes for it.

### Why `EARLY_EXIT_PENALTY_BPS = 2_000` (20% of principal)?
The 20% penalty on principal creates a meaningful cost for early exit (not a trivial fee), discouraging short-term speculation in long-lock tiers. The penalty feeds back into the reward pool, increasing APY for remaining stakers.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Write tests for new contract code (coverage must not regress)
4. Run linter: `npm run lint`
5. Run tests: `npm run test:unit`
6. Submit a PR with a clear description

---

## License

MIT — see [LICENSE](LICENSE)

---

## Links

- **DApp**: https://app.metaaras.io *(coming soon)*
- **Website**: https://metaaras.io *(coming soon)*
- **Whitepaper**: https://metaaras.io/whitepaper
- **Twitter**: https://twitter.com/MetaArasDAO
- **Telegram**: https://t.me/metaaras
- **GitHub Issues**: https://github.com/metaaras/metaaras-protocol/issues

---

*MetaAras Protocol · v2.0.0-rc1 · June 2026 · Ethereum Sepolia Deployed ✓*
