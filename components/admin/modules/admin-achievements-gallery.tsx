'use client';

import React, { useState } from 'react';
import {
  Trophy,
  Image as ImageIcon,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Calendar,
  Medal,
} from 'lucide-react';
import { AchievementItem, GalleryItem } from '@/types';
import { normalizeImageUrl, isGoogleDriveUrl, getImagePreviewUrls } from '@/lib/image-utils';
import {
  getAllAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} from '@/services/achievement.service';
import {
  getAllGalleries,
  createGallery,
  updateGallery,
  deleteGallery,
} from '@/services/gallery.service';
import { FileUploadField } from '../ui/file-upload-field';

interface AdminAchievementsGalleryProps {
  initialAchievements: AchievementItem[];
  initialGalleries: GalleryItem[];
}

export function AdminAchievementsGallery({
  initialAchievements,
  initialGalleries,
}: AdminAchievementsGalleryProps) {
  const [activeTab, setActiveTab] = useState<'achievements' | 'gallery'>('achievements');
  const [achievements, setAchievements] = useState<AchievementItem[]>(initialAchievements);
  const [galleries, setGalleries] = useState<GalleryItem[]>(initialGalleries);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Achievement Modal
  const [achModalOpen, setAchModalOpen] = useState(false);
  const [editingAch, setEditingAch] = useState<AchievementItem | null>(null);
  const [achForm, setAchForm] = useState<Partial<AchievementItem>>({
    title: '',
    recipient: '',
    rank: 'Juara 1',
    level: 'Nasional',
    year: '2026',
    category: 'Akademik',
    organizer: 'Kemendikbudristek RI',
    imageUrl: 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=800&q=80',
    description: '',
  });

  // Gallery Modal
  const [galModalOpen, setGalModalOpen] = useState(false);
  const [editingGal, setEditingGal] = useState<GalleryItem | null>(null);
  const [galForm, setGalForm] = useState<Partial<GalleryItem>>({
    title: '',
    description: '',
    category: 'Kegiatan Sekolah',
    imageUrl: '',
    date: new Date().toISOString().split('T')[0],
  });

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  // --- ACHIEVEMENT HANDLERS ---
  const handleOpenAchModal = (item?: AchievementItem) => {
    if (item) {
      setEditingAch(item);
      setAchForm(item);
    } else {
      setEditingAch(null);
      setAchForm({
        title: '',
        recipient: '',
        rank: 'Juara 1',
        level: 'Nasional',
        year: '2026',
        category: 'Akademik',
        organizer: 'Kemendikbudristek',
        imageUrl: 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=800&q=80',
        description: '',
      });
    }
    setAchModalOpen(true);
  };

  const handleSaveAch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!achForm.title?.trim() || !achForm.recipient?.trim()) return;

    setLoading(true);
    try {
      const payload: Omit<AchievementItem, 'id'> = {
        title: achForm.title.trim(),
        recipient: achForm.recipient.trim(),
        studentName: achForm.recipient.trim(),
        competitionName: achForm.title.trim(),
        rank: achForm.rank || 'Juara 1',
        level: (achForm.level as any) || 'Nasional',
        year: achForm.year || '2026',
        category: achForm.category || 'Akademik',
        organizer: achForm.organizer || 'Penyelenggara Resmi',
        imageUrl: achForm.imageUrl || 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=800&q=80',
        description: achForm.description?.trim() || '',
        createdAt: editingAch?.createdAt || new Date().toISOString(),
      };

      if (editingAch) {
        await updateAchievement(editingAch.id, payload);
        setAchievements((prev) => prev.map((a) => (a.id === editingAch.id ? { ...payload, id: editingAch.id } : a)));
        showNotice('Prestasi berhasil diperbarui.');
      } else {
        const id = await createAchievement(payload);
        setAchievements((prev) => [{ ...payload, id: id || `ach-${Date.now()}` }, ...prev]);
        showNotice('Prestasi baru berhasil ditambahkan.');
      }
      setAchModalOpen(false);
    } catch (err: any) {
      console.error(err);
      showNotice('Gagal menyimpan prestasi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAch = async (id: string, title: string) => {
    if (!confirm(`Hapus catatan prestasi "${title}"?`)) return;
    try {
      await deleteAchievement(id);
      setAchievements((prev) => prev.filter((a) => a.id !== id));
      showNotice('Prestasi telah dihapus.');
    } catch (err: any) {
      console.error(err);
      showNotice('Gagal menghapus prestasi.');
    }
  };

  // --- GALLERY HANDLERS ---
  const handleOpenGalModal = (item?: GalleryItem) => {
    if (item) {
      setEditingGal(item);
      setGalForm({
        ...item,
        imageUrl: item.imageUrl || item.coverUrl || (item.images && item.images[0]) || '',
      });
    } else {
      setEditingGal(null);
      setGalForm({
        title: '',
        description: '',
        category: 'Kegiatan Sekolah',
        imageUrl: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
    setGalModalOpen(true);
  };

  const handleSaveGal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galForm.title?.trim() || !galForm.imageUrl?.trim()) return;

    setLoading(true);
    try {
      const rawImg = galForm.imageUrl.trim();
      const payload: Omit<GalleryItem, 'id'> = {
        title: galForm.title.trim(),
        description: galForm.description?.trim() || '',
        category: galForm.category || 'Kegiatan Sekolah',
        imageUrl: rawImg,
        coverUrl: rawImg,
        images: [rawImg],
        status: 'published',
        date: galForm.date || new Date().toISOString().split('T')[0],
        createdAt: editingGal?.createdAt || new Date().toISOString(),
      };

      if (process.env.NODE_ENV !== 'production' || typeof window !== 'undefined') {
        console.info('[GalleryAdmin] SAVE Gallery');
        console.info('[GalleryAdmin] mode:', editingGal ? `UPDATE (${editingGal.id})` : 'CREATE (new)');
        console.info('[GalleryAdmin] title:', payload.title);
        console.info('[GalleryAdmin] imageUrl:', payload.imageUrl);
        console.info('[GalleryAdmin] coverUrl:', payload.coverUrl);
        console.info('[GalleryAdmin] images:', payload.images);
        console.info('[GalleryAdmin] status:', payload.status);
      }

      if (editingGal) {
        await updateGallery(editingGal.id, payload);
        setGalleries((prev) => prev.map((g) => (g.id === editingGal.id ? { ...payload, id: editingGal.id } : g)));
        showNotice('Dokumentasi galeri berhasil diperbarui.');
      } else {
        const id = await createGallery(payload);
        setGalleries((prev) => [{ ...payload, id: id || `gal-${Date.now()}` }, ...prev]);
        showNotice('Foto dokumentasi berhasil ditambahkan.');
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('school-cms-updated', { detail: { module: 'gallery' } }));
      }
      setGalModalOpen(false);
    } catch (err: any) {
      console.error('[GalleryAdmin] Error saving gallery:', err);
      showNotice('Gagal menyimpan galeri: ' + (err.message || 'Terjadi kesalahan sistem'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGal = async (id: string, title: string) => {
    if (!confirm(`Hapus dokumentasi foto "${title}"?`)) return;
    try {
      await deleteGallery(id);
      setGalleries((prev) => prev.filter((g) => g.id !== id));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('school-cms-updated', { detail: { module: 'gallery' } }));
      }
      showNotice('Foto galeri telah dihapus.');
    } catch (err: any) {
      console.error(err);
      showNotice('Gagal menghapus foto.');
    }
  };

  const filteredAch = achievements.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.recipient ? a.recipient.toLowerCase().includes(search.toLowerCase()) : false) ||
      (a.level ? a.level.toLowerCase().includes(search.toLowerCase()) : false)
  );

  const filteredGal = galleries.filter(
    (g) =>
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">Manajemen Prestasi &amp; Galeri Foto</h2>
          </div>
          <p className="text-xs text-slate-500">
            Publikasikan piala kejuaraan siswa-siswi serta dokumentasi momen kegiatan kesiswaan.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeTab === 'achievements' ? (
            <button
              onClick={() => handleOpenAchModal()}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Prestasi Juara</span>
            </button>
          ) : (
            <button
              onClick={() => handleOpenGalModal()}
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Unggah Foto Galeri</span>
            </button>
          )}
        </div>
      </div>

      {notice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'achievements'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Prestasi Kejuaraan ({achievements.length})
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'gallery'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Galeri Foto Dokumentasi ({galleries.length})
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari prestasi, penerima, atau kegiatan..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
          />
        </div>
      </div>

      {/* TAB 1: PRESTASI */}
      {activeTab === 'achievements' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Nama Prestasi / Kejuaraan</th>
                  <th className="px-4 py-3.5">Siswa / Tim Penerima</th>
                  <th className="px-4 py-3.5">Peringkat &amp; Tingkat</th>
                  <th className="px-4 py-3.5">Tahun</th>
                  <th className="px-4 py-3.5">Penyelenggara</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAch.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      Belum ada data capaian prestasi yang tersimpan.
                    </td>
                  </tr>
                ) : (
                  filteredAch.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200"
                          />
                          <p className="font-bold text-slate-900 max-w-xs">{item.title}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-800">{item.recipient || '-'}</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-200">
                          {item.rank || 'Juara'} {item.level ? `• ${item.level}` : ''}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">{item.year || '-'}</td>
                      <td className="px-4 py-3.5 text-slate-500">{item.organizer || '-'}</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenAchModal(item)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAch(item.id, item.title)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: GALERI */}
      {activeTab === 'gallery' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredGal.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between group"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getImagePreviewUrls(item.imageUrl)[0] || item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const candidates = getImagePreviewUrls(item.imageUrl);
                    const currentAttempt = parseInt(target.dataset.attempt || '0', 10);
                    const nextAttempt = currentAttempt + 1;

                    if (nextAttempt < candidates.length) {
                      target.dataset.attempt = nextAttempt.toString();
                      target.src = candidates[nextAttempt];
                    } else {
                      target.onerror = null;
                      target.src = 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80';
                    }
                  }}
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                  {item.category}
                </span>
              </div>
              <div className="p-3 space-y-1">
                <p className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</p>
                <p className="text-[10px] text-slate-500">{item.date}</p>
              </div>
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-1">
                <button
                  onClick={() => handleOpenGalModal(item)}
                  className="p-1 rounded text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteGal(item.id, item.title)}
                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL EDIT / TAMBAH PRESTASI */}
      {achModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {editingAch ? 'Edit Catatan Prestasi' : 'Tambah Prestasi Baru'}
              </h3>
              <button onClick={() => setAchModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAch} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kejuaraan / Lomba</label>
                <input
                  type="text"
                  required
                  value={achForm.title}
                  onChange={(e) => setAchForm({ ...achForm, title: e.target.value })}
                  placeholder="e.g. Olimpiade Sains Nasional (OSN) Bidang Fisika"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Siswa / Tim Penerima</label>
                <input
                  type="text"
                  required
                  value={achForm.recipient}
                  onChange={(e) => setAchForm({ ...achForm, recipient: e.target.value })}
                  placeholder="e.g. Rizky Pratama (Kelas XII MIPA 1)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Peringkat / Gelar</label>
                  <input
                    type="text"
                    value={achForm.rank}
                    onChange={(e) => setAchForm({ ...achForm, rank: e.target.value })}
                    placeholder="Juara 1 / Emas"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat</label>
                  <select
                    value={achForm.level}
                    onChange={(e) => setAchForm({ ...achForm, level: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Kota">Kota / Kab</option>
                    <option value="Provinsi">Provinsi</option>
                    <option value="Nasional">Nasional</option>
                    <option value="Internasional">Internasional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Perolehan</label>
                  <input
                    type="text"
                    value={achForm.year}
                    onChange={(e) => setAchForm({ ...achForm, year: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lembaga Penyelenggara</label>
                <input
                  type="text"
                  value={achForm.organizer}
                  onChange={(e) => setAchForm({ ...achForm, organizer: e.target.value })}
                  placeholder="Kementerian Pendidikan, Riset, dan Teknologi"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <FileUploadField
                label="Foto Piagam / Dokumentasi Prestasi"
                value={achForm.imageUrl || ''}
                onChange={(url) => setAchForm({ ...achForm, imageUrl: url })}
                folder="gallery"
                placeholder="https://... atau unggah foto piagam"
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAchModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-colors"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Prestasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT / TAMBAH FOTO GALERI */}
      {galModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {editingGal ? 'Edit Foto Galeri' : 'Tambah Foto Dokumentasi Baru'}
              </h3>
              <button onClick={() => setGalModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGal} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Dokumentasi</label>
                <input
                  type="text"
                  required
                  value={galForm.title}
                  onChange={(e) => setGalForm({ ...galForm, title: e.target.value })}
                  placeholder="e.g. Upacara Peringatan Hari Kemerdekaan RI"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Kegiatan</label>
                  <select
                    value={galForm.category}
                    onChange={(e) => setGalForm({ ...galForm, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Kegiatan Sekolah">Kegiatan Sekolah</option>
                    <option value="Upacara & Apel">Upacara &amp; Apel</option>
                    <option value="Ekstrakurikuler">Ekstrakurikuler</option>
                    <option value="Prestasi & Lomba">Prestasi &amp; Lomba</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Kegiatan</label>
                  <input
                    type="date"
                    value={galForm.date}
                    onChange={(e) => setGalForm({ ...galForm, date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <FileUploadField
                label="Foto Dokumentasi (Gambar Resolusi Tinggi)"
                value={galForm.imageUrl || ''}
                onChange={(url) => setGalForm({ ...galForm, imageUrl: url })}
                folder="gallery"
                placeholder="https://... atau unggah foto dokumentasi"
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md transition-colors"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Foto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
