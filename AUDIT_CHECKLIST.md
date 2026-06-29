# MetaAras — External Security Audit Checklist

> For use by the MetaAras team when engaging an external smart contract auditor.  
> Target audit firms: Trail of Bits, Certik, Peckshield, Quantstamp, Code4rena.

---

## Scope

### Contracts in Scope (all files in `contracts/`)

| Contract | LOC | Complexity | Priority |
|----------|-----|-----------|----------|
| `contracts/core/MTAToken.sol` | 224 | Medium | Critical |
| `contracts/core/MTAStaking.sol` | 600 | High | Critical |
| `contracts/core/MTAVesting.sol` | 430 | Medium | Critical |
| `contracts/governance/MTAGovernor.sol` | ~120 | Medium | High |
| `contracts/governance/MTATimelock.sol` | 27 | Low | High |
| `contracts/interfaces/IMTAToken.sol` | — | Low | Informational |
| `contracts/mocks/MockERC20.sol` | — | Low | Out of scope |

### Out of Scope
- Frontend code
- Deploy scripts
- Test files
- Mock contracts

---

## Known Architecture Decisions to Review

### MTAToken
1. `revokeMinter()` — permanently sets `mintingDisabled = true`. Verify flag check is in all mint paths.
2. Blacklist check in `_update()` — verify both sender AND receiver are checked.
3. `circulatingSupply()` — verify calculation doesn't overflow.

### MTAStaking (UUPS Proxy)
1. `EARLY_EXIT_PENALTY_BPS = 2_000` (20%) — applied to principal, NOT rewards. Verify this.
2. `PRECISION_DIVISOR = BPS_DENOMINATOR * YEAR_SECONDS` — pre-computed constant. Verify no overflow.
3. `compound()` — creates new stake position with rewards. Check for dust attacks.
4. `globalTotalStaked` accounting — verify increments/decrements match stake/unstake paths.
5. Early exit flow: verify `rewards are paid BEFORE penalty is deducted`.
6. UUPS upgrade guard: `_authorizeUpgrade` requires `UPGRADER_ROLE` — verify role separation.
7. `__gap[50]` storage reservation — verify gap is sufficient for planned upgrades.

### MTAVesting
1. `createSchedule()` — verify scheduleId collision resistance (V-2 fix in test).
2. `revoke()` — verify split between earned (→ beneficiary) and unvested (→ treasury) is correct.
3. `vestedAmount()` — verify cliff/linear math, especially boundary conditions.
4. `release()` — verify only beneficiary can call, verify amount > 0 check.

### MTAGovernor
1. Flash loan resistance: ERC20Votes checkpoints at `proposalSnapshot` block. Verify.
2. Quorum calculation: `4% of getPastTotalSupply` — verify correct block reference.
3. Proposal threshold: `500_000e18 MTA` — verify protection against Sybil.
4. Timelock integration: verify only Timelock can execute passed proposals.

### MTATimelock
1. `MIN_DELAY = 48 hours` — hardcoded. Verify this cannot be reduced via governance.
2. `EXECUTOR_ROLE = address(0)` — verify open execution is acceptable risk.
3. Role setup: PROPOSER = Governor, EXECUTOR = address(0), ADMIN = renounced.

---

## Security Test Scenarios Requested

### Reentrancy
- [ ] MTAStaking.stake() → reentrancy via malicious token
- [ ] MTAStaking.unstake() → reentrancy during reward payout
- [ ] MTAStaking.claimRewards() → reentrancy
- [ ] MTAVesting.release() → reentrancy

### Access Control
- [ ] All role-gated functions called by unauthorized address
- [ ] Deployer privilege escalation after role handover
- [ ] Timelock bypass attempts

### Integer Overflow/Underflow
- [ ] Reward calculation with very small elapsed time
- [ ] Reward calculation with maximum staking amounts
- [ ] Early exit penalty on maximum position
- [ ] `globalTotalStaked` underflow (unstake more than staked)

### Governance Attacks
- [ ] Flash loan governance attack (vote with borrowed tokens)
- [ ] Proposal spam (below threshold addresses)
- [ ] Proposal front-running
- [ ] Timelock cancellation attack

### Edge Cases
- [ ] Stake then immediately unstake (dust positions)
- [ ] Compound with 0 pending rewards
- [ ] Multiple vesting schedules for same beneficiary
- [ ] Revoke a vesting schedule after 100% vested

---

## Pre-Audit Deliverables (for auditor)

- [ ] Complete source code in `contracts/`
- [ ] 194/194 unit+integration+fuzz tests with full coverage report
- [ ] `AUDIT_PREP.md` — architecture overview (already exists)
- [ ] `FINAL_AUDIT_REPORT.md` — internal audit findings (already exists)
- [ ] `hardhat.config.ts` — compiler settings
- [ ] `SECURITY_CHECKLIST.md` — internal security checklist
- [ ] Access to deployed Sepolia testnet contracts for live testing
- [ ] Previous internal audit findings and remediations

---

## Audit Report Requirements

The auditor's final report must include:
1. Executive Summary with overall risk rating
2. Findings table: Severity / Title / Status (Open/Resolved)
3. Severity definitions used (Critical/High/Medium/Low/Info)
4. Detailed finding descriptions with PoC where applicable
5. Recommended remediation for each finding
6. Scope acknowledgment
7. Methodology description

---

## Post-Audit Process

1. Classify all findings by severity
2. Resolve all Critical and High findings — re-audit required
3. Review and document decisions for Medium/Low (accept or fix)
4. Publish full audit report on project website
5. Tag audited commit hash in GitHub
6. Deploy audited bytecode to mainnet (not development builds)
7. Submit audit report links to CMC/CoinGecko listings

---

*Prepared: June 2026 · MetaAras Security Team*
