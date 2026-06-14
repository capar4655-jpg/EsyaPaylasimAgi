/** Firebase Auth hata kodlarını okunabilir Türkçe mesaja çevirir. */
export function authErrorMessage(code?: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'Geçersiz e-posta adresi.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-posta veya şifre hatalı.';
    case 'auth/email-already-in-use':
      return 'Bu e-posta adresi zaten kayıtlı.';
    case 'auth/weak-password':
      return 'Şifre en az 6 karakter olmalı.';
    case 'auth/missing-password':
      return 'Lütfen şifreni gir.';
    case 'auth/network-request-failed':
      return 'Ağ hatası. İnternet bağlantını kontrol et.';
    case 'auth/too-many-requests':
      return 'Çok fazla deneme yapıldı. Biraz sonra tekrar dene.';
    default:
      return 'Bir hata oluştu. Lütfen tekrar dene.';
  }
}
