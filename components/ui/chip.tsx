import { Pressable, StyleSheet, Text } from 'react-native';
import { C } from '@/constants/colors';

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}>
      <Text
        numberOfLines={1}
        style={[styles.text, active ? styles.textActive : styles.textIdle]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  chipIdle: { backgroundColor: C.card, borderColor: C.border },
  text: { fontSize: 14, fontWeight: '600' },
  textActive: { color: C.white },
  textIdle: { color: C.text },
});
