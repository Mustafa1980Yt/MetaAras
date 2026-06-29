# MetaAras — Telegram Yapısı

## Telegram Kanal vs Grup

| | Kanal | Grup |
|--|-------|------|
| **Kullanım** | Duyurular | Topluluk tartışması |
| **Yazma** | Sadece admin | Herkes |
| **Önerilen** | @MetaArasAnnouncements | @MetaArasDAO |

**Her ikisini de oluştur:**
- `t.me/MetaArasAnnouncements` — Tek yönlü duyuru kanalı
- `t.me/MetaArasDAO` veya `t.me/metaaras` — Topluluk grubu

---

## Kanal Açıklaması (Bio)

### Duyuru Kanalı (@MetaArasAnnouncements)
```
📢 MetaAras Protocol — Official Announcements

🔐 Multichain DeFi Governance Protocol
⚡ Staking · DAO · Vesting on Ethereum + BSC

🌐 metaaras.io
💬 Community: t.me/MetaArasDAO
🐦 Twitter: twitter.com/MetaArasDAO
📄 Whitepaper: metaaras.io/whitepaper
```

### Topluluk Grubu (@MetaArasDAO)
```
🏛️ MetaAras DAO — Official Community

Welcome to MetaAras Protocol community!

MTA Token | Staking | Governance | Vesting
Ethereum + BNB Smart Chain

🌐 metaaras.io
📢 Announcements: t.me/MetaArasAnnouncements
🐦 Twitter: @MetaArasDAO
📄 Docs: metaaras.io/docs

⚠️ Admin will NEVER DM you first.
⚠️ Never share your private key or seed phrase.
```

---

## Grup Kuralları (Pinli Mesaj)

```
📌 MetaAras DAO Community Rules

Welcome to MetaAras! Please read before participating:

✅ ALLOWED
• Protocol discussions and questions
• Technical feedback and bug reports
• Governance proposal discussions
• Price discussions (civil and constructive)
• Sharing MetaAras content

❌ NOT ALLOWED
• Spam or self-promotion without admin permission
• Scam links, phishing, or fake giveaways
• FUD (Fear, Uncertainty, Doubt) without evidence
• Hate speech or personal attacks
• NSFW content of any kind
• Multiple accounts / ban evasion
• Sharing or asking for private keys / seed phrases
• Impersonating team members or admins

⚠️ SECURITY REMINDERS
• Admins NEVER send DMs first
• We will NEVER ask for your private key
• MetaAras NEVER runs wallet-draining "airdrops"
• If someone DMs you claiming to be MetaAras team → REPORT + BLOCK

🚫 Violations result in immediate ban.

Contract Address (Sepolia Testnet):
0x27315C3bF2370E933C376A7982CBDA77FF122376

Mainnet: [TBA — Q3 2026]

🌐 metaaras.io | 📄 metaaras.io/whitepaper
```

---

## Grup Bot Önerileri

### Rose Bot (Temel Moderasyon)
```
Komutlar:
/warn @user <sebep>
/ban @user
/mute @user <süre>
/rules
```

### Captcha Bot (Spam Engeli)
- Gruba katılırken otomatik doğrulama
- Bot hesapları ve spamcıları engeller

### MEV Bot (Fiyat Takibi)
- MTA fiyatını sorgulayabilme: `/price MTA`

---

## Pinli Mesajlar Yapısı

1. **Grup Kuralları** (yukarıdaki metin)
2. **Resmi Linkler** (website, duyuru kanalı, Twitter, GitHub)
3. **Token Bilgileri** (adres, tokenomics özeti)
4. **Son Önemli Duyuru**

---

## Admin Rolleri

| Rol | Yetki |
|-----|-------|
| Owner | Tam yetki |
| Admin | Ban, kick, pin mesaj |
| Moderator | Warn, mute, spam silme |
| Community Manager | Soruları yanıtlama |

---

## Başlangıç Mesajı Şablonu (Lansman Günü)

```
🎉 MetaAras Protocol is LIVE!

We're thrilled to welcome you to the MetaAras DAO community.

MetaAras (MTA) is a professional-grade multichain DeFi governance 
protocol built on Ethereum and BNB Smart Chain.

🔐 What can you do?
→ Stake MTA and earn 8–40% fixed APY
→ Vote on protocol governance proposals
→ Participate in treasury decisions
→ Compound rewards automatically

📊 Key Numbers:
→ 100M MTA total supply (hard cap)
→ 48-hour Timelock on all changes
→ 119/119 unit tests passing
→ External audit completed ✓

🚀 Start here: app.metaaras.io

Please read the pinned rules before chatting. 
Welcome aboard! 🏛️

#MetaAras #DeFi #DAO
```

---

*MetaAras Telegram Guide — Haziran 2026*
