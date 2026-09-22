/**
 * Utility to extract and resolve Google Drive image URLs, Firebase Storage URLs,
 * and standard HTTPS image URLs with reliable fallback chains.
 *
 * Supported Google Drive & Legacy Google formats:
 * - https://drive.google.com/file/d/[FILE_ID]/view?usp=sharing
 * - https://drive.google.com/file/d/[FILE_ID]/view
 * - https://drive.google.com/file/d/[FILE_ID]
 * - https://drive.google.com/open?id=[FILE_ID]
 * - https://drive.google.com/uc?id=[FILE_ID]
 * - https://drive.google.com/uc?export=view&id=[FILE_ID]
 * - https://drive.google.com/thumbnail?id=[FILE_ID]
 * - https://lh3.googleusercontent.com/d/[FILE_ID] (Legacy)
 * - https://*.googleusercontent.com/d/[FILE_ID] (Legacy)
 *
 * Google Drive Preview Priority:
 * 1. PRIMARY:    https://lh3.googleusercontent.com/d/FILE_ID (Direct Google CDN - returns HTTP 200 JPEG directly)
 * 2. FALLBACK 1: https://lh3.googleusercontent.com/d/FILE_ID=w1600 (High-resolution direct CDN)
 * 3. FALLBACK 2: https://drive.google.com/thumbnail?id=FILE_ID&sz=w1600
 * 4. FALLBACK 3: https://drive.google.com/uc?export=view&id=FILE_ID
 * 5. FALLBACK 4: https://drive.google.com/uc?id=FILE_ID
 */

export function extractGoogleDriveFileId(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // 1. Google Drive /file/d/{id} or /d/{id} (e.g. drive.google.com/file/d/ID/view?usp=sharing)
  const fileDMatch = trimmed.match(/(?:drive|docs)\.google\.com\/(?:[a-zA-Z0-9_\-\/]+)?\/(?:file\/)?d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return fileDMatch[1].split('/')[0].split('?')[0].split('&')[0];
  }

  // 2. Legacy googleusercontent format: googleusercontent.com/d/{FILE_ID} or lh3.googleusercontent.com/d/{FILE_ID}
  const googleUserContentMatch = trimmed.match(/(?:[a-zA-Z0-9_-]+\.)?googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (googleUserContentMatch && googleUserContentMatch[1]) {
    return googleUserContentMatch[1].split('=')[0];
  }

  // 3. Query parameter ?id={id} or &id={id} or ?export=download&id={id}
  if (trimmed.includes('google.com') || trimmed.includes('googleusercontent.com')) {
    const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) {
      return idParamMatch[1];
    }
  }

  // 4. Direct /d/{id} anywhere in URL
  const genericDMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]{15,70})/);
  if (genericDMatch && genericDMatch[1]) {
    return genericDMatch[1];
  }

  return null;
}

/**
 * Checks if a given URL is a Google Drive link or legacy Google Usercontent URL
 */
export function isGoogleDriveUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return (
    trimmed.includes('drive.google.com') ||
    trimmed.includes('docs.google.com') ||
    trimmed.includes('drive.usercontent.google.com') ||
    trimmed.includes('googleusercontent.com')
  );
}

function isLikelyFileId(str: string): boolean {
  return /^[a-zA-Z0-9_-]{20,60}$/.test(str.trim());
}

/**
 * Returns an ordered array of image URLs to try for a Google Drive file:
 * 1. Direct CDN (lh3.googleusercontent.com/d/FILE_ID) - returns HTTP 200 JPEG directly
 * 2. High-res direct CDN (lh3.googleusercontent.com/d/FILE_ID=w1600)
 * 3. Thumbnail (drive.google.com/thumbnail?id=FILE_ID&sz=w1600)
 * 4. uc?export=view&id=
 * 5. uc?id=
 */
export function getGoogleDriveImageUrls(fileIdOrUrl?: string | null): string[] {
  if (!fileIdOrUrl || typeof fileIdOrUrl !== 'string') return [];
  const fileId = extractGoogleDriveFileId(fileIdOrUrl) || (isLikelyFileId(fileIdOrUrl) ? fileIdOrUrl.trim() : null);

  if (!fileId) return [];

  return [
    `/api/proxy-image?id=${fileId}`,
    `https://lh3.googleusercontent.com/d/${fileId}`,
    `https://lh3.googleusercontent.com/d/${fileId}=w1600`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`,
    `https://drive.google.com/uc?export=view&id=${fileId}`,
    `https://drive.google.com/uc?id=${fileId}`,
  ];
}

/**
 * Returns the candidate list of URLs for browser preview.
 * For Google Drive / legacy Google Drive URLs:
 * [
 *   "/api/proxy-image?id=FILE_ID",
 *   "https://lh3.googleusercontent.com/d/FILE_ID",
 *   "https://lh3.googleusercontent.com/d/FILE_ID=w1600",
 *   "https://drive.google.com/thumbnail?id=FILE_ID&sz=w1600",
 *   "https://drive.google.com/uc?export=view&id=FILE_ID",
 *   "https://drive.google.com/uc?id=FILE_ID"
 * ]
 * For Dropbox: normalizes dl=0 to raw=1.
 * For Firebase Storage or other HTTPS images: returns [originalUrl].
 */
export function getImagePreviewUrls(url?: string | null): string[] {
  if (!url || typeof url !== 'string') return [];
  const trimmed = url.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith('/api/proxy-image')) {
    return [trimmed];
  }

  // Google Drive & Legacy Google Usercontent URLs
  if (isGoogleDriveUrl(trimmed)) {
    const fileId = extractGoogleDriveFileId(trimmed);
    if (fileId) {
      return getGoogleDriveImageUrls(fileId);
    }
  }

  // Dropbox
  if (trimmed.includes('dropbox.com') && trimmed.includes('dl=0')) {
    return [trimmed.replace('dl=0', 'raw=1')];
  }

  return [trimmed];
}

/**
 * Normalizes an image URL for display:
 * - If Google Drive URL: returns the internal server-side proxy endpoint
 *   (/api/proxy-image?id=FILE_ID) which bypasses Google Drive CORS, iframe, and hotlink blocking.
 * - If Firebase Storage URL or standard HTTPS image: preserved as-is.
 * - If Dropbox: replaces dl=0 with raw=1.
 */
export function normalizeImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('/api/proxy-image')) {
    return trimmed;
  }

  // Google Drive & legacy googleusercontent check
  if (isGoogleDriveUrl(trimmed)) {
    const fileId = extractGoogleDriveFileId(trimmed);
    if (fileId) {
      return `/api/proxy-image?id=${fileId}`;
    }
  }

  // Dropbox share link normalization (?dl=0 -> ?raw=1)
  if (trimmed.includes('dropbox.com') && trimmed.includes('dl=0')) {
    return trimmed.replace('dl=0', 'raw=1');
  }

  return trimmed;
}

/**
 * Returns alternative fallback URLs for a given image URL if the primary fails to load.
 */
export function getAlternativeImageUrls(url?: string | null): string[] {
  return getImagePreviewUrls(url);
}

/**
 * Resolves the source URL for a gallery item based on strict priority:
 * 1. item.imageUrl (primary source)
 * 2. item.images[0] (first element of images array if available)
 * 3. item.coverUrl (optional cover / fallback)
 */
export function getGallerySourceUrl(item?: {
  imageUrl?: string | null;
  images?: string[] | null;
  coverUrl?: string | null;
} | null): string | null {
  if (!item) return null;

  // PRIORITY 1: imageUrl
  if (typeof item.imageUrl === 'string' && item.imageUrl.trim()) {
    return item.imageUrl.trim();
  }

  // PRIORITY 2: images[0]
  if (Array.isArray(item.images) && item.images.length > 0) {
    const first = item.images[0];
    if (typeof first === 'string' && first.trim()) {
      return first.trim();
    }
  }

  // PRIORITY 3: coverUrl
  if (typeof item.coverUrl === 'string' && item.coverUrl.trim()) {
    return item.coverUrl.trim();
  }

  return null;
}


