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
import { GalleryItem } from '@/types';
import { normalizeImageUrl } from '@/lib/image-utils';

const COLLECTION_NAME = 'galleries';

function mapGalleryDoc(d: any): GalleryItem {
  const data = d.data();
  const rawImg = data.imageUrl || data.coverUrl || (Array.isArray(data.images) && data.images[0]) || '';
  const normalizedImages = Array.isArray(data.images) && data.images.length > 0
    ? data.images.map((img: string) => img || '')
    : (rawImg ? [rawImg] : []);

  return {
    id: d.id,
    ...data,
    imageUrl: data.imageUrl || rawImg,
    coverUrl: data.coverUrl || rawImg,
    images: normalizedImages,
  } as GalleryItem;
}

export async function getPublishedGalleries(): Promise<GalleryItem[]> {
  try {
    if (process.env.NODE_ENV !== 'production' || typeof window !== 'undefined') {
      console.info('[GalleryService DEBUG] getPublishedGalleries START');
    }
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', '==', 'published')
    );
    const snap = await getDocs(q);
    const items: GalleryItem[] = [];

    if (!snap.empty) {
      const mapped = snap.docs.map(mapGalleryDoc);
      mapped.sort((a, b) => {
        const timeA = new Date(a.date || a.createdAt || 0).getTime();
        const timeB = new Date(b.date || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      items.push(...mapped);
    }

    if (process.env.NODE_ENV !== 'production' || typeof window !== 'undefined') {
      console.info('[GalleryService DEBUG] getPublishedGalleries SUCCESS');
      console.info(`[GalleryService DEBUG] count: ${items.length}`);
      console.info(`[GalleryService DEBUG] ids:`, items.map((i) => i.id));
      console.info(`[GalleryService DEBUG] imageUrls:`, items.map((i) => i.imageUrl || '(empty)'));
      console.info(`[GalleryService DEBUG] coverUrls:`, items.map((i) => i.coverUrl || '(empty)'));
      console.info(`[GalleryService DEBUG] images:`, items.map((i) => i.images || []));
    }

    return items;
  } catch (error: any) {
    console.error('[GalleryService DEBUG] getPublishedGalleries ERROR:', error);
    if (error?.code === 'permission-denied') {
      console.error('[GalleryService DEBUG] Permission denied on galleries collection. Check firestore.rules for status == "published"');
    }
    throw error;
  }
}

export async function getAllGalleriesAdmin(): Promise<GalleryItem[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    const items: GalleryItem[] = [];
    if (!snap.empty) {
      const mapped = snap.docs.map(mapGalleryDoc);
      mapped.sort((a, b) => {
        const timeA = new Date(a.date || a.createdAt || 0).getTime();
        const timeB = new Date(b.date || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      items.push(...mapped);
    }

    if (process.env.NODE_ENV !== 'production' || typeof window !== 'undefined') {
      console.info(`[GalleryService] All admin gallery count: ${items.length}`);
      console.info(`[GalleryService] Admin Gallery IDs:`, items.map((i) => i.id));
    }

    return items;
  } catch (error: any) {
    console.error('[GalleryService] Failed to read admin galleries from Firestore:', error);
    return [];
  }
}

export async function createGallery(gallery: Omit<GalleryItem, 'id'>): Promise<string> {
  try {
    const docRef = doc(collection(db, COLLECTION_NAME));
    const rawImg = gallery.imageUrl || gallery.coverUrl || (Array.isArray(gallery.images) && gallery.images[0]) || '';
    const imagesList = Array.isArray(gallery.images) && gallery.images.length > 0
      ? gallery.images.filter(Boolean)
      : (rawImg ? [rawImg] : []);

    const galleryData = {
      title: gallery.title || '',
      description: gallery.description || '',
      category: gallery.category || 'Dokumentasi',
      date: gallery.date || new Date().toISOString().split('T')[0],
      imageUrl: rawImg,
      coverUrl: gallery.coverUrl || rawImg,
      images: imagesList,
      status: gallery.status || 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (process.env.NODE_ENV !== 'production' || typeof window !== 'undefined') {
      console.info('[GalleryService] CREATE Gallery:', docRef.id);
      console.info('[GalleryService] title:', galleryData.title);
      console.info('[GalleryService] imageUrl:', galleryData.imageUrl);
      console.info('[GalleryService] coverUrl:', galleryData.coverUrl);
      console.info('[GalleryService] images:', galleryData.images);
      console.info('[GalleryService] status:', galleryData.status);
    }

    await setDoc(docRef, galleryData);
    return docRef.id;
  } catch (error) {
    console.error('[GalleryService] Create gallery error:', error);
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
    throw error;
  }
}

export async function updateGallery(id: string, gallery: Partial<GalleryItem>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const updates: Record<string, any> = {
      ...gallery,
      updatedAt: new Date().toISOString(),
    };

    if (gallery.imageUrl !== undefined) {
      updates.imageUrl = gallery.imageUrl;
    }
    if (gallery.coverUrl !== undefined) {
      updates.coverUrl = gallery.coverUrl;
    }
    if (gallery.images !== undefined && Array.isArray(gallery.images)) {
      updates.images = gallery.images.filter(Boolean);
    }

    if (process.env.NODE_ENV !== 'production' || typeof window !== 'undefined') {
      console.info('[GalleryService] UPDATE Gallery:', id);
      console.info('[GalleryService] updates:', updates);
    }

    await setDoc(docRef, updates, { merge: true });
  } catch (error) {
    console.error(`[GalleryService] Update gallery ${id} error:`, error);
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
    throw error;
  }
}

export async function deleteGallery(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
}

export const getAllGalleries = getAllGalleriesAdmin;
