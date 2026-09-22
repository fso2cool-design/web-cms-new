import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { handleFirestoreError, OperationType } from '@/lib/firebase/error';
import { AchievementItem } from '@/types';
import { normalizeImageUrl } from '@/lib/image-utils';

const COLLECTION_NAME = 'achievements';

function mapAchievementDoc(d: any): AchievementItem {
  const data = d.data();
  const rawImg = data.photoUrl || data.imageUrl || '';
  const canonicalImg = normalizeImageUrl(rawImg);
  return {
    id: d.id,
    ...data,
    photoUrl: canonicalImg,
    imageUrl: canonicalImg,
  } as AchievementItem;
}

export async function getAchievements(): Promise<AchievementItem[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    if (!snap.empty) {
      const items = snap.docs.map(mapAchievementDoc);
      items.sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
      return items;
    }
    return [];
  } catch (error) {
    console.error('Failed to read achievements from Firestore:', error);
    return [];
  }
}

export const getAllAchievements = getAchievements;

export async function createAchievement(item: Omit<AchievementItem, 'id'>): Promise<string> {
  try {
    const docRef = doc(collection(db, COLLECTION_NAME));
    await setDoc(docRef, item);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
}

export async function updateAchievement(id: string, item: Partial<AchievementItem>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, item, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
}

export async function deleteAchievement(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
}
