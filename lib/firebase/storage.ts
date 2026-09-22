import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, auth } from './client';

export interface UploadResult {
  url: string;
  fullPath: string;
  name: string;
}

/**
 * Upload a file directly to Firebase Storage with path sanitization and auth validation.
 * @param file - File object from input[type="file"]
 * @param folder - Destination folder (e.g. 'news', 'gallery', 'teachers', 'facilities', 'documents', 'school')
 * @param onProgress - Optional callback for upload progress percentage (0 - 100)
 */
export async function uploadFileToStorage(
  file: File,
  folder: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Sesi autentikasi tidak ditemukan. Harap login kembali dengan akun administrator.');
  }

  // Sanitize filename to avoid weird character issues
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const storagePath = `${folder}/${timestamp}_${cleanName}`;
  const storageRef = ref(storage, storagePath);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        console.error(`[Firebase Storage] Upload error to ${storagePath}:`, error);
        reject(
          new Error(
            `Gagal mengunggah file ke penyimpanan cloud: ${error.message || 'Izin ditolak atau masalah jaringan'}`
          )
        );
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            url: downloadUrl,
            fullPath: storagePath,
            name: file.name,
          });
        } catch (urlErr) {
          reject(urlErr);
        }
      }
    );
  });
}
