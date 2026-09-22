'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  ChevronDown,
} from 'lucide-react';
import { FAQItem } from '@/types';
import {
  getAllFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} from '@/services/faq.service';

interface AdminFAQsProps {
  initialFAQs: FAQItem[];
}

export function AdminFAQs({ initialFAQs }: AdminFAQsProps) {
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFAQs);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [form, setForm] = useState<Partial<FAQItem>>({
    question: '',
    answer: '',
    category: 'PPDB',
    order: 1,
    status: 'published',
  });

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleOpenModal = (item?: FAQItem) => {
    if (item) {
      setEditingFaq(item);
      setForm(item);
    } else {
      setEditingFaq(null);
      setForm({
        question: '',
        answer: '',
        category: 'PPDB',
        order: faqs.length + 1,
        status: 'published',
      });
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question?.trim() || !form.answer?.trim()) return;

    setLoading(true);
    try {
      const payload: Omit<FAQItem, 'id'> = {
        question: form.question.trim(),
        answer: form.answer.trim(),
        category: form.category || 'Umum',
        order: Number(form.order) || 1,
        status: (form.status as any) || 'published',
        createdAt: editingFaq?.createdAt || new Date().toISOString(),
      };

      if (editingFaq) {
        await updateFAQ(editingFaq.id, payload);
        setFaqs((prev) => prev.map((f) => (f.id === editingFaq.id ? { ...payload, id: editingFaq.id } : f)));
        showNotice('FAQ berhasil diperbarui.');
      } else {
        const id = await createFAQ(payload);
        setFaqs((prev) => [{ ...payload, id: id || `faq-${Date.now()}` }, ...prev]);
        showNotice('FAQ baru berhasil ditambahkan.');
      }
      setModalOpen(false);
    } catch (err: any) {
      console.error(err);
      showNotice('Gagal menyimpan FAQ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, q: string) => {
    if (!confirm(`Hapus pertanyaan FAQ: "${q}"?`)) return;
    try {
      await deleteFAQ(id);
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      showNotice('FAQ telah dihapus.');
    } catch (err: any) {
      console.error(err);
      showNotice('Gagal menghapus FAQ.');
    }
  };

  const filtered = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">Manajemen Tanya Jawab Sekolah (FAQ)</h2>
          </div>
          <p className="text-xs text-slate-500">
            Kelola daftar jawaban untuk pertanyaan yang paling sering diajukan masyarakat.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tanya Jawab Baru</span>
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
          placeholder="Cari kata kunci tanya jawab..."
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
        />
      </div>

      {/* FAQ Items list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs">
            Belum ada daftar tanya jawab yang cocok.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2 hover:border-emerald-200 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-slate-400">Urutan: #{item.order}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{item.question}</h3>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.question)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-100">
                {item.answer}
              </p>
            </div>
          ))
        )}
      </div>

      {/* MODAL FAQ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {editingFaq ? 'Edit Tanya Jawab' : 'Tambah Tanya Jawab Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pertanyaan (Question)</label>
                <input
                  type="text"
                  required
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  placeholder="e.g. Bagaimana alur seleksi pendaftaran di sekolah kita?"
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
                    <option value="PPDB">PPDB 2026</option>
                    <option value="Akademik">Akademik &amp; Kurikulum</option>
                    <option value="Fasilitas">Fasilitas &amp; Perpustakaan</option>
                    <option value="Ekstrakurikuler">Kesiswaan &amp; Ekskul</option>
                    <option value="Umum">Umum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Urut Tampil</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jawaban Lengkap</label>
                <textarea
                  rows={4}
                  required
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  placeholder="Tuliskan jawaban resmi secara informatif dan jelas..."
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
                  {loading ? 'Menyimpan...' : 'Simpan FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
