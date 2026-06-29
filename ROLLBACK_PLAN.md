# MetaAras — Rollback Planı

**Version:** 1.0  
**Tarih:** Haziran 2026  

> Bu belge, mainnet deployment sırasında veya sonrasında bir sorun çıkması durumunda  
> uygulanacak rollback ve kurtarma prosedürlerini tanımlar.

---

## Rollback Felsefesi

MetaAras kontratları **immutable** (değiştirilemez) doğadadır — MTAStaking hariç (UUPS proxy).  
Akıllı kontratlar geri alınamaz: deploy edildikten sonra blokchain'de kalır.

Bu nedenle "rollback" birkaç anlama gelir:
1. **Deployment aşamasında hata** → Bir sonraki adıma geçme, sorunu tespit et ve düzelt
2. **Deploy sonrası kritik güvenlik açığı** → Kontratları pause et, kullanıcıları uyar, upgrade planla
3. **MTAStaking bug'ı** → UUPS upgrade mekanizmasını kullan (Timelock onayı gerekli)
4. **Frontend hatası** → Önceki deploy'a revert

---

## SENARYO 1: Deployment Sırasında Hata

### 1A — Script Yarıda Kesildi

**Belirti:** Deploy scripti hata verdi ve tamamlanamadı.

**Adımlar:**
1. `deployments/{network}.json` içinde hangi kontratların deploy edildiğini kontrol et
2. Eksik kontratları tek tek deploy et (01→04 sırasıyla)
3. Tamamlanan kontratları tekrar deploy ETME — mevcut adresleri kullan
4. Deploy scripti hangi adımda kaldıysa, o script'i yeniden çalıştır

```bash
# Mevcut durumu kontrol et
cat deployments/mainnet.json | python -m json.tool

# Sadece eksik kontratı deploy et (örnek: vesting eksik)
npx hardhat run scripts/deploy/02_deploy_vesting.ts --network mainnet
```

---

### 1B — Yanlış Adres Kullanıldı

**Belirti:** `MULTISIG_ADDRESS`, `TREASURY_WALLET` vb. yanlış adres girildi.

**Deployment sırasında fark edildiyse:**
- 05_post_deploy.ts henüz çalıştırılmadıysa: .env'i düzelt ve 05'i çalıştır
- Minting henüz tamamlanmadıysa: token kontratındaki rolü multisig'e ver, yanlış cüzdanı sıfırla

**Minting tamamlandıktan sonra fark edildiyse:**
- Yanlış cüzdana giden token'ları multisig üzerinden geri transfer et
- NOT: Bu işlem Gnosis Safe transaction gerektirir

**05_post_deploy.ts sonra fark edildiyse:**
- Yanlış adres kontrolü: `token.hasRole(ADMIN_ROLE, wrongAddress)` → `true` olmamalı
- Eğer yanlış adrese DEFAULT_ADMIN verilmişse: **Kritik durum — bkz. Senaryo 3**

---

### 1C — Gas Yetersiz / TX Dropped

**Belirti:** Transaction dropped (düşürüldü) veya gas bitmesi.

**Adımlar:**
1. Aynı nonce ile daha yüksek gas fee ile TX'i yeniden gönder (speed-up)
2. Veya: nonce'u geçersiz kılmak için 0 ETH self-transfer gönder, sonra scripti tekrar çalıştır
3. `deployments/json` dosyasını kontrol et — script zaten kayıt yapmış mı?

---

## SENARYO 2: Deploy Sonrası Bug (Kritik Güvenlik)

### 2A — Derhal Pause Et

**Belirti:** Exploit tespit edildi, büyük miktarda token hareket ediyor.

**Saniye başarısı — komuta geç:**
```
1. Gnosis Safe'i aç (HEMEN)
2. Çok sayıda imzacıya ping at: "ACİL — PAUSE GEREKLI"
3. pause() tx'ini oluştur (token + staking)
4. 2 imzacı onayı → TX gönder
5. Kullanıcıları DUYUR: "Kontrat geçici olarak duraklatıldı"
```

**Hardhat konsol ile (tek imzacı kısa yol — SADECE PAUSER_ROLE varsa):**
```javascript
// Acil pause — deployer PAUSER_ROLE'e sahipsa
const token   = await ethers.getContractAt("MTAToken", TOKEN_ADDR);
const staking = await ethers.getContractAt("MTAStaking", STAKING_ADDR);
await token.pause();
await staking.pause();
```

**Pause TX hash (kaydet):** `0x___`  
**Pause tarihi/saati:** ___

---

### 2B — Exploit Analizi

```
[ ] Exploit TX hash'lerini topla
[ ] Etkilenen adresleri belirle
[ ] Fon hareketi miktarını hesapla
[ ] Güvenlik açığının tam olarak nerede olduğunu tespit et
[ ] Audit firmasını bilgilendir
[ ] Hukuki danışmanı bilgilendir
```

**Etkilenen fon miktarı:** ___  
**Exploit TX:** `0x___`

---

### 2C — Kullanıcı İletişimi (Pause'dan sonra ilk 30 dakika)

```
Kanal: Twitter, Telegram, Discord, Medium
Mesaj taslağı:
"⚠️ [GÜNCELLEME] MetaAras protokolünde bir sorun tespit ettik.
Kullanıcı fonlarını korumak amacıyla kontratları geçici olarak
duraklatıyoruz. Araştırma sürecini sizinle paylaşacağız.
Lütfen panik yapmayın — fon güvende. Daha fazla bilgi: [LINK]"
```

---

### 2D — MTAStaking için UUPS Upgrade (Güvenlik Yaması)

**Bu yol yalnızca MTAStaking için geçerlidir (tek UUPS kontrat).**

Upgrade süreci:
1. Yeni MTAStaking implementasyonu yaz ve test et
2. Yeni implementasyonu deploy et (proxy değişmez)
3. Governance üzerinden upgrade önerisi oluştur
4. 7 gün oylama → 48 saat Timelock bekle
5. `upgradeToAndCall(newImpl, "")` çalıştır

```bash
# Yeni implementasyon deploy
npx hardhat run scripts/deploy/upgrade_staking.ts --network mainnet

# Governance proposal oluştur (frontend üzerinden veya script)
```

**UYARI:** Upgrade Timelock üzerinden yapılmalı. Doğrudan upgrade = güvenlik riski.

---

## SENARYO 3: Erişim Kaybı / Admin Kilitleme

**Belirti:** Multisig'e erişilemiyor (imzacılar kayboldu, cüzdan kaybedildi).

**Bu senaryo geri dönülemez olabilir.** Önlem:

1. **Minimum 3 imzacı** her zaman erişilebilir olmalı (5'ten 3 gerekli)
2. Her imzacı hardware wallet + seed phrase güvenli yedek almalı
3. Imzacı seti değiştirilirse → Gnosis Safe owner değişikliği önerisi yapılmalı
4. Governance üzerinden: `MTATimelock.grantRole(ADMIN, newMultisig)` önerilebilir

---

## SENARYO 4: Likidite Problemi

### 4A — Pool Drain (Likidite Çekilmesi)

**Belirti:** Pool depth aniden sıfırlandı veya çok düştü.

```
[ ] LP kilit durumunu kontrol et (team.finance / UNCX)
[ ] Eğer kilit yoksa: Acil 2. likidite turu için fon hazırla
[ ] Community buy-in başlat: "Likidite güçlendirme önerisi"
[ ] DexScreener'a "low liquidity warning" raporu gönder
```

### 4B — Fiyat Manipülasyonu

```
[ ] Pool trade pattern'larını izle
[ ] Anormal büyük swap'ları Etherscan'da takip et
[ ] Gerekirse: Pool fiyatı manipülasyonunu haber yap
[ ] Governance önerisi: Staking ödüllerini geçici durdur/azalt
```

---

## SENARYO 5: Frontend Çökmesi

**Belirti:** Kullanıcılar frontend'e erişemiyor.

**Adım 1 — Hızlı Revert (Vercel):**
```bash
vercel rollback  # Önceki deploy'a dön
```

**Adım 2 — Vercel yoksa:**
```bash
git revert <commit>
npm run build
npm run start  # veya pm2 restart all
```

**Adım 3 — DNS sorunuysa:**
- Cloudflare'da Cache purge yap
- DNS TTL'i kontrol et
- Backup domain'i aktifleştir (varsa)

**NOT:** Frontend çökmesi kontrat güvenliğini ETKİLEMEZ.  
Kullanıcılar doğrudan Etherscan Write Contract ile işlem yapabilir.  
Bu bilgiyi duyuruda belirt.

---

## Rollback Karar Matrisi

| Durum | Karar | Sorumlu | Süre |
|-------|-------|---------|------|
| Script hatası (deploy sırasında) | Düzelt, devam et | Teknik Lead | Dakikalar |
| TX dropped | Yeniden gönder | Teknik Lead | Dakikalar |
| Frontend hatası | Revert/fix | Frontend | 1 saat |
| Küçük bug (non-critical) | Governance upgrade | Multisig + DAO | 7+ gün |
| Kritik bug (funds at risk) | Pause + acil duyuru | Multisig | Saniyeler |
| Exploit devam ediyor | Pause + hukuk + audit | Tüm takım | Saatler |
| Admin erişim kaybı | Hukuki süreç + on-chain yönetim | Hukuk + teknik | Günler |

---

## İletişim Şablonları

### Pause Duyurusu (Twitter/Telegram)
```
⚠️ MetaAras Güncelleme

Protokol güvenliğini sağlamak amacıyla akıllı kontratlar
geçici olarak duraklatıldı.

✅ Kullanıcı fonları güvende
🔍 Sorun inceleniyor
📢 Sonraki güncelleme: [ZAMAN]

#MetaAras #DeFi
```

### Soruşturma Güncelleme Duyurusu
```
🔍 MetaAras Soruşturma Güncellemesi [Zaman]

Sorunun kaynağı: [AÇIKLAMA]
Etkilenen kontrat: [KONTRAT]
Etkilenen fonlar: [MIKTAR veya "Yok"]

Önümüzdeki adımlar:
1. [ADIM]
2. [ADIM]

Takipte kalın.
```

### Çözüm Duyurusu
```
✅ MetaAras — Sorun Çözüldü

Protokol yeniden aktif.

Özet: [ÖZET]
Alınan önlemler: [ÖNLEMLER]
Audit doğrulaması: [LINK]

Güveniniz için teşekkürler.
```

---

*MetaAras Rollback Plan v1.0 — Haziran 2026*  
*Bu belge en az 3 ayda bir güncellenmeli ve tüm multisig imzacılarıyla paylaşılmalı.*
