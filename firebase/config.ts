import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
// getReactNativePersistence, RN build'inde (dist/rn) mevcut ama yayınlanan
// TypeScript tiplerinde tanımlı değil — bu yüzden ts-ignore gerekiyor.
// @ts-ignore
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ============================================================================
//  FIREBASE YAPILANDIRMASI
//  ----------------------------------------------------------------------------
//  1) https://console.firebase.google.com adresinden bir proje oluştur.
//  2) Proje Ayarları > "Uygulamalarınız" > Web (</>) uygulaması ekle.
//  3) Sana verdiği firebaseConfig nesnesini AŞAĞIYA birebir yapıştır.
//  (Bu anahtarlar gizli değildir; güvenlik Firestore/Storage kurallarıyla sağlanır.)
// ============================================================================
export const firebaseConfig = {
  apiKey: 'BURAYA_API_KEY',
  authDomain: 'BURAYA_PROJE.firebaseapp.com',
  projectId: 'BURAYA_PROJE_ID',
  storageBucket: 'BURAYA_PROJE.appspot.com',
  messagingSenderId: 'BURAYA_SENDER_ID',
  appId: 'BURAYA_APP_ID',
};

/** Config henüz doldurulmadıysa false döner (uygulama kurulum ekranı gösterir). */
export const isFirebaseConfigured =
  !firebaseConfig.apiKey.startsWith('BURAYA') &&
  !firebaseConfig.projectId.startsWith('BURAYA');

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// initializeAuth, Fast Refresh sırasında ikinci kez çağrılırsa hata verir;
// o durumda mevcut auth örneğini al.
let _auth;
try {
  _auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  _auth = getAuth(app);
}

export const auth = _auth;
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
