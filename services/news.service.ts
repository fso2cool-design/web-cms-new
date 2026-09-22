import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { handleFirestoreError, OperationType } from '@/lib/firebase/error';
import { NewsItem } from '@/types';
import { normalizeImageUrl } from '@/lib/image-utils';

const COLLECTION_NAME = 'news';

function mapNewsDoc(d: any): NewsItem {
  const data = d.data();
  const rawImage = data.featuredImage || data.imageUrl || '';
  const canonicalImage = normalizeImageUrl(rawImage);
  return {
    id: d.id,
    ...data,
    featuredImage: canonicalImage,
    imageUrl: canonicalImage, // Backward compatibility for legacy public components
  } as NewsItem;
}

export async function getPublishedNews(maxCount = 20): Promise<NewsItem[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', '==', 'published')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const items = snap.docs.map(mapNewsDoc);
      items.sort((a, b) => {
        const timeA = new Date(a.publishedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.publishedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      return items.slice(0, maxCount);
    }
    return [];
  } catch (error) {
    console.error('Failed to read published news from Firestore:', error);
    return [];
  }
}

export async function getAllNewsAdmin(): Promise<NewsItem[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    if (!snap.empty) {
      const items = snap.docs.map(mapNewsDoc);
      items.sort((a, b) => {
        const timeA = new Date(a.createdAt || a.publishedAt || 0).getTime();
        const timeB = new Date(b.createdAt || b.publishedAt || 0).getTime();
        return timeB - timeA;
      });
      return items;
    }
    return [];
  } catch (error) {
    console.error('Failed to read admin news from Firestore:', error);
    return [];
  }
}

export async function getNewsById(id: string): Promise<NewsItem | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return mapNewsDoc(snap);
    }
    return null;
  } catch (error) {
    console.error('Failed to get news by id from Firestore:', error);
    return null;
  }
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('slug', '==', slug),
      where('status', '==', 'published')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return mapNewsDoc(snap.docs[0]);
    }
    return null;
  } catch (error) {
    console.error('Failed to find news slug in Firestore:', error);
    return null;
  }
}

export async function createNews(news: Omit<NewsItem, 'id'>): Promise<string> {
  try {
    const docRef = doc(collection(db, COLLECTION_NAME));
    const rawImage = news.featuredImage || news.imageUrl || '';
    const normalizedImage = normalizeImageUrl(rawImage);

    await setDoc(docRef, {
      ...news,
      featuredImage: normalizedImage,
      imageUrl: normalizedImage, // Backward compatibility for legacy Firestore consumers
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
}

export async function updateNews(id: string, news: Partial<NewsItem>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const updates: Record<string, any> = {
      ...news,
      updatedAt: new Date().toISOString(),
    };

    if (news.featuredImage !== undefined || news.imageUrl !== undefined) {
      const rawImage = news.featuredImage || news.imageUrl || '';
      const normalizedImage = normalizeImageUrl(rawImage);
      updates.featuredImage = normalizedImage;
      updates.imageUrl = normalizedImage; // Backward compatibility
    }

    await setDoc(docRef, updates, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
}

export async function deleteNews(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
}

export const getAllNews = getAllNewsAdmin;
