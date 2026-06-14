import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { earnedBadgeIds } from '@/lib/badges';
import type {
  BorrowRequest,
  Chat,
  ChatMessage,
  GeoPoint,
  Item,
  ItemCategory,
  ShareMode,
  UserProfile,
} from '@/types';

// ----------------------------------------------------------------------------
//  Yardımcılar
// ----------------------------------------------------------------------------

/** QR / teslim doğrulaması için benzersiz token üretir. */
export function makeToken(): string {
  return (
    Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
  ).toUpperCase();
}

// Eco-puan ödülleri
const REWARD_OWNER = 15; // paylaşan kişiye
const REWARD_BORROWER = 10; // ödünç alan kişiye

// ----------------------------------------------------------------------------
//  Kullanıcı profili
// ----------------------------------------------------------------------------

export async function ensureUserProfile(
  uid: string,
  data: { displayName: string; email: string }
): Promise<UserProfile> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as UserProfile;

  const profile: UserProfile = {
    uid,
    displayName: data.displayName,
    email: data.email,
    photoURL: null,
    location: null,
    ecoScore: 0,
    sharedCount: 0,
    borrowedCount: 0,
    badges: [],
    createdAt: Date.now(),
  };
  await setDoc(ref, profile);
  return profile;
}

export function subscribeProfile(
  uid: string,
  cb: (p: UserProfile | null) => void
) {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    cb(snap.exists() ? (snap.data() as UserProfile) : null);
  });
}

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserLocation(uid: string, location: GeoPoint) {
  await updateDoc(doc(db, 'users', uid), { location });
}

// ----------------------------------------------------------------------------
//  Eşyalar (items)
// ----------------------------------------------------------------------------

export interface NewItemInput {
  ownerId: string;
  ownerName: string;
  title: string;
  description: string;
  category: ItemCategory;
  mode: ShareMode;
  price?: number | null;
  photoURL?: string | null;
  location: GeoPoint;
}

export async function createItem(input: NewItemInput): Promise<string> {
  const ref = await addDoc(collection(db, 'items'), {
    ...input,
    price: input.price ?? null,
    photoURL: input.photoURL ?? null,
    status: 'available',
    createdAt: Date.now(),
  });
  return ref.id;
}

export async function getItem(id: string): Promise<Item | null> {
  const snap = await getDoc(doc(db, 'items', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Item) : null;
}

export function subscribeItem(id: string, cb: (item: Item | null) => void) {
  return onSnapshot(doc(db, 'items', id), (snap) => {
    cb(snap.exists() ? ({ id: snap.id, ...snap.data() } as Item) : null);
  });
}

export async function deleteItem(id: string) {
  await deleteDoc(doc(db, 'items', id));
}

/** Tüm uygun eşyaları dinler (sıralama/filtre client tarafında yapılır). */
export function subscribeItems(cb: (items: Item[]) => void) {
  return onSnapshot(collection(db, 'items'), (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Item);
    items.sort((a, b) => b.createdAt - a.createdAt);
    cb(items);
  });
}

/** Belirli bir kullanıcıya ait eşyaları dinler. */
export function subscribeMyItems(ownerId: string, cb: (items: Item[]) => void) {
  const q = query(collection(db, 'items'), where('ownerId', '==', ownerId));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Item);
    items.sort((a, b) => b.createdAt - a.createdAt);
    cb(items);
  });
}

// ----------------------------------------------------------------------------
//  Talepler (requests) + Sohbet oluşturma
// ----------------------------------------------------------------------------

/** Talep oluşturur ve eşleşen bir sohbet başlatır. requestId döner. */
export async function createRequest(
  item: Item,
  requester: { uid: string; displayName: string },
  message: string
): Promise<{ requestId: string; chatId: string }> {
  // Önce sohbet oluştur
  const chatRef = await addDoc(collection(db, 'chats'), {
    participants: [item.ownerId, requester.uid],
    participantNames: {
      [item.ownerId]: item.ownerName,
      [requester.uid]: requester.displayName,
    },
    itemId: item.id,
    itemTitle: item.title,
    lastMessage: message || 'Talep gönderildi',
    lastSenderId: requester.uid,
    updatedAt: Date.now(),
  });

  const reqRef = await addDoc(collection(db, 'requests'), {
    itemId: item.id,
    itemTitle: item.title,
    itemPhotoURL: item.photoURL ?? null,
    ownerId: item.ownerId,
    ownerName: item.ownerName,
    requesterId: requester.uid,
    requesterName: requester.displayName,
    status: 'pending',
    message: message || '',
    qrToken: makeToken(),
    chatId: chatRef.id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // İlk mesajı sohbete ekle
  if (message) {
    await addDoc(collection(db, 'chats', chatRef.id, 'messages'), {
      senderId: requester.uid,
      senderName: requester.displayName,
      text: message,
      createdAt: Date.now(),
    });
  }

  return { requestId: reqRef.id, chatId: chatRef.id };
}

export function subscribeIncomingRequests(
  ownerId: string,
  cb: (reqs: BorrowRequest[]) => void
) {
  const q = query(collection(db, 'requests'), where('ownerId', '==', ownerId));
  return onSnapshot(q, (snap) => {
    const reqs = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as BorrowRequest
    );
    reqs.sort((a, b) => b.updatedAt - a.updatedAt);
    cb(reqs);
  });
}

export function subscribeOutgoingRequests(
  requesterId: string,
  cb: (reqs: BorrowRequest[]) => void
) {
  const q = query(
    collection(db, 'requests'),
    where('requesterId', '==', requesterId)
  );
  return onSnapshot(q, (snap) => {
    const reqs = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as BorrowRequest
    );
    reqs.sort((a, b) => b.updatedAt - a.updatedAt);
    cb(reqs);
  });
}

export function subscribeRequest(
  id: string,
  cb: (req: BorrowRequest | null) => void
) {
  return onSnapshot(doc(db, 'requests', id), (snap) => {
    cb(snap.exists() ? ({ id: snap.id, ...snap.data() } as BorrowRequest) : null);
  });
}

export async function approveRequest(req: BorrowRequest) {
  await updateDoc(doc(db, 'requests', req.id), {
    status: 'approved',
    updatedAt: Date.now(),
  });
  await updateDoc(doc(db, 'items', req.itemId), { status: 'requested' });
}

export async function rejectRequest(reqId: string) {
  await updateDoc(doc(db, 'requests', reqId), {
    status: 'rejected',
    updatedAt: Date.now(),
  });
}

export async function cancelRequest(reqId: string) {
  await updateDoc(doc(db, 'requests', reqId), {
    status: 'cancelled',
    updatedAt: Date.now(),
  });
}

/**
 * QR tokenı ile talebi bir adım ilerletir (ödünç alan kişi tarar):
 *   approved   → picked_up   (eşya teslim alındı)
 *   picked_up  → returned     (eşya iade edildi → ödüller + konfeti)
 * Dönen `celebrate` true ise iade tamamlanmıştır.
 */
export interface ScanResult {
  ok: boolean;
  message: string;
  celebrate?: boolean;
  requestId?: string;
}

export async function advanceRequestByToken(
  token: string,
  scannerUid: string
): Promise<ScanResult> {
  const q = query(
    collection(db, 'requests'),
    where('qrToken', '==', token.trim())
  );
  const snap = await getDocs(q);
  if (snap.empty) return { ok: false, message: 'Geçersiz QR kodu.' };

  const reqDoc = snap.docs[0];
  const req = { id: reqDoc.id, ...reqDoc.data() } as BorrowRequest;

  if (req.requesterId !== scannerUid) {
    return { ok: false, message: 'Bu QR kodu sana ait bir talep değil.' };
  }

  if (req.status === 'approved') {
    await updateDoc(doc(db, 'requests', req.id), {
      status: 'picked_up',
      updatedAt: Date.now(),
    });
    await updateDoc(doc(db, 'items', req.itemId), { status: 'borrowed' });
    return {
      ok: true,
      message: 'Eşya teslim alındı! İyi kullanımlar 🙌',
      requestId: req.id,
    };
  }

  if (req.status === 'picked_up') {
    await completeReturn(req);
    return {
      ok: true,
      message: 'Eşya başarıyla iade edildi! 🎉',
      celebrate: true,
      requestId: req.id,
    };
  }

  return {
    ok: false,
    message:
      req.status === 'returned'
        ? 'Bu işlem zaten tamamlanmış.'
        : 'Bu talep teslim için uygun durumda değil.',
  };
}

/** İade tamamlama: durum + eco-puan + rozet + eşya durumu güncellenir. */
async function completeReturn(req: BorrowRequest) {
  await updateDoc(doc(db, 'requests', req.id), {
    status: 'returned',
    updatedAt: Date.now(),
  });
  await updateDoc(doc(db, 'items', req.itemId), { status: 'available' });

  await rewardUser(req.ownerId, 'owner');
  await rewardUser(req.requesterId, 'borrower');
}

async function rewardUser(uid: string, role: 'owner' | 'borrower') {
  const profile = await getProfile(uid);
  if (!profile) return;

  const sharedCount =
    profile.sharedCount + (role === 'owner' ? 1 : 0);
  const borrowedCount =
    profile.borrowedCount + (role === 'borrower' ? 1 : 0);
  const ecoScore =
    profile.ecoScore + (role === 'owner' ? REWARD_OWNER : REWARD_BORROWER);

  const badges = earnedBadgeIds({ sharedCount, borrowedCount, ecoScore });

  await updateDoc(doc(db, 'users', uid), {
    sharedCount,
    borrowedCount,
    ecoScore,
    badges,
  });
}

// ----------------------------------------------------------------------------
//  Sohbet (chats / messages)
// ----------------------------------------------------------------------------

export function subscribeChats(uid: string, cb: (chats: Chat[]) => void) {
  const q = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', uid)
  );
  return onSnapshot(q, (snap) => {
    const chats = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Chat);
    chats.sort((a, b) => b.updatedAt - a.updatedAt);
    cb(chats);
  });
}

export async function getChat(id: string): Promise<Chat | null> {
  const snap = await getDoc(doc(db, 'chats', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Chat) : null;
}

export function subscribeMessages(
  chatId: string,
  cb: (msgs: ChatMessage[]) => void
) {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ChatMessage));
  });
}

export async function sendMessage(
  chatId: string,
  sender: { uid: string; displayName: string },
  text: string
) {
  const trimmed = text.trim();
  if (!trimmed) return;
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId: sender.uid,
    senderName: sender.displayName,
    text: trimmed,
    createdAt: Date.now(),
  });
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: trimmed,
    lastSenderId: sender.uid,
    updatedAt: Date.now(),
  });
}
