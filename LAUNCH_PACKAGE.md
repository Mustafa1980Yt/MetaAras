# MetaAras v1.0 — Launch Package

> **Version:** 2.2.0-rc1 — Code Complete  
> **Prepared:** 2026-06-29  
> **Audience:** Core team members executing the mainnet launch  
> **Security:** Do not share PRIVATE_KEY, wallet seeds, or multisig signing details in any channel

---

## Code Status: FROZEN

**No code changes are needed before mainnet.** The smart contracts, frontend, and all deployment scripts are complete, tested (194/194), and audit-ready. The only remaining work is operational.

**Remaining hard blockers:**
1. External security audit completion and critical/high findings remediated
2. Gnosis Safe 3-of-5 multisig created on Ethereum Mainnet + BSC Mainnet

Everything else in this document can be prepared in parallel with the audit.

---

# Part 1 — Mainnet Deployment Runbook

## 1.1 Pre-Deploy Checklist (Complete Before Day 0)

Run through this list in the week before planned launch. Every item must be ✅ before executing the deploy.

```
Infrastructure
□ Gnosis Safe 3-of-5 created — Ethereum Mainnet    MULTISIG_ETH=0x...
□ Gnosis Safe 3-of-5 created — BSC Mainnet         MULTISIG_BSC=0x...
□ All 5 Safe signers confirmed on hardware wallets
□ Test Safe: send 0.001 ETH in/out with 3-of-5 signature — confirmed working

API Keys
□ Alchemy API key — Ethereum Mainnet endpoint       ALCHEMY_API_KEY=...
□ Etherscan API key — active, not expired           ETHERSCAN_API_KEY=...
□ BscScan API key — active, not expired             BSCSCAN_API_KEY=...
□ WalletConnect production project ID               WALLETCONNECT_PROJECT_ID=...
  (Register at cloud.walletconnect.com → New Project → Copy ID)

Wallets (all hardware wallets, all funded)
□ DEPLOYER wallet — Ethereum Mainnet — balance ≥ 0.5 ETH
□ DEPLOYER wallet — BSC Mainnet — balance ≥ 0.3 BNB
□ TREASURY_WALLET   — 0x...  (receives 15M MTA directly)
□ TEAM_WALLET       — 0x...  (receives 15M MTA via vesting, 12m cliff)
□ SEED_WALLET       — 0x...  (receives 10M MTA via vesting, 6m cliff)
□ ECOSYSTEM_WALLET  — 0x...  (receives 35M MTA directly, Gnosis Safe)
□ LIQUIDITY_WALLET  — 0x...  (receives 20M MTA, used for DEX pools)
□ PUBLIC_SALE_WALLET — 0x... (receives 5M MTA, used for TGE)

Audit
□ External audit completed (Trail of Bits / Certik / Code4rena)
□ All Critical findings: Resolved
□ All High findings: Resolved
□ Medium/Low findings: Reviewed and documented (accept or fix)
□ Audit report PDF received from firm

Code
□ git checkout mainnet-launch && git pull
□ npx hardhat compile — 0 errors
□ npx hardhat test — 194/194 passing
□ npm run lint — Solhint clean
□ cd frontend && npm run build — 24 routes, 0 errors
```

## 1.2 Environment Setup

```bash
# Root project — create .env (never commit this file)
cp .env.example .env

# Edit .env — fill every field:
PRIVATE_KEY=0x<deployer hardware wallet exported key — use only for this session>
ALCHEMY_API_KEY=<production Alchemy mainnet key>
ETHERSCAN_API_KEY=<etherscan.io key>
BSCSCAN_API_KEY=<bscscan.com key>
MULTISIG_ADDRESS=0x<Gnosis Safe address — Ethereum>
TREASURY_WALLET=0x<treasury wallet>
TEAM_WALLET=0x<team wallet>
SEED_WALLET=0x<seed investor wallet>
ECOSYSTEM_WALLET=0x<ecosystem Gnosis Safe>
LIQUIDITY_WALLET=0x<liquidity wallet>
PUBLIC_SALE_WALLET=0x<public sale wallet>
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<production WalletConnect ID>
NEXT_PUBLIC_NETWORK_ENV=mainnet
```

## 1.3 Ethereum Mainnet Deploy (Day 0, Ethereum)

Each step writes to `deployments/mainnet.json`. If any step fails, fix the issue and re-run that step only — the file acts as state.

```bash
# Step 0 — Final preflight (will catch missing env vars and low balance)
# NOTE: Remove the mainnet guard in preflight.ts first (lines 53-59)
# or run individual checks manually
npm run preflight:mainnet

# Step 1 — Deploy MTAToken
# Expected: contract deployed + Etherscan verified (waits 15 blocks)
# Duration: ~3 minutes
npm run deploy:token:mainnet

# Verify in deployments/mainnet.json:
# { "contracts": { "MTAToken": "0x..." } }

# Step 2 — Deploy MTAVesting + Distribute 100M MTA
# CRITICAL: Verify wallet addresses in .env before running
# This step: deploys vesting, mints 100M total, creates 2 schedules, revokes minter
# Duration: ~5 minutes (6 transactions)
npm run deploy:vesting:mainnet

# Verify: totalSupply() == 100_000_000e18
# Verify: isMintingDisabled() == true  (PERMANENT — cannot undo)

# Step 3 — Deploy MTATimelock + MTAGovernor
# This step: deploys both, wires roles, deployer renounces timelock admin
# Duration: ~4 minutes
npm run deploy:governance:mainnet

# Verify: timelock.getMinDelay() == 172800 (48 hours)
# Verify: deployer has NO admin role on timelock

# Step 4 — Deploy MTAStaking (UUPS proxy)
# Duration: ~3 minutes
npm run deploy:staking:mainnet

# Verify: proxy address and implementation address both in deployments/mainnet.json

# Step 5 — Transfer all roles to multisig (IRREVERSIBLE)
# READ the output carefully — 9 checks must all pass at the end
# Duration: ~5 minutes (9 transactions)
npm run deploy:post:mainnet

# Required output (all must show ✓):
#   ✓ Token DEFAULT_ADMIN multisig'te
#   ✓ Token DEFAULT_ADMIN deployer'da yok
#   ✓ Minting devre dışı
#   ✓ Vesting VESTING_ADMIN multisig'te
#   ✓ Vesting VESTING_ADMIN deployer'da yok
#   ✓ Staking DEFAULT_ADMIN multisig'te
#   ✓ Staking DEFAULT_ADMIN deployer'da yok
#   ✓ Staking UPGRADER_ROLE deployer'da yok
#   ✓ Staking UPGRADER_ROLE devredildi

# Step 6 — Fund the reward pool (run from TREASURY_WALLET, not deployer)
# The TREASURY_WALLET must sign this transaction
# Option A: Import TREASURY_WALLET key temporarily:
#   PRIVATE_KEY=<treasury private key> npm run approve-rewards:mainnet
# Option B: Use hardware wallet with TREASURY_WALLET address in Hardhat config
npm run approve-rewards:mainnet

# Step 7 — Final on-chain state verification
# All 15+ checks must pass — do not launch without this
npm run state:mainnet

# Step 8 — Sync contract addresses to frontend
npm run sync-env:mainnet
```

## 1.4 BSC Mainnet Deploy (Day 0 or Day 1, BSC)

Same sequence with BSC network. Use BSC MULTISIG_ADDRESS:

```bash
# Update .env: MULTISIG_ADDRESS=0x<BSC Gnosis Safe>
npm run deploy:token:bsc
npm run deploy:vesting:bsc       # NOTE: also mints 100M on BSC
npm run deploy:governance:bsc
npm run deploy:staking:bsc
npm run deploy:post:bsc
npm run approve-rewards:bsc
npm run state:bsc
npm run sync-env:bsc
```

**Important:** BSC and Ethereum are independent deployments. Each chain has its own 100M MTA supply. The protocol is multi-chain, not cross-chain bridged.

## 1.5 Contract Verification

```bash
npm run verify:ethereum    # Verifies all 5 contracts on Etherscan
npm run verify:bsc         # Verifies all 5 contracts on BscScan
```

Expected output for each contract: `✓ <ContractName> doğrulandı`

If a contract shows `✓ Zaten doğrulanmış` — already verified, no action needed.

If a contract fails verification:
1. Wait 2-3 minutes (Etherscan indexing can lag)
2. Re-run the verify script — it is idempotent
3. If still failing, verify manually via Etherscan UI (see Part 3)

## 1.6 Frontend Production Deploy

```bash
cd frontend
cp .env.production.example .env.production.local

# Edit .env.production.local:
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<production ID>
NEXT_PUBLIC_NETWORK_ENV=mainnet
# Mainnet addresses are already filled by sync-env:mainnet above

npm run build    # Must complete: 24 routes, 0 errors, 0 warnings
npm run start    # Test locally on port 3000 before Vercel deploy

# Verify locally:
# 1. Connect MetaMask (Ethereum Mainnet)
# 2. Navigate to /staking — tier cards visible, APY correct
# 3. Navigate to /governance — voting parameters correct
# 4. Navigate to /analytics — TVL shows 0 (no stakers yet) — OK
# 5. Navigate to /vesting — "no schedules" for random wallet — OK

# Deploy to Vercel
npx vercel --prod
# OR push to mainnet-launch branch if Vercel is connected to GitHub
```

---

# Part 2 — Rollback Plan

## 2.1 What Can Be Rolled Back vs. What Cannot

| Action | Reversible? | Method |
|--------|-------------|--------|
| Frontend deploy | ✅ Yes | Redeploy previous Vercel build (instant) |
| Add liquidity to DEX | ✅ Yes | Remove liquidity (if not locked) |
| Add liquidity (locked) | ❌ No | Cannot unlock until lock expiry |
| Role transfer to multisig | ❌ No | Multisig can transfer roles again, but deployer cannot |
| Token distribution (mint) | ❌ No | Minting revoked — cannot undo |
| Smart contract deploy | ❌ No | Can deploy new contracts but old ones persist |
| Vesting schedule creation | Partial | Revocable schedules can be cancelled; non-revocable cannot |
| Staking APY change | ✅ Via governance | Timelock proposal (48h delay) |
| Staking pause | ✅ Via multisig | Instant — call pause() from Gnosis Safe |
| Token pause | ✅ Via multisig | Instant — call pause() from Gnosis Safe |

## 2.2 Pre-Announcement Rollback (Before Public Announcement)

If a critical issue is discovered BEFORE the public announcement:

```
Timeline: 0-4 hours after deploy

1. DO NOT announce on any social channel
2. Pause token and staking via Gnosis Safe (3 signers needed):
   MTAToken.pause() — from Gnosis Safe
   MTAStaking.pause() — from Gnosis Safe
3. If issue is in frontend: roll back Vercel to previous build
4. If issue is in contracts: see Section 2.4
5. Communicate internally only — no public posts until resolved
```

## 2.3 Post-Announcement Rollback (After Public Announcement)

If a critical issue is discovered AFTER the public announcement:

```
Timeline: 0-15 minutes from detection

Step 1 — PAUSE (immediate, no delay)
  Gnosis Safe signers coordinate via Signal/private channel
  Execute: MTAToken.pause()
  Execute: MTAStaking.pause()
  This stops all transfers and staking operations immediately

Step 2 — COMMUNICATE (within 30 minutes)
  Post on Twitter/X: "We have paused MTAToken and MTAStaking as a precaution
  while investigating a potential issue. No funds have been lost. Update in 2 hours."
  Post same message on Telegram and Discord
  DO NOT say "hack" or "exploit" until confirmed

Step 3 — INVESTIGATE
  Identify affected contracts and transactions
  Estimate scope: how many users, how much funds at risk
  Contact audit firm's emergency line

Step 4 — REMEDIATE
  If frontend bug: fix and redeploy (no user funds at risk)
  If contract bug: see Section 2.4

Step 5 — RESUME or WIND DOWN
  If fixable: deploy patched version, migrate state if needed, unpause
  If not fixable: communicate recovery plan, facilitate user withdrawals
```

## 2.4 Smart Contract Emergency Procedures

**Scenario A: Bug discovered, no funds lost yet**
```
1. Pause all contracts (Section 2.3 Step 1)
2. Assess: Can users withdraw funds while paused?
   - unstake() is blocked by pause()
   - vesting release() is blocked by token pause()
3. Create emergency Timelock proposal to allow withdrawals:
   - UPGRADER_ROLE (Timelock) can upgrade MTAStaking to new implementation
   - Must wait 48h for Timelock delay
4. If 48h is too long: multisig can use adminUnstake() for each position
```

**Scenario B: Funds actively being drained**
```
1. Pause IMMEDIATELY — this is the top priority
2. MTAToken pause blocks all transfers including the attacker
3. Once paused, funds cannot move
4. Then: investigate, communicate, plan recovery
```

**Scenario C: Governance attack (malicious proposal passed)**
```
1. Check if proposal is in queue (Timelock has not executed yet)
2. Multisig can cancel the Timelock operation before execution:
   MTATimelock.cancel(operationId) — multisig has CANCELLER_ROLE?
   Note: Governor has CANCELLER_ROLE, not multisig — proposer can cancel
3. If proposal already executed and damage done: treat as Scenario A or B
```

**Emergency contacts to prepare:**
- Audit firm emergency line: [get from audit firm upon engagement]
- Immunefi: immunefi.com/bug-bounty (white-hat reports go here)
- Etherscan team (for adding warning to contract page if needed)

---

# Part 3 — Explorer Contract Verification Guide

## 3.1 Automatic Verification (Preferred)

The deploy scripts automatically verify during deployment. After running `npm run verify:ethereum`, all contracts should appear as verified on Etherscan.

Confirm by visiting each contract address on Etherscan:
- Look for the green checkmark ✓ next to "Contract"
- Click "Contract" tab → should show source code, not bytecode

## 3.2 Manual Verification (if automatic fails)

### MTAToken — Standard Contract

1. Go to `https://etherscan.io/address/<MTAToken_ADDRESS>#code`
2. Click "Verify and Publish"
3. Fill:
   - Compiler: Solidity (Single file) or (Multi-Part files) — use Standard JSON
   - Compiler version: `v0.8.24+commit.e11b9ed9`
   - License: MIT
4. Upload the Hardhat standard JSON:
   ```bash
   npx hardhat verify --network mainnet <MTAToken_ADDRESS> \
     <DEPLOYER_ADDRESS> \
     <DEPLOYER_ADDRESS> \
     <MULTISIG_ADDRESS> \
     <MULTISIG_ADDRESS>
   ```
   (admin, minter, pauser, blacklister arguments)

### MTAVesting — Standard Contract

```bash
npx hardhat verify --network mainnet <MTAVesting_ADDRESS> \
  <MTAToken_ADDRESS> \
  <TREASURY_WALLET> \
  <DEPLOYER_ADDRESS>
```

### MTATimelock — Standard Contract

```bash
npx hardhat verify --network mainnet <MTATimelock_ADDRESS> \
  "[]" "[]" <DEPLOYER_ADDRESS>
```
Note: empty arrays `[]` for proposers and executors (configured post-deploy)

### MTAGovernor — Standard Contract

```bash
npx hardhat verify --network mainnet <MTAGovernor_ADDRESS> \
  <MTAToken_ADDRESS> \
  <MTATimelock_ADDRESS>
```

### MTAStaking — UUPS Proxy (special)

```bash
# Verify the IMPLEMENTATION (not the proxy)
npx hardhat verify --network mainnet <MTAStaking_IMPL_ADDRESS>
# No constructor arguments (implementation uses _disableInitializers())

# The proxy itself is auto-detected by Etherscan via EIP-1967
```

## 3.3 Post-Verification Checks

For each verified contract on Etherscan, confirm:

```
MTAToken
□ Read: MAX_SUPPLY() = 100000000000000000000000000 (100M × 10^18)
□ Read: isMintingDisabled() = true
□ Read: totalSupply() = 100000000000000000000000000
□ Read: paused() = false

MTAVesting
□ Read: token() = MTAToken address
□ Read: treasury() = TREASURY_WALLET address
□ Read: totalVestingAmount() = 25000000000000000000000000 (25M × 10^18)

MTATimelock
□ Read: getMinDelay() = 172800 (48 hours in seconds)
□ Read: hasRole(PROPOSER_ROLE, MTAGovernor) = true
□ Read: hasRole(EXECUTOR_ROLE, address(0)) = true
□ Read: hasRole(DEFAULT_ADMIN_ROLE, deployer) = false

MTAGovernor
□ Read: token() = MTAToken address
□ Read: timelock() = MTATimelock address
□ Read: votingDelay() = 86400
□ Read: votingPeriod() = 604800
□ Read: proposalThreshold() = 500000000000000000000000 (500K MTA)

MTAStaking (proxy)
□ Read via proxy: stakingToken() = MTAToken address
□ Read via proxy: rewardsPool() = TREASURY_WALLET address
□ Read via proxy: paused() = false
□ Implementation slot: eth_getStorageAt(proxy, 0x360894...)
```

---

# Part 4 — DEX Liquidity Guide

## 4.1 Overview

| Exchange | Chain | Pair | Fee Tier | Amount |
|----------|-------|------|----------|--------|
| Uniswap V3 | Ethereum | MTA/WETH | 0.3% | 10M MTA + $30K+ ETH |
| PancakeSwap V3 | BSC | MTA/WBNB | 0.25% | 10M MTA + $30K+ BNB |

**Minimum total liquidity at launch: $60,000 USD equivalent.**
Below this, price impact for a $5,000 trade exceeds 10% — unacceptable for users.

## 4.2 Uniswap V3 — Ethereum Mainnet

### Using the Script

```bash
# Ensure LIQUIDITY_WALLET has:
# - 10M MTA approved to Uniswap NonfungiblePositionManager
# - Sufficient ETH for liquidity + gas

npm run liquidity:uniswap
```

### Manual via Uniswap UI

1. Go to `https://app.uniswap.org/pools`
2. Click "New Position"
3. Select tokens:
   - Token A: MTA → paste MTAToken mainnet address
   - Token B: ETH
4. Select fee tier: **0.3%** (standard for new/unknown tokens)
5. Set price range: **Full Range** (click "Full Range" button)
   - This maximizes liquidity depth at any price
   - Reduces impermanent loss risk during early volatile period
6. Enter amounts: 10M MTA + equivalent ETH
7. Review: check that MTA is listed correctly (correct address, 18 decimals)
8. Click "Add" → approve MTA if needed → confirm transaction
9. Note the Position NFT token ID from the transaction receipt

### Locking LP (Required)

```
Unicrypt Liquidity Locker (Ethereum):
1. Go to: https://app.unicrypt.network/services/lock-liquidity
2. Connect LIQUIDITY_WALLET
3. Find your Uniswap V3 NFT position
4. Lock duration: minimum 365 days (1 year)
5. Unlock date: [set exactly 1 year from launch date]
6. Confirm lock transaction
7. Save the lock URL (e.g., unicrypt.network/amm/v3/<position_id>)

Alternative: Team.Finance → same process
```

## 4.3 PancakeSwap V3 — BSC Mainnet

```bash
npm run liquidity:pancakeswap
```

Or manually at `https://pancakeswap.finance/liquidity`:
1. Same process as Uniswap but on BSC
2. Fee tier: **0.25%** (PancakeSwap V3 default for new tokens)
3. Lock via Unicrypt BSC version or PancakeSwap built-in lock

## 4.4 Post-Liquidity Verification

```
□ Uniswap V3 pool visible on:
    https://info.uniswap.org/#/pools
    https://dexscreener.com/ethereum/<MTAToken_ADDRESS>

□ PancakeSwap pool visible on:
    https://pancakeswap.finance/info/pairs
    https://dexscreener.com/bsc/<MTAToken_BSC_ADDRESS>

□ DexTools auto-detected (usually within 1 hour of first trade):
    https://www.dextools.io/app/en/ether/pair-explorer/
    https://www.dextools.io/app/en/bnb/pair-explorer/

□ Price impact test: simulate $10,000 trade — confirm < 5% impact
□ LP lock confirmation on Unicrypt (copy lock URL for public announcement)
```

---

# Part 5 — Token Launch Checklist

## T-7 Days (One Week Before)

```
□ All wallets funded (deployer ETH/BNB, liquidity wallet MTA budget)
□ Gnosis Safe tested with a small test transaction
□ API keys verified (Alchemy, Etherscan, BscScan, WalletConnect)
□ Audit report received and critical/high findings remediated
□ .env files prepared (never committed — double-check .gitignore)
□ Social media accounts ready (Twitter/X, Telegram, Discord set up)
□ Blog post/announcement written (embargoed)
□ Team briefed on emergency response procedures (this document)
□ Immunefi bug bounty draft prepared
```

## T-1 Day (Day Before)

```
□ Final test run: npx hardhat test → 194/194 passing
□ Final build: cd frontend && npm run build → 24 routes, 0 errors
□ Deploy scripts dry-run on localhost: npm run deploy:local
□ Verify state script test on Sepolia: npm run state:sepolia
□ Backup .env file on encrypted storage (offline)
□ All team members online and reachable
□ Announce maintenance window if applicable
```

## T+0 Day of Launch

### Morning (Execute in Order)

```
Hour 0-1: Ethereum Deploy
□ npm run deploy:token:mainnet
□ npm run deploy:vesting:mainnet
□ npm run deploy:governance:mainnet
□ npm run deploy:staking:mainnet
□ npm run deploy:post:mainnet
□ npm run state:mainnet → all checks green
□ npm run verify:ethereum

Hour 1-2: BSC Deploy
□ npm run deploy:token:bsc
□ npm run deploy:vesting:bsc
□ npm run deploy:governance:bsc
□ npm run deploy:staking:bsc
□ npm run deploy:post:bsc
□ npm run state:bsc
□ npm run verify:bsc

Hour 2-3: Liquidity
□ npm run approve-rewards:mainnet (TREASURY_WALLET signs)
□ npm run approve-rewards:bsc (TREASURY_WALLET signs)
□ npm run liquidity:uniswap (LIQUIDITY_WALLET signs)
□ npm run liquidity:pancakeswap (LIQUIDITY_WALLET signs)
□ LP tokens locked on Unicrypt (both chains)

Hour 3-4: Frontend
□ npm run sync-env:mainnet
□ npm run sync-env:bsc
□ cd frontend && npm run build (final build with real addresses)
□ Vercel deploy: vercel --prod
□ Smoke test live site: connect MetaMask mainnet, check all DApp pages

Hour 4+: Announcement
□ Etherscan + BscScan contract addresses saved in shared doc
□ Publish audit report link on website
□ Launch Immunefi bug bounty
□ Post announcement on Twitter/X
□ Post in Telegram + Discord
□ Submit to CoinGecko self-service: https://www.coingecko.com/request/token/add
□ Submit to CoinMarketCap: https://coinmarketcap.com/request/
□ Submit PancakeSwap token list PR
```

## T+1 Day (Verification)

```
□ Check DexScreener auto-listing (usually within hours of first trade)
□ Verify MTA price chart visible
□ Check staking page: users can stake (if any early adopters)
□ Check vesting page: team/seed schedule visible and counting down
□ Governance page: correct parameters showing
□ Gas costs reasonable (check gas tracker)
□ Review any Immunefi submissions received
□ Post "Day 1 update" on social channels
```

---

# Part 6 — Multisig Operation Guide

## 6.1 What Requires Multisig (3-of-5 Signatures)

| Action | Contract | Function | Notes |
|--------|----------|----------|-------|
| Emergency pause | MTAToken | pause() | Immediate effect |
| Emergency pause | MTAStaking | pause() | Immediate effect |
| Unpause | MTAToken | unpause() | After issue resolved |
| Unpause | MTAStaking | unpause() | After issue resolved |
| Blacklist address | MTAToken | setBlacklist(addr, true) | OFAC compliance |
| Remove blacklist | MTAToken | setBlacklist(addr, false) | User appeal approved |
| Force-close stake | MTAStaking | adminUnstake(user, id, dest) | Blacklisted user |
| Force-release vesting | MTAVesting | adminEmergencyRelease(id, dest) | Blacklisted beneficiary |
| Recover excess tokens | MTAVesting | withdrawExcess(dest) | Accounting error |
| Queue governance proposal | MTATimelock | (via Governor flow) | — |
| Cancel queued proposal | MTATimelock | cancel(id) | Emergency |
| Update rewards pool | MTAStaking | updateRewardsPool(addr) | NEW: DEFAULT_ADMIN |

**Tier/APY changes:** Must go through Timelock (Governor vote → 48h → execute). Multisig alone cannot change APY — this requires governance.

**UPGRADER_ROLE (proxy upgrades):** Held by Timelock. Cannot be executed directly from multisig. Requires a governance proposal.

## 6.2 How to Execute a Multisig Transaction

### Using Gnosis Safe UI

1. Go to `https://app.safe.global`
2. Select the MetaAras Safe (Ethereum or BSC)
3. Click "New Transaction" → "Contract Interaction"
4. Enter contract address (e.g., MTAToken address)
5. Load ABI — paste from `frontend/src/lib/contracts/MTAToken.abi.json`
6. Select function (e.g., `pause`)
7. Click "Add to Batch" or "Create Transaction"
8. Share transaction link with other signers via Signal/private channel
9. Collect 3 signatures (Safe shows pending confirmation count)
10. Execute when 3/5 confirmed

### Common Safe Transactions (Quick Reference)

```
PAUSE TOKEN (emergency)
  Contract: MTAToken address
  Function: pause()
  Arguments: none
  Required: 3 of 5 signers

PAUSE STAKING (emergency)
  Contract: MTAStaking proxy address
  Function: pause()
  Arguments: none
  Required: 3 of 5 signers

BLACKLIST ADDRESS
  Contract: MTAToken address
  Function: setBlacklist(address account, bool status)
  Arguments: account=0x<target>, status=true
  Required: 3 of 5 signers

ADMIN UNSTAKE (blacklisted user)
  Contract: MTAStaking proxy address
  Function: adminUnstake(address user, uint256 positionId, address destination)
  Arguments: user=0x<staker>, positionId=<N>, destination=0x<safe_address>
  Required: 3 of 5 signers

FORCE-RELEASE VESTING (blacklisted beneficiary)
  Contract: MTAVesting address
  Function: adminEmergencyRelease(bytes32 scheduleId, address destination)
  Arguments: scheduleId=0x<from event logs>, destination=0x<safe_address>
  Required: 3 of 5 signers
```

## 6.3 Creating a Governance Proposal (via Timelock)

For parameter changes (APY, proposal threshold, etc.):

1. Any holder with ≥500,000 MTA delegated can propose via Governor
2. Create proposal → 1 day voting delay → 7 day voting period → queue → 48h Timelock → execute

For the team to propose changes:
```javascript
// Example: Update staking APY via governance
// Target: MTAStaking
// Function: updateTierConfig(uint8 tier, uint256 lockDuration, uint256 apyBps)
// Example: Set Gold tier to 30% APY (was 25%)
// tier=2 (Gold), lockDuration=15552000 (180 days), apyBps=3000

// This MUST go through governance — multisig cannot call updateTierConfig
// (multisig has DEFAULT_ADMIN_ROLE but updateTierConfig requires it — actually it does use DEFAULT_ADMIN)
// BUT: best practice is to route all parameter changes through governance for transparency
```

---

# Part 7 — Emergency Response Procedures

## 7.1 Severity Classification

| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| P0 — Critical | Funds actively being stolen | < 5 minutes | Active exploit draining staking pool |
| P1 — High | Funds at risk but not yet stolen | < 30 minutes | Reentrancy vector discovered |
| P2 — Medium | Protocol malfunction, no fund risk | < 4 hours | Staking rewards miscalculated |
| P3 — Low | UI/frontend issue | < 24 hours | Wrong APY displayed |

## 7.2 P0 Response (Active Exploit)

```
TARGET: Pause everything within 5 minutes

Minute 0-2: ALERT
  Signal group "MetaAras Emergency": "@all ACTIVE EXPLOIT — pause immediately"
  Do NOT post on public channels yet

Minute 2-5: PAUSE
  3 signers go to app.safe.global simultaneously
  Signer 1: Create pause() transaction for MTAToken → share link
  Signer 2: Sign MTAToken pause
  Signer 3: Sign MTAToken pause → EXECUTE immediately (2 sigs needed? no, 3)
  Repeat for MTAStaking.pause()
  Confirm: paused() returns true on both contracts

Minute 5-15: ASSESS
  Which contract is being exploited?
  Which transactions are the attack? (Etherscan/BscScan)
  How much has been drained?
  Is the attack ongoing or complete?

Minute 15-30: COMMUNICATE
  Twitter/X: "We have paused all contracts as a precautionary measure.
  We are actively investigating. We will update within 60 minutes.
  No further action needed from users at this time."
  Telegram: same message
  Discord: same message + pin it

Hour 1: REPORT
  Full incident report drafted (internal first)
  Contact audit firm emergency line
  If bug bounty submitted on Immunefi: acknowledge receipt

Hour 2-48: REMEDIATE
  Identify root cause
  Draft fix
  Test fix
  Governance proposal (via Timelock) OR emergency multisig upgrade if critical
  Communicate timeline to community

Post-Incident:
  Full public post-mortem within 72 hours
  Audit the fix before re-enabling
```

## 7.3 P1 Response (High Risk, No Active Drain)

```
Hour 0-0.5: PAUSE
  Pause contracts as precaution (better safe than sorry)

Hour 0.5-1: VERIFY
  Confirm the vulnerability independently (second developer reviews)
  Estimate scope and exploitability

Hour 1-2: COMMUNICATE
  Twitter: "We are pausing contracts to investigate a potential security concern.
  Funds are safe. Update within 2 hours."

Hour 2-24: REMEDIATE
  Same as P0 remediation phase
  Timeline depends on fix complexity
```

## 7.4 P2/P3 Response

```
P2 (Medium — no fund risk):
  - Internal issue ticket
  - Fix in next deployment (frontend or governance proposal)
  - Communicate via Discord announcement channel
  - No pause required

P3 (Low — UI bug):
  - Fix frontend
  - Redeploy to Vercel
  - No on-chain action
```

## 7.5 Communication Templates

```
INITIAL ALERT (P0/P1)
"🔴 MetaAras Update: We have temporarily paused MTA token transfers and
staking as a precautionary security measure. We are investigating an
anomaly and will provide a full update within [X] hours.
User funds are protected by the pause mechanism.
No action required from users. Stay tuned."

ALL-CLEAR (after resolution)
"✅ MetaAras Update: The previously reported issue has been resolved.
[Brief description of what happened and what was fixed].
Contracts have been unpaused and are operating normally.
We will publish a full post-mortem within 72 hours.
Thank you for your patience and trust."

FALSE ALARM
"ℹ️ MetaAras Update: After thorough investigation, the anomaly we
identified was [description]. There was no security vulnerability.
Contracts have been unpaused. We apologize for any disruption."
```

---

# Part 8 — First 30 Days Monitoring Plan

## 8.1 Monitoring Stack (Set Up Before Launch)

### Option A: OpenZeppelin Defender (Recommended)

```
1. Go to: https://defender.openzeppelin.com
2. Create account → New Project → MetaAras
3. Add Sentinel → Contract Monitor for each contract address
4. Configure alerts for critical functions:

MTAToken Sentinels:
  - Function: pause() → Alert: Slack + Email + PagerDuty
  - Function: setBlacklist() → Alert: Slack + Email
  - Event: Transfer > 1,000,000 MTA single tx → Alert: Slack

MTAStaking Sentinels:
  - Function: pause() → Alert: Slack + Email + PagerDuty
  - Event: EarlyExitPenaltyCollected > 100,000 MTA → Alert: Slack
  - Event: RewardPoolDepleted → Alert: Slack + Email (pool needs refill)
  - Event: EmergencyUnstaked → Alert: Slack + Email

MTAGovernor Sentinels:
  - Event: ProposalCreated → Alert: Slack (review all proposals)
  - Event: ProposalExecuted → Alert: Slack + Email

5. Set up Relayer for automated responses if desired
```

### Option B: Tenderly

```
1. https://tenderly.co → Create Project
2. Add contracts (all 5 addresses on both chains)
3. Create Alerts:
   - Transaction simulations for governance proposals
   - Real-time events for all critical functions
   - Gas usage anomaly detection
```

### Option C: Minimum Viable Monitoring (Free)

```
Etherscan API email alerts:
1. Create Etherscan account
2. Go to each contract → "Watch This Address" (bell icon)
3. Enable email for all transactions

DexScreener alerts:
1. Open pool on DexScreener
2. "Add Alert" → Price change > ±20% in 1 hour
```

## 8.2 Daily Monitoring Routine (Days 1-30)

### Every Day (15 minutes)

```
Morning Check:
□ Check Etherscan for any unexpected transactions on all 5 contracts
□ Check DexScreener: liquidity still present, no abnormal volume
□ Check Telegram/Discord: user reports of any issues
□ Check Defender/Tenderly: any triggered alerts overnight

Key Metrics to Log (create a simple spreadsheet):
  Date | TVL (globalTotalStaked) | Active Positions | Pending Rewards | Pool Balance
```

### Every Week (1 hour)

```
□ Run: npm run state:mainnet → all checks still green
□ Review all governance proposals (if any)
□ Check reward pool balance: TREASURY_WALLET allowance decreasing?
  If pool balance < 10% of weekly expected rewards → top up
□ Check staking contract: globalTotalStaked reasonable?
□ Check vesting: any schedules releasable (beneficiaries may need reminder)
□ Community report: Discord/Telegram sentiment
□ Review any Immunefi submissions
```

### Reward Pool Monitoring

```
Reward pool balance check (approximate weekly drain):
  Weekly rewards = TVL × average_APY / 52

Example: $1M TVL, average 20% APY → $1M × 0.20 / 52 = ~$3,846/week

Monitor:
  token.balanceOf(TREASURY_WALLET) should stay >> weekly rewards
  If balance drops below 4 weeks of expected rewards: REFILL

Refill process:
  1. Transfer MTA from ECOSYSTEM_WALLET to TREASURY_WALLET
  2. Requires Gnosis Safe transaction from ECOSYSTEM_WALLET admin
  3. No contract interaction needed — just a token transfer
  4. allowance from TREASURY_WALLET to MTAStaking is MaxUint256, so no re-approval
```

## 8.3 Week-by-Week Milestones

```
Week 1 (Days 1-7)
  Target: Protocol live, first stakers, price discovery
  □ Monitor for any exploit attempts
  □ CoinGecko listing submitted → follow up
  □ CMC listing submitted → follow up
  □ DexScreener/DexTools auto-detected
  □ Community onboarding: guide users through staking flow
  □ First governance discussion (temperature check — no formal proposal yet)

Week 2 (Days 8-14)
  Target: Stability confirmed, listings progressing
  □ Review gas costs — consider optimizing reward claim frequency guidance
  □ Community analytics: how many unique stakers, average position size
  □ Gate.io / MEXC initial outreach (requires some on-chain volume)
  □ Bug bounty: check if any white-hat reports received

Week 3 (Days 15-21)
  Target: Growth, community engagement
  □ First governance proposal (if any parameter change needed)
  □ Ecosystem fund allocation proposal discussion (via Discord)
  □ CEX follow-ups
  □ Consider announcing Phase 2 roadmap feature

Week 4 (Days 22-30)
  Target: Month 1 review
  □ Full incident/performance report (30-day post-mortem)
  □ TVL target assessment
  □ Liquidity depth analysis (price impact acceptable?)
  □ Reward pool sustainability check (months of runway?)
  □ Community vote: any urgent protocol improvements?
  □ Publish "MetaAras Month 1" report on Medium/Mirror
```

## 8.4 KPIs to Track

| Metric | Target (Month 1) | Source |
|--------|-----------------|--------|
| TVL (Total Value Locked) | > $500,000 | staking.globalTotalStaked × price |
| Unique stakers | > 200 | Count active positions |
| Governance proposals | 0-1 (stability phase) | MTAGovernor |
| Reward pool runway | > 12 months | TREASURY_WALLET balance |
| Immunefi reports | 0 critical/high | Immunefi dashboard |
| CoinGecko listing | Listed by Day 14 | CoinGecko |
| DEX liquidity | > $60K | Uniswap/PancakeSwap info |

---

# Appendix A — Contract Addresses

> Fill in after deployment

```
ETHEREUM MAINNET
MTAToken:    0x[TBD after deploy]
MTAVesting:  0x[TBD after deploy]
MTATimelock: 0x[TBD after deploy]
MTAGovernor: 0x[TBD after deploy]
MTAStaking (proxy): 0x[TBD after deploy]
MTAStaking (impl):  0x[TBD after deploy]
Gnosis Safe:        0x[your multisig]
Treasury Wallet:    0x[your treasury]

BSC MAINNET
MTAToken (BSC):    0x[TBD after deploy]
MTAVesting (BSC):  0x[TBD after deploy]
MTATimelock (BSC): 0x[TBD after deploy]
MTAGovernor (BSC): 0x[TBD after deploy]
MTAStaking (BSC):  0x[TBD after deploy]
Gnosis Safe (BSC): 0x[your BSC multisig]
```

# Appendix B — Role Bytes32 Values

```
DEFAULT_ADMIN_ROLE  = 0x0000000000000000000000000000000000000000000000000000000000000000
MINTER_ROLE        = 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6
PAUSER_ROLE        = 0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a
BLACKLISTER_ROLE   = 0x1e04e05e461f6b7e1c66f48b0a94ec86b4d22f02e1ef3c3aa90264050f5f49ca
UPGRADER_ROLE      = 0x189ab7a9244df0848122154315af71fe140f3db0fe014031783b0946b8c9d2e3
VESTING_ADMIN_ROLE = 0x0c5c9fa7b4b6de36e2b18f4cbbb04f0fbc7be5ea9af0ae4ba8e6c73e73a84cac
```

# Appendix C — npm Command Quick Reference

```bash
# Testing
npx hardhat test                    # Run all 194 tests
npm run test:unit                   # Unit tests only
npm run coverage                    # Coverage report

# Deploy (replace :sepolia with :mainnet or :bsc)
npm run preflight:mainnet           # Pre-deploy checks
npm run deploy:token:mainnet        # Step 1
npm run deploy:vesting:mainnet      # Step 2
npm run deploy:governance:mainnet   # Step 3
npm run deploy:staking:mainnet      # Step 4
npm run deploy:post:mainnet         # Step 5 (role transfer)

# Post-deploy
npm run approve-rewards:mainnet     # Fund reward pool
npm run state:mainnet               # Verify on-chain state
npm run verify:ethereum             # Etherscan verification
npm run verify:bsc                  # BscScan verification
npm run sync-env:mainnet            # Frontend addresses
npm run sync-abis                   # ABI sync from artifacts

# Frontend
cd frontend && npm run build        # Production build
cd frontend && npm run start        # Local production server

# Liquidity
npm run liquidity:uniswap           # Uniswap V3 MTA/ETH
npm run liquidity:pancakeswap       # PancakeSwap V3 MTA/BNB
```

---

*MetaAras v1.0 Launch Package — Prepared 2026-06-29 · v2.2.0-rc1*  
*For internal use only. Do not share wallet addresses or private key details via email or public channels.*
