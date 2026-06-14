import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { TextField } from '@/components/ui/text-field';
import { C } from '@/constants/colors';
import {
  CATEGORY_EMOJI,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  MODE_LABELS,
  MODE_ORDER,
} from '@/constants/labels';
import { useAuth } from '@/context/auth';
import { useLocation } from '@/hooks/use-location';
import { createItem } from '@/lib/firestore';
import { pickImageFromLibrary, takePhoto } from '@/lib/image';
import type { ItemCategory, ShareMode } from '@/types';

export default function NewItemScreen() {
  const { user, profile } = useAuth();
  const { location, status, request } = useLocation(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ItemCategory>('alet');
  const [mode, setMode] = useState<ShareMode>('odunc');
  const [price, setPrice] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  const handlePick = async (fn: () => Promise<string | null>) => {
    setPhotoBusy(true);
    try {
      const uri = await fn();
      if (uri) setPhoto(uri);
    } catch {
      Alert.alert('Hata', 'Fotoğraf işlenemedi.');
    } finally {
      setPhotoBusy(false);
    }
  };

  const choosePhoto = () => {
    Alert.alert('Fotoğraf ekle', undefined, [
      { text: 'Kamera', onPress: () => handlePick(takePhoto) },
      { text: 'Galeri', onPress: () => handlePick(pickImageFromLibrary) },
      { text: 'İptal', style: 'cancel' },
    ]);
  };

  const onSubmit = async () => {
    if (!user) return;
    if (!title.trim()) {
      Alert.alert('Eksik bilgi', 'Lütfen bir başlık gir.');
      return;
    }
    if (!location) {
      Alert.alert(
        'Konum gerekli',
        'Eşyanın haritada görünmesi için konum izni gerekiyor.'
      );
      return;
    }
    setSaving(true);
    try {
      const id = await createItem({
        ownerId: user.uid,
        ownerName: profile?.displayName ?? user.displayName ?? 'Komşu',
        title: title.trim(),
        description: description.trim(),
        category,
        mode,
        price: mode === 'kiralama' ? Number(price) || 0 : null,
        photoURL: photo,
        location,
      });
      router.replace(`/item/${id}`);
    } catch {
      Alert.alert('Hata', 'Eşya kaydedilemedi. Tekrar dene.');
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Fotoğraf */}
        <Pressable style={styles.photoBox} onPress={choosePhoto}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photo} contentFit="cover" />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera-outline" size={32} color={C.muted} />
              <Text style={styles.photoText}>
                {photoBusy ? 'İşleniyor...' : 'Fotoğraf ekle (opsiyonel)'}
              </Text>
            </View>
          )}
        </Pressable>

        <TextField
          label="Başlık"
          placeholder="Örn: Bosch matkap"
          value={title}
          onChangeText={setTitle}
        />
        <TextField
          label="Açıklama"
          placeholder="Eşyan hakkında kısa bilgi..."
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Field label="Kategori">
          <View style={styles.chips}>
            {CATEGORY_ORDER.map((c) => (
              <Chip
                key={c}
                label={`${CATEGORY_EMOJI[c]} ${CATEGORY_LABELS[c]}`}
                active={category === c}
                onPress={() => setCategory(c)}
              />
            ))}
          </View>
        </Field>

        <Field label="Paylaşım türü">
          <View style={styles.chips}>
            {MODE_ORDER.map((m) => (
              <Chip
                key={m}
                label={MODE_LABELS[m]}
                active={mode === m}
                onPress={() => setMode(m)}
              />
            ))}
          </View>
        </Field>

        {mode === 'kiralama' ? (
          <TextField
            label="Günlük ücret (₺)"
            placeholder="Örn: 50"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
        ) : null}

        {/* Konum durumu */}
        <View style={styles.locationBox}>
          <Ionicons
            name="location-outline"
            size={20}
            color={location ? C.primary : C.muted}
          />
          <Text style={styles.locationText}>{locationLabel(status, location)}</Text>
          {!location ? (
            <Pressable onPress={request}>
              <Text style={styles.locationAction}>Yenile</Text>
            </Pressable>
          ) : null}
        </View>

        <Button
          title="Eşyayı Paylaş"
          onPress={onSubmit}
          loading={saving}
          style={{ marginTop: 8 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function locationLabel(
  status: string,
  location: { lat: number; lng: number } | null
) {
  if (location)
    return `Konum alındı (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`;
  if (status === 'loading') return 'Konum alınıyor...';
  if (status === 'denied') return 'Konum izni verilmedi';
  return 'Konum bekleniyor';
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 18, paddingBottom: 48 },
  photoBox: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  photoText: { color: C.muted, fontSize: 14 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: C.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 12,
  },
  locationText: { flex: 1, fontSize: 13, color: C.text },
  locationAction: { color: C.primary, fontWeight: '700', fontSize: 13 },
});
