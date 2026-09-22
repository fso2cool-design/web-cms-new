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
import { FAQItem } from '@/types';

const COLLECTION_NAME = 'faqs';

export async function getPublishedFAQs(): Promise<FAQItem[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', '==', 'published')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FAQItem));
      items.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
      return items;
    }
    return [];
  } catch (error) {
    console.error('Failed to read published FAQs from Firestore:', error);
    return [];
  }
}

export async function getAllFAQsAdmin(): Promise<FAQItem[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    if (!snap.empty) {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FAQItem));
      items.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
      return items;
    }
    return [];
  } catch (error) {
    console.error('Failed to read admin FAQs from Firestore:', error);
    return [];
  }
}

export async function createFAQ(faq: Omit<FAQItem, 'id'>): Promise<string> {
  try {
    const docRef = doc(collection(db, COLLECTION_NAME));
    await setDoc(docRef, faq);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
}

export async function updateFAQ(id: string, faq: Partial<FAQItem>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, faq, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
}

export async function deleteFAQ(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
}

export const getAllFAQs = getAllFAQsAdmin;
