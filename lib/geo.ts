import { GeoPoint } from '@/types';

const EARTH_RADIUS_M = 6371000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** İki koordinat arası mesafe (metre) — Haversine formülü */
export function distanceMeters(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

/**
 * "Geofence" yarıçapı (metre). Expo Go arka plan geofencing desteklemediği için,
 * uygulama açıkken bu yarıçap içindeki eşyaları "mahallende" kabul ediyoruz.
 */
export const GEOFENCE_RADIUS_M = 3000;

export function isWithinGeofence(
  user: GeoPoint,
  item: GeoPoint,
  radius: number = GEOFENCE_RADIUS_M
): boolean {
  return distanceMeters(user, item) <= radius;
}
