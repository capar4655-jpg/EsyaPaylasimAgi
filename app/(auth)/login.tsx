import { Link } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { C } from '@/constants/colors';
import { useAuth } from '@/context/auth';
import { authErrorMessage } from '@/lib/auth-errors';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      setError('E-posta ve şifre gerekli.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
      // Başarılı girişte yönlendirme otomatik (korumalı rotalar).
    } catch (e: any) {
      setError(authErrorMessage(e?.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>♻️</Text>
          <Text style={styles.appName}>Eşya Paylaşım Ağı</Text>
          <Text style={styles.tagline}>
            Mahallendeki eşyaları paylaş, ödünç al, takas et
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Giriş Yap</Text>

          <TextField
            label="E-posta"
            placeholder="ornek@eposta.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextField
            label="Şifre"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Giriş Yap" onPress={onSubmit} loading={loading} />

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Hesabın yok mu? </Text>
            <Link href="/register" style={styles.link}>
              Kayıt ol
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 28 },
  header: { alignItems: 'center', gap: 6 },
  logo: { fontSize: 64 },
  appName: { fontSize: 26, fontWeight: '800', color: C.text },
  tagline: {
    fontSize: 14,
    color: C.muted,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: { gap: 16 },
  title: { fontSize: 20, fontWeight: '700', color: C.text },
  error: { color: C.danger, fontSize: 14 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 4 },
  switchText: { color: C.muted, fontSize: 14 },
  link: { color: C.primary, fontSize: 14, fontWeight: '700' },
});
