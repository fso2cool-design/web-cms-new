'use client';

import React, { useState } from 'react';
import {
  Compass,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Calendar,
  User,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { ExtracurricularItem } from '@/types';
import {
  createExtracurricular,
  updateExtracurricular,
  deleteExtracurricular,
} from '@/services/extracurricular.service';
import { FileUploadField } from '../ui/file-upload-field';

interface AdminExtracurricularsProps {
  initialExtracurriculars: ExtracurricularItem[];
}

const CATEGORY_OPTIONS = [
  'Kepanduan & Bela Negara',
  'Sains & Teknologi',
  'Olahraga',
  'Seni & Budaya',
  'Bahasa & Komunikasi',
  'Kemanusiaan & Kesehatan',
  'Keagamaan',
  'Kewirausahaan & Keterampilan',
  'Lainnya',
];

export function AdminExtracurriculars({ initialExtracurriculars }: AdminExtracurricularsProps) {
  const [items, setItems] = useState<ExtracurricularItem[]>(initialExtracurriculars);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExtracurricularItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<ExtracurricularItem>>({
    name: '',
    category: 'Kepanduan & Bela Negara',
    mentor: '',
    schedule: '',
    description: '',
    photo: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&q=80',
    isActive: true,
  });

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleOpenModal = (item?: ExtracurricularItem) => {
    if (item) {
      setEditingItem(item);
      setForm({ ...item });
    } else {
      setEditingItem(null);
      setForm({
        name: '',
        category: 'Kepanduan & Bela Negara',
        mentor: '',
        schedule: 'Setiap Jumat, 15.00 - 17.00 WIB',
        description: '',
        photo: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&q=80',
        isActive: true,
      });
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) return;

    setLoading(true);
    try {
      const payload: Omit<ExtracurricularItem, 'id'> = {
        name: form.name.trim(),
        category: form.category || 'Lainnya',
        mentor: form.mentor?.trim() || 'Tim Pembina Sekolah',
        schedule: form.schedule?.trim() || 'Sesuai Jadwal Mingguan',
        description: form.description?.trim() || '',
        photo: form.photo?.trim() || 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&q=80',
        isActive: form.isActive ?? true,
      };

      if (editingItem) {
        await updateExtracurricular(editingItem.id, payload);
        setItems((prev) =>
          prev.map((it) => (it.id === editingItem.id ? { ...payload, id: editingItem.id } : it))
        );
        showNotice(`Ekstrakurikuler "${payload.name}" berhasil diperbarui.`);
      } else {
        const newId = await createExtracurricular(payload);
        setItems((prev) => [{ ...payload, id: newId || `extra-${Date.now()}` }, ...prev]);
        showNotice(`Ekstrakurikuler baru "${payload.name}" berhasil ditambahkan.`);
      }
      setModalOpen(false);
    } catch (err: any) {
      console.error(err);
      showNotice('Gagal menyimpan data: ' + (err.message || 'Kesalahan sistem'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (item: ExtracurricularItem) => {
    try {
      const updatedStatus = !item.isActive;
      await updateExtracurricular(item.id, { isActive: updatedStatus });
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, isActive: updatedStatus } : it))
      );
      showNotice(
        `Status ${item.name} diubah menjadi ${updatedStatus ? 'Aktif' : 'Non-Aktif'}.`
      );
    } catch (err: any) {
      console.error(err);
      showNotice('Gagal mengubah status kegiatan.');
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteExtracurricular(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
      setDeleteConfirmId(null);
      showNotice('Ekstrakurikuler telah berhasil dihapus.');
    } catch (err: any) {
      console.error(err);
      showNotice('Gagal menghapus data.');
    } finally {
      setLoading(false);
    }
  };

  // Metrics
  const totalCount = items.length;
  const activeCount = items.filter((i) => i.isActive).length;
  const inactiveCount = totalCount - activeCount;
  const categoriesCount = new Set(items.map((i) => i.category || 'Lainnya')).size;

  // Filtered
  const filtered = items.filter((it) => {
    const matchSearch =
      it.name.toLowerCase().includes(search.toLowerCase()) ||
      it.mentor.toLowerCase().includes(search.toLowerCase()) ||
      it.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || it.category === categoryFilter;
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && it.isActive) ||
      (statusFilter === 'inactive' && !it.isActive);
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">
              Pengelolaan Ekstrakurikuler &amp; Pengembangan Diri
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Kelola cabang ekstrakurikuler sekolah, pembina/pelatih, jadwal pembinaan, dan publikasi profil kegiatan.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Ekstrakurikuler</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Ekstrakurikuler</span>
          <p className="text-2xl font-black text-slate-900 mt-0.5">{totalCount}</p>
        </div>
        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-900 uppercase">Kegiatan Aktif</span>
          <p className="text-2xl font-black text-emerald-700 mt-0.5">{activeCount}</p>
        </div>
        <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-900 uppercase">Non-Aktif / Vakum</span>
          <p className="text-2xl font-black text-amber-700 mt-0.5">{inactiveCount}</p>
        </div>
        <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-900 uppercase">Bidang / Kategori</span>
          <p className="text-2xl font-black text-blue-700 mt-0.5">{categoriesCount}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama ekskul, pembina, kegiatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="all">Semua Kategori</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="active">Hanya Aktif</option>
            <option value="inactive">Hanya Non-Aktif</option>
          </select>
        </div>
      </div>

      {/* Items Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col"
          >
            <div className="h-44 bg-slate-100 relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.photo || 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&q=80'}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
                  {item.category || 'Umum'}
                </span>
              </div>

              <div className="absolute top-3 right-3">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(item)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-xs transition-colors flex items-center gap-1 ${
                    item.isActive
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-rose-600 text-white hover:bg-rose-700'
                  }`}
                  title="Klik untuk mengubah status aktif"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-emerald-200' : 'bg-rose-200'}`} />
                  <span>{item.isActive ? 'Aktif' : 'Vakum'}</span>
                </button>
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-white font-bold text-base leading-tight drop-shadow-sm">
                  {item.name}
                </h3>
              </div>
            </div>

            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <User className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="font-semibold text-slate-700 line-clamp-1">
                    Pembina: {item.mentor || 'Belum ditentukan'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="text-slate-600 line-clamp-1">{item.schedule || 'Jadwal fleksibel'}</span>
                </div>

                {item.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-1">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleOpenModal(item)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ubah</span>
                </button>
                <button
                  onClick={() => setDeleteConfirmId(item.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
          <Compass className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs text-slate-500">Tidak ada ekstrakurikuler yang sesuai dengan kriteria pencarian.</p>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingItem ? 'Edit Profil Ekstrakurikuler' : 'Tambah Ekstrakurikuler Baru'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Ekstrakurikuler *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pramuka, Klub Robotika, Futsal, Tari Tradisional..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bidang / Kategori *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium text-slate-800"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Aktivitas
                  </label>
                  <select
                    value={form.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setForm({ ...form, isActive: e.target.value === 'active' })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium text-slate-800"
                  >
                    <option value="active">🟢 Aktif &amp; Terbuka Pendaftaran</option>
                    <option value="inactive">🔴 Non-Aktif / Vakum Sementara</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Pembina / Pelatih
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Bambang Trianto, S.Pd."
                    value={form.mentor}
                    onChange={(e) => setForm({ ...form, mentor: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jadwal Latihan / Pertemuan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Setiap Jumat, 14.30 - 17.00 WIB"
                    value={form.schedule}
                    onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi Kegiatan &amp; Target Prestasi
                </label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan fokus kegiatan, pembentukan karakter, serta kompetisi yang rutin diikuti..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <FileUploadField
                label="Foto Dokumentasi / Banner Kegiatan Ekskul"
                value={form.photo || ''}
                onChange={(url) => setForm({ ...form, photo: url })}
                folder="extracurriculars"
                placeholder="https://... atau unggah foto dokumentasi kegiatan"
              />

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
                >
                  {loading && <span className="animate-spin text-xs">⏳</span>}
                  <span>{editingItem ? 'Simpan Perubahan' : 'Terbitkan Ekskul'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900">Hapus Ekstrakurikuler?</h4>
              <p className="text-xs text-slate-500">
                Data kegiatan ekstrakurikuler ini akan dihapus permanen dari basis data dan tidak akan ditampilkan lagi di portal publik.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={loading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                {loading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
