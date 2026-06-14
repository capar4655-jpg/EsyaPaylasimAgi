import type { ItemCategory, RequestStatus, ShareMode } from '@/types';
import { C } from '@/constants/colors';

export const MODE_LABELS: Record<ShareMode, string> = {
  odunc: 'Ödünç',
  kiralama: 'Kiralama',
  takas: 'Takas',
};

export const MODE_ORDER: ShareMode[] = ['odunc', 'kiralama', 'takas'];

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  alet: 'Alet',
  kamp: 'Kamp',
  mutfak: 'Mutfak',
  elektronik: 'Elektronik',
  kitap: 'Kitap',
  bahce: 'Bahçe',
  spor: 'Spor',
  diger: 'Diğer',
};

export const CATEGORY_EMOJI: Record<ItemCategory, string> = {
  alet: '🔧',
  kamp: '⛺',
  mutfak: '🍳',
  elektronik: '🔌',
  kitap: '📚',
  bahce: '🌿',
  spor: '⚽',
  diger: '📦',
};

export const CATEGORY_ORDER: ItemCategory[] = [
  'alet',
  'kamp',
  'mutfak',
  'elektronik',
  'kitap',
  'bahce',
  'spor',
  'diger',
];

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'Onay bekliyor',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
  picked_up: 'Teslim alındı',
  returned: 'Tamamlandı',
  cancelled: 'İptal edildi',
};

export const REQUEST_STATUS_COLOR: Record<RequestStatus, string> = {
  pending: C.accent,
  approved: C.primary,
  rejected: C.danger,
  picked_up: C.info,
  returned: C.primaryDark,
  cancelled: C.muted,
};
