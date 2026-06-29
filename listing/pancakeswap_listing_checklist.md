# PancakeSwap V3 Listing Checklist — MetaAras (MTA)

## Status
- Target: PancakeSwap V3 on BNB Smart Chain Mainnet
- Planned: Q3 2026 (following mainnet deployment and audit completion)

---

## Pre-Requisites

### Smart Contract
- [ ] MTAToken deployed on BSC Mainnet (chainId 56)
- [ ] Contract verified on BscScan
- [ ] Minting permanently disabled (revokeMinter() called)
- [ ] Admin role transferred to Gnosis Safe multisig
- [ ] External security audit completed

### Token Information
- **Name**: MetaAras
- **Symbol**: MTA
- **Decimals**: 18
- **Total Supply**: 100,000,000
- **Contract Standard**: BEP-20 (ERC-20 compatible)
- **BSC Mainnet Address**: `[PENDING MAINNET DEPLOY]`
- **BscScan**: `https://bscscan.com/token/[ADDRESS]`

---

## Liquidity Provision Requirements

### Initial Liquidity
- **Recommended minimum**: $50,000–$100,000 USD equivalent
- **MTA allocation**: 20,000,000 MTA (20% — Liquidity bucket from tokenomics)
- **Pair**: MTA/BNB and/or MTA/USDT
- **Fee tier**: 0.25% (standard for mid-cap tokens)
- **Price range**: Full range initially for stability

### PancakeSwap V3 Pool Creation Steps
1. Go to app.pancakeswap.finance/add (BSC network)
2. Select MTA token address + BNB or USDT
3. Set fee tier: 0.25%
4. Set initial price based on market conditions
5. Provide liquidity in full range for launch
6. Lock LP tokens (recommended: unicrypt or mudra locker)
7. Submit transaction and verify pool creation on BscScan

---

## Listing Application (Unofficial Route)

PancakeSwap does not require formal application for permissionless pools.
However, for **Featured Token** status on the frontend:

1. Create Pool at app.pancakeswap.finance
2. Submit project to PancakeSwap Token Listing GitHub:
   - URL: https://github.com/pancakeswap/token-list
   - PR with logo.png + token metadata
3. Reach minimum TVL ($500K+ recommended for featured)
4. Community verification: CMC + CoinGecko listing preferred

---

## Token List PR Requirements (pancakeswap/token-list)

### Logo
- Format: PNG, 256x256, transparent background
- File path: `src/tokens/[address].png`

### Token Entry JSON
```json
{
  "chainId": 56,
  "address": "0xBSC_MAINNET_TOKEN_ADDRESS",
  "symbol": "MTA",
  "name": "MetaAras",
  "decimals": 18,
  "logoURI": "https://tokens.pancakeswap.finance/images/0x[ADDRESS].png",
  "tags": ["governance", "defi"]
}
```

---

## Launch Safety Checklist

- [ ] Contract audit completed (no critical/high findings)
- [ ] Multisig controls all admin functions
- [ ] LP tokens locked for minimum 6 months
- [ ] Community notified of liquidity provision date
- [ ] CoinGecko listing submitted (required for price feed)
- [ ] CoinMarketCap listing submitted
- [ ] Social media channels announced
- [ ] Discord/Telegram launch announcement prepared
- [ ] Price impact analysis performed for initial pool size
- [ ] Emergency drain plan documented (in case of exploit)

---

## Post-Launch Monitoring

- Monitor pool on info.pancakeswap.finance
- Track price and volume on CoinGecko / CMC
- Governance proposal for additional liquidity if needed
- Watch for suspicious large sells (whale monitoring)
