// Uygulama genelinde kullanılan veri tipleri (Firestore dokümanları ile eşleşir)

/** Paylaşım türü: ödünç (ücretsiz), kiralama (ücretli), takas */
export type ShareMode = 'odunc' | 'kiralama' | 'takas';

/** Eşyanın anlık durumu */
export type ItemStatus = 'available' | 'requested' | 'borrowed';

export type ItemCategory =
  | 'alet'
  | 'kamp'
  | 'mutfak'
  | 'elektronik'
  | 'kitap'
  | 'bahce'
  | 'spor'
  | 'diger';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string | null;
  location?: GeoPoint | null;
  ecoScore: number; // sürdürülebilirlik puanı
  sharedCount: number; // başarıyla paylaştığı (ödünç verdiği) eşya sayısı
  borrowedCount: number; // başarıyla ödünç aldığı eşya sayısı
  badges: string[]; // kazanılan rozet id'leri
  createdAt: number;
}

export interface Item {
  id: string;
  ownerId: string;
  ownerName: string;
  title: string;
  description: string;
  category: ItemCategory;
  mode: ShareMode;
  price?: number | null; // kiralama için günlük ücret
  photoURL?: string | null; // base64 data URI veya Storage URL
  location: GeoPoint;
  status: ItemStatus;
  createdAt: number;
}

export type RequestStatus =
  | 'pending' // talep gönderildi, onay bekliyor
  | 'approved' // sahibi onayladı, QR ile teslim bekleniyor
  | 'rejected' // sahibi reddetti
  | 'picked_up' // QR okutuldu, eşya teslim alındı
  | 'returned' // eşya iade edildi → işlem tamamlandı 🎉
  | 'cancelled'; // talep eden iptal etti

export interface BorrowRequest {
  id: string;
  itemId: string;
  itemTitle: string;
  itemPhotoURL?: string | null;
  ownerId: string;
  ownerName: string;
  requesterId: string;
  requesterName: string;
  status: RequestStatus;
  message?: string;
  qrToken: string; // teslim/iade doğrulaması için benzersiz token
  chatId: string;
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: number;
}

export interface Chat {
  id: string;
  participants: string[]; // [ownerId, requesterId]
  participantNames: Record<string, string>;
  itemId: string;
  itemTitle: string;
  lastMessage: string;
  lastSenderId: string;
  updatedAt: number;
}
