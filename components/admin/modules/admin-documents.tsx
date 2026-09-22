'use client';

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Download,
  FileSpreadsheet,
  FileCode,
} from 'lucide-react';
import { DownloadDocumentItem } from '@/types';
import {
  getAllDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
} from '@/services/document.service';
import { FileUploadField } from '../ui/file-upload-field';

interface AdminDocumentsProps {
  initialDocuments: DownloadDocumentItem[];
}

export function AdminDocuments({ initialDocuments }: AdminDocumentsProps) {
  const [documents, setDocuments] = useState<DownloadDocumentItem[]>(initialDocuments);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DownloadDocumentItem | null>(null);
  const [form, setForm] = useState<Partial<DownloadDocumentItem>>({
    title: '',
    category: 'Formulir',
    fileUrl: '',
    fileSize: '1.2 MB',
    fileType: 'PDF',
    description: '',
    status: 'published',
  });

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleOpenModal = (item?: DownloadDocumentItem) => {
    if (item) {
      setEditingDoc(item);
      setForm(item);
    } else {
      setEditingDoc(null);
      setForm({
        title: '',
        category: 'Formulir',
        fileUrl: 'https://example.com/dokumen-sekolah.pdf',
        fileSize: '1.5 MB',
        fileType: 'PDF',
        description: '',
        status: 'published',
      });
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim() || !form.fileUrl?.trim()) return;

    setLoading(true);
    try {
      const payload: Omit<DownloadDocumentItem, 'id'> = {
        title: form.title.trim(),
        category: form.category || 'Formulir',
        fileUrl: form.fileUrl.trim(),
        fileSize: form.fileSize || '1.0 MB',
        fileType: (form.fileType as any) || 'PDF',
        description: form.description?.trim() || '',
        downloadCount: editingDoc?.downloadCount || 0,
        publishedAt: editingDoc?.publishedAt || new Date().toISOString().split('T')[0],
        status: (form.status as any) || 'published',
        createdAt: editingDoc?.createdAt || new Date().toISOString(),
      };

      if (editingDoc) {
        await updateDocument(editingDoc.id, payload);
        setDocuments((prev) => prev.map((d) => (d.id === editingDoc.id ? { ...payload, id: editingDoc.id } : d)));
        showNotice('Dokumen berhasil diperbarui.');
      } else {
        const id = await createDocument(payload);
        setDocuments((prev) => [{ ...payload, id: id || `doc-${Date.now()}` }, ...prev]);
        showNotice('Dokumen baru berhasil dipublikasikan.');
      }
      setModalOpen(false);
    } catch (err: any) {
      console.error(err);
      showNotice('Gagal menyimpan dokumen: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus berkas unduhan "${title}"?`)) return;
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      showNotice('Dokumen telah dihapus.');
    } catch (err: any) {
      console.error(err);
      showNotice('Gagal menghapus dokumen.');
    }
  };

  const filtered = documents.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || d.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">Pusat Unduhan Berkas &amp; Panduan Publik</h2>
          </div>
          <p className="text-xs text-slate-500">
            Unggah formulir registrasi, kalender akademik format cetak, dan juknis sekolah untuk masyarakat.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Dokumen Unduhan</span>
        </button>
      </div>

      {notice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="all">Semua Kategori ({documents.length})</option>
            <option value="Formulir">Formulir</option>
            <option value="Panduan">Panduan &amp; Juknis</option>
            <option value="Akademik">Akademik &amp; Kurikulum</option>
            <option value="PPDB">PPDB</option>
          </select>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul berkas..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
          />
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Nama Dokumen</th>
                <th className="px-4 py-3.5">Kategori</th>
                <th className="px-4 py-3.5">Format &amp; Ukuran</th>
                <th className="px-4 py-3.5">Tgl Publikasi</th>
                <th className="px-4 py-3.5">Total Unduh</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    Tidak ada dokumen unduhan yang sesuai.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-emerald-700 font-bold text-xs shrink-0">
                          {item.fileType}
                        </div>
                        <div className="space-y-0.5 max-w-sm">
                          <p className="font-bold text-slate-900">{item.title}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[10px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">
                      {item.fileType} • {item.fileSize}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{item.publishedAt}</td>
                    <td className="px-4 py-3.5 font-semibold text-emerald-800">
                      {item.downloadCount || 0}x diunduh
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="Buka Link Berkas"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
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

      {/* MODAL EDIT / TAMBAH DOKUMEN */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {editingDoc ? 'Edit Dokumen Unduhan' : 'Tambah Berkas Unduhan Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Dokumen</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Formulir Surat Izin Dispensasi Siswa"
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
                    <option value="Formulir">Formulir</option>
                    <option value="Panduan">Panduan &amp; Juknis</option>
                    <option value="Akademik">Akademik &amp; Kurikulum</option>
                    <option value="PPDB">PPDB 2026</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Format Berkas</label>
                  <select
                    value={form.fileType}
                    onChange={(e) => setForm({ ...form, fileType: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="PDF">PDF</option>
                    <option value="DOCX">DOCX / Word</option>
                    <option value="XLSX">XLSX / Excel</option>
                    <option value="ZIP">ZIP</option>
                  </select>
                </div>
              </div>

              <FileUploadField
                label="File Dokumen / Berkas Unduhan"
                value={form.fileUrl || ''}
                onChange={(url) => setForm({ ...form, fileUrl: url })}
                folder="documents"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
                placeholder="https://... atau unggah file dokumen"
                helperText="Mendukung upload dokumen (PDF, Word, Excel, ZIP) ke Cloud Storage atau link Drive."
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan Dokumen</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Instruksi pengisian dan lampiran yang dibutuhkan..."
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
                  {loading ? 'Menyimpan...' : 'Simpan Berkas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
