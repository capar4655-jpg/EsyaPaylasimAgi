import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { SetupRequired } from '@/components/setup-required';
import { C } from '@/constants/colors';
import { AuthProvider, useAuth } from '@/context/auth';
import { isFirebaseConfigured } from '@/firebase/config';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  if (!isFirebaseConfigured) {
    return <SetupRequired />;
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootNavigator />
        <StatusBar style="dark" />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: C.bg,
        }}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: C.card },
        headerTintColor: C.text,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: C.bg },
      }}>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="item/new"
          options={{ title: 'Eşya Ekle', presentation: 'modal' }}
        />
        <Stack.Screen name="item/[id]" options={{ title: 'Eşya Detayı' }} />
        <Stack.Screen name="request/[id]" options={{ title: 'Talep' }} />
        <Stack.Screen name="chat/[id]" options={{ title: 'Sohbet' }} />
        <Stack.Screen
          name="scan"
          options={{ title: 'QR Tara', presentation: 'modal' }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
