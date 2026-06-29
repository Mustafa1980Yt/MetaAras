# MetaAras — Sepolia Testnet Deploy Kılavuzu

**Son Güncelleme:** 2026-06-29  
**Hedef Ağ:** Ethereum Sepolia (chainId: 11155111)  
**Durum:** Deploy scriptleri hazır · Local simülasyonla doğrulandı ✅

---

## Ön Gereksinimler

### Gerekli hesaplar (hepsi ücretsiz)

| Servis | Amaç | URL |
|--------|------|-----|
| Alchemy | Sepolia RPC | https://dashboard.alchemy.com |
| Etherscan | Kontrat doğrulama | https://etherscan.io/myapikey |
| WalletConnect | Frontend cüzdan bağlantısı | https://cloud.walletconnect.com |

### Testnet ETH (faucet)

| Faucet | Miktar | Gereksinim |
|--------|--------|-----------|
| https://sepoliafaucet.com | 0.5 ETH/gün | Alchemy hesabı |
| https://faucets.chain.link/sepolia | 0.1 ETH | — |
| https://www.infura.io/faucet/sepolia | 0.5 ETH | Kayıt |

**Minimum:** 0.2 ETH (deploy toplamı ~0.09 ETH, güvenli marj dahil)

---

## Adım Adım Deploy

### 1 — Ortamı hazırla

```bash
# Proje kök dizininde
cp .env.example .env
```

`.env` dosyasını aç ve şu sırayla doldur:

```
PRIVATE_KEY          = testnet cüzdan private key (0x... formatında)
ALCHEMY_API_KEY      = Alchemy Sepolia API key
ETHERSCAN_API_KEY    = Etherscan API key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = WalletConnect Project ID
```

Opsiyonel (testnet'te boş bırakılabilir):
```
MULTISIG_ADDRESS     = Gnosis Safe adresi (boş → deployer fallback)
TEAM_WALLET          = boş → deployer fallback
SEED_WALLET          = boş → deployer fallback
```

---

### 2 — Preflight kontrolü

Deploy öncesi ortamı doğrula:

```bash
npm run preflight:sepolia
```

Beklenen çıktı:
```
✓ PRIVATE_KEY
✓ ALCHEMY_API_KEY
✓ ETHERSCAN_API_KEY
✓ Bağlı: chainId 11155111, blok XXXXX
✓ Deployer bakiye: X.XX ETH
✓ Preflight geçti! Deploy için hazır.
```

Hatalar varsa `.env` dosyasını düzelt ve tekrar çalıştır.

---

### 3 — Deploy

**Tam pipeline (tek komut):**

```bash
npm run deploy:sepolia
```

**Adım adım (sorun çıkarsa):**

```bash
# Token + mint + dağılım
npm run deploy:token:sepolia
npm run deploy:vesting:sepolia

# Governance
npm run deploy:governance:sepolia

# Staking (UUPS proxy)
npm run deploy:staking:sepolia
```

Her adımda `deployments/sepolia.json` otomatik güncellenir.

---

### 4 — Kontrat doğrulama (Etherscan)

```bash
npm run verify:sepolia
```

Beklenen çıktı:
```
✓ MTAToken doğrulandı
✓ MTAVesting doğrulandı
✓ MTATimelock doğrulandı
✓ MTAGovernor doğrulandı
✓ MTAStaking (implementation) doğrulandı
```

`Already Verified` mesajı normal — hata değil.

---

### 5 — Frontend env senkronizasyonu

Deploy sonrası frontend'i yeni adresleri okuyacak şekilde güncelle:

```bash
# deployments/sepolia.json → frontend/.env.local
npm run sync-env:sepolia
```

Çıktı:
```
╔═══════════════════════════════════════════╗
║  sync-env: sepolia                       ║
╚═══════════════════════════════════════════╝
  Kaynak  : deployments/sepolia.json
  Hedef   : frontend/.env.local

  MTAToken    : 0x...
  MTAVesting  : 0x...
  MTATimelock : 0x...
  MTAGovernor : 0x...
  MTAStaking  : 0x...
```

---

### 6 — Admin rollerini multisig'e devret

```bash
npm run deploy:post:sepolia
```

⚠ Bu adım **geri alınamaz**. `MULTISIG_ADDRESS` doğru ayarlandıysa çalıştır.  
Multisig yoksa bu adımı atla (testnet için kabul edilebilir).

---

### 7 — Frontend'i yeniden derle ve başlat

```bash
cd frontend
npm run build
npm run start
```

---

### 8 — On-chain durum doğrulama

```bash
npm run state:sepolia
```

Beklenen:
```
Toplam Arz  : 100000000.0 MTA
Max Arz     : 100000000.0 MTA
Arz Eşleşme : ✓ DOĞRU
Mint Kilitli: ✓ EVET
Vesting Schedule: 2 adet
Staking Token   : 0x<MTAToken>
```

---

## Tam Deploy → Verify → Frontend Akışı

```
.env hazırla
     │
     ▼
npm run preflight:sepolia          ← ortam kontrol
     │
     ▼
npm run deploy:sepolia             ← 5 kontrat deploy
     │
     ├── deployments/sepolia.json  ← adresler + tx hash'ler
     │
     ▼
npm run verify:sepolia             ← Etherscan doğrulama
     │
     ▼
npm run sync-env:sepolia           ← frontend/.env.local yazar
     │
     ▼
npm run state:sepolia              ← on-chain doğrulama
     │
     ▼
cd frontend && npm run build       ← frontend derle
     │
     ▼
npm run deploy:post:sepolia        ← (opsiyonel) admin → multisig
```

---

## Environment Variables — Tam Liste

### Deploy için gerekli (`.env`)

| Değişken | Zorunlu | Açıklama |
|---------|---------|---------|
| `PRIVATE_KEY` | ✅ | Testnet deployer private key |
| `ALCHEMY_API_KEY` | ✅ | Sepolia RPC endpoint |
| `ETHERSCAN_API_KEY` | ✅ | Kontrat verify |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | ✅ | Frontend dApp bağlantısı |
| `MULTISIG_ADDRESS` | ⚠ opsiyonel | Admin role devri (mainnet'te zorunlu) |
| `TEAM_WALLET` | ⚠ opsiyonel | Testnet'te deployer fallback |
| `SEED_WALLET` | ⚠ opsiyonel | Testnet'te deployer fallback |
| `TREASURY_WALLET` | ⚠ opsiyonel | Testnet'te deployer fallback |
| `ECOSYSTEM_WALLET` | ⚠ opsiyonel | Testnet'te deployer fallback |
| `LIQUIDITY_WALLET` | ⚠ opsiyonel | Testnet'te deployer fallback |
| `PUBLIC_SALE_WALLET` | ⚠ opsiyonel | Testnet'te deployer fallback |
| `BSCSCAN_API_KEY` | — | Yalnızca bscTestnet deploy |
| `REPORT_GAS` | — | `true` → gas raporu |
| `CMC_API_KEY` | — | USD gas tahmini |

### `sync-env:sepolia` sonrası frontend `.env.local`

Bu değerler `deployments/sepolia.json`'dan otomatik okunur:

| Değişken | Kaynak |
|---------|--------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | `.env` dosyasından kopyalanır |
| `NEXT_PUBLIC_NETWORK_ENV` | `testnet` (otomatik) |
| `NEXT_PUBLIC_MTA_TOKEN_ADDRESS` | `deployments/sepolia.json` |
| `NEXT_PUBLIC_MTA_STAKING_ADDRESS` | `deployments/sepolia.json` |
| `NEXT_PUBLIC_MTA_VESTING_ADDRESS` | `deployments/sepolia.json` |
| `NEXT_PUBLIC_MTA_GOVERNOR_ADDRESS` | `deployments/sepolia.json` |
| `NEXT_PUBLIC_MTA_TIMELOCK_ADDRESS` | `deployments/sepolia.json` |

---

## Verify Komutları (Manuel)

`npm run verify:sepolia` başarısız olursa tek tek:

```bash
# MTAToken
npx hardhat verify --network sepolia <MTAToken_ADRES> \
  <DEPLOYER_ADRES> <DEPLOYER_ADRES> <MULTISIG_ADRES> <MULTISIG_ADRES>

# MTAVesting
npx hardhat verify --network sepolia <MTAVesting_ADRES> \
  <MTAToken_ADRES> <TREASURY_ADRES> <DEPLOYER_ADRES>

# MTATimelock
npx hardhat verify --network sepolia <MTATimelock_ADRES> \
  "[]" "[]" <DEPLOYER_ADRES>

# MTAGovernor
npx hardhat verify --network sepolia <MTAGovernor_ADRES> \
  <MTAToken_ADRES> <MTATimelock_ADRES>

# MTAStaking implementation (UUPS — proxy değil)
npx hardhat verify --network sepolia <MTAStakingImpl_ADRES>
```

Adresler `deployments/sepolia.json`'dan alınır.

---

## Tahmini Maliyetler (Sepolia — değer yok, faucet ETH)

| İşlem | Gas |
|-------|-----|
| MTAToken deploy | ~1,200,000 |
| MTAVesting + mint | ~2,800,000 |
| MTATimelock | ~1,000,000 |
| MTAGovernor | ~2,500,000 |
| MTAStaking UUPS proxy | ~2,000,000 |
| Toplam | ~9,500,000 gas |

---

## Sık Karşılaşılan Hatalar

| Hata | Sebep | Çözüm |
|------|-------|-------|
| `insufficient funds` | Yetersiz ETH | Faucet'ten ETH al |
| `could not detect network` | Yanlış RPC | ALCHEMY_API_KEY kontrol et |
| `nonce too low` | Önceki tx bekliyor | Birkaç dakika bekle |
| `MULTISIG_ADDRESS not set` | Env eksik | 0x000 bırak (testnet kabul edilir) |
| `Deployment dosyası bulunamadı` | Önceki adım eksik | Adımları sırayla çalıştır |
| `Already Verified` | Zaten doğrulandı | Normal — hata değil |

---

*MetaAras Team · TESTNET_DEPLOY.md · 2026-06-29*
