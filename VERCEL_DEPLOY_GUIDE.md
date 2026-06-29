# MetaAras Frontend — Vercel Deployment Rehberi

## Neden Vercel?

- Next.js'in yapımcısı — en iyi Next.js desteği
- Otomatik HTTPS + CDN
- Preview deployments (her PR için otomatik önizleme)
- Edge Functions desteği
- Ücretsiz plan yeterli (hobby projeler için)

---

## Yöntem 1: GitHub Entegrasyonu (Önerilen)

### Adım 1 — Vercel Hesabı

1. `vercel.com` → **Sign Up** → **Continue with GitHub**
2. GitHub hesabını yetkilendir

### Adım 2 — Proje İmport Et

1. Vercel Dashboard → **Add New** → **Project**
2. GitHub reposu listesinden `metaaras-protocol` seç → **Import**

### Adım 3 — Proje Ayarları

```
Framework Preset  : Next.js          (otomatik algılanır)
Root Directory    : frontend          ← ÖNEMLİ: değiştir!
Build Command     : npm run build    (otomatik)
Output Directory  : .next            (otomatik)
Install Command   : npm ci           (otomatik)
```

> ⚠️ **Root Directory `frontend` olarak ayarla.** Proje monorepo yapısında — sözleşmeler kök dizinde, frontend alt klasörde.

### Adım 4 — Environment Variables

Vercel → Proje → **Settings** → **Environment Variables** bölümüne aşağıdaki değerleri ekle:

**Zorunlu:**
| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | `<cloud.walletconnect.com'dan al>` | Production, Preview |
| `NEXT_PUBLIC_NETWORK_ENV` | `mainnet` | Production |
| `NEXT_PUBLIC_NETWORK_ENV` | `testnet` | Preview |

**Mainnet Adresleri (deploy sonrası):**
| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_ETH_MAINNET_MTA_TOKEN_ADDRESS` | `0x...` |
| `NEXT_PUBLIC_ETH_MAINNET_MTA_STAKING_ADDRESS` | `0x...` |
| `NEXT_PUBLIC_ETH_MAINNET_MTA_VESTING_ADDRESS` | `0x...` |
| `NEXT_PUBLIC_ETH_MAINNET_MTA_GOVERNOR_ADDRESS` | `0x...` |
| `NEXT_PUBLIC_ETH_MAINNET_MTA_TIMELOCK_ADDRESS` | `0x...` |
| `NEXT_PUBLIC_BSC_MAINNET_MTA_TOKEN_ADDRESS` | `0x...` |
| `NEXT_PUBLIC_BSC_MAINNET_MTA_STAKING_ADDRESS` | `0x...` |
| `NEXT_PUBLIC_BSC_MAINNET_MTA_VESTING_ADDRESS` | `0x...` |
| `NEXT_PUBLIC_BSC_MAINNET_MTA_GOVERNOR_ADDRESS` | `0x...` |
| `NEXT_PUBLIC_BSC_MAINNET_MTA_TIMELOCK_ADDRESS` | `0x...` |

**Testnet Adresleri (şu an canlı — Preview için):**
| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_ETH_SEPOLIA_MTA_TOKEN_ADDRESS` | `0x27315C3bF2370E933C376A7982CBDA77FF122376` |
| `NEXT_PUBLIC_ETH_SEPOLIA_MTA_STAKING_ADDRESS` | `0xd82f1c0f0AF107CDB25FB189575Ee60A6ce12D35` |
| `NEXT_PUBLIC_ETH_SEPOLIA_MTA_VESTING_ADDRESS` | `0x98fC5324F5f110B4f707Ee5444335B64f4640465` |
| `NEXT_PUBLIC_ETH_SEPOLIA_MTA_GOVERNOR_ADDRESS` | `0x9924B7c4fa59113e99748095a6af41eb9406730b` |
| `NEXT_PUBLIC_ETH_SEPOLIA_MTA_TIMELOCK_ADDRESS` | `0x572FAb358dE3322286BD05E8F9AeAF349c41Ab5e` |

### Adım 5 — Deploy

**Settings** → **Deployments** → **Deploy** veya GitHub'a push yapıldığında otomatik deploy tetiklenir.

---

## Yöntem 2: Vercel CLI

```bash
# Vercel CLI kur
npm i -g vercel

# Frontend klasörüne gir
cd C:\Users\W-10\metaaras\frontend

# Login
vercel login

# İlk deployment (sihirbaz açılır)
vercel

# Production deploy
vercel --prod
```

CLI sihirbazı şu soruları sorar:
```
? Set up and deploy? → Yes
? Which scope? → Hesabını seç
? Link to existing project? → No (yeni proje)
? Project name: → metaaras-dapp
? In which directory is your code located? → ./  (frontend klasöründeyiz)
? Override settings? → No
```

---

## Otomatik Deploy Akışı (GitHub Push)

```
git push origin main
     ↓
Vercel otomatik algılar
     ↓
npm ci + npm run build
     ↓
24 route generate edilir
     ↓
Production URL güncellenir
     ↓
metaaras.vercel.app (veya custom domain)
```

Preview deploy (main dışı branch):
```
git push origin feature/my-feature
     ↓
Preview URL: metaaras-git-feature-my-feature.vercel.app
```

---

## Build Optimizasyon Notları

`frontend/next.config.ts` içinde şunların açık olduğundan emin ol:

```typescript
const nextConfig = {
  output: 'standalone',   // Vercel için optimize
  images: {
    unoptimized: false,   // Vercel Image Optimization aktif
  },
};
```

---

## Önemli: `next start` vs `next dev`

Vercel her zaman `next build` + `next start` kullanır — bu doğru.  
`next dev` (Turbopack) local geliştirme içindir ve CSS sorunlarına yol açabilir.

---

## Sorun Giderme

### Build Hatası: Module not found

```bash
# Lokal olarak kontrol et
cd frontend
npm ci
npm run build
```

### Environment Variable Eksik

Vercel'de env var eklendikten sonra **Redeploy** gerekebilir:
Deployments → En son deploy → ⋯ → **Redeploy**

### 404 Sayfaları

Next.js App Router ile Vercel tam uyumlu — ekstra `vercel.json` gerekmez.

---

## Deployment URL'leri

| Ortam | URL |
|-------|-----|
| Production | `https://metaaras.io` (domain bağlandıktan sonra) |
| Vercel Default | `https://metaaras-protocol.vercel.app` |
| Preview | `https://metaaras-git-<branch>.vercel.app` |

---

*MetaAras Vercel Deploy Guide — Haziran 2026*
