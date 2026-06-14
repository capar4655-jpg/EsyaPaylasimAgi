import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '@/components/ui/empty-state';
import { Loading } from '@/components/ui/loading';
import { C } from '@/constants/colors';
import { useAuth } from '@/context/auth';
import { subscribeChats } from '@/lib/firestore';
import type { Chat } from '@/types';

export default function MessagesScreen() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[] | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeChats(user.uid, setChats);
    return unsub;
  }, [user]);

  return (
    <View style={styles.container}>
      <FlatList
        data={chats ?? []}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => {
          const otherUid = item.participants.find((p) => p !== user?.uid);
          const otherName = otherUid
            ? item.participantNames[otherUid]
            : 'Komşu';
          return (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              onPress={() => router.push(`/chat/${item.id}`)}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {otherName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {otherName}
                </Text>
                <Text style={styles.item} numberOfLines={1}>
                  {item.itemTitle}
                </Text>
                <Text style={styles.preview} numberOfLines={1}>
                  {item.lastSenderId === user?.uid ? 'Sen: ' : ''}
                  {item.lastMessage}
                </Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          chats === null ? (
            <Loading />
          ) : (
            <EmptyState
              emoji="💬"
              title="Henüz mesaj yok"
              subtitle="Bir eşya talep ettiğinde sohbet burada başlar."
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  list: { padding: 16, flexGrow: 1 },
  sep: { height: 10 },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
  },
  pressed: { opacity: 0.85 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: C.white, fontSize: 20, fontWeight: '800' },
  name: { fontSize: 16, fontWeight: '700', color: C.text },
  item: { fontSize: 13, color: C.primary, fontWeight: '600' },
  preview: { fontSize: 13, color: C.muted },
});
