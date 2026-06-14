import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Loading } from '@/components/ui/loading';
import { TextField } from '@/components/ui/text-field';
import { C } from '@/constants/colors';
import { CATEGORY_EMOJI, CATEGORY_LABELS, MODE_LABELS } from '@/constants/labels';
import { useAuth } from '@/context/auth';
import { useLocation } from '@/hooks/use-location';
import { createRequest, deleteItem, subscribeItem } from '@/lib/firestore';
import { distanceMeters, formatDistance } from '@/lib/geo';
import type { Item } from '@/types';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, profile } = useAuth();
  const { location } = useLocation(true);

  const [item, setItem] = useState<Item | null | undefined>(undefined);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsub = subscribeItem(id, setItem);
    return unsub;
  }, [id]);

  if (item === undefined) return <Loading />;
  if (item === null)
    return (
      <EmptyState emoji="🔍" title="Eşya bulunamadı" subtitle="Silinmiş olabilir." />
    );

  const isOwner = item.ownerId === user?.uid;
  const dist = location ? distanceMeters(location, item.location) : null;

  const onDelete = () => {
    Alert.alert('Eşyayı sil', `"${item.title}" silinsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          await deleteItem(item.id);
          router.back();
        },
      },
    ]);
  };

  const onRequest = async () => {
    if (!user) return;
    setSending(true);
    try {
      const { requestId } = await createRequest(
        item,
        {
          uid: user.uid,
          displayName: profile?.displayName ?? user.displayName ?? 'Komşu',
        },
        message.trim() || `Merhaba, "${item.title}" için talepte bulunmak istiyorum.`
      );
      router.replace(`/request/${requestId}`);
    } catch {
      Alert.alert('Hata', 'Talep gönderilemedi. Tekrar dene.');
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          {item.photoURL ? (
            <Image source={{ uri: item.photoURL }} style={styles.heroImg} contentFit="cover" />
          ) : (
            <Text style={styles.heroEmoji}>{CATEGORY_EMOJI[item.category]}</Text>
          )}
        </View>

        <View style={styles.headerRow}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.modePill}>
            <Text style={styles.modePillText}>
              {MODE_LABELS[item.mode]}
              {item.mode === 'kiralama' && item.price ? ` · ${item.price}₺/gün` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Meta icon="pricetag-outline" text={CATEGORY_LABELS[item.category]} />
          <Meta icon="person-outline" text={item.ownerName} />
          {dist != null ? (
            <Meta icon="location-outline" text={formatDistance(dist)} />
          ) : null}
        </View>

        {item.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Açıklama</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        ) : null}

        {/* Aksiyon alanı */}
        {isOwner ? (
          <View style={styles.section}>
            <View style={styles.statusBox}>
              <Ionicons name="cube-outline" size={18} color={C.primary} />
              <Text style={styles.statusText}>{ownerStatusText(item)}</Text>
            </View>
            <Button title="Eşyayı Sil" variant="danger" onPress={onDelete} />
          </View>
        ) : item.status === 'available' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Talep gönder</Text>
            <TextField
              placeholder="Sahibe kısa bir mesaj yaz..."
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <Button
              title="Talep Gönder"
              onPress={onRequest}
              loading={sending}
            />
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.busyBox}>
              <Text style={styles.busyText}>
                Bu eşya şu anda müsait değil. Daha sonra tekrar dene.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ownerStatusText(item: Item): string {
  switch (item.status) {
    case 'available':
      return 'Bu eşya paylaşıma açık.';
    case 'requested':
      return 'Bu eşya için bir talep onayladın, teslim bekleniyor.';
    case 'borrowed':
      return 'Bu eşya şu anda ödünç verildi.';
    default:
      return '';
  }
}

function Meta({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={15} color={C.muted} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16, paddingBottom: 40 },
  hero: {
    height: 220,
    borderRadius: 18,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroImg: { width: '100%', height: '100%' },
  heroEmoji: { fontSize: 90 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: { flex: 1, fontSize: 22, fontWeight: '800', color: C.text },
  modePill: {
    backgroundColor: C.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  modePillText: { color: C.primaryDark, fontWeight: '700', fontSize: 13 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: C.muted, fontSize: 14 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  description: { fontSize: 15, color: C.text, lineHeight: 22 },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 12,
  },
  statusText: { flex: 1, color: C.text, fontSize: 14 },
  busyBox: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 16,
  },
  busyText: { color: C.muted, fontSize: 14, textAlign: 'center' },
});
