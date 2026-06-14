import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { C } from '@/constants/colors';

/** firebase/config.ts doldurulmadığında gösterilen yönlendirme ekranı. */
export function SetupRequired() {
  return (
    <ScrollView
      style={{ backgroundColor: C.bg }}
      contentContainerStyle={styles.container}>
      <Text style={styles.emoji}>🔧</Text>
      <Text style={styles.title}>Firebase yapılandırması gerekli</Text>
      <Text style={styles.body}>
        Uygulamanın çalışması için Firebase bilgilerini eklemelisin:
      </Text>

      <View style={styles.card}>
        <Step n="1" text="console.firebase.google.com adresinden yeni bir proje oluştur." />
        <Step n="2" text="Authentication > Sign-in method > E-posta/Şifre yöntemini etkinleştir." />
        <Step n="3" text="Firestore Database oluştur (test modunda başlat)." />
        <Step n="4" text="Proje Ayarları > Web uygulaması ekle, verilen firebaseConfig'i kopyala." />
        <Step n="5" text="firebase/config.ts dosyasındaki firebaseConfig nesnesine yapıştır." />
      </View>

      <Text style={styles.note}>
        Kaydettikten sonra uygulama otomatik yenilenecek ve giriş ekranı açılacak.
      </Text>
    </ScrollView>
  );
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <View style={styles.step}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{n}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 80, gap: 14 },
  emoji: { fontSize: 56, textAlign: 'center' },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },
  body: { fontSize: 15, color: C.muted, textAlign: 'center' },
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    gap: 14,
    marginTop: 8,
  },
  step: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: C.white, fontWeight: '800', fontSize: 13 },
  stepText: { flex: 1, fontSize: 14, color: C.text, lineHeight: 20 },
  note: {
    fontSize: 13,
    color: C.muted,
    textAlign: 'center',
    marginTop: 4,
  },
});
