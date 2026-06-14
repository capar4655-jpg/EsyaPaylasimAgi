import { StyleSheet, Text, View } from 'react-native';
import { C } from '@/constants/colors';

export function EmptyState({
  emoji,
  title,
  subtitle,
}: {
  emoji: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 64, paddingHorizontal: 32, gap: 8 },
  emoji: { fontSize: 52 },
  title: { fontSize: 17, fontWeight: '700', color: C.text, textAlign: 'center' },
  subtitle: { fontSize: 14, color: C.muted, textAlign: 'center', lineHeight: 20 },
});
