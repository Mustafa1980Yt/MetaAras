# MetaAras (MTA) — Mainnet Readiness Checklist

**Version:** 1.0  
**Last Updated:** 2026-06-28  
**Target Mainnet Date:** Q3 2026  
**Current Status:** 🟡 Testnet Phase

---

## Go / No-Go Criteria

**ALL items in "BLOCKING" sections must be ✅ before mainnet deployment.**  
Non-blocking items should be addressed within 30 days post-launch.

---

## BLOCKING: Security

| # | Requirement | Status | Owner | ETA |
|---|-------------|--------|-------|-----|
| S1 | External security audit completed | ⏳ | Security team | Q3 2026 |
| S2 | All HIGH/CRITICAL audit findings fixed | ⏳ | Dev team | Pre-launch |
| S3 | Audit report published publicly | ⏳ | Security team | Pre-launch |
| S4 | Second audit / diff audit (if major changes) | ⏳ | Security team | If needed |
| S5 | Slither — zero HIGH findings | ✅ | CI/CD | Passing |
| S6 | Bug bounty program live on testnet ≥ 14 days | ⏳ | Marketing | Pre-launch |
| S7 | Emergency pause has been tested on testnet | ⏳ | Dev team | Pre-launch |

---

## BLOCKING: Smart Contracts

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| C1 | All 5 contracts deployed and verified on Sepolia | ⏳ | Deploy scripts ready |
| C2 | All 5 contracts deployed and verified on Sepolia | ✅ | Block 11,164,753 — Jun 2026 |
| C3 | Integration tests pass on fork of mainnet | ⏳ | Requires Alchemy fork |
| C4 | Token total supply = 100,000,000 MTA after distribution | ⏳ | Verified by deploy script |
| C5 | Minting permanently revoked (revokeMinter called) | ⏳ | Step 2 of deploy |
| C6 | Admin roles transferred to Gnosis Safe multisig | ⏳ | Step 5 of deploy |
| C7 | Deployer admin roles renounced | ⏳ | Step 5 of deploy |
| C8 | All contracts verified on Etherscan/BscScan | ⏳ | verify_all.ts script |

---

## BLOCKING: Multisig Configuration

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| M1 | Gnosis Safe created at app.safe.global | ⏳ | 3-of-5 threshold minimum |
| M2 | All Safe signers verified (hardware wallets preferred) | ⏳ | Pre-launch |
| M3 | Test transaction executed via Safe on testnet | ⏳ | Pre-launch |
| M4 | Token admin transferred to Safe | ⏳ | Post-deploy step |
| M5 | Staking admin transferred to Safe | ⏳ | Post-deploy step |
| M6 | Safe address documented in DEPLOYMENT.md | ⏳ | Post-setup |

---

## BLOCKING: Testing

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| T1 | Unit test coverage ≥ 95% | ⏳ | Run: npm run coverage |
| T2 | Integration tests pass on local hardhat | ⏳ | Run: npm run test:integration |
| T3 | All 900 Playwright E2E tests pass | ✅ | Last run: 900/900 |
| T4 | Community testnet testing period ≥ 7 days | ⏳ | After testnet deploy |
| T5 | Load test: frontend handles 100 concurrent users | ⏳ | Pre-launch |

---

## BLOCKING: Legal & Compliance

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| L1 | Legal review of token structure completed | ⏳ | Counsel required |
| L2 | Terms of Service published | ⏳ | Legal team |
| L3 | Privacy Policy published | ⏳ | Legal team |
| L4 | Risk disclosure published | ⏳ | Whitepaper section 10 |
| L5 | Jurisdiction restrictions documented | ⏳ | Legal team |

---

## NON-BLOCKING (Target: Within 30 Days Post-Launch)

### Infrastructure

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| I1 | Custom domain configured (metaaras.io) | ⏳ | DNS setup |
| I2 | HTTPS / SSL certificates active | ⏳ | Infrastructure |
| I3 | CDN configured for frontend assets | ⏳ | Vercel/Cloudflare |
| I4 | Monitoring and alerting set up | ⏳ | Grafana/DataDog |
| I5 | Uptime monitoring (target: 99.9%) | ⏳ | StatusPage |

### Frontend

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| F1 | Real WalletConnect Project ID (not demo) | ⏳ | cloud.walletconnect.com |
| F2 | NEXT_PUBLIC_MTA_*_ADDRESS set to mainnet | ⏳ | After mainnet deploy |
| F3 | MetaAras logo/favicon finalized | ✅ | Zap icon + gradient |
| F4 | Open Graph / social preview images | ⏳ | Marketing |
| F5 | SEO meta tags complete | ✅ | All pages have metadata |
| F6 | Analytics integration (privacy-respecting) | ⏳ | Optional |
| F7 | Error boundary components | ⏳ | React error boundaries |

### Community

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| COM1 | GitHub repository public | ⏳ | Current: private |
| COM2 | Discord/Telegram community channel | ⏳ | Pre-launch |
| COM3 | Twitter/X account (@MetaAras) | ⏳ | Pre-launch |
| COM4 | CoinGecko / CoinMarketCap listing applied | ⏳ | Post-launch |
| COM5 | Blog post / announcement published | ⏳ | Launch day |

### Documentation

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| D1 | Whitepaper v2 PDF generated and hosted | ⏳ | Docs section |
| D2 | Technical documentation complete | ✅ | /docs page |
| D3 | Audit report linked from website | ⏳ | Post-audit |
| D4 | Video walkthrough / demo | ⏳ | Optional |

---

## Mainnet Deployment Sequence

When all BLOCKING items are ✅, execute in this exact order:

```
Day 0 (Deploy Day):
  08:00  Final audit sign-off confirmed
  09:00  Multisig signers assembled and tested
  10:00  Deploy MTAToken to mainnet
  10:30  Deploy MTAVesting to mainnet
  11:00  Deploy MTAGovernor + MTATimelock to mainnet
  11:30  Deploy MTAStaking to mainnet
  12:00  Execute token distribution
  12:30  Transfer admin roles to multisig
  13:00  Renounce deployer roles
  13:30  Verify all contracts on Etherscan
  14:00  Update frontend env vars to mainnet addresses
  14:30  Rebuild and deploy frontend
  15:00  Public announcement

Day 1+:
  Monitor contract events and transaction activity
  Watch for unusual staking patterns or governance activity
  Stand by for emergency response if needed
```

---

## Current Readiness Score

| Category | Weight | Score | Weighted |
|----------|--------|-------|---------|
| Security | 30% | 25/60 (42%) | 12.6/30 |
| Smart Contracts | 25% | 0/8 (0%) | 0/25 |
| Multisig | 15% | 0/6 (0%) | 0/15 |
| Testing | 15% | 1/5 (20%) | 3/15 |
| Legal | 10% | 0/5 (0%) | 0/10 |
| Non-blocking | 5% | 7/22 (32%) | 1.6/5 |
| **Total** | **100%** | | **17.2/100** |

> ⚠️ **17/100** — Not ready for mainnet. Complete BLOCKING items first.

---

## Contact

For security issues: security@metaaras.io (not yet active — use GitHub Issues)  
For deployment questions: Use the project's internal communication channels.

*This document is reviewed and updated weekly during the pre-launch phase.*
