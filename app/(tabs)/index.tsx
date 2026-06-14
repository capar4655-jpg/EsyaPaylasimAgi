import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ItemCard } from '@/components/item-card';
import { MapViewLeaflet, type MapMarker } from '@/components/map-view';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { C } from '@/constants/colors';
import { useAuth } from '@/context/auth';
import { useLocation } from '@/hooks/use-location';
import { subscribeItems } from '@/lib/firestore';
import { GEOFENCE_RADIUS_M, distanceMeters } from '@/lib/geo';
import type { Item } from '@/types';

export default function ExploreScreen() {
  const { user } = useAuth();
  const { location, status, request } = useLocation(true);
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    const unsub = subscribeItems(setItems);
    return unsub;
  }, []);

  // Başkalarına ait, müsait eşyalar + mesafe, en yakından uzağa
  const nearby = useMemo(() => {
    const list = (items ?? [])
      .filter((it) => it.status === 'available' && it.ownerId !== user?.uid)
      .map((it) => ({
        item: it,
        dist: location ? distanceMeters(location, it.location) : null,
      }));
    list.sort((a, b) => {
      if (a.dist == null || b.dist == null) return 0;
      return a.dist - b.dist;
    });
    return list;
  }, [items, location, user?.uid]);

  const withinRadius = nearby.filter(
    (n) => n.dist != null && n.dist <= GEOFENCE_RADIUS_M
  ).length;

  const markers: MapMarker[] = nearby.map((n) => ({
    id: n.item.id,
    lat: n.item.location.lat,
    lng: n.item.location.lng,
    title: n.item.title,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Keşfet</Text>
          <Text style={styles.subtitle}>
            {location
              ? `${withinRadius} eşya mahallende (${GEOFENCE_RADIUS_M / 1000} km)`
              : 'Mahallendeki eşyaları keşfet'}
          </Text>
        </View>
        <Pressable style={styles.iconBtn} onPress={request}>
          <Ionicons name="locate" size={20} color={C.primary} />
        </Pressable>
      </View>

      {location ? (
        <MapViewLeaflet
          center={location}
          markers={markers}
          radiusM={GEOFENCE_RADIUS_M}
          onSelect={(id) => router.push(`/item/${id}`)}
          style={styles.map}
        />
      ) : (
        <View style={styles.locationCard}>
          <Ionicons name="map-outline" size={36} color={C.primary} />
          <Text style={styles.locationTitle}>Konumunu paylaş</Text>
          <Text style={styles.locationBody}>
            Mahallendeki eşyaları haritada görmek için konum iznine ihtiyacımız var.
          </Text>
          <Button
            title={status === 'loading' ? 'Alınıyor...' : 'Konumu Aç'}
            onPress={request}
            loading={status === 'loading'}
            style={{ alignSelf: 'stretch' }}
          />
        </View>
      )}

      <FlatList
        data={nearby}
        keyExtractor={(n) => n.item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          nearby.length > 0 ? (
            <Text style={styles.listHeader}>Yakındaki eşyalar</Text>
          ) : null
        }
        renderItem={({ item: n }) => (
          <ItemCard
            item={n.item}
            distanceM={n.dist}
            onPress={() => router.push(`/item/${n.item.id}`)}
          />
        )}
        ListEmptyComponent={
          items === null ? null : (
            <EmptyState
              emoji="🗺️"
              title="Yakında eşya yok"
              subtitle="İlk paylaşan sen ol veya daha sonra tekrar bak."
            />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { fontSize: 26, fontWeight: '800', color: C.text },
  subtitle: { fontSize: 13, color: C.muted, marginTop: 2 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    height: 280,
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
  },
  locationCard: {
    marginHorizontal: 16,
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  locationTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  locationBody: {
    fontSize: 14,
    color: C.muted,
    textAlign: 'center',
    marginBottom: 8,
  },
  list: { padding: 16, paddingBottom: 24, flexGrow: 1 },
  listHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    marginBottom: 12,
  },
});
