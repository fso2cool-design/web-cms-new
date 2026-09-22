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
import { ExtracurricularItem } from '@/types';

const COLLECTION_NAME = 'extracurriculars';

export async function getActiveExtracurriculars(): Promise<ExtracurricularItem[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('isActive', '==', true)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ExtracurricularItem));
    }
    return [];
  } catch (error) {
    console.error('Failed to read active extracurriculars from Firestore:', error);
    return [];
  }
}

export async function getAllExtracurricularsAdmin(): Promise<ExtracurricularItem[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ExtracurricularItem));
    }
    return [];
  } catch (error) {
    console.error('Failed to read admin extracurriculars from Firestore:', error);
    return [];
  }
}

export async function createExtracurricular(item: Omit<ExtracurricularItem, 'id'>): Promise<string> {
  try {
    const docRef = doc(collection(db, COLLECTION_NAME));
    await setDoc(docRef, item);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
}

export async function updateExtracurricular(id: string, item: Partial<ExtracurricularItem>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, item, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
}

export async function deleteExtracurricular(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
}

export const getAllExtracurriculars = getAllExtracurricularsAdmin;
