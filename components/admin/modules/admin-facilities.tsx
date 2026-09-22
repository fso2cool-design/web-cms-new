'use client';

import React, { useState } from 'react';
import {
  Landmark,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  MapPin,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { FacilityItem } from '@/types';
import { normalizeImageUrl, isGoogleDriveUrl } from '@/lib/image-utils';
import {
  getAllFacilities,
  createFacility,
  updateFacility,
  deleteFacility,
} from '@/services/facility.service';
import { FileUploadField } from '../ui/file-upload-field';

interface AdminFacilitiesProps {
  initialFacilities: FacilityItem[];
}

export function AdminFacilities({ initialFacilities }: AdminFacilitiesProps) {
  const [facilities, setFacilities] = useState<FacilityItem[]>(initialFacilities);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FacilityItem | null>(null);
  const [form, setForm] = useState<Partial<FacilityItem>>({
    name: '',
    category: 'Akademik',
    capacity: '40 Orang',
    condition: 'Baik',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
    status: 'published',
  });

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleOpenModal = (item?: FacilityItem) => {
    if (item) {
      setEditingItem(item);
      setForm(item);
    } else {
      setEditingItem(null);
      setForm({
        name: '',
        category: 'Akademik',
        capacity: '40 Siswa',
        condition: 'Baik',
        description: '',
        imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
        status: 'published',
      });
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) return;

    setLoading(true);
    try {
      const img = form.imageUrl || form.photoUrl || 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80';
      const payload: Omit<FacilityItem, 'id'> = {
        name: form.name.trim(),
        category: form.category || 'Akademik',
        capacity: form.capacity || 'Tersedia',
        condition: (form.condition as any) || 'Baik',
        description: form.description?.trim() || '',
        imageUrl: img,
        photoUrl: img,
        status: (form.status as any) || 'published',
        createdAt: editingItem?.createdAt || new Date().toISOString(),
      };

      if (editingItem) {
        await updateFacility(editingItem.id, payload);
        setFacilities((prev) => prev.map((f) => (f.id === editingItem.id ? { ...payload, id: editingItem.id } : f)));
        showNotice('Sarana prasarana berhasil diperbarui.');
      } else {
        const id = await createFacility(payload);
        setFacilities((prev) => [{ ...payload, id: id || `fac-${Date.now()}` }, ...prev]);
        showNotice('Fasilitas baru berhasil ditambahkan.');
      }
      setModalOpen(false);
    } catch (err: any) {
      console.error(err);
      showNotice('Gagal menyimpan fasilitas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus fasilitas "${name}"?`)) return;
    try {
      await deleteFacility(id);
      setFacilities((prev) => prev.filter((f) => f.id !== id));
      showNotice('Fasilitas telah dihapus.');
    } catch (err: any) {
      console.error(err);
      showNotice('Gagal menghapus fasilitas.');
    }
  };

  const filtered = facilities.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">Sarana &amp; Prasarana Sekolah</h2>
          </div>
          <p className="text-xs text-slate-500">
            Kelola inventaris laboratorium, ruang kelas multimedia, sarana olahraga, dan perpustakaan.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Fasilitas Baru</span>
        </button>
      </div>

      {notice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari fasilitas atau kategori..."
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
        />
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-40 object-cover border-b border-slate-100"
              />
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                    {item.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.condition === 'Sangat Baik' || item.condition === 'Baik'
                        ? 'bg-blue-50 text-blue-800'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    Kondisi: {item.condition}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                <p className="text-[11px] text-slate-600 font-medium">Kapasitas: {item.capacity}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenModal(item)}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-bold text-xs border border-slate-200 transition-colors flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(item.id, item.name)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Hapus"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL EDIT / TAMBAH FASILITAS */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {editingItem ? 'Edit Fasilitas Sekolah' : 'Tambah Fasilitas Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Fasilitas</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Laboratorium Komputer Multimedia"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Akademik">Akademik &amp; Lab</option>
                    <option value="Olahraga">Olahraga &amp; Seni</option>
                    <option value="Ibadah">Sarana Ibadah</option>
                    <option value="Penunjang">Kantin &amp; Kesehatan (UKS)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kondisi</label>
                  <select
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Sangat Baik">Sangat Baik</option>
                    <option value="Baik">Baik</option>
                    <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                  </select>
                </div>
              </div>

              <FileUploadField
                label="Foto Fasilitas"
                value={form.imageUrl || ''}
                onChange={(url) => setForm({ ...form, imageUrl: url, photoUrl: url })}
                folder="facilities"
                placeholder="https://... atau unggah foto fasilitas"
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Perangkat PC Core i7, pendingin ruangan, proyektor laser..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-colors"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Fasilitas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
