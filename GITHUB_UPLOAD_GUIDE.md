# MetaAras — GitHub Upload Rehberi

## 1. Git Kurulumu

Git kurulu değilse:

```bash
# Windows — winget ile
winget install --id Git.Git -e --source winget

# Kurulum bittikten sonra terminali kapatıp yeniden aç
git --version   # git version 2.x.x çıkmalı
```

---

## 2. Git Kimlik Ayarı (İlk Kez)

```bash
git config --global user.name "MetaAras Team"
git config --global user.email "your@email.com"
```

---

## 3. Repository Başlatma

```bash
cd C:\Users\W-10\metaaras

# Git repo başlat
git init

# Varsayılan branch'i main yap
git branch -M main
```

---

## 4. GitHub'da Repository Oluşturma

1. **github.com** adresine git → **Sign in** (veya hesap aç)
2. Sağ üst **+** → **New repository**
3. Ayarlar:
   - **Repository name:** `metaaras-protocol`
   - **Description:** `Professional multichain DeFi governance protocol — Staking · Governance · Vesting`
   - **Visibility:** `Public` (açık kaynak)
   - **Initialize:** ❌ Hiçbirini işaretleme (lokal repo'yu push edeceğiz)
4. **Create repository** tıkla

---

## 5. İlk Push

GitHub sayfasında gösterilecek komutları kopyala, veya:

```bash
# GitHub remote ekle
git remote add origin https://github.com/KULLANICI_ADI/metaaras-protocol.git

# İlk commit (henüz commit yoksa)
git add -A
git commit -m "initial commit: MetaAras v2.0.0-rc1 — production ready"

# Push
git push -u origin main
```

> **Not:** Push sırasında GitHub kullanıcı adı/şifre veya Personal Access Token (PAT) istenebilir.  
> PAT oluşturmak için: GitHub → Settings → Developer Settings → Personal Access Tokens → Generate new token

---

## 6. Repo Ayarları (GitHub UI)

Push tamamlandıktan sonra GitHub repo sayfasında:

### About bölümü (sağ üst ⚙️)
```
Description : Professional multichain DeFi governance protocol
Website     : https://metaaras.io
Topics      : ethereum bnb-smart-chain defi governance staking dao solidity nextjs web3 openZeppelin hardhat
```

### Settings → General
- **Wikis:** Kapalı (doküman sitende var)
- **Issues:** Açık (bug raporları için)
- **Discussions:** Açık (topluluk için)
- **Projects:** Opsiyonel

### Settings → Branches
- **Branch protection rule** ekle → `main`
  - ✅ Require pull request before merging
  - ✅ Require status checks to pass

---

## 7. .gitignore Kontrolü

Proje zaten `.gitignore` içeriyor. GitHub'a şunlar **gitmemeli:**
- `node_modules/` ✓ gitignored
- `.env` ve `.env.local` ✓ gitignored
- `deployments/*.json` ✓ gitignored (mainnet adresleri özel)
- `typechain-types/` ✓ gitignored (compile ile üretilir)
- `.next/` ✓ gitignored

---

## 8. Sepolia Deployment JSON'ı Paylaşmak (Opsiyonel)

Testnet adreslerini paylaşmak istiyorsan:

```bash
# Sadece sepolia.json'ı gitignore'dan çıkar
echo "!deployments/sepolia.json" >> .gitignore
git add deployments/sepolia.json
git commit -m "add: Sepolia testnet deployment addresses"
git push
```

---

## 9. Release Oluşturma

```bash
# Tag oluştur
git tag -a v2.0.0-rc1 -m "MetaAras v2.0.0-rc1 — Production Ready, Sepolia Deployed"
git push origin v2.0.0-rc1
```

GitHub'da: **Releases** → **Draft a new release** → Tag seç → Release notes ekle

---

## 10. GitHub Actions (Opsiyonel CI/CD)

`.github/workflows/ci.yml` dosyası oluşturarak otomatik test çalıştırabilirsin:

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run compile
      - run: npm run test:unit
```

---

## Kontrol Listesi

- [ ] Git kuruldu ve version doğrulandı
- [ ] GitHub hesabı mevcut
- [ ] Repository `metaaras-protocol` oluşturuldu (Public)
- [ ] `git init` + `git remote add origin ...` yapıldı
- [ ] İlk commit ve push tamamlandı
- [ ] About bölümü ve Topics eklendi
- [ ] README.md GitHub'da düzgün görünüyor
- [ ] Releases → v2.0.0-rc1 yayınlandı

---

*MetaAras GitHub Upload Guide — Haziran 2026*
