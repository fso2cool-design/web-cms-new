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
import { SchoolReview } from '@/types';

const COLLECTION_NAME = 'reviews';

/**
 * Mendapatkan ulasan yang telah disetujui (Approved) untuk halaman publik
 */
export async function getApprovedReviews(): Promise<SchoolReview[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', '==', 'approved')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SchoolReview));
      items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      return items.slice(0, 20);
    }
    return [];
  } catch (error) {
    console.error('Failed to read approved reviews from Firestore:', error);
    return [];
  }
}

/**
 * Mendapatkan seluruh ulasan (Pending, Approved, Rejected) untuk Panel Admin
 */
export async function getAllReviewsAdmin(): Promise<SchoolReview[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    if (!snap.empty) {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SchoolReview));
      items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      return items;
    }
    return [];
  } catch (error) {
    console.error('Failed to read admin reviews from Firestore:', error);
    return [];
  }
}

/**
 * Mengirim ulasan baru dari masyarakat / wali santri (Status: Pending)
 */
export async function submitSchoolReview(
  data: Omit<SchoolReview, 'id' | 'status' | 'createdAt'>
): Promise<string> {
  try {
    const docRef = doc(collection(db, COLLECTION_NAME));
    await setDoc(docRef, {
      ...data,
      rating: Number(data.rating) || 5,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
}

/**
 * Memperbarui status moderasi ulasan (Approved / Rejected) oleh Admin
 */
export async function updateReviewStatus(
  id: string,
  status: 'approved' | 'rejected' | 'pending'
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, { status }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
}

/**
 * Menghapus ulasan tidak pantas / spam oleh Admin
 */
export async function deleteReview(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
}

export const deleteSchoolReview = deleteReview;

