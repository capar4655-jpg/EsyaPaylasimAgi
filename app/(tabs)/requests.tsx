import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { RequestCard } from '@/components/request-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Loading } from '@/components/ui/loading';
import { C } from '@/constants/colors';
import { useAuth } from '@/context/auth';
import {
  subscribeIncomingRequests,
  subscribeOutgoingRequests,
} from '@/lib/firestore';
import type { BorrowRequest } from '@/types';

type Tab = 'incoming' | 'outgoing';

export default function RequestsScreen() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('incoming');
  const [incoming, setIncoming] = useState<BorrowRequest[] | null>(null);
  const [outgoing, setOutgoing] = useState<BorrowRequest[] | null>(null);

  useEffect(() => {
    if (!user) return;
    const u1 = subscribeIncomingRequests(user.uid, setIncoming);
    const u2 = subscribeOutgoingRequests(user.uid, setOutgoing);
    return () => {
      u1();
      u2();
    };
  }, [user]);

  const data = tab === 'incoming' ? incoming : outgoing;
  const pendingIncoming = (incoming ?? []).filter(
    (r) => r.status === 'pending'
  ).length;

  return (
    <View style={styles.container}>
      <View style={styles.segment}>
        <SegmentBtn
          label="Gelen"
          badge={pendingIncoming}
          active={tab === 'incoming'}
          onPress={() => setTab('incoming')}
        />
        <SegmentBtn
          label="Gönderdiklerim"
          active={tab === 'outgoing'}
          onPress={() => setTab('outgoing')}
        />
      </View>

      <FlatList
        data={data ?? []}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <RequestCard
            request={item}
            role={tab}
            onPress={() => router.push(`/request/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          data === null ? (
            <Loading />
          ) : (
            <EmptyState
              emoji={tab === 'incoming' ? '📥' : '📤'}
              title={
                tab === 'incoming'
                  ? 'Henüz gelen talep yok'
                  : 'Henüz talep göndermedin'
              }
              subtitle={
                tab === 'incoming'
                  ? 'Eşyalarına talep geldiğinde burada görünecek.'
                  : 'Keşfet sekmesinden bir eşya talep et.'
              }
            />
          )
        }
      />
    </View>
  );
}

function SegmentBtn({
  label,
  badge,
  active,
  onPress,
}: {
  label: string;
  badge?: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.segBtn, active && styles.segBtnActive]}>
      <Text style={[styles.segText, active && styles.segTextActive]}>
        {label}
      </Text>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  segment: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    paddingBottom: 4,
  },
  segBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segBtnActive: { backgroundColor: C.primary, borderColor: C.primary },
  segText: { fontSize: 14, fontWeight: '700', color: C.text },
  segTextActive: { color: C.white },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: C.white, fontSize: 11, fontWeight: '800' },
  list: { padding: 16, paddingTop: 12, flexGrow: 1 },
});
