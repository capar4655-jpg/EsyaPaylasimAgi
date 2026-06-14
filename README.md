# ♻️ Eşya Paylaşım Ağı — *CircularShare*

> Mahalle ölçeğinde, nadir kullanılan eşyaların (matkap, çadır, merdiven…) güvenli bir şekilde **paylaşıldığı, kiralandığı ve takas edildiği** eşler arası (P2P) mobil platform.

Sürdürülebilir tüketimi teşvik eden, komşuları bir araya getiren bir **React Native (Expo)** uygulaması. Bir kullanıcı yalnızca 2 saatliğine matkaba ihtiyaç duyduğunda; uygulamayı açar, **haritadan** üst sokaktaki komşusunda matkap olduğunu görür, **talep** gönderir, onaylanınca **QR kod** ile eşyayı teslim alır ve uygulama içi **güvenli mesajlaşma** ile iletişim kurar. Eşya başarıyla iade edildiğinde ekranda **"Sürdürülebilirlik Kahramanı" konfetisi** patlar ve **rozet** kazanılır. 🎉

---

## ✨ Özellikler

- 🔐 **Kimlik doğrulama** — Firebase Authentication (e-posta/şifre), kalıcı oturum
- 🗺️ **Harita ile keşif** — OpenStreetMap üzerinde yakındaki eşyalar + "mahalle" yarıçapı (geofence)
- 📍 **Konum & mesafe** — eşyaların sana uzaklığı (Haversine), en yakından sırala
- 📦 **Eşya yönetimi** — fotoğraf, kategori, paylaşım türü (ödünç / kiralama / takas) ile ilan ekleme
- 🤝 **Talep akışı** — talep gönder → onayla/reddet → teslim → iade
- 📷 **QR kod** — teslim ve iade işlemleri QR üretme/okuma ile doğrulanır
- 💬 **Gerçek zamanlı sohbet** — eşya sahibi ile talep eden arasında mesajlaşma
- 🏅 **Oyunlaştırma** — eco-puan, animasyonlu rozetler ve iade konfetisi
- 🌗 Tutarlı, sürdürülebilirlik temalı modern arayüz

---

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Çatı | Expo SDK 54, React Native 0.81, React 19, TypeScript |
| Yönlendirme | expo-router v6 (dosya tabanlı, korumalı rotalar) |
| Backend | Firebase Authentication + Cloud Firestore |
| Harita | Leaflet + OpenStreetMap (WebView içinde, API anahtarı gerektirmez) |
| Konum | expo-location (ön plan) |
| QR | react-native-qrcode-svg (üretme) · expo-camera (okuma) |
| Medya | expo-image-picker + expo-image-manipulator |
| Animasyon | react-native-confetti-cannon |

---

## 🚀 Kurulum

### 1. Bağımlılıkları yükle
```bash
npm install
```

### 2. Firebase projesini hazırla
1. [Firebase Console](https://console.firebase.google.com)'da yeni bir proje oluştur.
2. **Authentication → Sign-in method → E-posta/Şifre** yöntemini etkinleştir.
3. **Firestore Database** oluştur (geliştirme için "test modu" ile başlayabilirsin).
4. (Önerilir) [`firestore.rules`](./firestore.rules) dosyasındaki kuralları **Firestore → Rules** sekmesine yapıştırıp yayınla.
5. **Proje Ayarları → Uygulamalarınız → Web (`</>`)** uygulaması ekle ve verilen `firebaseConfig` nesnesini kopyala.

### 3. Yapılandırmayı gir
[`firebase/config.ts`](./firebase/config.ts) dosyasındaki `firebaseConfig` nesnesine kendi bilgilerini yapıştır:
```ts
export const firebaseConfig = {
  apiKey: '...',
  authDomain: '...',
  projectId: '...',
  storageBucket: '...',
  messagingSenderId: '...',
  appId: '...',
};
```
> Uygulama yapılandırma eksikse otomatik olarak bir **kurulum rehberi ekranı** gösterir.

### 4. Çalıştır
```bash
npx expo start
```
Telefonunda **Expo Go** uygulamasıyla terminaldeki QR kodu okut. Hepsi bu! 📱

---

## 🧭 Uygulama Akışı

```
Kayıt / Giriş
   └── Keşfet (Harita)  ──►  Eşya Detayı  ──►  Talep Gönder
                                                   │
                                          (Sahip)  ▼
                                              Onayla ──► QR göster
                                                   │
                                  (Talep eden) QR'ı tara ──► Teslim alındı
                                                   │
                                  (Talep eden) QR'ı tekrar tara ──► İade 🎉
                                                   │
                                       Eco-puan + Rozet + Konfeti
```

> **İpucu (demo):** En akıcı demo için iki ayrı hesap (biri eşya sahibi, biri talep eden) kullan. Tek cihazda test ederken QR ekranındaki **"Kodu elle gir"** seçeneğiyle teslim/iade adımlarını canlandırabilirsin.

---

## 📂 Proje Yapısı

```
app/                     # Ekranlar (expo-router, dosya tabanlı yönlendirme)
  _layout.tsx            # Kök: AuthProvider + korumalı rotalar
  (auth)/                # Giriş / Kayıt
  (tabs)/                # Keşfet, Eşyalarım, Talepler, Mesajlar, Profil
  item/                  # Eşya ekleme (new) ve detay ([id])
  request/[id].tsx       # Talep detayı + QR
  chat/[id].tsx          # Sohbet
  scan.tsx               # QR tarayıcı
components/              # Tekrar kullanılabilir bileşenler (kart, buton, harita…)
context/auth.tsx         # Oturum & profil yönetimi
firebase/config.ts       # Firebase başlatma
lib/                     # firestore (veri katmanı), geo, badges, image, auth-errors
constants/               # renkler, etiketler
hooks/use-location.ts    # Ön plan konum
types/                   # TypeScript veri tipleri
firestore.rules          # Firestore güvenlik kuralları
```

---

## 📝 Notlar

- Bu sürüm **Expo Go** ile çalışacak şekilde tasarlanmıştır; harita için `react-native-maps` yerine **WebView + Leaflet**, arka plan geofencing yerine uygulama açıkken **mesafe tabanlı yakınlık** kullanılır.
- Gerçek **Google Maps SDK** ve arka plan **geofencing** için bir [development build](https://docs.expo.dev/develop/development-builds/introduction/) alınarak `expo-maps` ve `expo-location` arka plan API'leri entegre edilebilir.
- Eşya fotoğrafları, kurulum sürtünmesini azaltmak için küçültülüp Firestore'da (base64) saklanır; üretim için Firebase Storage tercih edilebilir.

---

## 👤 Geliştirici

**Atakan Çapar**

Bu proje bir start-up fikir havuzu ödevi kapsamında geliştirilmiştir — **CircularShare (Eşya Paylaşım Ağı)**.
