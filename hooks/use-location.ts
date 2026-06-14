import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import type { GeoPoint } from '@/types';

export type LocationStatus =
  | 'idle'
  | 'loading'
  | 'granted'
  | 'denied'
  | 'error';

/**
 * Ön plan konumu (Expo Go uyumlu). Arka plan/geofencing kullanılmaz;
 * bunun yerine uygulama açıkken anlık konum alınır.
 */
export function useLocation(autoRequest = true) {
  const [location, setLocation] = useState<GeoPoint | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');

  const request = useCallback(async (): Promise<GeoPoint | null> => {
    setStatus('loading');
    try {
      const { status: perm } =
        await Location.requestForegroundPermissionsAsync();
      if (perm !== 'granted') {
        setStatus('denied');
        return null;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const geo: GeoPoint = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      setLocation(geo);
      setStatus('granted');
      return geo;
    } catch {
      setStatus('error');
      return null;
    }
  }, []);

  useEffect(() => {
    if (autoRequest) request();
  }, [autoRequest, request]);

  return { location, status, request };
}
