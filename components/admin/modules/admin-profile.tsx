'use client';

import React, { useState } from 'react';
import {
  Building2,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  User,
  Image as ImageIcon,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { SchoolProfile } from '@/types';
import { updateSchoolProfile } from '@/services/school.service';
import { normalizeImageUrl, isGoogleDriveUrl } from '@/lib/image-utils';
import { FileUploadField } from '../ui/file-upload-field';

interface AdminProfileProps {
  schoolProfile: SchoolProfile;
  onProfileUpdated: (updated: SchoolProfile) => void;
}

export function AdminProfile({ schoolProfile, onProfileUpdated }: AdminProfileProps) {
  const [formData, setFormData] = useState<SchoolProfile>(schoolProfile);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 9 Categories
  type TabType = 'identity' | 'contact' | 'vision' | 'principal' | 'organization' | 'stats' | 'curriculum' | 'ppdb_ekskul' | 'settings';
  const [activeSubTab, setActiveSubTab] = useState<TabType>('identity');

  const handleChange = (field: keyof SchoolProfile, value: any) => {
    let finalValue = value;
    if (typeof value === 'string' && (field === 'logoUrl' || field === 'principalPhoto' || field === 'organizationChartUrl')) {
      finalValue = normalizeImageUrl(value);
    }
    setFormData((prev) => ({ ...prev, [field]: finalValue }));
    setSuccess(false);
  };

  const handleFeatureToggle = (featureKey: keyof NonNullable<SchoolProfile['features']>) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...(prev.features || {
          ppdbEnabled: true,
          galleryEnabled: true,
          documentsEnabled: true,
          faqEnabled: true,
          alumniEnabled: true,
        }),
        [featureKey]: !prev.features?.[featureKey],
      },
    }));
    setSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await updateSchoolProfile(formData);
      onProfileUpdated(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      console.error('Failed to update school profile:', err);
      setError('Gagal menyimpan profil sekolah: ' + (err.message || 'Kesalahan sistem'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">Manajemen Identitas &amp; Profil Sekolah</h2>
          </div>
          <p className="text-xs text-slate-500">
            Perbarui data kelembagaan, visi misi, profil kepala sekolah, kontak, dan statistik resmi.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profil sekolah berhasil diperbarui dan disinkronkan ke basis data!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs - 9 Categories */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'identity', label: '1. Identitas Lembaga' },
          { id: 'contact', label: '2. Kontak & Lokasi' },
          { id: 'vision', label: '3. Visi, Misi & Sejarah' },
          { id: 'principal', label: '4. Kepala Sekolah' },
          { id: 'organization', label: '5. Struktur Organisasi' },
          { id: 'stats', label: '6. Statistik & Data' },
          { id: 'curriculum', label: '7. Kurikulum & Akademik' },
          { id: 'ppdb_ekskul', label: '8. PPDB & Jalur' },
          { id: 'settings', label: '9. Pengaturan Portal & Tautan' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSubTab(tab.id as TabType)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUB TAB 1: IDENTITAS */}
      {activeSubTab === 'identity' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 animate-in fade-in">
          <h3 className="text-sm font-bold text-emerald-900 border-b border-slate-100 pb-2">
            Identitas Resmi Sekolah
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Lengkap Sekolah</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Singkat / Panggilan</label>
              <input
                type="text"
                required
                value={formData.shortName}
                onChange={(e) => handleChange('shortName', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">NPSN</label>
              <input
                type="text"
                required
                value={formData.npsn}
                onChange={(e) => handleChange('npsn', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">NSS (Opsional)</label>
              <input
                type="text"
                value={formData.nss || ''}
                onChange={(e) => handleChange('nss', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Peringkat Akreditasi</label>
              <select
                value={formData.accreditation}
                onChange={(e) => handleChange('accreditation', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="A (Unggul)">A (Unggul)</option>
                <option value="B (Baik)">B (Baik)</option>
                <option value="C (Cukup)">C (Cukup)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tahun Berdiri Lembaga</label>
              <input
                type="text"
                value={formData.establishedYear || ''}
                onChange={(e) => handleChange('establishedYear', e.target.value)}
                placeholder="e.g. 1982 atau 1985"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Bentuk Pendidikan (Jenjang &amp; Status)</label>
              <input
                type="text"
                value={formData.educationLevel || ''}
                onChange={(e) => handleChange('educationLevel', e.target.value)}
                placeholder="e.g. SMA / Negeri atau Madrasah Aliyah / Negeri"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none mb-1.5"
              />
              <div className="flex flex-wrap gap-1">
                {['SMA / Negeri', 'Madrasah Aliyah / Negeri', 'SMK / Negeri', 'SMP / Negeri'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleChange('educationLevel', chip)}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-100 text-slate-700 transition-colors"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Slogan / Motto Utama</label>
              <input
                type="text"
                value={formData.slogan}
                onChange={(e) => handleChange('slogan', e.target.value)}
                placeholder="e.g. Unggul dalam Prestasi, Santun dalam Budi Pekerti"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tagline (Opsional)</label>
              <input
                type="text"
                value={formData.tagline || ''}
                onChange={(e) => handleChange('tagline', e.target.value)}
                placeholder="Tagline singkat opsional"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
            <div>
              <FileUploadField
                label="Logo Resmi Sekolah"
                value={formData.logoUrl || ''}
                onChange={(url) => handleChange('logoUrl', url)}
                folder="school"
                placeholder="https://... atau unggah file logo"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Status Keunggulan / Sub-Badge</label>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">Tampil di Hero &amp; Bar</span>
              </div>
              <input
                type="text"
                value={formData.excellenceBadge || ''}
                onChange={(e) => handleChange('excellenceBadge', e.target.value)}
                placeholder="e.g. Sekolah Penggerak Mandiri Berbagi / Madrasah Riset & Unggul"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none mb-2"
              />
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Sekolah Penggerak Mandiri Berbagi',
                  'Madrasah Mandiri Berprestasi',
                  'Madrasah Riset & Keterampilan',
                  'Sekolah Adiwiyata Mandiri',
                  'Sekolah Ramah Anak',
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleChange('excellenceBadge', chip)}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-100 text-slate-700 transition-colors"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Deskripsi Singkat Lembaga (Tampil di Hero &amp; Footer Portal)
            </label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Deskripsi profil singkat sekolah..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* SUB TAB 2: KONTAK & LOKASI */}
      {activeSubTab === 'contact' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 animate-in fade-in">
          <h3 className="text-sm font-bold text-emerald-900 border-b border-slate-100 pb-2">
            Informasi Kontak &amp; Lokasi Sekolah
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Alamat Lengkap Sekolah</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Resmi</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Nomor Telepon Kantor</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">No. WhatsApp Resmi (Helpdesk)</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                placeholder="6281234567890"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Jam Operasional Kantor Tata Usaha
              </label>
              <input
                type="text"
                value={formData.operatingHours || ''}
                onChange={(e) => handleChange('operatingHours', e.target.value)}
                placeholder="e.g. Senin - Jumat: 07.00 - 15.30 WIT"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Website Utama (Jika ada domain lain)
              </label>
              <input
                type="text"
                value={formData.website || ''}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          
          <div>
             <label className="block text-xs font-bold text-slate-700 mb-1.5">URL Google Maps (Opsional)</label>
             <input
               type="text"
               value={formData.googleMapsUrl || ''}
               onChange={(e) => handleChange('googleMapsUrl', e.target.value)}
               placeholder="https://maps.google.com/..."
               className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
             />
          </div>
        </div>
      )}

      {/* SUB TAB 3: VISI, MISI, SEJARAH */}
      {activeSubTab === 'vision' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 animate-in fade-in">
          <h3 className="text-sm font-bold text-emerald-900 border-b border-slate-100 pb-2">
            Visi, Misi, dan Ringkasan Sejarah
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Visi Sekolah</label>
            <textarea
              rows={3}
              value={formData.vision}
              onChange={(e) => handleChange('vision', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Misi Sekolah (Pisahkan per baris untuk tiap poin misi)
            </label>
            <textarea
              rows={5}
              value={formData.mission}
              onChange={(e) => handleChange('mission', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Sejarah Pendirian Lembaga</label>
            <textarea
              rows={4}
              value={formData.history}
              onChange={(e) => handleChange('history', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* SUB TAB 4: KEPALA SEKOLAH */}
      {activeSubTab === 'principal' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 animate-in fade-in">
          <h3 className="text-sm font-bold text-emerald-900 border-b border-slate-100 pb-2">
            Profil &amp; Sambutan Kepala Sekolah
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Lengkap Kepala Sekolah</label>
              <input
                type="text"
                value={formData.principalName}
                onChange={(e) => handleChange('principalName', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <FileUploadField
                label="Foto Formal Kepala Sekolah"
                value={formData.principalPhoto || ''}
                onChange={(url) => handleChange('principalPhoto', url)}
                folder="teachers"
                placeholder="https://... atau unggah foto kepala sekolah"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">NIP Kepala Sekolah</label>
              <input
                type="text"
                value={formData.principalNip || ''}
                onChange={(e) => handleChange('principalNip', e.target.value)}
                placeholder="e.g. 19750812 200003 1 004"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Kualifikasi / Gelar Pendidikan Terakhir</label>
              <input
                type="text"
                value={formData.principalEducation || ''}
                onChange={(e) => handleChange('principalEducation', e.target.value)}
                placeholder="e.g. Magister Pendidikan Universitas Indonesia"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Teks Sambutan Kepala Sekolah</label>
            <textarea
              rows={6}
              value={formData.principalSpeech}
              onChange={(e) => handleChange('principalSpeech', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* SUB TAB 5: STRUKTUR ORGANISASI */}
      {activeSubTab === 'organization' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 animate-in fade-in">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-emerald-900">
              Bagan Struktur Organisasi Sekolah
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Atur gambar bagan struktur kepemimpinan resmi sekolah untuk ditampilkan pada modal publik.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <FileUploadField
                label="Bagan Struktur Organisasi Resmi (JPG / PNG / WebP / PDF)"
                value={formData.organizationChartUrl || ''}
                onChange={(url) => handleChange('organizationChartUrl', url)}
                folder="school"
                placeholder="https://... atau unggah gambar bagan struktur"
                helperText="Upload gambar bagan resolusi tinggi. Jika dikosongkan, website otomatis menampilkan diagram standar."
              />
            </div>

            {/* Pratinjau Tampilan */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-700 block mb-2">Pratinjau Status Bagan Struktur:</span>
              {formData.organizationChartUrl ? (
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                      Gambar Bagan Aktif
                    </span>
                    <a
                      href={formData.organizationChartUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-700 hover:underline font-semibold"
                    >
                      Buka di Tab Baru ↗
                    </a>
                  </div>
                  <div className="max-h-96 overflow-auto rounded-xl border border-slate-200 bg-white p-2 text-center">
                    <img
                      src={formData.organizationChartUrl}
                      alt="Pratinjau Bagan Struktur Organisasi"
                      className="max-h-80 mx-auto object-contain rounded-lg shadow-2xs"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto text-base">
                    🏛️
                  </div>
                  <p className="text-xs font-bold text-slate-700">Diagram Hirarki Standar Aktif</p>
                  <p className="text-[11px] text-slate-500 max-w-md mx-auto leading-relaxed">
                    Belum ada gambar khusus. Pengunjung akan melihat diagram hirarki dengan struktur standar.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 6: STATISTIK */}
      {activeSubTab === 'stats' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 animate-in fade-in">
          <h3 className="text-sm font-bold text-emerald-900 border-b border-slate-100 pb-2">
            Statistik Pokok Pendidikan (Ditampilkan di Hero Portal)
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Jumlah Siswa Aktif</label>
              <input
                type="number"
                value={formData.studentCount || 0}
                onChange={(e) => handleChange('studentCount', Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Jumlah Tenaga Pendidik</label>
              <input
                type="number"
                value={formData.teacherCount || 0}
                onChange={(e) => handleChange('teacherCount', Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Jumlah Rombongan Belajar</label>
              <input
                type="number"
                value={formData.classCount || 0}
                onChange={(e) => handleChange('classCount', Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tingkat Kelulusan</label>
              <input
                type="text"
                value={formData.graduationRate || ''}
                onChange={(e) => handleChange('graduationRate', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 7: KURIKULUM & AKADEMIK */}
      {activeSubTab === 'curriculum' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-emerald-900">
              Ringkasan Kurikulum &amp; 3 Pilar Pembelajaran
            </h3>
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
              Tampil di Tab Kurikulum Publik
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Ikhtisar Pendekatan Kurikulum
            </label>
            <textarea
              rows={2}
              value={formData.curriculumOverview || ''}
              onChange={(e) => handleChange('curriculumOverview', e.target.value)}
              placeholder="e.g. Menerapkan Kurikulum Merdeka secara mandiri berbagi..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                1. Rincian Intrakurikuler
              </label>
              <textarea
                rows={3}
                value={formData.curriculumDetails?.intrakurikuler || ''}
                onChange={(e) =>
                  handleChange('curriculumDetails', {
                    ...formData.curriculumDetails,
                    intrakurikuler: e.target.value,
                  })
                }
                placeholder="Mata pelajaran umum dan pilihan..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                2. Kokurikuler (P5 / Karakter)
              </label>
              <textarea
                rows={3}
                value={formData.curriculumDetails?.kokurikuler || ''}
                onChange={(e) =>
                  handleChange('curriculumDetails', {
                    ...formData.curriculumDetails,
                    kokurikuler: e.target.value,
                  })
                }
                placeholder="Tema projek penguatan karakter / P5 / P2RA..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                3. Rincian Ekstrakurikuler
              </label>
              <textarea
                rows={3}
                value={formData.curriculumDetails?.ekstrakurikuler || ''}
                onChange={(e) =>
                  handleChange('curriculumDetails', {
                    ...formData.curriculumDetails,
                    ekstrakurikuler: e.target.value,
                  })
                }
                placeholder="Pengembangan minat bakat, keagamaan, kepramukaan..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 8: PPDB & JALUR */}
      {activeSubTab === 'ppdb_ekskul' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 animate-in fade-in">
          <h3 className="text-sm font-bold text-emerald-900 border-b border-slate-100 pb-2">
            Pengaturan Pendaftaran Peserta Didik Baru (PPDB)
          </h3>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Tahun Ajaran PPDB Aktif</label>
              <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded">Navbar &amp; PPDB Banner</span>
            </div>
            <input
              type="text"
              value={formData.ppdbYear || ''}
              onChange={(e) => handleChange('ppdbYear', e.target.value)}
              placeholder="e.g. 2026/2027"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none mb-2"
            />
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Tahun ajaran ini otomatis sinkron ke badge topbar navbar, tombol pendaftaran, dan banner ajakan PPDB di beranda.
            </p>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Jalur Pendaftaran PPDB (pisahkan dengan koma)</label>
            <textarea
              rows={2}
              value={formData.ppdbTracks?.join(', ') || ''}
              onChange={(e) => handleChange('ppdbTracks', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))}
              placeholder="e.g. Zonasi, Afirmasi, Prestasi Akademik, Prestasi Non-Akademik"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Daftar jalur pendaftaran yang bisa dipilih calon siswa baru pada saat mengisi formulir pendaftaran.
            </p>
          </div>
        </div>
      )}

      {/* SUB TAB 9: PENGATURAN PORTAL & TAUTAN */}
      {activeSubTab === 'settings' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 animate-in fade-in">
          <h3 className="text-sm font-bold text-emerald-900 border-b border-slate-100 pb-2">
            Saklar Fitur &amp; Modul Portal Publik
          </h3>

          <div className="space-y-4">
            {[
              { key: 'ppdbEnabled', label: 'Modul PPDB Online (Pendaftaran & Cek Status)', desc: 'Aktifkan banner pendaftaran dan formulir pendaftaran siswa baru' },
              { key: 'galleryEnabled', label: 'Modul Galeri Dokumentasi Foto Kegiatan', desc: 'Tampilkan album foto dan kegiatan kesiswaan di portal' },
              { key: 'documentsEnabled', label: 'Modul Pusat Unduhan Dokumen Publik', desc: 'Beri izin publik mengunduh berkas, formulir, dan kalender pendidikan' },
              { key: 'faqEnabled', label: 'Modul Tanya Jawab Publik (FAQ)', desc: 'Tampilkan daftar pertanyaan yang sering diajukan di beranda' },
            ].map((f) => {
              const isChecked = formData.features?.[f.key as keyof NonNullable<SchoolProfile['features']>] ?? true;
              return (
                <div key={f.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">{f.label}</p>
                    <p className="text-[11px] text-slate-500">{f.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFeatureToggle(f.key as any)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                      isChecked ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                        isChecked ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-emerald-900">
                  Tautan Resmi Footer (Portal Kementerian &amp; Lembaga)
                </h3>
                <p className="text-xs text-slate-500">
                  Sesuaikan daftar tautan resmi di bagian footer website publik.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleChange('officialLinks', [
                      { title: 'Kementerian Agama RI', url: 'https://kemenag.go.id' },
                      { title: 'Portal EMIS Madrasah', url: 'https://emis.kemenag.go.id' },
                      { title: 'SIMPATIKA Kemenag', url: 'https://simpatika.kemenag.go.id' },
                      { title: 'Asesmen Nasional (ANBK)', url: 'https://anbk.kemdikbud.go.id' },
                    ]);
                  }}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg transition-colors border border-emerald-200"
                >
                  + Preset Kemenag
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleChange('officialLinks', [
                      { title: 'Kementerian Pendidikan', url: 'https://kemdikbud.go.id' },
                      { title: 'Portal Dapodikdasmen', url: 'https://dapo.kemdikbud.go.id' },
                      { title: 'Platform Merdeka Mengajar', url: 'https://guru.kemdikbud.go.id' },
                      { title: 'Pusat Prestasi Nasional', url: 'https://puspresnas.kemdikbud.go.id' },
                    ]);
                  }}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold rounded-lg transition-colors border border-blue-200"
                >
                  + Preset Kemdikbud
                </button>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              {(formData.officialLinks && formData.officialLinks.length > 0
                ? formData.officialLinks
                : [
                    { title: '', url: '' },
                  ]
              ).map((link, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      value={link.title}
                      onChange={(e) => {
                        const newLinks = [...(formData.officialLinks || [])];
                        if (!newLinks[idx]) newLinks[idx] = { title: '', url: '' };
                        newLinks[idx].title = e.target.value;
                        handleChange('officialLinks', newLinks);
                      }}
                      placeholder="Nama Tautan (e.g. Portal Dapodik)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => {
                        const newLinks = [...(formData.officialLinks || [])];
                        if (!newLinks[idx]) newLinks[idx] = { title: '', url: '' };
                        newLinks[idx].url = e.target.value;
                        handleChange('officialLinks', newLinks);
                      }}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newLinks = [...(formData.officialLinks || [])];
                      newLinks.splice(idx, 1);
                      handleChange('officialLinks', newLinks);
                    }}
                    className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-200"
                  >
                    Hapus
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  const newLinks = [...(formData.officialLinks || [])];
                  newLinks.push({ title: '', url: '' });
                  handleChange('officialLinks', newLinks);
                }}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-colors inline-block"
              >
                + Tambah Tautan
              </button>
            </div>
          </div>
          
          <div className="pt-6 mt-6 border-t border-slate-100">
             <div className="flex flex-col gap-1 border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-bold text-emerald-900">
                  Tautan Sosial Media
                </h3>
                <p className="text-xs text-slate-500">
                  Masukkan URL profil sosial media sekolah (Opsional).
                </p>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-slate-700 mb-1.5">Instagram</label>
                   <input
                      type="url"
                      value={formData.socialMedia?.instagram || ''}
                      onChange={(e) => handleChange('socialMedia', { ...formData.socialMedia, instagram: e.target.value })}
                      placeholder="https://instagram.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-700 mb-1.5">Facebook</label>
                   <input
                      type="url"
                      value={formData.socialMedia?.facebook || ''}
                      onChange={(e) => handleChange('socialMedia', { ...formData.socialMedia, facebook: e.target.value })}
                      placeholder="https://facebook.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-700 mb-1.5">YouTube</label>
                   <input
                      type="url"
                      value={formData.socialMedia?.youtube || ''}
                      onChange={(e) => handleChange('socialMedia', { ...formData.socialMedia, youtube: e.target.value })}
                      placeholder="https://youtube.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-700 mb-1.5">TikTok</label>
                   <input
                      type="url"
                      value={formData.socialMedia?.tiktok || ''}
                      onChange={(e) => handleChange('socialMedia', { ...formData.socialMedia, tiktok: e.target.value })}
                      placeholder="https://tiktok.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                </div>
             </div>
          </div>
        </div>
      )}
    </form>
  );
}
