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
import { ContactMessageItem } from '@/types';

const COLLECTION_NAME = 'contactMessages';

export async function submitContactMessage(
  data: Omit<ContactMessageItem, 'id' | 'isRead' | 'createdAt'>
): Promise<string> {
  try {
    const docRef = doc(collection(db, COLLECTION_NAME));
    await setDoc(docRef, {
      ...data,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
}

export async function getAllContactMessagesAdmin(): Promise<ContactMessageItem[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ContactMessageItem));
  } catch (error) {
    console.warn('Fallback reading contact messages:', error);
    return [];
  }
}

export async function markContactMessageAsRead(id: string, isRead = true): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, { isRead }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
}

export async function deleteContactMessage(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
}

export const getAllContactMessages = getAllContactMessagesAdmin;
export const markContactMessageRead = markContactMessageAsRead;
