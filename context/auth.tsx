import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { auth } from '@/firebase/config';
import { ensureUserProfile, subscribeProfile } from '@/lib/firestore';
import type { UserProfile } from '@/types';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  initializing: boolean;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  initializing: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initializing, setInitializing] = useState(true);
  const profileUnsub = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      // Önceki profil aboneliğini temizle
      profileUnsub.current?.();
      profileUnsub.current = null;

      setUser(u);
      if (u) {
        await ensureUserProfile(u.uid, {
          displayName: u.displayName ?? 'Komşu',
          email: u.email ?? '',
        });
        profileUnsub.current = subscribeProfile(u.uid, setProfile);
      } else {
        setProfile(null);
      }
      setInitializing(false);
    });

    return () => {
      unsub();
      profileUnsub.current?.();
    };
  }, []);

  const signUp = async (name: string, email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );
    await updateProfile(cred.user, { displayName: name.trim() });
    await ensureUserProfile(cred.user.uid, {
      displayName: name.trim(),
      email: email.trim(),
    });
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, initializing, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
