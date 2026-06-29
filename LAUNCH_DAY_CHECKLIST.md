# MetaAras — Launch Day Checklist

**Version:** 1.0  
**Kullanım:** Mainnet launch günü, sırayla her adımı işaretle.

---

## T-7 Gün: Hazırlık Haftası

### İletişim Hazırlığı
- [ ] Lansman duyurusu tweet taslağı yazıldı ve onaylandı
- [ ] Telegram duyurusu taslağı hazır
- [ ] Medium/mirror makale taslağı hazır
- [ ] Discord duyurusu taslağı hazır
- [ ] Token adresleri ve pool linki duyurulara eklendi

### Teknik Hazırlık
- [ ] Audit raporu herkese açık yayınlandı
- [ ] Frontend production'a deploy edildi ve test edildi
- [ ] Tüm mainnet kontratlar Etherscan/BscScan'da verified
- [ ] LP lock hash'i ve expiry tarihi hazır (duyurularda kullanılacak)
- [ ] DexScreener token bilgileri tamamlandı
- [ ] Monitoring araçları kuruldu (Tenderly veya Forta alerts)

### Takım Hazırlığı
- [ ] Tüm imzacılar Gnosis Safe'e erişebiliyor
- [ ] Acil iletişim kanalı kuruldu (özel Telegram grup)
- [ ] Görev atamaları yapıldı: Kim neyi izleyecek?
- [ ] Rollback prosedürleri takımla paylaşıldı

---

## T-24 Saat: Gün Öncesi

### Teknik Kontroller
- [ ] Frontend son kez test edildi (staking, governance, analytics)
- [ ] Gas fiyatları kontrol edildi — yoğun değil mi?
- [ ] Ethereum ve BSC mainnet RPC endpointleri sağlıklı
- [ ] Deployer cüzdanı bakiyesi yeterli (ETH + BNB)
- [ ] Liquidity wallet'ta yeterli bakiye

### İletişim Son Hazırlık
- [ ] Tüm duyuru metinleri son kez okundu
- [ ] Token adresleri duyurularda doğru yazılmış
- [ ] Doğru link yapıları kontrol edildi

### Güvenlik Son Kontrol
- [ ] Yeni tehdit bildirim haberleri tarandı (Rekt.news, Twitter/X)
- [ ] Benzer kontrat exploit'leri araştırıldı
- [ ] Multisig imzacıları hazır ve iletişimde

---

## Lansman Günü — Saat Saat

### 06:00 — Sabah Kontrolleri

```
[ ] Frontend çalışıyor: https://app.metaaras.io
[ ] MetaMask ile bağlantı başarılı
[ ] Ethereum Mainnet doğru görünüyor
[ ] BSC Mainnet doğru görünüyor
[ ] Tüm kontrat adresleri sitede doğru
[ ] Etherscan'da tüm kontratlar verified görünüyor
```

**İmzacı 1 onayı:** _____ saat _____  
**İmzacı 2 onayı:** _____ saat _____  
**İmzacı 3 onayı:** _____ saat _____

---

### 08:00 — Likidite Pool Hazırlığı

```
[ ] BSC Mainnet: PancakeSwap pool adresini doğrula
[ ] Pool depth yeterli mi? (En az $50K USD değerinde)
[ ] Fiyat slippage'ı kabul edilebilir seviyede
[ ] LP lock kilidi aktif ve hash paylaşıldı
[ ] ETH Mainnet: Uniswap pool aktif (varsa)
```

**PancakeSwap Pool:** https://pancakeswap.finance/add/___  
**LP Lock TX:** https://bscscan.com/tx/___

---

### 09:00 — Küçük İşlem Testi (Smoke Test)

> Her adım için küçük miktarlar kullanın (10-50 MTA)

```
[ ] 1. DApp'e MetaMask ile bağlan
[ ] 2. Token bakiyesi görünüyor
[ ] 3. Staking formunda Bronze tier seç
[ ] 4. 10 MTA stake et → Approve tx → Stake tx
[ ] 5. "My Positions" tab'ında pozisyon görünüyor
[ ] 6. Governance sayfası yükleniyor
[ ] 7. Analytics sayfasında live data görünüyor
[ ] 8. BSC ağına geç → aynı işlemleri tekrarla
```

**Ethereum Test TX:** `0x___`  
**BSC Test TX:** `0x___`

**Sorun var mı?** Evet / Hayır  
**Varsa:** Rollback Plan'a bak (ROLLBACK_PLAN.md)

---

### 10:00 — Topluluk Hazırlığı

```
[ ] Discord'da #announcements kanalı hazır
[ ] Telegram kanalında moderatörler hazır
[ ] Twitter/X hesabı giriş yapılmış
[ ] Medium/Mirror hesabı hazır
```

---

### 11:00 — Lansman Onay Toplantısı

> Tüm takım üyeleri katılmalı (video call veya live)

**Onay anketi:**
- [ ] CTO: Teknik hazır mıyız? → Evet / Hayır
- [ ] Güvenlik: Bilinen risk var mı? → Evet / Hayır
- [ ] Topluluk: Topluluk hazır mı? → Evet / Hayır
- [ ] Multisig: İmzacılar hazır mı? → Evet / Hayır

**KARAR:** Devam / Ertele — ___________ tarafından _____ saatte onaylandı

---

### 12:00 — RESMI LANSMAN

```
[ ] Twitter duyurusu yayınlandı
[ ] Telegram duyurusu yayınlandı
[ ] Discord duyurusu yayınlandı
[ ] Medium/Mirror makale yayınlandı
[ ] DexScreener'da token görünüyor
[ ] CoinGecko/CMC başvuruları onaylandı (veya pending)
```

**Duyuru TX hash:** Geçerli değil (off-chain)  
**Twitter duyuru URL:** ___

---

### 13:00 — İlk Saatlerde İzleme

**Her 30 dakikada kontrol et:**

```
[ ] :00 — Kontratlar pause değil
[ ] :00 — Likidite pool depth düşmedi
[ ] :00 — Fiyat makul aralıkta
[ ] :00 — Gas tüketimi normal
[ ] :00 — Frontend yükleme süresi <3s
[ ] :00 — Etherscan'da olağandışı tx yok
[ ] :30 — [aynıları tekrarla]
```

---

### 14:00–18:00 — Aktif İzleme Periyodu

**Saatlik kontrol listesi:**

```
[ ] Staking TVL (Total Value Locked) artıyor mu?
[ ] Pool fiyatı makul seyrediyor mu?
[ ] Social medyada negatif/şüpheli içerik var mı?
[ ] Herhangi bir güvenlik uyarısı var mı? (Rekt.news, Twitter)
[ ] Frontend performansı kabul edilebilir mi?
[ ] Herhangi bir hata raporlandı mı?
```

---

### 20:00 — Gün Sonu Değerlendirmesi

**Metrikler kaydedilecek:**

| Metrik | Değer |
|--------|-------|
| Toplam TVL (Staking) | |
| Pool Likidite Değeri | |
| Toplam TX Sayısı | |
| Unique Kullanıcı | |
| Frontend Uptime | |
| Hata/Sorun | |

**Başarı kriterleri:**
- [ ] 0 güvenlik olayı
- [ ] Frontend %99+ uptime
- [ ] Staking çalışıyor
- [ ] Likidite stabil
- [ ] Topluluk pozitif geri bildirim

---

## T+1 Gün: İlk Gün Sonrası

- [ ] Gecelik log analizi
- [ ] On-chain anormallik taraması
- [ ] Topluluk geri bildirimleri toplanıyor
- [ ] Hata rapor listesi güncellendi
- [ ] Sonraki 48 saat izleme programı güncellendi

---

## Acil Durum İletişim Listesi

> Bu listeyi güvenli bir yerde saklayın (kağıt + şifreli dijital kopya)

| Kişi | Rol | İletişim |
|------|-----|----------|
| ________ | CTO / Teknik Lead | @_____ |
| ________ | Multisig İmzacı 1 | @_____ |
| ________ | Multisig İmzacı 2 | @_____ |
| ________ | Multisig İmzacı 3 | @_____ |
| ________ | Topluluk Yöneticisi | @_____ |
| ________ | Hukuki Danışman | @_____ |

**Acil Pause Süreci:** Sadece 2 imzacı gerekli (Gnosis Safe 2/5 threshold düşürme — ön onay gerekir)

---

*MetaAras Launch Day Checklist v1.0*  
*Hazırlayan: MetaAras Teknik Ekibi — Haziran 2026*
