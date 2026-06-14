import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { C } from '@/constants/colors';
import { CATEGORY_EMOJI, CATEGORY_LABELS, MODE_LABELS } from '@/constants/labels';
import { formatDistance } from '@/lib/geo';
import type { Item, ShareMode } from '@/types';

const MODE_STYLE: Record<ShareMode, { bg: string; fg: string }> = {
  odunc: { bg: C.primarySoft, fg: C.primaryDark },
  kiralama: { bg: C.accentSoft, fg: '#B45309' },
  takas: { bg: '#E6EEFD', fg: C.info },
};

interface Props {
  item: Item;
  distanceM?: number | null;
  onPress?: () => void;
}

export function ItemCard({ item, distanceM, onPress }: Props) {
  const mode = MODE_STYLE[item.mode];
  const unavailable = item.status !== 'available';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.thumb}>
        {item.photoURL ? (
          <Image
            source={{ uri: item.photoURL }}
            style={styles.thumbImg}
            contentFit="cover"
          />
        ) : (
          <Text style={styles.thumbEmoji}>{CATEGORY_EMOJI[item.category]}</Text>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {CATEGORY_LABELS[item.category]} · {item.ownerName}
        </Text>

        <View style={styles.row}>
          <View style={[styles.pill, { backgroundColor: mode.bg }]}>
            <Text style={[styles.pillText, { color: mode.fg }]}>
              {MODE_LABELS[item.mode]}
              {item.mode === 'kiralama' && item.price
                ? ` · ${item.price}₺/gün`
                : ''}
            </Text>
          </View>

          {typeof distanceM === 'number' ? (
            <Text style={styles.distance}>📍 {formatDistance(distanceM)}</Text>
          ) : null}

          {unavailable ? (
            <View style={[styles.pill, styles.busyPill]}>
              <Text style={[styles.pillText, { color: C.muted }]}>
                Müsait değil
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
    gap: 12,
    alignItems: 'center',
  },
  pressed: { opacity: 0.85 },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImg: { width: '100%', height: '100%' },
  thumbEmoji: { fontSize: 30 },
  body: { flex: 1, gap: 3 },
  title: { fontSize: 16, fontWeight: '700', color: C.text },
  meta: { fontSize: 13, color: C.muted },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  pill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  busyPill: { backgroundColor: C.bg },
  pillText: { fontSize: 12, fontWeight: '700' },
  distance: { fontSize: 12, color: C.muted, fontWeight: '600' },
});
