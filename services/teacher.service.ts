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
import { TeacherItem } from '@/types';

const COLLECTION_NAME = 'teachers';

export async function getActiveTeachers(): Promise<TeacherItem[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('isActive', '==', true)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as TeacherItem));
      items.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
      return items;
    }
    return [];
  } catch (error) {
    console.error('Failed to read active teachers from Firestore:', error);
    return [];
  }
}

export async function getAllTeachersAdmin(): Promise<TeacherItem[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    if (!snap.empty) {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as TeacherItem));
      items.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
      return items;
    }
    return [];
  } catch (error) {
    console.error('Failed to read admin teachers from Firestore:', error);
    return [];
  }
}

export async function createTeacher(teacher: Omit<TeacherItem, 'id'>): Promise<string> {
  try {
    const docRef = doc(collection(db, COLLECTION_NAME));
    await setDoc(docRef, teacher);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
}

export async function updateTeacher(id: string, teacher: Partial<TeacherItem>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, teacher, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
}

export async function deleteTeacher(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
}

export const getAllTeachers = getAllTeachersAdmin;
