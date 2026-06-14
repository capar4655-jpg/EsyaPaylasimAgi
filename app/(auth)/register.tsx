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

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name.trim()) {
      setError('Lütfen adını gir.');
      return;
    }
    if (!email.trim() || !password) {
      setError('E-posta ve şifre gerekli.');
      return;
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı.');
      return;
    }
    if (password !== confirm) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signUp(name, email, password);
      // Kayıt sonrası otomatik giriş + yönlendirme.
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
          <Text style={styles.logo}>🌱</Text>
          <Text style={styles.appName}>Aramıza Katıl</Text>
          <Text style={styles.tagline}>
            Paylaşarak hem tasarruf et hem doğayı koru
          </Text>
        </View>

        <View style={styles.form}>
          <TextField
            label="Ad Soyad"
            placeholder="Adın"
            value={name}
            onChangeText={setName}
          />
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
            placeholder="En az 6 karakter"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextField
            label="Şifre (tekrar)"
            placeholder="••••••••"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Kayıt Ol" onPress={onSubmit} loading={loading} />

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Zaten hesabın var mı? </Text>
            <Link href="/login" style={styles.link}>
              Giriş yap
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
  logo: { fontSize: 60 },
  appName: { fontSize: 26, fontWeight: '800', color: C.text },
  tagline: {
    fontSize: 14,
    color: C.muted,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: { gap: 16 },
  error: { color: C.danger, fontSize: 14 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 4 },
  switchText: { color: C.muted, fontSize: 14 },
  link: { color: C.primary, fontSize: 14, fontWeight: '700' },
});
