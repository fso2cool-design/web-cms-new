'use client';

import React, { useState, useRef } from 'react';
import { Upload, Check, AlertCircle, Loader2, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { uploadFileToStorage } from '@/lib/firebase/storage';
import {
  isGoogleDriveUrl,
  extractGoogleDriveFileId,
  getImagePreviewUrls,
} from '@/lib/image-utils';

interface FileUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: 'news' | 'gallery' | 'teachers' | 'facilities' | 'extracurriculars' | 'documents' | 'school';
  accept?: string;
  helperText?: string;
  placeholder?: string;
  isVideo?: boolean;
}

export function FileUploadField({
  label,
  value,
  onChange,
  folder,
  accept = 'image/*',
  helperText,
  placeholder = 'https://... atau unggah file langsung',
}: FileUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Derive candidates based on value directly
  const trimmedValue = (value || '').trim();
  const isDrive = isGoogleDriveUrl(trimmedValue);
  const driveFileId = isDrive ? extractGoogleDriveFileId(trimmedValue) : null;
  const isInvalidDrive = isDrive && !driveFileId;
  const candidateUrls = trimmedValue ? getImagePreviewUrls(trimmedValue) : [];

  // Track attempts and status per input value
  const [currentUrlValue, setCurrentUrlValue] = useState(trimmedValue);
  const [attemptIndex, setAttemptIndex] = useState(0);
  const [hasFailedAll, setHasFailedAll] = useState(false);
  const [isLoadedSuccess, setIsLoadedSuccess] = useState(false);

  // If value prop changes externally or via typing, adjust attempt index during render
  if (trimmedValue !== currentUrlValue) {
    setCurrentUrlValue(trimmedValue);
    setAttemptIndex(0);
    setHasFailedAll(false);
    setIsLoadedSuccess(false);
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewSrc = candidateUrls.length > 0 && attemptIndex < candidateUrls.length
    ? candidateUrls[attemptIndex]
    : '';

  const imageLoadError = isInvalidDrive || hasFailedAll || (!isDrive && hasFailedAll);
  const imageLoaded = isLoadedSuccess && !imageLoadError;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadFileToStorage(file, folder, (pct) => {
        setProgress(pct);
      });
      onChange(result.url);
    } catch (err: any) {
      console.error('[UploadField] Error:', err);
      setError(err.message || 'Gagal mengunggah file. Periksa koneksi atau izin autentikasi.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    onChange(raw);
  };

  const handleImageError = () => {
    if (candidateUrls.length > 0 && attemptIndex < candidateUrls.length - 1) {
      const nextIdx = attemptIndex + 1;
      console.info(`[Gallery] Trying fallback [${nextIdx + 1}/${candidateUrls.length}]:`, candidateUrls[nextIdx]);
      setAttemptIndex(nextIdx);
    } else {
      console.warn(`[Gallery] Image failed after all ${candidateUrls.length} attempts:`, trimmedValue);
      setHasFailedAll(true);
      setIsLoadedSuccess(false);
    }
  };

  const isImageFile = accept.includes('image') || (!trimmedValue.endsWith('.pdf') && !trimmedValue.endsWith('.doc'));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">{label}</label>
        {value && !imageLoadError && imageLoaded && (
          <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
            <Check className="w-3 h-3" /> Gambar Valid &amp; Siap Tampil
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value || ''}
          onChange={handleUrlInput}
          placeholder={placeholder}
          className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 disabled:opacity-60 shadow-xs"
          title="Upload file langsung ke Cloud Storage (Disarankan)"
        >
          {uploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              <span>{progress}%</span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5 text-white" />
              <span>Upload dari Perangkat</span>
            </>
          )}
        </button>
      </div>

      {uploading && (
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-600 h-1.5 rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && (
        <p className="text-[11px] text-rose-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Live Preview & Verification Box */}
      {value && isImageFile && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
              Pratinjau Gambar Langsung:
            </span>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>Buka Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="relative w-full h-36 bg-slate-200 rounded-lg overflow-hidden flex items-center justify-center border border-slate-300/80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={`preview-${attemptIndex}-${previewSrc || value}`}
              src={previewSrc || value}
              alt="Pratinjau input"
              className={`w-full h-full object-contain transition-opacity duration-200 ${
                imageLoadError ? 'hidden' : 'block'
              }`}
              onLoad={() => {
                setIsLoadedSuccess(true);
                setHasFailedAll(false);
              }}
              onError={handleImageError}
            />

            {imageLoadError && (
              <div className="p-3 text-center text-rose-700 space-y-1">
                <AlertCircle className="w-6 h-6 mx-auto text-rose-500" />
                <p className="text-xs font-semibold">
                  {isInvalidDrive
                    ? 'URL Google Drive tidak valid (File ID tidak ditemukan).'
                    : 'URL gambar tidak dapat dimuat oleh browser.'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {isDrive
                    ? 'Pastikan opsi berbagi file disetel ke "Siapa saja yang memiliki link" (Anyone with the link -> Viewer), atau gunakan tombol hijau "Upload dari Perangkat".'
                    : 'Pastikan link merupakan direct image URL atau gunakan tombol hijau "Upload dari Perangkat".'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {helperText ? (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      ) : (
        <p className="text-[11px] text-slate-500">
          Metode utama: <strong>Upload dari Perangkat</strong> (Firebase Storage). Mendukung juga link langsung (HTTPS / Google Drive publik).{' '}
          {isDrive && driveFileId && (
            <span className="text-emerald-600 font-semibold">✓ Link Google Drive terdeteksi (ID: {driveFileId.slice(0, 8)}...)</span>
          )}
          {isInvalidDrive && (
            <span className="text-rose-600 font-semibold">⚠ Format URL Google Drive tidak dikenali</span>
          )}
        </p>
      )}
    </div>
  );
}

