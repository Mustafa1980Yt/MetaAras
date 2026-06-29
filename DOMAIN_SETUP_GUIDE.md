# MetaAras — Domain Bağlama Rehberi

## Hedef Domain Yapısı

```
metaaras.io          → Ana site (marketing + DApp)
app.metaaras.io      → DApp (alternatif — Vercel subdomain yönlendirme)
```

---

## Yöntem 1: Vercel + Kendi Domain'in (Önerilen)

### Adım 1 — Vercel'e Domain Ekle

1. Vercel Dashboard → `metaaras-protocol` projesi → **Settings**
2. Sol menü: **Domains** → **Add Domain**
3. Gir: `metaaras.io` → **Add**
4. Vercel iki seçenek sunar:
   - **A Record** (apex domain için — önerilir)
   - **CNAME** (subdomain için)

Vercel'in göstereceği kayıtlar:
```
Type   Name    Value
A      @       76.76.21.21
CNAME  www     cname.vercel-dns.com
```

---

### Adım 2 — DNS Ayarları

Domain kayıt şirketinin yönetim paneline git (GoDaddy, Namecheap, Cloudflare vb.)

**DNS yönetimi → Yeni kayıt ekle:**

```
A kaydı:
  Host : @
  Value: 76.76.21.21
  TTL  : 3600 (veya auto)

CNAME kaydı:
  Host : www
  Value: cname.vercel-dns.com
  TTL  : 3600
```

**app. subdomain'i de bağlamak istersen:**
```
CNAME kaydı:
  Host : app
  Value: cname.vercel-dns.com
  TTL  : 3600
```

---

### Adım 3 — SSL Sertifikası

Vercel DNS doğrulamasını yaptıktan sonra **otomatik olarak** Let's Encrypt SSL sertifikası atar.

İşlem 24-48 saat içinde tamamlanır (DNS yayılması).

Vercel'de durum: Domains → `metaaras.io` → **Valid** görünmeli ✓

---

## Yöntem 2: Cloudflare + Vercel (Gelişmiş)

### Neden Cloudflare?

- DDoS koruması
- Ek DNS güvenliği
- Analytics
- Cache hızlandırma
- Domain gizlilik

### Kurulum Adımları

**1. Cloudflare'e ekle:**
- `dash.cloudflare.com` → **Add a Site** → `metaaras.io`
- Free plan yeterli

**2. Cloudflare nameserver'larını kullan:**
Cloudflare sana 2 nameserver verecek:
```
ns1.cloudflare.com
ns2.cloudflare.com
```
Domain kayıt şirketinde nameserver'ları bu ikisiyle değiştir.

**3. Cloudflare DNS'e Vercel kayıtlarını ekle:**
```
A     @    76.76.21.21        Proxy: Kapalı (DNS only) ⬅ önemli!
CNAME www  cname.vercel-dns.com   Proxy: Kapalı
```

> ⚠️ **Proxy (turuncu bulut) KAPALI olmalı!**  
> Vercel SSL sertifikası oluşturabilmek için direkt bağlantı gerektirir.

**4. Vercel'de domain doğrula:**
Domains → `metaaras.io` → **Verify** → SSL otomatik oluşturulur.

**5. Cloudflare SSL/TLS:**
Cloudflare → SSL/TLS → Mode: **Full (Strict)**

---

## Vercel'de Birden Fazla Domain

```
metaaras.io       → Primary (canonical)
www.metaaras.io   → Redirect → metaaras.io
app.metaaras.io   → Aynı projeye veya ayrı proje
```

Vercel → Domains:
- `metaaras.io` → Primary
- `www.metaaras.io` → Redirect to `metaaras.io`

---

## Kontrol Listesi

- [ ] Domain satın alındı (Namecheap / GoDaddy / Cloudflare Registrar)
- [ ] Vercel projesine domain eklendi
- [ ] DNS kayıtları (A + CNAME) ayarlandı
- [ ] DNS yayılması beklendi (en fazla 48 saat)
- [ ] Vercel'de domain durumu "Valid" görünüyor
- [ ] `https://metaaras.io` browser'da açılıyor
- [ ] HTTP → HTTPS otomatik redirect çalışıyor
- [ ] `www.metaaras.io` → `metaaras.io` redirect çalışıyor

---

## Faydalı DNS Kontrol Araçları

- DNS yayılması: https://www.whatsmydns.net/
- SSL kontrolü: https://www.ssllabs.com/ssltest/
- DNS kayıtları: https://dnschecker.org/

---

*MetaAras Domain Setup Guide — Haziran 2026*
