<div align="center">

# MetaAras Protocol

**Professional Multichain DeFi Governance · Staking · Vesting**

[![Tests](https://img.shields.io/badge/Tests-119%2F119-brightgreen?style=for-the-badge&logo=checkmarx)](test/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue?style=for-the-badge&logo=solidity)](contracts/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-v5.3-purple?style=for-the-badge)](https://openzeppelin.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia%20✓-627EEA?style=flat-square&logo=ethereum)](https://sepolia.etherscan.io/address/0x27315C3bF2370E933C376A7982CBDA77FF122376)
[![BSC](https://img.shields.io/badge/BNB_Chain-Pending-F3BA2F?style=flat-square&logo=binance)](https://bscscan.com)
[![Audit](https://img.shields.io/badge/Audit-Scheduled_Q2_2026-orange?style=flat-square)](AUDIT_CHECKLIST.md)
[![Version](https://img.shields.io/badge/Version-2.0.0--rc1-blue?style=flat-square)](CHANGELOG.md)

<br/>

[**Live DApp (Testnet)**](https://app.metaaras.io) · [**Whitepaper**](https://metaaras.io/whitepaper) · [**Docs**](https://metaaras.io/docs) · [**Twitter**](https://twitter.com/MetaArasDAO) · [**Telegram**](https://t.me/metaaras)

</div>

---

## What is MetaAras?

MetaAras (MTA) is a **production-grade, multichain DeFi protocol** that puts protocol control entirely in the hands of token holders through verifiable on-chain governance.

Every parameter — staking APY adjustments, treasury disbursements, contract upgrades, emergency pauses — is gated behind a governance vote followed by a mandatory **48-hour Timelock**. No admin keys. No backdoors.

```
Stake MTA → Earn Rewards → Vote on Proposals → Shape the Protocol
```

---

## Protocol Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     MetaAras Protocol                        │
├────────────────┬────────────────┬────────────────────────────┤
│   MTAToken     │   MTAStaking   │      MTAVesting            │
│                │                │                            │
│ ERC-20 + Permit│ 4 Tiers        │ Linear schedules           │
│ EIP-5805 Votes │ 8%–40% APY     │ Cliff + vesting            │
│ Pause + BList  │ UUPS Proxy     │ Admin-revocable            │
│ 100M hard cap  │ ReentrancyGuard│ SafeERC20                  │
└────────────────┴────────────────┴────────────────────────────┘
                          │
              ┌──────────┴──────────┐
              │                     │
        MTAGovernor           MTATimelock
        OZ Governor v5        48h MIN_DELAY
        4% quorum             PROPOSER = Governor
        500K threshold        EXECUTOR = address(0)
        7-day voting          Admin = renounced
```

---

## Key Features

| Feature | Details |
|---------|---------|
| **Token (MTAToken)** | 100M hard cap · EIP-2612 Permit · EIP-5805 Votes · Pause · Blacklist |
| **Staking (MTAStaking)** | 4 tiers: 8%–40% fixed APY · UUPS upgradeable · Per-position isolation |
| **Vesting (MTAVesting)** | Linear schedules · Configurable cliff · Admin-revocable |
| **Governance (MTAGovernor)** | OZ Governor v5 · 4% quorum · 500K threshold · 7-day voting |
| **Timelock (MTATimelock)** | 48-hour delay · Open execution · Admin renounced |
| **Frontend** | Next.js 16 App Router · RainbowKit · wagmi v2 · 24 routes |

---

## Staking Tiers

| Tier | APY | Lock | Minimum | Early Exit |
|------|-----|------|---------|------------|
| 🥉 Bronze | **8%** | 30 days | 100 MTA | 20% of principal |
| 🥈 Silver | **15%** | 90 days | 1,000 MTA | 20% of principal |
| 🥇 Gold | **25%** | 180 days | 5,000 MTA | 20% of principal |
| 💎 Platinum | **40%** | 365 days | 10,000 MTA | 20% of principal |

> Rewards formula: `principal × apyBps × elapsed / (10_000 × 31_536_000)`  
> Each position is independently tracked — no pool dilution.  
> Early exit penalty goes back to the reward pool, increasing APY for remaining stakers.

---

## Tokenomics

```
Total Supply: 100,000,000 MTA (Hard Cap — No Inflation Ever)

┌──────────────────────────────────────────────────────────┐
│ Ecosystem Rewards  ████████████████████████████  35%    │
│ Liquidity          ████████████████            20%      │
│ Team               ████████████                15% ⏳   │
│ Treasury           ████████████                15% 🔒   │
│ Seed Round         ████████                    10% ⏳   │
│ Public Sale        ████                         5%      │
└──────────────────────────────────────────────────────────┘

⏳ = Vesting locked    🔒 = Governance gated
```

| Allocation | Amount | % | Vesting |
|------------|--------|---|---------|
| Ecosystem (Rewards + Grants) | 35,000,000 | 35% | TGE unlocked — DAO governed |
| Liquidity | 20,000,000 | 20% | TGE unlocked |
| Treasury | 15,000,000 | 15% | Timelock controlled |
| Team | 15,000,000 | 15% | 12-month cliff + 36-month linear |
| Seed Round | 10,000,000 | 10% | 6-month cliff + 18-month linear |
| Public Sale | 5,000,000 | 5% | TGE unlocked |

---

## Governance Parameters

| Parameter | Value |
|-----------|-------|
| Proposal Threshold | 500,000 MTA (0.5%) |
| Voting Delay | 7,200 blocks (~24 hours) |
| Voting Period | 50,400 blocks (~7 days) |
| Quorum | 4% of total supply |
| Timelock Delay | **48 hours (hardcoded)** |
| Execution | Open — any address can execute after delay |

---

## Live Deployments

### Ethereum Sepolia (Testnet — LIVE ✓)

| Contract | Address |
|----------|---------|
| MTAToken | [`0x27315C3bF2370E933C376A7982CBDA77FF122376`](https://sepolia.etherscan.io/address/0x27315C3bF2370E933C376A7982CBDA77FF122376#code) |
| MTAVesting | [`0x98fC5324F5f110B4f707Ee5444335B64f4640465`](https://sepolia.etherscan.io/address/0x98fC5324F5f110B4f707Ee5444335B64f4640465#code) |
| MTATimelock | [`0x572FAb358dE3322286BD05E8F9AeAF349c41Ab5e`](https://sepolia.etherscan.io/address/0x572FAb358dE3322286BD05E8F9AeAF349c41Ab5e#code) |
| MTAGovernor | [`0x9924B7c4fa59113e99748095a6af41eb9406730b`](https://sepolia.etherscan.io/address/0x9924B7c4fa59113e99748095a6af41eb9406730b#code) |
| MTAStaking (proxy) | [`0xd82f1c0f0AF107CDB25FB189575Ee60A6ce12D35`](https://sepolia.etherscan.io/address/0xd82f1c0f0AF107CDB25FB189575Ee60A6ce12D35) |

> All 5 contracts verified on Etherscan · Deployed at block 11,164,753

### BSC Mainnet — Pre-Audit | Ethereum Mainnet — Pre-Audit

---

## Security Architecture

| Layer | Mechanism |
|-------|-----------|
| Access Control | Role-based (RBAC) — OpenZeppelin AccessControl |
| Reentrancy | ReentrancyGuard on all state-mutating functions |
| Flash Loans | ERC20Votes checkpoints prevent proposal manipulation |
| Upgrade Safety | UUPS with UPGRADER_ROLE locked to Timelock |
| Emergency Pause | Token + Staking pausable by PAUSER_ROLE (multisig) |
| Governance Delay | 48-hour Timelock — hardcoded, cannot be reduced |
| Supply Cap | Hard cap enforced in `mint()`, permanently revokeable |
| Admin Handover | All roles transferred to Gnosis Safe 3/5 post-deploy |

**Audit Status:** External audit scheduled Q2 2026 (Trail of Bits / Certik)  
**Bug Bounty:** Immunefi $50K+ pool — planned at audit launch

---

## Quick Start

### Prerequisites

- Node.js 20+ · npm 10+

### Smart Contracts

```bash
# Install
npm install

# Compile contracts
npm run compile

# Run all 119 tests
npm run test:unit

# Gas report
npm run gas

# Coverage
npm run coverage
```

### Frontend

```bash
cd frontend
npm install
cp .env.production.example .env.local
# Edit .env.local — add WalletConnect ID + contract addresses

npm run build
npm run start
```

### Deploy (Testnet)

```bash
# 1. Preflight check
npm run preflight:sepolia

# 2. Deploy all contracts
npm run deploy:sepolia

# 3. Verify on Etherscan
npm run verify:ethereum

# 4. Transfer roles to multisig
npm run deploy:post:sepolia

# 5. Sync addresses to frontend
npm run sync-env:sepolia
```

---

## Test Coverage

```
119 tests — 0 failures

  MTAToken     ████████████████████████████████████  35 tests
  MTAVesting   ████████████████████████████████████████████████  40 tests
  MTAStaking   ████████████████████████████  22 tests
  MTAGovernor  ████████████████████████████  22 tests
```

| Suite | Tests | Scope |
|-------|-------|-------|
| MTAToken | 35 | Mint, pause, blacklist, permit, votes |
| MTAVesting | 40 | Schedules, cliff, linear, revoke |
| MTAStaking | 22 | Stake, unstake, rewards, early exit, UUPS |
| MTAGovernor | 22 | Proposals, voting, quorum, timelock |

---

## Project Structure

```
metaaras/
├── contracts/
│   ├── core/
│   │   ├── MTAToken.sol          # ERC-20 + Permit + Votes + Pause + Blacklist
│   │   ├── MTAVesting.sol        # Linear vesting with cliff + revocation
│   │   └── MTAStaking.sol        # 4-tier staking, UUPS upgradeable
│   ├── governance/
│   │   ├── MTAGovernor.sol       # OpenZeppelin Governor v5
│   │   └── MTATimelock.sol       # 48-hour TimelockController
│   └── interfaces/
│       └── IMTAToken.sol
│
├── scripts/
│   ├── deploy/                   # 00–05: Full deploy pipeline
│   ├── liquidity/                # PancakeSwap V3 + Uniswap V3 scripts
│   ├── verify/                   # Etherscan + BscScan verification
│   ├── utils/                    # approve_rewards, verify_state
│   ├── sync-env.ts               # Sync deploy addresses → frontend env
│   └── preflight.ts              # Pre-deploy safety checks
│
├── test/unit/                    # 119 unit tests
│
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── (marketing)/      # Public: whitepaper, roadmap, tokenomics…
│       │   └── (dapp)/           # DApp: staking, governance, vesting, analytics…
│       ├── components/
│       │   ├── marketing/        # Landing page sections
│       │   ├── layout/           # Navbar, Footer, Providers
│       │   └── ui/               # Reusable UI components
│       └── constants/
│           └── contracts.ts      # Chain-aware address resolution
│
├── listing/                      # CMC + CoinGecko + PancakeSwap files
├── social/                       # Twitter, Telegram, Discord guides
│
├── MAINNET_RUNBOOK.md            # Step-by-step deployment guide
├── LAUNCH_DAY_CHECKLIST.md       # Launch day operations
├── ROLLBACK_PLAN.md              # Rollback procedures
├── EMERGENCY_PROCEDURES.md       # Incident response
└── PRE_MAINNET_VERIFICATION.md   # Pre-launch verification
```

---

## Architecture Decisions

**Why UUPS for MTAStaking?**  
UUPS proxy allows the community to vote on new staking features (new tiers, liquid staking) without redeploying or migrating user positions.

**Why No Cross-Chain Bridge?**  
Each chain maintains an independent MTA instance. Removes bridge exploit risk (Ronin, Wormhole). Future cross-chain via LayerZero if/when the DAO votes.

**Why 20% Early Exit Penalty?**  
Creates meaningful cost for short-term speculation in long-lock tiers. Penalty feeds back into the reward pool — increases APY for remaining stakers.

**Why Hardcoded 48h Timelock?**  
Prevents governance attacks where an attacker rapidly passes a malicious proposal. Hardcoded means it cannot be reduced by any governance vote.

---

## Mainnet Roadmap

| Step | Status |
|------|--------|
| ✅ Smart contract development | Complete |
| ✅ 119-test unit test suite | Complete |
| ✅ Sepolia testnet deployment | Complete (Jun 2026) |
| ✅ Production frontend (24 routes) | Complete |
| ✅ Operational runbooks | Complete |
| 🔒 External security audit | Scheduled Q3 2026 |
| 🔒 Gnosis Safe multisig setup | Pre-mainnet |
| 🔒 Ethereum Mainnet deployment | Q3 2026 |
| 🔒 BSC Mainnet deployment | Q3 2026 |
| 🔒 PancakeSwap / Uniswap V3 liquidity | Post-mainnet |
| 🔒 CoinGecko + CMC listing | Post-mainnet |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Write tests for new contract code (coverage must not regress)
4. Run: `npm run lint && npm run test:unit`
5. Submit a PR with a clear description

---

## License

MIT — see [LICENSE](LICENSE)

---

<div align="center">

**MetaAras Protocol · v2.0.0-rc1 · June 2026**  
Built with ❤️ using OpenZeppelin · Hardhat · Next.js · wagmi

[Website](https://metaaras.io) · [DApp](https://app.metaaras.io) · [Docs](https://metaaras.io/docs) · [Twitter](https://twitter.com/MetaArasDAO) · [Telegram](https://t.me/metaaras) · [GitHub Issues](https://github.com/metaaras/metaaras-protocol/issues)

</div>
