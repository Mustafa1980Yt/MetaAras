# PancakeSwap V3 Listeleme Rehberi — MetaAras (MTA)

## Durum

| Ağ | Durum | Hedef |
|----|-------|-------|
| BSC Mainnet Pool | Bekliyor | Q3 2026 (audit sonrası) |
| PancakeSwap Featured | Bekliyor | $500K+ TVL sonrası |

---

## 1. Ön Koşullar

### Kontrat
- [ ] MTAToken BSC Mainnet'te deploy edildi (chainId: 56)
- [ ] BscScan'da verified
- [ ] `revokeMinter()` çağrıldı — minting kalıcı olarak kapalı
- [ ] Tüm admin rolleri Gnosis Safe multisig'e transfer edildi
- [ ] Harici güvenlik audit tamamlandı

### Likidite Cüzdanı
- [ ] `LIQUIDITY_WALLET`'ta 20M MTA mevcut (tokenomics %20)
- [ ] Yeterli BNB mevcut (havuz seed + gas)
- [ ] Cüzdan hardware wallet ile güvence altında

### Logo ve Medya
- [ ] MTA logo PNG, 256×256px, transparent background → `listing/logo_256x256.png`
- [ ] MTA logo PNG, 200×200px → `listing/logo_200x200.png`
- [ ] MTA logo PNG, 64×64px → `listing/logo_64x64.png`

---

## 2. Pool Oluşturma

### Yöntem A: Script (Önerilen)

```bash
# scripts/liquidity/add_pancakeswap_liquidity.ts içinde ilk fiyatı ayarla:
# INITIAL_MTA_PRICE_IN_BNB = 0.001  (1 MTA = 0.001 BNB → $0.60 @ BNB=$600)

npm run liquidity:pancakeswap
```

### Yöntem B: Manuel (PancakeSwap UI)

1. `app.pancakeswap.finance/add` → BSC ağı seç
2. Token seç: MTA (`<BSC_MAINNET_TOKEN_ADDRESS>`) + WBNB
3. **Fee Tier:** %1 (yeni token için önerilir, alternatif: %0.25)
4. **Price Range:** Full range (başlangıç için)
5. Miktarlar:
   - MTA: 1,000,000 (ilk fazda — 20M'dan)
   - WBNB: 1,000 (price × MTA amount)
6. **Add Liquidity** → Approve + Confirm

### Pool Parametreleri

| Parametre | Değer |
|-----------|-------|
| Pair | MTA / WBNB |
| Fee Tier | 1% (FEE=10000) |
| Tick Spacing | 200 |
| Initial Price | 1 MTA = 0.001 BNB (ayarlanabilir) |
| Tick Range | Full range (-887200 → +887200) |
| PancakeSwap Factory | `0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865` |
| Position Manager | `0x46A15B0b27311cedF172AB29E4f4766fbE7F4364` |
| WBNB | `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095b` |

---

## 3. LP Token Kilitleme (Zorunlu)

Pool oluşturulduktan sonra LP NFT'i kilitle:

**UNCX Network (Önerilen):**
```
URL    : app.uncx.network
Ağ     : BNB Smart Chain
Süre   : Minimum 12 ay (önerilir: 24 ay)
Ücret  : ~0.5 BNB (platform ücreti)
```

**Mudra Locker (Alternatif):**
```
URL    : mudra.website/bsc
Süre   : 12+ ay
```

Lock TX Hash: `___________`  
Lock Expiry: `___________`

---

## 4. PancakeSwap Token Listesi PR

Permissionless pool herhangi bir başvuru gerektirmez.  
**Featured Token** statüsü için GitHub PR gerekir:

### Repository
```
github.com/pancakeswap/token-list
```

### Dosya Ekle
```
tokens/bsc/0x<BSC_TOKEN_ADDRESS>.json
```

### JSON İçeriği
```json
{
  "chainId": 56,
  "address": "0x<BSC_MAINNET_TOKEN_ADDRESS>",
  "symbol": "MTA",
  "name": "MetaAras",
  "decimals": 18,
  "logoURI": "https://tokens.pancakeswap.finance/images/0x<ADDRESS>.png",
  "tags": ["governance", "defi", "staking"]
}
```

### Logo Dosyası
```
src/tokens/0x<ADDRESS>.png   (256×256px, transparent background)
```

### PR Başlığı
```
Add MetaAras (MTA) token — BNB Smart Chain
```

### PR Açıklaması Şablonu
```
## Token Request: MetaAras (MTA)

**Token Address:** 0x<BSC_MAINNET_ADDRESS>
**Network:** BNB Smart Chain (chainId: 56)
**Symbol:** MTA
**Decimals:** 18
**Total Supply:** 100,000,000

**Project Links:**
- Website: https://metaaras.io
- Whitepaper: https://metaaras.io/whitepaper
- GitHub: https://github.com/metaaras/metaaras-protocol
- BscScan: https://bscscan.com/token/0x<ADDRESS>
- Audit Report: [LINK]

**About the Project:**
MetaAras is a professional-grade multichain DeFi governance protocol
with 4-tier staking (8–40% APY), on-chain DAO governance (OZ Governor v5),
and linear token vesting. Built with OpenZeppelin v5.3, 119 unit tests.

**Liquidity:**
- PancakeSwap V3 Pool: [POOL_ADDRESS]
- LP Lock TX: [LOCK_TX] (locked for 24 months)
- TVL at listing: $[AMOUNT]

**Token Distribution:**
- Ecosystem (35%) · Liquidity (20%) · Team-vested (15%)
- Minting permanently disabled at TGE
```

---

## 5. Listeleme Gereksinimleri Özeti

**Featured token statüsü için genellikle istenilenler:**

| Kriter | Değer |
|--------|-------|
| Minimum TVL | $500,000+ |
| Minimum günlük hacim | $50,000+ |
| LP Lock | Doğrulanmış, 12+ ay |
| Audit | Tamamlanmış ve herkese açık |
| CoinGecko / CMC | Listelenmiş |
| Sosyal medya varlığı | Aktif topluluk |

---

## 6. Lansman Güvenlik Kontrolleri

- [ ] Audit tamamlandı (no critical/high findings)
- [ ] Multisig tüm admin işlevlerini kontrol ediyor
- [ ] LP tokenleri kilitlendi (minimum 12 ay)
- [ ] Pool derinliği yeterli (minimum $50K)
- [ ] Fiyat etkisi analizi yapıldı (1% slippage için maksimum işlem büyüklüğü)
- [ ] Topluluk likidite ekleme tarihinden haberdar
- [ ] CoinGecko başvurusu yapıldı
- [ ] CoinMarketCap başvurusu yapıldı

---

## 7. Lansman Sonrası İzleme

| Araç | Kullanım |
|------|----------|
| info.pancakeswap.finance | Pool TVL, hacim, fiyat |
| dexscreener.com | Gerçek zamanlı fiyat izleme |
| bscscan.com/token/`<ADDR>` | Holder dağılımı |
| app.uncx.network | LP lock durumu |
| coingecko.com | Piyasa verileri |

---

*MetaAras PancakeSwap Listing Guide v2.0 — Haziran 2026*
