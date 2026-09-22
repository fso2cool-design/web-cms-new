'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './client';
import { AppUser, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signInDemoAdmin: (role?: UserRole) => void;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  appUser: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signInDemoAdmin: () => {},
  signOut: async () => {},
  isAdmin: false,
});

const ADMIN_EMAILS = [
  'letithaven@gmail.com',
  'alumnimansbt@gmail.com',
  'ponpesalaska@gmail.com',
  'fso2cool@gmail.com',
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedDemo = localStorage.getItem('demo_admin_user');
        if (savedDemo) {
          return JSON.parse(savedDemo) as AppUser;
        }
      } catch (e) {
        console.warn('Failed to parse demo admin session', e);
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userEmailLower = (currentUser.email || '').toLowerCase().trim();
        const isDesignatedAdmin = ADMIN_EMAILS.includes(userEmailLower);

        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);

          if (snap.exists()) {
            const existingData = snap.data() as AppUser;
            // Auto-heal: If user is one of the designated admin emails but not yet superadmin in Firestore, elevate now
            if (isDesignatedAdmin && existingData.role !== 'superadmin') {
              const elevated: AppUser = {
                ...existingData,
                role: 'superadmin',
                email: currentUser.email || existingData.email,
              };
              await setDoc(userDocRef, { role: 'superadmin' }, { merge: true });
              setAppUser(elevated);
            } else {
              setAppUser(existingData);
            }
          } else {
            // New user registration in Firestore - never pass undefined to setDoc()
            const newUser: AppUser = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Administrator',
              role: isDesignatedAdmin ? 'superadmin' : 'staff',
              ...(currentUser.photoURL ? { photoURL: currentUser.photoURL } : {}),
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newUser, { merge: true });
            setAppUser(newUser);
          }
        } catch (err: any) {
          if (err?.code === 'permission-denied') {
            console.error('[AuthContext] Firestore permission-denied syncing user document users/' + currentUser.uid);
          } else {
            console.warn('[AuthContext] Firestore user-document sync failed:', err);
          }
          // Fallback user state
          setAppUser({
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Administrator',
            role: isDesignatedAdmin ? 'superadmin' : 'staff',
            ...(currentUser.photoURL ? { photoURL: currentUser.photoURL } : {}),
          });
        }
      } else {
        // If not logged into Firebase, check if demo admin is active
        const demoActive = typeof window !== 'undefined' ? localStorage.getItem('demo_admin_user') : null;
        if (!demoActive) {
          setAppUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google Sign In failed:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const trimmedEmail = email.trim();
    try {
      await signInWithEmailAndPassword(auth, trimmedEmail, pass);
      if (process.env.NODE_ENV !== 'production' || typeof window !== 'undefined') {
        console.info(`[AuthContext] signInWithEmail SUCCESS for email: ${trimmedEmail}`);
      }
    } catch (error: any) {
      const code = error?.code || 'unknown';
      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        console.warn(`[AuthContext] Authentication failed: User not found or invalid credentials for email [${trimmedEmail}]. Code: ${code}`);
      } else if (code === 'auth/permission-denied') {
        console.error(`[AuthContext] Authentication error: Permission denied. Code: ${code}`);
      } else {
        console.error(`[AuthContext] Email Sign In failed for email [${trimmedEmail}]. Code: ${code}`, error?.message);
      }
      throw error;
    }
  };

  const signInDemoAdmin = (role: UserRole = 'superadmin') => {
    const demoUser: AppUser = {
      uid: 'demo-admin-id',
      email: 'admin.demo@sekolah.id',
      displayName: 'Operator / Admin Sekolah',
      role,
      createdAt: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('demo_admin_user', JSON.stringify(demoUser));
    }
    setAppUser(demoUser);
  };

  const signOut = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo_admin_user');
    }
    setAppUser(null);
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Firebase sign out warning:', e);
    }
  };

  const isAdmin =
    appUser?.role === 'superadmin' ||
    appUser?.role === 'admin' ||
    appUser?.role === 'editor' ||
    appUser?.role === 'kepala_sekolah';

  return (
    <AuthContext.Provider
      value={{
        user,
        appUser,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signInDemoAdmin,
        signOut,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
