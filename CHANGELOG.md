# Changelog

All notable changes to MetaAras are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
