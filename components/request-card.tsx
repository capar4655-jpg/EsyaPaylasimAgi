import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { C } from '@/constants/colors';
import { REQUEST_STATUS_COLOR, REQUEST_STATUS_LABELS } from '@/constants/labels';
import type { BorrowRequest } from '@/types';

interface Props {
  request: BorrowRequest;
  role: 'incoming' | 'outgoing';
  onPress?: () => void;
}

export function RequestCard({ request, role, onPress }: Props) {
  const other =
    role === 'incoming' ? request.requesterName : request.ownerName;
  const statusColor = REQUEST_STATUS_COLOR[request.status];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.thumb}>
        {request.itemPhotoURL ? (
          <Image
            source={{ uri: request.itemPhotoURL }}
            style={styles.thumbImg}
            contentFit="cover"
          />
        ) : (
          <Text style={styles.thumbEmoji}>📦</Text>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {request.itemTitle}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {role === 'incoming' ? 'İsteyen: ' : 'Sahip: '}
          {other}
        </Text>
        <View style={[styles.pill, { backgroundColor: statusColor + '22' }]}>
          <Text style={[styles.pillText, { color: statusColor }]}>
            {REQUEST_STATUS_LABELS[request.status]}
          </Text>
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
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImg: { width: '100%', height: '100%' },
  thumbEmoji: { fontSize: 26 },
  body: { flex: 1, gap: 4 },
  title: { fontSize: 16, fontWeight: '700', color: C.text },
  meta: { fontSize: 13, color: C.muted },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pillText: { fontSize: 12, fontWeight: '700' },
});
