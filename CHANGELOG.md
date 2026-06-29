# Changelog

All notable changes to MetaAras are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2.2.0-rc1] — 2026-06-29

### Security (Critical)
- **`MTAStaking.sol` UPGRADER_ROLE backdoor closed** — `05_post_deploy.ts` now transfers `UPGRADER_ROLE` to the Timelock (governance-gated upgrades) and revokes it from the deployer; 2 new verification checks added
- **`MTAVesting.sol` blacklisted-beneficiary rescue** — Added `adminEmergencyRelease(scheduleId, destination)`: redirects vested tokens when beneficiary is blacklisted; works for revocable and non-revocable schedules; 8 tests
- **`MTAVesting.sol` excess token recovery** — Added `withdrawExcess(destination)`: recovers tokens sent directly to contract beyond `totalVestingAmount`; 6 tests; `Vesting__NoExcess` error
- **CSP header** — `next.config.ts` now sets `Content-Security-Policy` (default-src, script-src, connect-src, frame-src WalletConnect, object-src 'none', base-uri 'self')

### Added
- `Vesting__NoExcess` custom error (replaces unused `Vesting__CannotRelease`)
- `EmergencyReleased(scheduleId, destination, amount)` event
- `ExcessWithdrawn(destination, amount)` event
- 14 new MTAVesting tests

### Changed
- `05_post_deploy.ts` — UPGRADER_ROLE: granted to Timelock, revoked from deployer, 2 extra verification checks, `upgradeTarget` in deployment JSON
- `SECURITY_CHECKLIST.md` v1.1 — items 29-31, 43, 49 added/updated; total 60→64, done 36→45
- `package.json` version → `2.2.0-rc1`

### Tests
- **Total: 194/194** (↑ from 180, +14 MTAVesting)

---

## [2.1.0-rc3] — 2026-06-29

### Added
- **`adminUnstake` tests** — 9 comprehensive tests covering normal flow, early exit penalty, post-lock no-penalty, `EmergencyUnstaked` event, state changes, double-call revert, zero-destination revert, non-admin revert, totalPenaltiesCollected tracking
- **`scripts/sync-abis.ts`** — automated ABI sync script; run `npm run sync-abis` after any contract change
- **`npm run sync-abis`** — package.json script added for ABI regeneration

### Changed
- **`MTAStaking.sol`** — removed unused `Staking__ZeroAmount` error (superseded by `Staking__BelowMinimum`)
- **All ABI JSON files** — regenerated from compiled artifacts to match current contract state:
  - `MTAStaking.abi.json`: added `stakedApyBps` field to `StakePosition` struct, added `adminUnstake`, `EmergencyUnstaked`, `RewardPoolDepleted`, `Staking__BelowMinimum`, `MIN_STAKE_AMOUNT`, `MAX_LOCK_DURATION`; removed `Staking__ZeroAmount`
  - `MTAToken.abi.json`, `MTAVesting.abi.json`, `MTAGovernor.abi.json`: regenerated from artifacts
- **`staking/page.tsx`** — inline `getPosition` ABI updated with `stakedApyBps` field; added 1 MTA minimum stake validation with user-friendly error message; "No minimum" → "1 MTA"
- **`governance/page.tsx`** — Voting delay/period display changed from block-based ("7,200 blocks") to timestamp-based ("24h", "7 days") to match EIP-6372 timestamp clock implementation
- **`analytics/page.tsx`** — staking tier "No minimum" updated to "1 MTA"
- **`.solhint.json`** — removed non-existent Solhint 5.x rules (`contract-name-camelcase`, `event-name-camelcase`)
- **`package.json`** version → `2.1.0-rc3`

### Fixed
- **Test failures**: `Staking__ZeroAmount` → `Staking__BelowMinimum` in unit and fuzz tests (2 tests fixed)

### Tests
- **Total: 180/180** (↑ from 170, added 10 adminUnstake tests)
- MTAToken: 35 · MTAVesting: 40 · MTAStaking: 61 · MTAGovernor: 24 · Integration: 19 · Fuzz: 26 (5 corrected: zero-amount → BelowMinimum)

---

## [2.0.0-rc1] — 2026-06-29

### Added
- **MTAGovernor test suite** — 22 new unit tests (Deployment, Proposals, Voting, State Machine, Quorum)
- **Admin panel** (`/admin`) — role-gated interface: pause/unpause token + staking, blacklist management, role inspector
- **Analytics panel** (`/analytics`) — live on-chain metrics: TVL, supply, staking ratio, allocation bar charts
- **Landing page** — expanded from 1 section to 7 (ProtocolStats, HowItWorks, StakingTiers, Governance, Security, CTA)
- **Staking page** — complete rewrite: ERC20 approve flow, "My Positions" tab, Claim/Compound/Unstake per position
- **Mainnet deployment scripts** (01–05): full pipeline from token deploy through admin handover
- **Liquidity scripts**: `add_pancakeswap_liquidity.ts` (BSC), `add_uniswap_liquidity.ts` (ETH)
- **Mainnet npm scripts**: `preflight:mainnet`, `deploy:token:mainnet`, `verify:ethereum`, `sync-env:mainnet`, `liquidity:pancakeswap`, etc.
- **Operational documents**: `MAINNET_RUNBOOK.md`, `LAUNCH_DAY_CHECKLIST.md`, `ROLLBACK_PLAN.md`, `EMERGENCY_PROCEDURES.md`, `PRE_MAINNET_VERIFICATION.md`
- **Listing files**: `listing/coinmarketcap_info.json`, `listing/coingecko_info.json`, `listing/pancakeswap_listing_checklist.md`
- **Social guides**: `social/twitter_profile.md`, `social/telegram_group.md`, `social/discord_structure.md`
- **Deployment guides**: `GITHUB_UPLOAD_GUIDE.md`, `VERCEL_DEPLOY_GUIDE.md`, `DOMAIN_SETUP_GUIDE.md`
- **`frontend/.env.production.example`** — production environment variable template
- Navbar: `Analytics` and `Admin` links added to DApp navigation
- Roadmap: Phase 2 → `completed`, Phase 3 → `in-progress`

### Changed
- `scripts/deploy/05_post_deploy.ts` — complete rewrite: now transfers PAUSER_ROLE + BLACKLISTER_ROLE + Vesting admin (previously only DEFAULT_ADMIN); added Gnosis Safe code-check guard; idempotent role checks
- `package.json` version → `2.0.0-rc1`; `test:unit` now includes MTAGovernor tests
- `README.md` — complete rewrite: GitHub showcase quality, architecture diagram, staking tier table, tokenomics bar chart, security table

### Fixed
- `05_post_deploy.ts` was writing wrong env var prefix (`NEXT_PUBLIC_MTA_*` instead of `NEXT_PUBLIC_ETH_MAINNET_MTA_*`)
- `test/unit/MTAGovernor.test.ts` — Typechain overload type errors: `quorumNumerator` and `encodeFunctionData("pause")` casts fixed
- `frontend/.gitignore` — `.env*` pattern was incorrectly suppressing `.env.production.example`

### Tests
- **Total: 119/119** (↑ from 97, added 22 MTAGovernor tests)
- MTAToken: 35 · MTAVesting: 40 · MTAStaking: 22 · MTAGovernor: 22

---

## [1.1.0-RC1] — 2026-06-29

### Added
- **Multichain architecture**: native support for Ethereum + BNB Smart Chain
- Per-network environment variable prefix system (`ETH_SEPOLIA_*`, `BSC_TESTNET_*`, `ETH_MAINNET_*`, `BSC_MAINNET_*`)
- `NetworkGuard` component: detects wrong chain, shows one-click switch buttons
- `networks.ts`: central multichain config with `isActiveChain()` and `getActiveChains()` helpers
- `NETWORK_ENV` variable: controls `development` / `testnet` / `mainnet` active chain filtering
- BSC Testnet Hardhat network config with `BSC_TESTNET_RPC_URL` support
- `preflight:bsc-testnet` — pre-deploy validation for BSC (balance, RPC, key format)
- `deploy:bsc-testnet`, `verify:bsc-testnet`, `sync-env:bsc-testnet` npm scripts
- `scripts/verify/verify_ethereum.ts` — Etherscan verification for mainnet + Sepolia
- `scripts/verify/verify_bsc.ts` — BscScan verification for BSC + BSC Testnet
- Litepaper page (`/litepaper`) — executive summary of the protocol
- Privacy Policy page (`/privacy`)
- Terms of Service page (`/terms`)
- Risk Disclosure page (`/risk`)
- `robots.ts` — Next.js App Router robots.txt generation
- `sitemap.ts` — Next.js App Router sitemap.xml generation
- `AUDIT_PREP.md` — audit scope, test coverage, known limitations
- `CHANGELOG.md` — this file
- Roadmap extended to 2027-2028 (Phase 6: L2, Phase 7: Ecosystem Maturity)
- Whitepaper Section 8: Multichain Architecture (v2.1)
- Docs: BSC Testnet deploy pipeline, multichain architecture section

### Changed
- `hardhat.config.ts`: placeholder PRIVATE_KEY no longer causes compile errors (regex validation)
- `sync-env.ts`: rewritten for per-network prefix isolation (multiple networks coexist in `.env.local`)
- `preflight.ts`: added BSC support, placeholder detection, BSCSCAN_API_KEY check
- `constants/contracts.ts`: added `bsc` mainnet key (previously mapped to `mainnet` incorrectly)
- `lib/contracts/index.ts`: per-network env vars instead of shared `NEXT_PUBLIC_MTA_*`
- Hero badge: "Modül 1 Complete" → "Multichain DeFi Protocol — Ethereum + BNB Chain"
- Hero feature: "Audited Security" → "Battle-Tested Security" (accurate pre-audit messaging)
- Staking early exit: updated FAQ, Tokenomics, Litepaper, and Whitepaper (NOTE: subsequently corrected in v1.0.0 Final Audit — see Fixed)
- Footer: "Smart contracts audited" → "OpenZeppelin v5 · Ethereum + BNB Chain"
- Footer: Added `Legal` section (Risk Disclosure, Privacy Policy, Terms of Service)
- Navbar: Added Litepaper link
- SEO: Updated keywords (BNB Chain, BSC, Multichain, APY, DAO), OG image placeholder, Twitter card
- README: Updated for multichain, BSC testnet deploy steps, version → 1.1.0-RC1

### Fixed
- `contracts.ts` BSC mainnet case 56 was returning `mainnet` addresses instead of `bsc`
- FAQ and Tokenomics early exit penalty: interim fix was itself incorrect ("50% on rewards"); reverted to match contract (`EARLY_EXIT_PENALTY_BPS = 2,000` = 20% of principal) in Final Audit
- `.env.local` mixed old/new format after sync-env rewrite (clean rewrite)
- Stale `sync-env` npm script (no-arg) removed from frontend/package.json

---

## [1.0.0-RC1] — 2026-01-15

### Added
- MTAToken: ERC-20, 100M supply, Permit, Votes, Pause, Blacklist
- MTAVesting: linear schedules, cliff support, admin-revocable
- MTAStaking: 4-tier APY (8/15/25/40%), UUPS upgradeable, per-position isolation
- MTAGovernor: OpenZeppelin Governor v5, 7-day vote period, 4% quorum
- MTATimelock: 48-hour execution delay
- 97/97 unit tests (100% statement coverage)
- Slither static analysis — no high/critical findings
- Next.js 16 App Router frontend with 12 pages
- RainbowKit + wagmi v2 wallet integration
- Dark/light theme, full mobile responsive
- Hardhat deploy pipeline with preflight validation
- Etherscan verification scripts
- `SECURITY_CHECKLIST.md`, `MAINNET_READINESS.md`
- `RELEASE_NOTES_v1.0.0-RC1.md`
