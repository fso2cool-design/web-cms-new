import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { handleFirestoreError, OperationType } from '@/lib/firebase/error';
import { PPDBApplicantItem } from '@/types';

const COLLECTION_NAME = 'ppdbApplicants';

export async function submitPPDBApplication(
  data: Omit<PPDBApplicantItem, 'id' | 'registrationNumber' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<{ id: string; registrationNumber: string; applicant: PPDBApplicantItem }> {
  try {
    const timestamp = Date.now().toString().slice(-6);
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const registrationNumber = `PPDB-2026-${timestamp}${randomSuffix}`;

    const docRef = doc(collection(db, COLLECTION_NAME));
    const newApplicant: PPDBApplicantItem = {
      ...data,
      id: docRef.id,
      registrationNumber,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(docRef, newApplicant);
    return { id: docRef.id, registrationNumber, applicant: newApplicant };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
}

export async function getApplicantByRegNumber(registrationNumber: string): Promise<PPDBApplicantItem | null> {
  const cleanReg = registrationNumber.trim().toUpperCase();
  try {
    // Attempt secure API route first
    const res = await fetch(`/api/ppdb/track?regNumber=${encodeURIComponent(cleanReg)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.found && json.data) {
        return json.data as PPDBApplicantItem;
      }
      return null;
    }
  } catch (apiErr) {
    console.warn('[PPDB Service] API route tracking error, attempting direct query:', apiErr);
  }

  // Fallback if user is logged in as admin
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    const match = snap.docs.find(
      (d) => d.data().registrationNumber?.toUpperCase() === cleanReg
    );
    if (match) {
      return { id: match.id, ...match.data() } as PPDBApplicantItem;
    }
    return null;
  } catch (error) {
    console.warn('[PPDB Service] Applicant tracking query failed:', error);
    return null;
  }
}

export async function getAllPPDBApplicantsAdmin(): Promise<PPDBApplicantItem[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as PPDBApplicantItem));
    items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return items;
  } catch (error) {
    console.warn('PPDB applicants read fallback:', error);
    return [];
  }
}

export async function updatePPDBStatus(
  id: string,
  status: PPDBApplicantItem['status'],
  notes?: string
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(
      docRef,
      {
        status,
        ...(notes !== undefined ? { notes } : {}),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
}

export async function deletePPDBApplicant(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
}

export const getAllApplicants = getAllPPDBApplicantsAdmin;
export const updateApplicantStatus = updatePPDBStatus;
export const submitPPDBRegistration = submitPPDBApplication;
