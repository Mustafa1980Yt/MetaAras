# MetaAras — Mainnet'e Geçmeden Önce Kontrol Edilmesi Gereken Her Şey

**Version:** 1.0  
**Tarih:** Haziran 2026  
**Bu belge:** Mainnet deploy öncesi kapsamlı doğrulama kontrol listesi

---

## 1. GÜVENLİK (BLOCKING)

### 1.1 Harici Audit

- [ ] **Audit tamamlandı** — Trail of Bits / Certik / Peckshield veya eşdeğeri
- [ ] Tüm **Critical** bulgular kapatıldı ve audit firması tarafından doğrulandı
- [ ] Tüm **High** bulgular kapatıldı veya bilinçli olarak kabul edildi (belgelendi)
- [ ] **Medium** bulgular için risk değerlendirmesi yapıldı
- [ ] Audit raporu **herkese açık** yayınlandı (website + GitHub)
- [ ] Audit commit hash'i `git tag v2.0.0-audited` ile etiketlendi
- [ ] Mainnet'e deploy edilecek bytecode, audit edilen commit'in bytecode'u ile eşleşiyor

**Audit Firması:** ___________  
**Audit Tarihi:** ___________  
**Audit Raporu URL:** ___________  
**Audited Commit:** ___________

---

### 1.2 Multisig Yapılandırması

- [ ] **Ethereum Mainnet Gnosis Safe** oluşturuldu
  - Adres: `0x___________`
  - Eşik: ___/5 imzacı (minimum 3 önerilir)
  - İmzacı adresleri listelendi ve doğrulandı
- [ ] **BSC Mainnet Gnosis Safe** oluşturuldu
  - Adres: `0x___________`
- [ ] Her imzacı Safe'e gerçek bir TX gönderdi (test imzası yapıldı)
- [ ] `05_post_deploy.ts` ile MULTISIG_ADDRESS üstteki adresler
- [ ] Yedek imza prosedürü belgelendi (bir imzacı erişilemezse ne olur?)

---

### 1.3 Deployer Cüzdanı Güvenliği

- [ ] Deployer private key **hardware wallet**'ta (Ledger Nano X / Trezor Model T)
- [ ] Hardware wallet firmware güncel
- [ ] Deployer adresi izole bir cüzdanda — başka amaçlarla kullanılmıyor
- [ ] Seed phrase iki ayrı güvenli fiziksel lokasyonda
- [ ] Deploy sonrası deployer private key **kullanımdan kaldırılacak** (yeni cüzdan üret)

---

### 1.4 Ek Güvenlik Kontrolleri

- [ ] Akıllı kontratlar **Slither** ile tarandı — yüksek severity bulgu yok
- [ ] **Mythril** veya eşdeğeri araç ile tarandı
- [ ] Reentrancy guard tüm external fonksiyonlarda doğrulandı (manuel review)
- [ ] Access control — tüm roller gözden geçirildi ve gereksiz yetkiler kaldırıldı
- [ ] UUPS upgrade guard `_authorizeUpgrade` sadece UPGRADER_ROLE'e açık doğrulandı
- [ ] Frontend'de XSS, CSP başlıkları, HTTPS zorunlu — güvenlik taraması yapıldı

---

## 2. AKILLI KONTRAT VERİFİKASYON (BLOCKING)

### 2.1 Testnet'te Kapsamlı Test

> **Strateji Notu:** BSC Testnet deploy atlandı. Ethereum Sepolia testnet başarıyla tamamlandı.
> Kontrat kodu zincirden bağımsız (EVM-compatible) — Sepolia doğrulaması yeterlidir.

- [x] **Sepolia** deploy başarıyla tamamlandı (5 kontrat — blok 11,164,753) ✅
- [ ] Sepolia'da tüm 119 unit test mantığı elle test edildi (UI'dan)
- [ ] Testnet'te staking yapıldı → claim edildi → unstake edildi
- [ ] Testnet'te governance proposal oluşturuldu → oylandı → timelock'a geçti
- [ ] Testnet'te vesting schedule oluşturuldu → release edildi
- [ ] Testnet'te admin panel test edildi (pause/unpause/blacklist)
- [ ] Testnet'te rol transferi (05_post_deploy) çalıştırıldı ve doğrulandı

---

### 2.2 Gas Analizi

- [ ] `REPORT_GAS=true npm run test:unit` çalıştırıldı
- [ ] `stake()` gas kullanımı kabul edilebilir (< 200,000 gas)
- [ ] `unstake()` gas kullanımı < 200,000 gas
- [ ] `claimRewards()` gas < 150,000 gas
- [ ] Yüksek gas fiyatı senaryosunda kullanıcı deneyimi test edildi

---

### 2.3 Bytecode Doğrulama

- [ ] Etherscan/BscScan'da bytecode verified (tüm 5 kontrat)
- [ ] Implementation bytecode ile kaynak kod eşleşiyor
- [ ] UUPS proxy implementation adresi Etherscan'da görünüyor

---

## 3. TOKEN DAĞILIMI (BLOCKING)

### 3.1 Tokenomics Doğrulama (Mainnet deploy sonrası)

Mevcut değerler testnet'te doğrulandı:

| Allocation | Beklenen | Doğrulama Komutu |
|-----------|---------|-----------------|
| Team (Vesting) | 15,000,000 MTA | `vesting.getSchedule(teamWallet)` |
| Seed (Vesting) | 10,000,000 MTA | `vesting.getSchedule(seedWallet)` |
| Ecosystem | 35,000,000 MTA | `token.balanceOf(ecosystemWallet)` |
| Liquidity | 20,000,000 MTA | `token.balanceOf(liquidityWallet)` |
| Treasury | 15,000,000 MTA | `token.balanceOf(treasuryWallet)` |
| Public Sale | 5,000,000 MTA | `token.balanceOf(publicSaleWallet)` |
| **Toplam** | **100,000,000 MTA** | `token.totalSupply()` |

- [ ] `token.mintingDisabled()` → `true`
- [ ] `token.MAX_SUPPLY()` → `100,000,000 MTA`

---

### 3.2 Vesting Parametreleri

- [ ] Team cliff: 12 ay (31,104,000 saniye) ✓
- [ ] Team vesting süresi: 36 ay (93,312,000 saniye) ✓
- [ ] Seed cliff: 6 ay (15,552,000 saniye) ✓
- [ ] Seed vesting süresi: 18 ay (46,656,000 saniye) ✓
- [ ] Schedule başlangıç zamanı: deploy bloğu ✓

---

## 4. FRONTEND (BLOCKING)

### 4.1 Build Kalitesi

- [ ] `npm run build` → 0 TypeScript hatası
- [ ] 24 route başarıyla oluşturuldu
- [ ] Bundle boyutu kontrol edildi (gzip < 500KB ilk yükleme)
- [ ] Lighthouse puanı ≥ 90 (Performance, Accessibility, Best Practices)
- [ ] Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1

### 4.2 Cüzdan Entegrasyonu

- [ ] MetaMask (injected) bağlantısı test edildi
- [ ] WalletConnect bağlantısı test edildi
- [ ] Yanlış ağ uyarısı görünüyor (kullanıcı desteklenmyen ağdaysa)
- [ ] Disconnect düzgün çalışıyor
- [ ] Bağlantı durumu ağ değiştiğinde güncelleniyor

### 4.3 Kontrat Etkileşimleri

- [ ] Token bakiyesi okunuyor (Ethereum Mainnet)
- [ ] Token bakiyesi okunuyor (BSC Mainnet)
- [ ] Staking: Approve akışı çalışıyor
- [ ] Staking: Stake TX gönderilebiliyor
- [ ] Staking: Pozisyonlar listeleniyor
- [ ] Governance: Öneri listesi yükleniyor
- [ ] Vesting: Schedule görüntüleniyor

### 4.4 Çevre Değişkenleri

- [ ] `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` gerçek project ID (demo değil)
- [ ] `NEXT_PUBLIC_NETWORK_ENV=mainnet`
- [ ] `NEXT_PUBLIC_ETH_MAINNET_MTA_TOKEN_ADDRESS` doğru
- [ ] `NEXT_PUBLIC_ETH_MAINNET_MTA_STAKING_ADDRESS` doğru
- [ ] `NEXT_PUBLIC_ETH_MAINNET_MTA_VESTING_ADDRESS` doğru
- [ ] `NEXT_PUBLIC_ETH_MAINNET_MTA_GOVERNOR_ADDRESS` doğru
- [ ] `NEXT_PUBLIC_ETH_MAINNET_MTA_TIMELOCK_ADDRESS` doğru
- [ ] `NEXT_PUBLIC_BSC_MAINNET_MTA_*` (5 adres) doğru

---

## 5. ALTYAPI (HIGH PRIORITY)

### 5.1 Domain ve SSL

- [ ] `metaaras.io` alan adı kayıtlı ve aktif
- [ ] `app.metaaras.io` subdomain'i DNS'e yönlendirildi
- [ ] SSL sertifikası geçerli (browser uyarısı yok)
- [ ] HTTPS redirect çalışıyor (HTTP → HTTPS)
- [ ] Cloudflare veya CDN yapılandırıldı

### 5.2 RPC Yapılandırması

- [ ] Alchemy mainnet key aktif ve rate limit yeterli
- [ ] Alchemy BSC key aktif
- [ ] Fallback RPC URL'leri frontend'de yapılandırıldı
- [ ] Alchemy monitoring/alert kuruldu

### 5.3 Monitoring

- [ ] Uptime monitoring kuruldu (UptimeRobot veya Better Uptime)
- [ ] On-chain alert kuruldu (Tenderly veya Forta)
  - Token pause event alerti
  - Büyük transfer (> 5M MTA) alerti
  - Staking büyük unstake alerti
- [ ] Error tracking kuruldu (Sentry veya Datadog)

---

## 6. LİKİDİTE (BLOCKING)

### 6.1 Başlangıç Likidite Planı

- [ ] İlk fiyat kararı verildi ve takım onayladı: 1 MTA = ___ USD
- [ ] PancakeSwap (BSC) pool büyüklüğü kararlaştırıldı (min $50K önerilir)
- [ ] Likidite cüzdanında yeterli WBNB ve MTA mevcut
- [ ] LP lock platformu seçildi (UNCX veya team.finance)
- [ ] LP lock süresi kararlaştırıldı (min 12 ay)

### 6.2 Listing Dosyaları

- [ ] `listing/coinmarketcap_info.json` — mainnet adresleri güncellendi
- [ ] `listing/coingecko_info.json` — mainnet adresleri güncellendi
- [ ] Token logo (PNG 200×200 ve 400×400) hazır
- [ ] Token logosu beyaz arka planda ve şeffaf arka planda versiyonlar
- [ ] Website token sayfası CMC/CoinGecko standartlarına uygun

---

## 7. TOPLULUK VE İLETİŞİM (MEDIUM PRIORITY)

### 7.1 Sosyal Medya Hazırlığı

- [ ] Twitter/X hesabı mavi tik başvurusu (veya doğrulama)
- [ ] Telegram grubu ve kanalı kuruldu, moderatörler hazır
- [ ] Discord sunucusu kuruldu, kanallar yapılandırıldı
- [ ] GitHub reposu public yapıldı (veya release edildi)
- [ ] Lansman tweet taslağı takım onayından geçti

### 7.2 Dokümentasyon

- [ ] Whitepaper son versiyonu yayınlandı
- [ ] Litepaper yayınlandı
- [ ] Audit raporu herkese açık
- [ ] FAQ sayfası güncel
- [ ] Hata raporlama mekanizması (GitHub Issues veya Immunefi) aktif

---

## 8. HUKUKİ VE UYUM (ÖNCE DANIŞIN)

- [ ] Token "yatırım ürünü" veya "menkul kıymet" sayılıp sayılmadığı değerlendirildi
- [ ] Türkiye'de kripto regülasyon durumu gözden geçirildi
- [ ] Kullanım şartları ve gizlilik politikası siteye eklendi
- [ ] Risk uyarısı sayfası hazır (/risk)
- [ ] Hizmet kapsamı dışı ülkeler belirlendi (ABD, UK gerekiyorsa kısıtlama)

---

## 9. OPERASYONEL HAZIRLIK

### 9.1 Runbook ve Prosedürler

- [ ] `MAINNET_RUNBOOK.md` takımla paylaşıldı
- [ ] `LAUNCH_DAY_CHECKLIST.md` takımla paylaşıldı
- [ ] `ROLLBACK_PLAN.md` takımla paylaşıldı
- [ ] `EMERGENCY_PROCEDURES.md` takımla paylaşıldı
- [ ] Tüm imzacılar Gnosis Safe kullanımını biliyor

### 9.2 Deploy Günü Görev Atamaları

| Görev | Sorumlu | Yedek |
|-------|---------|-------|
| Deploy script çalıştırma | | |
| Gnosis Safe imza koordinasyonu | | |
| Real-time monitoring | | |
| Topluluk iletişimi | | |
| Teknik destek (Discord/Telegram) | | |
| Acil durum koordinasyonu | | |

---

## GEÇ/GEÇEMEZ KARİTERLER

### Mainnet Deploy İÇİN DEVAM ET:

| # | Kriter | Durum |
|---|--------|-------|
| 1 | Harici audit tamamlandı | ⬜ |
| 2 | Tüm Critical/High bulgular kapatıldı | ⬜ |
| 3 | Gnosis Safe multisig hazır ve test edildi | ⬜ |
| 4 | Sepolia testnet deploy başarılı ve verify edildi | ✅ |
| 5 | Frontend production build temiz (0 hata) | ⬜ |
| 6 | Başlangıç likidite planı onaylandı | ⬜ |
| 7 | Acil prosedürler takımla paylaşıldı | ⬜ |
| 8 | Deploy günü tüm görev atamaları yapıldı | ⬜ |

> Yukarıdaki 8 kriterden herhangi biri ⬜ ise **mainnet deploy'u ertele**.

---

## Son Onay İmzaları

Bu checklist'i tamamladıktan sonra:

| Kişi | Rol | İmza | Tarih |
|------|-----|------|-------|
| | CTO / Teknik Lead | | |
| | Güvenlik Sorumlusu | | |
| | Proje Lideri | | |

**Mainnet Deploy Onayı Verildi:** Evet / Hayır — Tarih: ___________

---

*MetaAras Pre-Mainnet Verification v1.0 — Haziran 2026*  
*Bu listeyi hiçbir adım atlamadan tamamlayın. Her adım için kanıt saklayın.*
