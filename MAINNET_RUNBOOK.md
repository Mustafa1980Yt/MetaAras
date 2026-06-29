# MetaAras — Mainnet Deployment Runbook

**Version:** 1.0  
**Tarih:** Haziran 2026  
**Durum:** Operasyonel — Audit Onayı Bekleniyor  

> Bu runbook, mainnet deployment'ının **adım adım operasyon kılavuzudur**.  
> Her adım tamamlandıkça işaret koy (✓). Bir adım başarısız olursa bir sonrakine geçme.

---

## Ön Koşullar (Bu Runbook Başlamadan Önce)

- [ ] Harici güvenlik audit raporu alındı ve tüm Critical/High bulgular kapatıldı
- [ ] Audit raporu herkese açık yayınlandı
- [ ] Gnosis Safe multisig (3/5 imza eşiği) kuruldu — Ethereum + BSC
- [ ] Gnosis Safe imzacı adresleri doğrulandı ve test edildi
- [ ] Tüm deployment cüzdanları ayrı ayrı hazırlandı:
  - TREASURY_WALLET
  - TEAM_WALLET
  - SEED_WALLET
  - ECOSYSTEM_WALLET
  - LIQUIDITY_WALLET
  - PUBLIC_SALE_WALLET
- [ ] Gerçek WalletConnect Project ID alındı (cloud.walletconnect.com)
- [ ] Production domain DNS'i ayarlandı (app.metaaras.io + metaaras.io)
- [ ] Cloudflare veya Vercel için SSL sertifikası hazır
- [ ] BSC Testnet deploy başarıyla tamamlandı ve doğrulandı

---

## Deployment Ortamı

### Kullanılacak Makine
- Air-gapped (internet bağlantısı izole) veya güvenli bir ortamda yapılmalı
- Hardware wallet (Ledger/Trezor) üzerinden private key imzalanmalı
- Hardware wallet için Hardhat Ledger entegrasyonu veya custom signer kullanın

### .env Dosyası (Mainnet Deploy İçin)

Aşağıdaki değerleri gerçek değerlerle doldurun:

```bash
# MAINNET DEPLOY ORTAM DEĞİŞKENLERİ
# Bu dosyayı asla commit etmeyin!

PRIVATE_KEY=0x<deployer_private_key>          # 64 hex karakter
ALCHEMY_API_KEY=<alchemy_mainnet_key>
ETHERSCAN_API_KEY=<etherscan_v2_api_key>
BSCSCAN_API_KEY=<bscscan_api_key>

MULTISIG_ADDRESS=<gnosis_safe_ethereum_address>

TREASURY_WALLET=<treasury_gnosis_safe>
TEAM_WALLET=<team_wallet_address>
SEED_WALLET=<seed_investor_wallet>
ECOSYSTEM_WALLET=<ecosystem_gnosis_safe>
LIQUIDITY_WALLET=<liquidity_ops_wallet>
PUBLIC_SALE_WALLET=<public_sale_wallet>
```

---

## FAZA 1: Ethereum Mainnet Deploy

### F1.1 — Preflight Kontrolü

```bash
# Preflight çalıştır (mainnet'te SADECE env kontrolü yapar, deploy etmez)
npx hardhat run scripts/preflight.ts --network mainnet
```

**Beklenen çıktı:** Tüm env vars ✓, balance ≥ 0.30 ETH ✓  
**Hata varsa:** .env dosyasını düzelt, tekrar çalıştır.

> NOT: preflight.ts mainnet'te deploy engelini kaldırıp SADECE kontrol yapar.  
> `process.exitCode = 1` döndürürse deploy'a devam etme.

**Sonuç:** ✓ / ✗ — Tarih/saat: ___________

---

### F1.2 — Token Deployment (01)

```bash
npx hardhat run scripts/deploy/01_deploy_token.ts --network mainnet
```

**Kontrol et:**
- [ ] MTAToken adresi `deployments/mainnet.json`'a kaydedildi
- [ ] Etherscan'da 15 blok sonra doğrulandı

**MTAToken adresi:** `0x___________`  
**Etherscan:** https://etherscan.io/address/___________

**Sonuç:** ✓ / ✗ — Tarih/saat: ___________

---

### F1.3 — Vesting + Token Dağılımı (02)

```bash
npx hardhat run scripts/deploy/02_deploy_vesting.ts --network mainnet
```

**Kontrol et:**
- [ ] MTAVesting adresi kaydedildi
- [ ] 100M MTA toplam supply doğrulandı
- [ ] Team vesting schedule oluşturuldu (12ay cliff, 36ay linear)
- [ ] Seed vesting schedule oluşturuldu (6ay cliff, 18ay linear)
- [ ] Minting kalıcı olarak kapatıldı (`revokeMinter()` çağrıldı)
- [ ] `token.mintingDisabled()` → `true` döndürüyor

**MTAVesting adresi:** `0x___________`  
**Toplam supply kontrol:** `cast call $TOKEN_ADDR "totalSupply()" --rpc-url mainnet`

**Sonuç:** ✓ / ✗ — Tarih/saat: ___________

---

### F1.4 — Governance Deployment (03)

```bash
npx hardhat run scripts/deploy/03_deploy_governance.ts --network mainnet
```

**Kontrol et:**
- [ ] MTATimelock adresi kaydedildi
- [ ] MTAGovernor adresi kaydedildi
- [ ] Timelock: PROPOSER_ROLE = Governor ✓
- [ ] Timelock: EXECUTOR_ROLE = address(0) ✓
- [ ] Timelock: DEFAULT_ADMIN renounced ✓
- [ ] MIN_DELAY = 172800 (48 saat) ✓

**MTATimelock:** `0x___________`  
**MTAGovernor:** `0x___________`

**Sonuç:** ✓ / ✗ — Tarih/saat: ___________

---

### F1.5 — Staking Deployment (04)

```bash
npx hardhat run scripts/deploy/04_deploy_staking.ts --network mainnet
```

**Kontrol et:**
- [ ] MTAStaking (proxy) adresi kaydedildi
- [ ] MTAStaking (implementation) adresi kaydedildi
- [ ] UUPS proxy doğru initialize edildi
- [ ] Staking kontratına ödül onayı verildi

**MTAStaking Proxy:** `0x___________`  
**MTAStaking Impl:**  `0x___________`

**Sonuç:** ✓ / ✗ — Tarih/saat: ___________

---

### F1.6 — Etherscan Doğrulama

```bash
npm run verify:ethereum
```

**Kontrol et:**
- [ ] MTAToken verified
- [ ] MTAVesting verified
- [ ] MTATimelock verified
- [ ] MTAGovernor verified
- [ ] MTAStaking (proxy) verified
- [ ] MTAStaking (implementation) verified

**Sonuç:** ✓ / ✗ — Tarih/saat: ___________

---

### F1.7 — Rol Transferleri (05 — GERİ ALINAMAZ!)

> ⚠️ DURUN! Bu adımdan önce:
> - Multisig adresinin doğru olduğunu 3 farklı kişiyle doğrulayın
> - Gnosis Safe'e giriş yaparak erişimin çalıştığını doğrulayın
> - Gerçek imzacıların Safe'e eklenebildiğini test edin

```bash
MULTISIG_ADDRESS=<gnosis_safe_address> \
  npx hardhat run scripts/deploy/05_post_deploy.ts --network mainnet
```

**Kontrol et (script tamamlandıktan sonra):**
- [ ] `token.hasRole(DEFAULT_ADMIN, multisig)` → `true`
- [ ] `token.hasRole(DEFAULT_ADMIN, deployer)` → `false`
- [ ] `token.hasRole(PAUSER_ROLE, multisig)` → `true`
- [ ] `token.hasRole(BLACKLISTER_ROLE, multisig)` → `true`
- [ ] `staking.hasRole(DEFAULT_ADMIN, multisig)` → `true`
- [ ] `vesting.hasRole(DEFAULT_ADMIN, multisig)` → `true`

**Sonuç:** ✓ / ✗ — Tarih/saat: ___________

---

### F1.8 — Frontend Env Sync

```bash
npm run sync-env:mainnet
```

**Kontrol et:**
- [ ] `frontend/.env.local` güncellendi
- [ ] `NEXT_PUBLIC_ETH_MAINNET_MTA_TOKEN_ADDRESS` doğru adres
- [ ] `NEXT_PUBLIC_ETH_MAINNET_MTA_STAKING_ADDRESS` doğru adres

**Sonuç:** ✓ / ✗ — Tarih/saat: ___________

---

### F1.9 — Durum Doğrulama

```bash
npm run state:mainnet
```

**Kontrol et (script çıktısı):**
- [ ] Tüm kontrat adresleri mevcut ve kod içeriyor
- [ ] Supply = 100,000,000 MTA
- [ ] Minting disabled = true
- [ ] Yönetim rolleri multisig'de

**Sonuç:** ✓ / ✗ — Tarih/saat: ___________

---

## FAZA 2: BSC Mainnet Deploy

> Ethereum Mainnet deploy tamamlandıktan sonra başlayın.

### F2.1 — BSC Preflight

```bash
npx hardhat run scripts/preflight.ts --network bsc
```

**Gerekli:** ≥ 0.10 BNB deployer bakiyesi

**Sonuç:** ✓ / ✗ — Tarih/saat: ___________

---

### F2.2 — BSC Token Deployment

```bash
npx hardhat run scripts/deploy/01_deploy_token.ts --network bsc
npx hardhat run scripts/deploy/02_deploy_vesting.ts --network bsc
npx hardhat run scripts/deploy/03_deploy_governance.ts --network bsc
npx hardhat run scripts/deploy/04_deploy_staking.ts --network bsc
```

**Kontrol et:** Her script için `deployments/bsc.json` güncellendi

**Sonuç:** ✓ / ✗ — Tarih/saat: ___________

---

### F2.3 — BSC Doğrulama

```bash
npm run verify:bsc
npm run sync-env:bsc
```

**Sonuç:** ✓ / ✗ — Tarih/saat: ___________

---

### F2.4 — BSC Rol Transferleri

```bash
MULTISIG_ADDRESS=<gnosis_safe_bsc_address> \
  npx hardhat run scripts/deploy/05_post_deploy.ts --network bsc
```

**Sonuç:** ✓ / ✗ — Tarih/saat: ___________

---

## FAZA 3: Frontend Build + Deploy

### F3.1 — Çevre Değişkeni Kontrolü

```bash
cd frontend
cat .env.local | grep "MAINNET\|BSC_MAINNET"
```

Tüm 10 adres (`ETH_MAINNET` × 5 + `BSC_MAINNET` × 5) mevcut olmalı.

**Sonuç:** ✓ / ✗ — Tarih/saat: ___________

---

### F3.2 — Production Build

```bash
cd frontend
npm run build
```

**Kontrol et:**
- [ ] 0 TypeScript hatası
- [ ] 24 route oluşturuldu
- [ ] Build output: `.next/` klasörü mevcut

**Sonuç:** ✓ / ✗ — Tarih/saat: ___________

---

### F3.3 — Lokal Production Test

```bash
cd frontend
npm run start
```

**Test et (tarayıcıda):**
- [ ] Ana sayfa yükleniyor
- [ ] /staking sayfası açılıyor
- [ ] Cüzdan bağlanabiliyor (MetaMask ile)
- [ ] Doğru network (Ethereum Mainnet) görünüyor
- [ ] MTA token bakiyesi okunuyor

**Sonuç:** ✓ / ✗ — Tarih/saat: ___________

---

### F3.4 — Production Deployment

```bash
# Vercel deployment (önerilir)
vercel --prod

# veya Cloudflare Pages
# veya kendi sunucunuz: pm2 start npm -- start
```

**Sonuç:** ✓ / ✗ — URL: ___________

---

## FAZA 4: Likidite

### F4.1 — PancakeSwap V3 (BSC)

> İlk fiyat kararı verin: 1 MTA = ??? BNB  
> `scripts/liquidity/add_pancakeswap_liquidity.ts` dosyasında `INITIAL_MTA_PRICE_IN_BNB` değerini güncelleyin.

```bash
npx hardhat run scripts/liquidity/add_pancakeswap_liquidity.ts --network bsc
```

**Kontrol et:**
- [ ] Pool oluşturuldu
- [ ] Likidite eklendi
- [ ] TX hash kaydedildi
- [ ] LP NFT token ID belirlendi

**Pool adresi:** `0x___________`  
**LP NFT ID:** `___________`

**Sonuç:** ✓ / ✗ — Tarih/saat: ___________

---

### F4.2 — LP Kilitleme (BSC)

> LP NFT'ini team.finance veya UNCX Network üzerinden kilitleyin.

```
Önerilen: UNCX Network (https://app.uncx.network)
Kilit süresi: Minimum 12 ay (önerilir: 24 ay)
```

**Lock TX:** `0x___________`  
**Lock expiry:** ___________

**Sonuç:** ✓ / ✗ — Tarih/saat: ___________

---

### F4.3 — Uniswap V3 (Ethereum) — Opsiyonel

```bash
# add_uniswap_liquidity.ts'de fiyatı güncelleyin
npx hardhat run scripts/liquidity/add_uniswap_liquidity.ts --network mainnet
```

**Pool adresi:** `0x___________`

**Sonuç:** ✓ / ✗ — Tarih/saat: ___________

---

## FAZA 5: Listing Başvuruları

### F5.1 — CoinMarketCap

1. `listing/coinmarketcap_info.json` içindeki token adreslerini mainnet adresleriyle güncelle
2. CMC'ye başvuru yap: https://coinmarketcap.com/request/add-crypto/
3. LP lock kanıtını forma ekle

**Başvuru tarihi:** ___________  
**Beklenen onay:** 7-14 iş günü

---

### F5.2 — CoinGecko

1. `listing/coingecko_info.json` içindeki adresleri güncelle
2. CoinGecko'ya başvur: https://www.coingecko.com/en/coin/add
3. Audit raporu linkini ekle

**Başvuru tarihi:** ___________

---

### F5.3 — DexScreener

DexScreener genellikle on-chain veriden otomatik algılar. Pool oluşturulduktan sonra:
- Pool adresi ile kontrol et: https://dexscreener.com/bsc/<pool_address>
- Token bilgilerini "Update Info" ile tamamla

---

## Deployment Sonrası İzleme

### İlk 48 Saat

**Her 4 saatte bir kontrol edilecekler:**
- [ ] Kontratlar pause değil (`token.paused()` → false)
- [ ] Staking çalışıyor (küçük miktarla test)
- [ ] Likidite çekilmemiş (pool depth)
- [ ] Gas fiyatları normal
- [ ] Frontend erişilebilir
- [ ] On-chain işlemler beklenen şekilde ilerliyor

**İzleme araçları:**
- Etherscan: https://etherscan.io/address/<token_address>
- BscScan: https://bscscan.com/address/<token_address>
- DexScreener: https://dexscreener.com
- Tenderly Alerts (opsiyonel): https://tenderly.co

---

## Tamamlanan Deployment Özeti

| Adım | Kontrat | Ağ | Adres | Tx |
|------|---------|-----|-------|-----|
| F1.2 | MTAToken | Ethereum | | |
| F1.3 | MTAVesting | Ethereum | | |
| F1.4 | MTAGovernor | Ethereum | | |
| F1.4 | MTATimelock | Ethereum | | |
| F1.5 | MTAStaking | Ethereum | | |
| F2.2 | MTAToken | BSC | | |
| F2.2 | MTAVesting | BSC | | |
| F2.2 | MTAGovernor | BSC | | |
| F2.2 | MTATimelock | BSC | | |
| F2.2 | MTAStaking | BSC | | |

---

*MetaAras Runbook v1.0 — Haziran 2026*  
*Deployment yetkisi: Multisig 3/5 imza gerektirir*
