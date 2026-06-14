import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { ItemCard } from '@/components/item-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Loading } from '@/components/ui/loading';
import { C } from '@/constants/colors';
import { useAuth } from '@/context/auth';
import { subscribeMyItems } from '@/lib/firestore';
import type { Item } from '@/types';

export default function ItemsScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeMyItems(user.uid, setItems);
    return unsub;
  }, [user]);

  return (
    <View style={styles.container}>
      <FlatList
        data={items ?? []}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onPress={() => router.push(`/item/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          items === null ? (
            <Loading />
          ) : (
            <EmptyState
              emoji="📦"
              title="Henüz eşya eklemedin"
              subtitle="Paylaşmak istediğin ilk eşyanı ekleyerek başla."
            />
          )
        }
      />

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push('/item/new')}>
        <Ionicons name="add" size={30} color={C.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  list: { padding: 16, paddingBottom: 100, flexGrow: 1 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabPressed: { opacity: 0.9, transform: [{ scale: 0.97 }] },
});
