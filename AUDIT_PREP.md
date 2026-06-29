# MetaAras — Audit Preparation Document

**Version:** 1.1.0-RC1  
**Date:** June 2026  
**Status:** Pre-external audit — internal review complete

---

## 1. Scope

### Contracts in Scope

| Contract | Path | Type | Upgradeability |
|----------|------|------|----------------|
| MTAToken | `contracts/core/MTAToken.sol` | ERC-20 | Non-upgradeable |
| MTAVesting | `contracts/core/MTAVesting.sol` | Vesting | Non-upgradeable |
| MTAStaking | `contracts/core/MTAStaking.sol` | Staking | UUPS Upgradeable |
| MTAGovernor | `contracts/governance/MTAGovernor.sol` | DAO Governor | Non-upgradeable |
| MTATimelock | `contracts/governance/MTATimelock.sol` | Timelock | Non-upgradeable |

### Interfaces in Scope

| Interface | Path |
|-----------|------|
| IMTAToken | `contracts/interfaces/IMTAToken.sol` |

### Out of Scope

- Frontend code (`frontend/`)
- Deploy scripts (`scripts/`)
- Test files (`test/`)
- Third-party dependencies (OpenZeppelin v5)

---

## 2. Protocol Summary

MetaAras is a multichain DeFi governance protocol. The contract suite provides:

1. **MTAToken** — ERC-20 governance token with hard-capped supply (100M MTA), EIP-2612 Permit, EIP-5805 Votes, emergency pause, and on-chain blacklist.

2. **MTAVesting** — Linear vesting with configurable cliff periods. Supports multiple beneficiaries with individual schedules. Schedules are admin-revocable; unvested tokens return to the designated treasury address.

3. **MTAStaking** — Four-tier staking system (Bronze 8%, Silver 15%, Gold 25%, Platinum 40% APY). Per-position reward isolation ensures rewards are not diluted by new stakers. Early exit deducts a 20% penalty from the staked principal (`EARLY_EXIT_PENALTY_BPS = 2,000`); all accrued rewards are paid in full. UUPS upgradeable; upgrade authority is the MTATimelock in production.

4. **MTAGovernor** — OpenZeppelin Governor v5 implementation. 500K MTA proposal threshold (0.5% of supply), 7-day voting period, 4% quorum (4M MTA). Executes through MTATimelock.

5. **MTATimelock** — 48-hour minimum execution delay. Proposer role granted to MTAGovernor; executor role granted to the DAO (address(0) = anyone can execute passed proposals).

---

## 3. Dependencies

| Dependency | Version | Usage |
|-----------|---------|-------|
| OpenZeppelin Contracts | v5.3.0 | ERC20, Ownable, Governor, Timelock, Upgrades |
| OpenZeppelin Upgrades | v3.x | UUPS proxy pattern for MTAStaking |
| Solidity | 0.8.24 | Compiler version (viaIR optimizer enabled) |

---

## 4. Test Coverage

### Unit Tests

- **Total:** 97 tests / 97 passing
- **Runner:** Hardhat + Mocha + Chai
- **Coverage:** 100% statement coverage on all in-scope contracts

```bash
npm run test:unit     # Run 97 unit tests
npm run coverage      # Generate LCOV coverage report
```

### Static Analysis

| Tool | Result |
|------|--------|
| Slither | No high or critical findings |
| Solhint | 0 warnings (style checks) |

To reproduce:
```bash
slither . --exclude-dependencies
npx solhint 'contracts/**/*.sol'
```

---

## 5. Access Control Summary

### MTAToken

| Role | Holder | Capability |
|------|--------|-----------|
| `MINTER_ROLE` | Deployer (revoked post-distribution) | Mint tokens |
| `PAUSER_ROLE` | Deployer → Timelock post-deploy | Emergency pause transfers |
| `BLACKLIST_ROLE` | Deployer → Timelock post-deploy | Blacklist addresses |

### MTAVesting

| Role | Holder | Capability |
|------|--------|-----------|
| `DEFAULT_ADMIN_ROLE` | Deployer → Timelock post-deploy | Create/revoke schedules |
| `MANAGER_ROLE` | Deployer → Multisig post-deploy | Create schedules (non-admin) |

### MTAStaking

| Role | Holder | Capability |
|------|--------|-----------|
| `DEFAULT_ADMIN_ROLE` | Deployer → Timelock post-deploy | Admin functions |
| `UPGRADER_ROLE` | Deployer → Timelock post-deploy | Upgrade proxy implementation |

### MTAGovernor / MTATimelock

| Role | Holder | Capability |
|------|--------|-----------|
| `PROPOSER_ROLE` | MTAGovernor | Queue proposals |
| `EXECUTOR_ROLE` | address(0) (anyone) | Execute passed proposals after delay |
| `CANCELLER_ROLE` | Multisig | Cancel queued proposals |
| `DEFAULT_ADMIN_ROLE` | Timelock (self) | Manage timelock roles |

---

## 6. Known Limitations & Non-Issues

### Intentional Design Decisions

1. **Per-position APY is fixed at stake time** — The APY a position earns does not change mid-lock. This is intentional: stakers get rate certainty for the duration of their lock.

2. **20% early exit penalty on principal** — `EARLY_EXIT_PENALTY_BPS = 2,000` (20% of staked amount). Accrued rewards are always paid in full before the penalty is deducted from principal. The penalty amount is transferred to `rewardsPool`. This is intentional design, not a bug.

3. **Governor requires delegation before voting** — Users must call `delegate(self)` to activate voting power. This is standard ERC20Votes behavior.

4. **MTAVesting treasury address is set at construction** — Revoked token amounts return to this fixed address. Changing it requires redeployment or upgrade (if upgradeable).

5. **UUPS upgrades gated by Timelock** — The 48-hour delay on upgrades is a feature: it gives stakeholders time to react before an upgrade executes.

### Known Out-of-Scope Risks

- Frontend: not in audit scope
- RPC provider trust: users connect through their own wallet providers
- Slippage/MEV on DEX interactions: not applicable (no AMM integration)

---

## 7. Audit Focus Areas

The following areas are recommended for focused review:

### High Priority

- `MTAStaking.sol`: reward calculation, early exit penalty math, per-position isolation
- `MTAStaking.sol`: UUPS `_authorizeUpgrade` access control
- `MTAToken.sol`: blacklist mechanics, pause behavior, minter revocation
- `MTAVesting.sol`: cliff + linear release calculation, revocation correctness

### Medium Priority

- Governor proposal lifecycle: create → vote → queue → execute
- Timelock role setup: ensure executor and proposer roles are correctly assigned
- Cross-contract integration: staking uses token's `transferFrom`, vesting uses `transfer`

### Lower Priority

- Gas optimization (already uses viaIR optimizer)
- Event emissions completeness

---

## 8. Deployment Architecture (Testnet Reference)

```
Deployer EOA
  │
  ├─> MTAToken.deploy()
  ├─> MTAVesting.deploy(token, treasury)
  ├─> MTATimelock.deploy(minDelay=48h, proposers=[], executors=[0x0])
  ├─> MTAGovernor.deploy(token, timelock)
  ├─> MTATimelock.grantRole(PROPOSER, governor)
  ├─> MTAStaking.deployProxy(token)  [UUPS proxy]
  ├─> MTAStaking.grantRole(UPGRADER, timelock)
  ├─> MTAToken.grantRole(PAUSER, timelock)
  ├─> MTAToken.revokeRole(MINTER, deployer)
  └─> [Transfer admin roles to multisig]
```

---

## 9. Audit Checklist for Auditor

- [ ] Verify all OpenZeppelin contracts match declared version (v5.3.0)
- [ ] Verify `viaIR` optimizer does not produce unexpected behavior
- [ ] Check all `unchecked` blocks for overflow safety
- [ ] Verify reentrancy guards where external calls precede state changes
- [ ] Check role privilege escalation paths
- [ ] Verify UUPS `_authorizeUpgrade` cannot be called by non-timelock
- [ ] Test early exit penalty calculation for edge cases (0 rewards, dust amounts)
- [ ] Verify governance proposal lifecycle for edge cases (cancel after queue, re-propose)
- [ ] Check for flashloan-based governance attacks (snapshot block)
- [ ] Verify blacklist cannot prevent legitimate DAO actions

---

## 10. Contact

**Security disclosures:** security@metaaras.io (PGP key available on request)  
**Audit coordination:** legal@metaaras.io  
**GitHub:** github.com/metaaras/metaaras (private until mainnet)
