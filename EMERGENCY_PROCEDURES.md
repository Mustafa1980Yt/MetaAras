# MetaAras — Acil Durum Prosedürleri

**Version:** 1.0  
**Tarih:** Haziran 2026  
**Sınıflandırma:** Gizli — Sadece Core Takım

---

## Acil Durum Seviyeleri

| Seviye | Tanım | Yanıt Süresi | Sorumlu |
|--------|-------|-------------|---------|
| 🔴 SEV-1 | Aktif exploit / fon riski altında | < 5 dakika | Tüm imzacılar |
| 🟠 SEV-2 | Kritik bug / sistemik hata | < 30 dakika | Teknik + 3 imzacı |
| 🟡 SEV-3 | Önemli hizmet kesintisi | < 2 saat | Teknik Lead |
| 🟢 SEV-4 | Küçük bug / performans | 24-48 saat | Teknik Lead |

---

## Hızlı Referans — Acil Durum Komutları

### Token Pause (Gnosis Safe üzerinden)

```
İşlem verisi:
  - Hedef: MTAToken adresi
  - Fonksiyon: pause()
  - Gerekli imzacı: 3 (eşik 3/5)
  - Beklenen gaz: ~50,000
```

### Staking Pause

```
İşlem verisi:
  - Hedef: MTAStaking proxy adresi
  - Fonksiyon: pause()
  - Gerekli imzacı: 3 (eşik 3/5)
```

### Her İkisini Aynı Anda Pause Et (Gnosis Safe Batch TX)

Gnosis Safe → Transaction Builder → Batch:
1. Token.pause()
2. Staking.pause()

Bu işlem tek tx olarak imzalanabilir — her zaman batch kullanmayı tercih et.

---

## SEV-1: Aktif Exploit / Saldırı

### İlk 5 Dakika (Alarm Aşaması)

```
T+0:00  Exploit doğrulandı — alarm ver
T+0:30  Tüm imzacılara acil mesaj at: "SEV-1 — HEMEN KATIL"
T+1:00  Gnosis Safe'de batch pause TX hazırla
T+2:00  3 imzacı onayı topla
T+3:00  Pause TX gönder
T+4:00  Pause TX onayını doğrula (Etherscan)
T+5:00  Kamuya duyuru yayınla (pause uygulandı)
```

**Mesaj Şablonu (imzacılara):**
```
🚨 SEV-1 ACİL — MetaAras

[EXPLOIT AÇIKLAMASI - max 2 cümle]

HEMEN: Gnosis Safe'i aç → Pending TX onayını imzala
TX: [LINK]

Onaylayan: [İSİM] ✓
```

---

### İlk 30 Dakika (Hasarı Sınırlama)

```
[ ] Pause TX'i doğrula: token.paused() = true, staking.paused() = true
[ ] Exploit TX hash'lerini kaydet
[ ] Etkilenen adresleri ve miktarları tespit et
[ ] Likidite pool'undan çekilme var mı? Kontrol et
[ ] Audit firmasını bilgilendir (acil iletişim kanalı)
[ ] Hukuki danışmanı bilgilendir
[ ] Snapshot: Tüm bakiyeleri ve pozisyonları kaydet (Etherscan export)
```

**Exploit Bilgi Formu:**
```
Tespit Tarihi/Saati:
Tespit Eden:
Exploit TX Hash(es):
Etkilenen Kontrat:
Etkilenen Fonlar (tahmini):
Saldırgan Adresi:
Exploit Vektörü (tahmini):
Pause TX Hash:
```

---

### İlk 2 Saat (Analiz + İletişim)

```
[ ] Kamuya durum raporu yayınla (ayrıntısız — soruşturma devam ediyor)
[ ] Audit firmasından acil inceleme talep et
[ ] Exploit vektörünü tam olarak tespit et
[ ] Kullanıcıları etkilenen pozisyonlar hakkında bilgilendir
[ ] Yasal yükümlülükleri değerlendir (KVKK, regülasyon)
```

---

### 2-24 Saat (Çözüm Geliştirme)

```
[ ] Güvenlik yaması yaz + test et
[ ] Audit firması yamaları doğruluyor
[ ] Governance önerisi hazırla (MTAStaking upgrade için)
[ ] Etkilenen kullanıcı tazminat planı (mümkünse)
[ ] Tam olay raporu taslağı hazırla
```

---

### 24-72 Saat (Kurtarma)

```
[ ] Yamayı deploy et (MTAStaking UUPS upgrade)
[ ] Kapsamlı test turu
[ ] Güvenli ise pause kaldır
[ ] Tam kamuoyu raporu yayınla
[ ] CMC/CoinGecko'yu güncelle
[ ] Post-mortem raporu hazırla ve yayınla
```

---

## SEV-2: Kritik Bug (Fonlar Henüz Etkilenmemiş)

### Yanıt Sırası

```
1. Hatayı iç takımda doğrula (30 dk içinde)
2. Risk değerlendirmesi: Fon kaybı riski var mı?
   - Varsa → SEV-1'e yükselt
   - Yoksa → SEV-2 devam
3. Önleyici pause kararı al (oylama gerekli)
4. Kullanıcılara "bakım modu" bildirimi
5. Yama geliştir → test → audit
6. Governance + Timelock süreci
```

---

## SEV-3: Hizmet Kesintisi

### Frontend Kesintisi

```
1. Hata türünü tespit et (DNS, Build, Server, CDN)
2. Son çalışan versiyona revert:
   vercel rollback
3. Durum sayfasını güncelle (status.metaaras.io — varsa)
4. Topluluk: "Geçici teknik sorun — çözüyoruz"
5. Sorunu düzelt → deploy → doğrula
6. Post-fix duyuru
```

### RPC / Alchemy Kesintisi

```
1. Alchemy dashboard'u kontrol et
2. Fallback RPC'ye geç (frontend config'de)
3. Birden fazla RPC sağlayıcı kullan:
   - Ethereum: Alchemy, Infura, Ankr, PublicNode
   - BSC: BNB RPC, QuickNode, NodeReal
```

---

## İletişim Protokolü

### Dahili (Core Takım)

| Platform | Kullanım |
|----------|----------|
| Özel Telegram grup | Gerçek zamanlı koordinasyon |
| Özel Discord kanal | Dosya/link paylaşımı |
| E-posta | Resmi kayıt tutma |
| Gnosis Safe | TX onayları |

### Harici (Topluluk)

| Platform | Ne Zaman | Kim |
|----------|----------|-----|
| Twitter/X | Onaylanan her gelişmede | Topluluk Yöneticisi |
| Telegram kanal | Her 30 dakikada (SEV-1) | Topluluk Yöneticisi |
| Discord #announcements | Her güncellemede | Moderatör |
| Medium | Tam rapor için | CTO veya Lead Dev |

### Asla Yapılmayanlar

- ❌ Tam exploit detaylarını açıklamadan önce exploit gerçekleşmişse açıklama yapma
- ❌ Tahmini kayıp rakamları söyleme (kanıtlanana kadar)
- ❌ Kurtarma sürecini garanti etme
- ❌ Kullanıcı özel bilgilerini (adresler vs.) sosyal medyada paylaşma

---

## Blockchain Araçları

### On-Chain Durum Sorgusu

```bash
# Token pause durumu
cast call $TOKEN_ADDR "paused()" --rpc-url https://eth-mainnet.alchemyapi.io/v2/$ALCHEMY_KEY

# Staking pause durumu
cast call $STAKING_ADDR "paused()" --rpc-url https://eth-mainnet.alchemyapi.io/v2/$ALCHEMY_KEY

# Rol kontrolü
cast call $TOKEN_ADDR \
  "hasRole(bytes32,address)(bool)" \
  "0x0000000000000000000000000000000000000000000000000000000000000000" \
  $MULTISIG_ADDR \
  --rpc-url https://eth-mainnet.alchemyapi.io/v2/$ALCHEMY_KEY
```

### Adres Monitörü

Tenderly (önerilir) üzerinde alert kur:
- MTAToken: balance değişimleri > 1M MTA
- MTAStaking: büyük unstake işlemleri
- Multisig: yeni tx'ler
- Pool: büyük swap'lar

---

## Hukuki ve Uyum

### Bildirim Gereksinimleri

Exploit durumunda (özellikle kullanıcı kaybı varsa):

```
- Türk kullanıcılar için KVKK bildirimi (72 saat)
- AB kullanıcıları için GDPR bildirimi (72 saat içinde DPA'ya)
- Büyük borsa/listeleme platformlarına (CMC, CoinGecko) bildirim
```

### Kanıt Koruma

```
[ ] Tüm exploit TX hash'lerini kaydet
[ ] Etherscan sayfalarının ekran görüntülerini al
[ ] Tüm dahili iletişim loglarını sakla
[ ] Saldırgan adresinin her TX'ini takip et
```

---

## Simülasyon ve Drill

**Her 3 ayda bir acil durum simülasyonu yapılmalı:**

```
1. Sahte exploit TX oluştur (testnet'te)
2. Tüm imzacıları gecenin 02:00'sinde alarma kaldır
3. Pause sürecini gerçek ortamda (testnet) çalıştır
4. 5 dakika hedefini ölçtür
5. İyileştirme noktalarını not al
```

**Son drill:** ___________  
**Katılanlar:** ___________  
**Pause süresi:** ___________ dakika

---

## Sonraki Adım Planlaması

Acil durumun ardından:

1. **Post-mortem (72 saat içinde):**
   - Zaman çizelgesi
   - Kök neden analizi
   - Yanıt süreci değerlendirmesi
   - İyileştirme önerileri

2. **Güvenlik İyileştirme:**
   - Yeni test coverage
   - Ek monitoring
   - Prosedür güncellemesi

3. **Topluluk İletişimi:**
   - Tam olay raporu
   - Alınan önlemler
   - Gelecek güvenlik roadmap

---

*MetaAras Acil Durum Prosedürleri v1.0 — Haziran 2026*  
*Bu belge 3 ayda bir gözden geçirilmeli ve tüm imzacılarla paylaşılmalı.*  
*Kağıt kopya: Güvenli lokasyonda sakla.*
