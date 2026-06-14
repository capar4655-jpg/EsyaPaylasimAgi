import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { C } from '@/constants/colors';

export function Loading() {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={C.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 64, alignItems: 'center', justifyContent: 'center' },
});
