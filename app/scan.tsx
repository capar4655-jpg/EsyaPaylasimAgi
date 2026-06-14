import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { C } from '@/constants/colors';
import { useAuth } from '@/context/auth';
import { advanceRequestByToken } from '@/lib/firestore';

export default function ScanScreen() {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [processing, setProcessing] = useState(false);
  const [manual, setManual] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const lock = useRef(false);

  const handleToken = async (raw: string) => {
    if (!user) return;
    const token = raw.startsWith('EPA:') ? raw.slice(4) : raw.trim();
    if (!token) {
      lock.current = false;
      return;
    }
    setProcessing(true);
    try {
      const res = await advanceRequestByToken(token, user.uid);
      if (res.ok && res.requestId) {
        router.replace(
          `/request/${res.requestId}${res.celebrate ? '?celebrate=1' : ''}`
        );
        return;
      }
      Alert.alert('QR Sonucu', res.message, [
        {
          text: 'Tamam',
          onPress: () => {
            lock.current = false;
          },
        },
      ]);
    } catch {
      Alert.alert('Hata', 'İşlem yapılamadı. Tekrar dene.', [
        {
          text: 'Tamam',
          onPress: () => {
            lock.current = false;
          },
        },
      ]);
    } finally {
      setProcessing(false);
    }
  };

  const onScanned = ({ data }: { data: string }) => {
    if (lock.current || processing) return;
    lock.current = true;
    handleToken(data);
  };

  // İzin yükleniyor
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={C.primary} size="large" />
      </View>
    );
  }

  // Manuel giriş modu (tek cihazda test için)
  if (manual || !permission.granted) {
    return (
      <View style={styles.manualWrap}>
        {!permission.granted && !manual ? (
          <>
            <Text style={styles.manualTitle}>Kamera izni gerekli</Text>
            <Text style={styles.manualBody}>
              QR kodu taramak için kamera iznine ihtiyacımız var.
            </Text>
            <Button title="İzin Ver" onPress={requestPermission} />
            <Pressable onPress={() => setManual(true)}>
              <Text style={styles.link}>Bunun yerine kodu elle gir</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.manualTitle}>Kodu elle gir</Text>
            <Text style={styles.manualBody}>
              QR kodun altındaki kodu (EPA:...) buraya yazabilirsin. Tek cihazda
              test ederken kullanışlıdır.
            </Text>
            <TextField
              placeholder="EPA:XXXXXX"
              autoCapitalize="characters"
              value={manualCode}
              onChangeText={setManualCode}
            />
            <Button
              title="Onayla"
              loading={processing}
              onPress={() => {
                lock.current = true;
                handleToken(manualCode);
              }}
            />
            {permission.granted ? (
              <Pressable onPress={() => setManual(false)}>
                <Text style={styles.link}>Kameraya geç</Text>
              </Pressable>
            ) : null}
          </>
        )}
      </View>
    );
  }

  // Kamera tarama modu
  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={onScanned}
      />
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.frame} />
        <Text style={styles.hint}>
          {processing ? 'İşleniyor...' : 'QR kodunu çerçeveye hizala'}
        </Text>
        <Pressable
          style={styles.manualBtn}
          onPress={() => setManual(true)}>
          <Text style={styles.manualBtnText}>Kodu elle gir</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bg,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  frame: {
    width: 240,
    height: 240,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: C.white,
    backgroundColor: 'transparent',
  },
  hint: {
    color: C.white,
    fontSize: 15,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  manualBtn: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  manualBtnText: { color: C.text, fontWeight: '700' },
  manualWrap: {
    flex: 1,
    backgroundColor: C.bg,
    padding: 24,
    justifyContent: 'center',
    gap: 14,
  },
  manualTitle: { fontSize: 20, fontWeight: '800', color: C.text },
  manualBody: { fontSize: 14, color: C.muted, lineHeight: 20 },
  link: {
    color: C.primary,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
});
