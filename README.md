# 🎬 WatchTogether - Modern Real-Time Watch Party & Voice Chat Platform

Modern ve gerçek zamanlı **"Birlikte İzle + Sesli Sohbet" (Watch Together + Voice Chat)** web uygulaması. 

Kullanıcılar arkadaşlarıyla aynı odaya girerek **sesli konuşabilir**, **canlı mesajlaşabilir** ve oda içerisinde **YouTube** ya da **Netflix** uygulamalarını seçerek videoları tamamen senkronize şekilde birlikte izleyebilir.

---

## 🚀 Öne Çıkan Özellikler

### 1. Oda İçi Uygulama Seçici (App Hub)
- **YouTube Ekranı**: Link kopyalama zahmeti olmadan, oda içindeki dahili YouTube arayüzünden trend videoları, lo-fi müzikleri, oyun ve film fragmanlarını tek tıkla seçip tüm odaya senkronize başlatabilirsiniz. Dileyen kullanıcılar arama kutusuna diledikleri YouTube linkini de yapıştırabilir.
- **Netflix Sinema Ekranı**: Netflix temalı özel arayüz (Stranger Things, Squid Game, Arcane, Black Mirror vb.), detay panelleri, introyu atla butonu ve senkronize oynatıcı.
- **Canlı Sekme & Ekran Paylaşımı (Netflix WebRTC Stream)**: Resmi DRM ve tarayıcı güvenlik kısıtlamalarına takılmadan, kendi bilgisayarınızdaki Netflix sekmesini odaya doğrudan HD kalitede ve sesli olarak aktarabilirsiniz.

### 2. Gerçek Zamanlı Video Senkronizasyonu (`useVideoSync`)
- **Supabase Realtime Broadcast**: `play`, `pause`, `seek`, `sync`, `change-app`, `change-video` aksiyonları anında odadaki tüm kullanıcılara iletilir.
- **Periyodik Drift Düzeltme**: Her 5 saniyede bir oda liderinin video süresi kontrol edilir; zaman farkı 1 saniyeden fazlaysa istemciler otomatik olarak doğru saniyeye eşitlenir.

### 3. WebRTC Sesli Sohbet (`useWebRTCVoice`)
- **Mesh WebRTC Mimarisi**: Harici ücretli servislere ihtiyaç duymadan Google STUN sunucuları ve Supabase Realtime signaling üzerinden sıfır gecikmeli sesli iletişim.
- **Audio Activity Detection**: `AudioContext` ve `AnalyserNode` ile konuşma tespiti; konuşan kullanıcının avatarı etrafında Discord tarzı parlayan yeşil halka animasyonu.
- **Mikrofon & Kulaklık Kontrolleri**: Tek tıkla Sustur (Mute), Sağırlaştır (Deafen) ve Bağlantıyı Kes.

### 4. Canlı Sohbet (`useChat`)
- Discord tarzı mesajlaşma baloncukları, kullanıcı avatarları, zaman damgaları.
- Gerçek zamanlı yazıyor ("... yazıyor") göstergesi.
- Dahili emoji seçici popover.

### 5. Oda Sahibi Yetkileri (`OwnerControlsModal`)
- Odayı kilitleme/açma.
- İstenmeyen kullanıcıları odadan çıkarma (kick).
- İzleme uygulamasını ve videoyu anlık değiştirme.
- Odayı tamamen kapatma ve silme.

---

## 🛠️ Teknoloji Yığını

* **Frontend**: Next.js 16 (App Router), React 19, TypeScript
* **Stil & Tasarım**: Tailwind CSS v4, Dark Theme (`#0B0D12`, `#151821`, `#1C202B`, `#7C3AED`)
* **Veritabanı & Realtime**: Supabase (Auth, PostgreSQL, Realtime Broadcast & Presence)
* **Ses & Video İletişimi**: WebRTC (RTCPeerConnection, getUserMedia, getDisplayMedia)
* **İkonlar**: Lucide React + Özel SVG Marka İkonları

---

## 📦 Kurulum ve Çalıştırma

### 1. Çalışma Dizinine Geçin:
```bash
cd C:\Users\PC\.gemini\antigravity\scratch\watch-together
```

### 2. Bağımlılıklar:
Bağımlılıklar projede önceden yüklenmiştir. İhtiyaç halinde:
```bash
npm install
```

### 3. Geliştirme Sunucusunu Başlatın:
```bash
npm run dev
```
Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

---

## 🗄️ Supabase Kurulumu (Opsiyonel / Canlı Mod)

Uygulama, `.env.local` dosyasındaki bilgiler eksik veya varsayılan olsa bile **otomatik demo/misafir modunda** tam performansla çalışır. 

Gerçek Supabase projenize bağlamak için:

1. [Supabase Dashboard](https://supabase.com) üzerinden yeni bir proje oluşturun.
2. `supabase/migrations/001_initial_schema.sql` dosyasındaki SQL kodlarını Supabase SQL Editor'de çalıştırın.
3. `.env.local` dosyasını kendi proje bilgilerinize göre güncelleyin:
```env
NEXT_PUBLIC_SUPABASE_URL=https://projeniz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=projenizin_anon_anahtari
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
4. Uygulama otomatik olarak canlı Supabase Auth ve Realtime altyapısına geçecektir.
