import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { C } from '@/constants/colors';
import { useAuth } from '@/context/auth';
import { BADGES, earnedBadgeIds } from '@/lib/badges';

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();

  if (!profile) return <Loading />;

  const earned = earnedBadgeIds({
    sharedCount: profile.sharedCount,
    borrowedCount: profile.borrowedCount,
    ecoScore: profile.ecoScore,
  });

  return (
    <ScrollView
      style={{ backgroundColor: C.bg }}
      contentContainerStyle={styles.container}>
      {/* Profil başlığı */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(profile.displayName || 'K').charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{profile.displayName}</Text>
        <Text style={styles.email}>{profile.email || user?.email}</Text>
      </View>

      {/* Eco-puan kartı */}
      <View style={styles.ecoCard}>
        <Text style={styles.ecoLabel}>🌍 Sürdürülebilirlik Puanı</Text>
        <Text style={styles.ecoScore}>{profile.ecoScore}</Text>
        <View style={styles.statsRow}>
          <Stat value={profile.sharedCount} label="Paylaşım" />
          <View style={styles.statDivider} />
          <Stat value={profile.borrowedCount} label="Ödünç alma" />
          <View style={styles.statDivider} />
          <Stat value={earned.length} label="Rozet" />
        </View>
      </View>

      {/* Rozetler */}
      <Text style={styles.sectionTitle}>Rozetler</Text>
      <View style={styles.badgeGrid}>
        {BADGES.map((b) => {
          const has = earned.includes(b.id);
          return (
            <View
              key={b.id}
              style={[styles.badge, !has && styles.badgeLocked]}>
              <Text style={[styles.badgeEmoji, !has && styles.lockedEmoji]}>
                {has ? b.emoji : '🔒'}
              </Text>
              <Text style={styles.badgeName}>{b.name}</Text>
              <Text style={styles.badgeDesc}>{b.description}</Text>
            </View>
          );
        })}
      </View>

      <Button
        title="Çıkış Yap"
        variant="ghost"
        onPress={signOut}
        style={{ marginTop: 8 }}
      />
    </ScrollView>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16, paddingBottom: 40 },
  header: { alignItems: 'center', gap: 8, paddingVertical: 12 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: C.white, fontSize: 36, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '800', color: C.text },
  email: { fontSize: 14, color: C.muted },
  ecoCard: {
    backgroundColor: C.primaryDark,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  ecoLabel: { color: C.white, fontSize: 14, fontWeight: '600', opacity: 0.9 },
  ecoScore: { color: C.white, fontSize: 48, fontWeight: '900' },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  stat: { alignItems: 'center', paddingHorizontal: 14 },
  statValue: { color: C.white, fontSize: 22, fontWeight: '800' },
  statLabel: { color: C.white, opacity: 0.85, fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.25)' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: C.text, marginTop: 4 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  badge: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 4,
  },
  badgeLocked: { opacity: 0.55 },
  badgeEmoji: { fontSize: 32 },
  lockedEmoji: { fontSize: 28 },
  badgeName: { fontSize: 14, fontWeight: '700', color: C.text },
  badgeDesc: { fontSize: 12, color: C.muted, lineHeight: 16 },
});
