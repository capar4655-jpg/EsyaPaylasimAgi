import ConfettiCannon from 'react-native-confetti-cannon';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { C } from '@/constants/colors';

/**
 * "Sürdürülebilirlik Kahramanı" kutlaması: ekranda patlayan konfeti + rozet afişi.
 * `visible` true olduğunda konfeti otomatik başlar.
 */
export function Celebration({
  visible,
  title = 'Sürdürülebilirlik Kahramanı! 🦸',
  subtitle = 'Bir eşya daha yeniden kullanıldı, teşekkürler!',
}: {
  visible: boolean;
  title?: string;
  subtitle?: string;
}) {
  const { width } = useWindowDimensions();
  if (!visible) return null;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.fill]}>
      <ConfettiCannon
        count={180}
        origin={{ x: width / 2, y: -20 }}
        fadeOut
        autoStart
        explosionSpeed={400}
        fallSpeed={2800}
      />
      <View style={styles.bannerWrap}>
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>{title}</Text>
          <Text style={styles.bannerSubtitle}>{subtitle}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { alignItems: 'center', justifyContent: 'flex-start' },
  bannerWrap: { marginTop: 60, paddingHorizontal: 24 },
  banner: {
    backgroundColor: C.primaryDark,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  bannerTitle: { color: C.white, fontSize: 18, fontWeight: '800' },
  bannerSubtitle: {
    color: C.white,
    opacity: 0.9,
    fontSize: 13,
    textAlign: 'center',
  },
});
