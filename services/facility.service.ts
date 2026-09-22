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
import { FacilityItem } from '@/types';

const COLLECTION_NAME = 'facilities';

export async function getPublishedFacilities(): Promise<FacilityItem[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', '==', 'published')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FacilityItem));
      items.sort((a, b) => ((a as any).order ?? 99) - ((b as any).order ?? 99));
      return items;
    }
    return [];
  } catch (error) {
    console.error('Failed to read published facilities from Firestore:', error);
    return [];
  }
}

export async function getAllFacilitiesAdmin(): Promise<FacilityItem[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    if (!snap.empty) {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FacilityItem));
      items.sort((a, b) => ((a as any).order ?? 99) - ((b as any).order ?? 99));
      return items;
    }
    return [];
  } catch (error) {
    console.error('Failed to read admin facilities from Firestore:', error);
    return [];
  }
}

export async function createFacility(facility: Omit<FacilityItem, 'id'>): Promise<string> {
  try {
    const docRef = doc(collection(db, COLLECTION_NAME));
    await setDoc(docRef, facility);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
}

export async function updateFacility(id: string, facility: Partial<FacilityItem>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, facility, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
}

export async function deleteFacility(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
}

export const getAllFacilities = getAllFacilitiesAdmin;
