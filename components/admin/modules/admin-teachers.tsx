'use client';

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  GraduationCap,
  Briefcase,
  Mail,
} from 'lucide-react';
import { TeacherItem } from '@/types';
import { normalizeImageUrl, isGoogleDriveUrl } from '@/lib/image-utils';
import {
  getAllTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from '@/services/teacher.service';
import { FileUploadField } from '../ui/file-upload-field';

interface AdminTeachersProps {
  initialTeachers: TeacherItem[];
}

export function AdminTeachers({ initialTeachers }: AdminTeachersProps) {
  const [teachers, setTeachers] = useState<TeacherItem[]>(initialTeachers);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherItem | null>(null);
  const [form, setForm] = useState<Partial<TeacherItem>>({
    name: '',
    nip: '',
    role: 'Guru Mata Pelajaran',
    subject: '',
    education: 'S1 Pendidikan',
    category: 'Guru',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    order: 1,
    isActive: true,
  });

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleOpenModal = (item?: TeacherItem) => {
    if (item) {
      setEditingTeacher(item);
      setForm(item);
    } else {
      setEditingTeacher(null);
      setForm({
        name: '',
        nip: '',
        role: 'Guru Mata Pelajaran',
        subject: '',
        education: 'S1 Pendidikan',
        category: 'Guru',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        order: teachers.length + 1,
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
      const payload: Omit<TeacherItem, 'id'> = {
        name: form.name.trim(),
        nip: form.nip?.trim() || '-',
        role: form.role || 'Guru Mata Pelajaran',
        subject: form.subject?.trim() || form.role || 'Tenaga Pendidik',
        education: form.education?.trim() || 'S1',
        category: (form.category as any) || 'Guru',
        photoUrl: form.photoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        order: Number(form.order) || 1,
        isActive: form.isActive ?? true,
      };

      if (editingTeacher) {
        await updateTeacher(editingTeacher.id, payload);
        setTeachers((prev) => prev.map((t) => (t.id === editingTeacher.id ? { ...payload, id: editingTeacher.id } : t)));
        showNotice('Data pendidik berhasil diperbarui.');
      } else {
        const id = await createTeacher(payload);
        setTeachers((prev) => [{ ...payload, id: id || `t-${Date.now()}` }, ...prev]);
        showNotice('Pendidik baru berhasil ditambahkan.');
      }
      setModalOpen(false);
    } catch (err: any) {
      console.error(err);
      showNotice('Gagal menyimpan data guru: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus data ${name} dari direktori?`)) return;
    try {
      await deleteTeacher(id);
      setTeachers((prev) => prev.filter((t) => t.id !== id));
      showNotice('Data guru/tendik telah dihapus.');
    } catch (err: any) {
      console.error(err);
      showNotice('Gagal menghapus data.');
    }
  };

  const filtered = teachers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.nip?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">Direktori Guru &amp; Tenaga Kependidikan (GTK)</h2>
          </div>
          <p className="text-xs text-slate-500">
            Kelola data dewan guru, staf tata usaha, bidang keahlian, dan penugasan wali kelas.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Guru / Tendik</span>
        </button>
      </div>

      {notice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="all">Semua Bidang ({teachers.length})</option>
            <option value="Guru">Guru Mata Pelajaran</option>
            <option value="Tendik">Tenaga Kependidikan / Staf TU</option>
            <option value="Manajemen">Pimpinan &amp; Waka</option>
          </select>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, NIP, atau mata pelajaran..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
          />
        </div>
      </div>

      {/* Grid or Table of Teachers */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Foto &amp; Nama Lengkap</th>
                <th className="px-4 py-3.5">NIP</th>
                <th className="px-4 py-3.5">Jabatan / Mapel</th>
                <th className="px-4 py-3.5">Pendidikan Terakhir</th>
                <th className="px-4 py-3.5">Kategori</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    Tidak ada data pendidik yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.photoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'}
                          alt={item.name}
                          className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 shadow-xs"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-[11px] text-slate-500">{item.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">{item.nip}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{item.subject}</td>
                    <td className="px-4 py-3.5 text-slate-600">{item.education}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                        {item.category || 'Guru'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
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

      {/* MODAL EDIT / TAMBAH GURU */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {editingTeacher ? 'Edit Data Pendidik' : 'Tambah Tenaga Pendidik / Tendik'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap &amp; Gelar</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Dra. Hj. Siti Aminah, M.Pd."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIP (atau NUPTK)</label>
                  <input
                    type="text"
                    value={form.nip}
                    onChange={(e) => setForm({ ...form, nip: e.target.value })}
                    placeholder="198005xxxx..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Kepegawaian</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Guru">Guru Mata Pelajaran</option>
                    <option value="Tendik">Tenaga Kependidikan (TU/Lab)</option>
                    <option value="Manajemen">Kepala Sekolah / Waka</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran / Bidang</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Matematika / Fisika / Tata Usaha"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pendidikan Terakhir</label>
                  <input
                    type="text"
                    value={form.education}
                    onChange={(e) => setForm({ ...form, education: e.target.value })}
                    placeholder="S1 Pendidikan Matematika - UNJ"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <FileUploadField
                label="Foto Resmi GTK"
                value={form.photoUrl || ''}
                onChange={(url) => setForm({ ...form, photoUrl: url })}
                folder="teachers"
                placeholder="https://... atau unggah foto guru/tendik"
              />

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
                  {loading ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
