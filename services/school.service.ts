import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { handleFirestoreError, OperationType } from '@/lib/firebase/error';
import { SchoolProfile } from '@/types';
import { initialSchoolProfile } from '@/lib/seed-data';

const PROFILE_DOC_PATH = 'schoolProfile/general';

export async function getSchoolProfile(): Promise<SchoolProfile> {
  try {
    const docRef = doc(db, 'schoolProfile', 'general');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as SchoolProfile;
    }
    return initialSchoolProfile;
  } catch (error) {
    console.warn('Could not fetch schoolProfile from Firestore, using initial profile:', error);
    return initialSchoolProfile;
  }
}

export async function updateSchoolProfile(profile: Partial<SchoolProfile>): Promise<void> {
  try {
    const docRef = doc(db, 'schoolProfile', 'general');
    await setDoc(
      docRef,
      {
        ...profile,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, PROFILE_DOC_PATH);
  }
}
