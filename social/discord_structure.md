# MetaAras — Discord Sunucu Yapısı

## Sunucu Adı

```
MetaAras Protocol | MTA DAO
```

## Sunucu İkonu

- Format: PNG, 512×512px
- MTA logo görseli

---

## Kanal Yapısı (Kategoriler ve Kanallar)

```
📢 ANNOUNCEMENTS
├── #announcements        [Salt okunur — sadece ekip yazabilir]
├── #changelog            [Salt okunur — version güncellemeleri]
└── #security-alerts      [Salt okunur — güvenlik uyarıları]

👋 WELCOME
├── #welcome              [Giriş ve kurallar pinli]
├── #rules                [Sunucu kuralları]
├── #introductions        [Üye tanışma]
└── #roles                [Reaction roles — seçim ekle]

💬 GENERAL
├── #general              [Genel sohbet]
├── #price-discussion     [Fiyat konuşmaları buraya]
├── #memes                [Topluluk içerikleri]
└── #off-topic            [Konu dışı]

🏛️ DAO GOVERNANCE
├── #governance-proposals  [Öneri tartışmaları]
├── #voting-results        [Oy sonuçları]
├── #treasury-updates      [Hazine raporları]
└── #improvement-ideas     [Topluluk önerileri]

⚡ STAKING & DAPP
├── #staking-help         [Staking soruları]
├── #vesting-help         [Vesting soruları]
├── #dapp-support         [Genel DApp sorunları]
└── #transactions         [TX hash paylaşımı / doğrulama]

🛠️ DEVELOPERS
├── #dev-general          [Geliştirici tartışmaları]
├── #smart-contracts      [Kontrat soruları]
├── #frontend             [Frontend geliştirme]
├── #bug-reports          [Hata bildirimleri]
└── #github-feed          [Otomatik GitHub bildirimler]

📊 ANALYTICS
├── #protocol-stats       [TVL, staker sayısı, volume]
└── #on-chain-alerts      [Büyük TX'ler, whale hareketleri]

🤝 PARTNERS
├── #partnerships         [Ortak proje duyuruları]
└── #integrations         [API / SDK entegrasyonları]

🎙️ VOICE CHANNELS
├── 🔊 Community Call
├── 🔊 AMA Room
└── 🔊 Dev Hangout

📚 RESOURCES
├── #links                [Önemli linkler pinli]
├── #faq                  [Sık sorulan sorular]
└── #documentation        [Doküman linkleri]

🔧 ADMIN [Sadece ekip görür]
├── #team-general
├── #ops
└── #moderation-log
```

---

## Rol Yapısı

```
🔴 Core Team          — Tam yetki, tüm kanallara erişim
🟠 Moderator          — Ban/kick, spam silme, mesaj sabitleme
🟡 Community Manager  — Soru yanıtlama, hoş geldin mesajları
🟢 DAO Delegate       — Governance kanallarında özel erişim
🔵 OG Member          — İlk 100 üye — özel rozet
⚪ Staker             — MTA stake ettiğini doğrulayan üyeler
⚫ Member             — Herkes (default rol)
```

### Reaction Roles (#roles kanalı)
```
🔵 Staker Alert     — Staking güncellemeleri bildirimi
🟣 Governance Alert — Yeni öneri bildirimi
🟡 Dev Updates      — GitHub/teknik güncellemeler
🔴 All Alerts       — Tüm duyurular
```

---

## Hoş Geldin Mesajı (Bot ile otomatik — #welcome)

```
👋 Welcome to MetaAras Protocol DAO, {user}!

You've joined the official community for MetaAras (MTA) —
a professional DeFi governance protocol on Ethereum and BNB Chain.

📌 First things to do:
1️⃣ Read the rules in #rules
2️⃣ Introduce yourself in #introductions
3️⃣ Pick your roles in #roles
4️⃣ Start staking at app.metaaras.io

🔒 Security reminder:
Our team will NEVER DM you first.
We will NEVER ask for your private key or seed phrase.

Let's build together! 🏛️
```

---

## Sunucu Kuralları (#rules — pinli mesaj)

```
📜 MetaAras Discord Server Rules

1. 🤝 BE RESPECTFUL
   Treat everyone with respect. No harassment, hate speech, or
   personal attacks.

2. 💬 STAY ON TOPIC
   Use the appropriate channels. Price talk → #price-discussion,
   Dev questions → #dev-general, etc.

3. 🚫 NO SPAM
   No repeated messages, @mentions, or unsolicited DMs.
   No self-promotion without admin permission.

4. 🔐 SECURITY FIRST
   Never share your private key or seed phrase.
   Report suspicious users to moderators immediately.
   Admins will NEVER DM you asking for funds or keys.

5. 📢 NO FAKE NEWS
   Share only verified information. Label speculation clearly.
   No FUD without evidence.

6. 🤖 NO SCAMS
   Zero tolerance for phishing links, fake airdrops, or
   impersonation. Immediate permanent ban.

7. 🌍 ENGLISH / TÜRKÇE
   Primary languages are English and Turkish.
   Other languages in #off-topic.

8. 📊 NO FINANCIAL ADVICE
   Nothing here is financial advice. DYOR always.
   MetaAras team does not provide investment advice.

Violations → Warning → Timeout → Permanent Ban

Thanks for being part of MetaAras DAO! 🏛️
```

---

## Önerilen Botlar

| Bot | Amaç |
|-----|-------|
| **Carl-bot** | Reaction roles, welcome mesajları, log |
| **MEE6** | Level sistemi, moderasyon |
| **GitHub Bot** | `#github-feed` için otomatik PR/commit bildirimleri |
| **Dyno** | Anti-spam, auto-mod |
| **Collab.Land** | Token gated rol (MTA sahipleri) |

### Collab.Land Token-Gated Roller (Opsiyonel)
```
Staker rolü almak için:
→ #roles kanalında "Verify" tıkla
→ Collab.Land bot cüzdanını doğrular
→ ≥100 MTA stake → "Staker" rolü
→ ≥10,000 MTA → "Platinum Staker" rolü
```

---

## İlk Kurulum Adımları

1. Discord hesabında yeni sunucu oluştur
2. Yukarıdaki kanal yapısını oluştur
3. Rolleri ayarla
4. Carl-bot / MEE6 ekle ve konfigüre et
5. Kurallar ve hoş geldin mesajlarını pinle
6. Reaction roles kur (#roles kanalı)
7. Ekibi davet et ve rolleri ver
8. Lansman duyurusu için hazır ol

---

*MetaAras Discord Structure Guide — Haziran 2026*
