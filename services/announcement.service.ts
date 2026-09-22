import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { handleFirestoreError, OperationType } from '@/lib/firebase/error';
import { AnnouncementItem } from '@/types';

const COLLECTION_NAME = 'announcements';

export async function getPublishedAnnouncements(): Promise<AnnouncementItem[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', '==', 'published')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AnnouncementItem));
      items.sort((a, b) => new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime());
      return items;
    }
    return [];
  } catch (error) {
    console.error('Failed to read published announcements from Firestore:', error);
    return [];
  }
}

export async function getAllAnnouncementsAdmin(): Promise<AnnouncementItem[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    if (!snap.empty) {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AnnouncementItem));
      items.sort((a, b) => new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime());
      return items;
    }
    return [];
  } catch (error) {
    console.error('Failed to read admin announcements from Firestore:', error);
    return [];
  }
}

export async function createAnnouncement(announcement: Omit<AnnouncementItem, 'id'>): Promise<string> {
  try {
    const docRef = doc(collection(db, COLLECTION_NAME));
    await setDoc(docRef, { ...announcement, createdAt: new Date().toISOString() });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
}

export async function updateAnnouncement(id: string, announcement: Partial<AnnouncementItem>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, announcement, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
}

export async function deleteAnnouncement(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
}

export const getAllAnnouncements = getAllAnnouncementsAdmin;
