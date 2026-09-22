'use client';

import React, { useState, useRef } from 'react';
import {
  Newspaper,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  AlertCircle,
  Eye,
  Calendar,
  Tag,
  Bell,
  Save,
  Heading,
  Bold,
  Italic,
  Quote,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon,
  Columns2,
  ArrowLeft,
  Globe,
  Sparkles,
  BookOpen,
  PenTool,
  User,
} from 'lucide-react';
import { NewsItem, AnnouncementItem } from '@/types';
import { normalizeImageUrl, isGoogleDriveUrl } from '@/lib/image-utils';
import {
  getAllNews,
  createNews,
  updateNews,
  deleteNews,
} from '@/services/news.service';
import {
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '@/services/announcement.service';
import { FileUploadField } from '../ui/file-upload-field';

interface AdminNewsProps {
  initialNews: NewsItem[];
  initialAnnouncements: AnnouncementItem[];
}

function generateReducedSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 55)
    .replace(/-+$/, '');
}

export function AdminNews({ initialNews, initialAnnouncements }: AdminNewsProps) {
  const [activeTab, setActiveTab] = useState<'news' | 'announcements'>('news');
  const [newsList, setNewsList] = useState<NewsItem[]>(initialNews);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Modal / Studio State for News
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [studioMode, setStudioMode] = useState<'split' | 'edit' | 'preview'>('split');
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormatting = (prefix: string, suffix: string = '', placeholder: string = '') => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const oldText = newsForm.content || '';
    const selectedText = oldText.substring(start, end) || placeholder;

    const newContent =
      oldText.substring(0, start) + prefix + selectedText + suffix + oldText.substring(end);

    setNewsForm((prev) => ({ ...prev, content: newContent }));

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  const [newsForm, setNewsForm] = useState<Partial<NewsItem>>({
    title: '',
    category: 'Akademik',
    excerpt: '',
    content: '',
    featuredImage: '',
    author: 'Humas Sekolah',
    status: 'published',
  });

  // Modal State for Announcements
  const [annModalOpen, setAnnModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<AnnouncementItem | null>(null);
  const [annForm, setAnnForm] = useState<Partial<AnnouncementItem>>({
    title: '',
    content: '',
    priority: 'normal',
    targetAudience: 'Semua Warga Sekolah',
    status: 'published',
  });

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  // --- NEWS HANDLERS ---
  const handleOpenNewsModal = (item?: NewsItem) => {
    if (item) {
      setEditingNews(item);
      setNewsForm({
        ...item,
        featuredImage: item.featuredImage || item.imageUrl || '',
        author: item.author && !item.author.includes('SMAN 1 Cerdas') ? item.author : 'Humas Sekolah',
      });
    } else {
      setEditingNews(null);
      setNewsForm({
        title: '',
        category: 'Akademik',
        excerpt: '',
        content: '',
        featuredImage: '',
        author: 'Humas Sekolah',
        status: 'published',
      });
    }
    setNewsModalOpen(true);
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title?.trim() || !newsForm.content?.trim()) return;

    setLoading(true);
    try {
      const now = new Date().toISOString().split('T')[0];
      const rawImg = newsForm.featuredImage || (editingNews as any)?.imageUrl || '';
      const canonicalImg = normalizeImageUrl(rawImg);

      const payload: any = {
        title: newsForm.title.trim(),
        slug: generateReducedSlug(newsForm.title.trim()),
        category: newsForm.category || 'Umum',
        excerpt: newsForm.excerpt?.trim() || newsForm.content.slice(0, 150) + '...',
        content: newsForm.content.trim(),
        featuredImage: canonicalImg,
        imageUrl: canonicalImg,
        author: newsForm.author || 'Humas Sekolah',
        status: (newsForm.status as any) || 'published',
        publishedAt: now,
        createdAt: editingNews?.createdAt || new Date().toISOString(),
      };

      if (editingNews) {
        await updateNews(editingNews.id, payload);
        setNewsList((prev) => prev.map((n) => (n.id === editingNews.id ? { ...payload, id: editingNews.id } : n)));
        showNotice('Berita berhasil diperbarui.');
      } else {
        const id = await createNews(payload);
        setNewsList((prev) => [{ ...payload, id: id || `news-${Date.now()}` }, ...prev]);
        showNotice('Berita baru berhasil diterbitkan.');
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('school-cms-updated', { detail: { module: 'news' } }));
      }
      setNewsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      showNotice('Gagal menyimpan berita: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNews = async (id: string, title: string) => {
    if (!confirm(`Hapus artikel berita "${title}"?`)) return;
    try {
      await deleteNews(id);
      setNewsList((prev) => prev.filter((n) => n.id !== id));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('school-cms-updated', { detail: { module: 'news' } }));
      }
      showNotice('Artikel berita telah dihapus.');
    } catch (err: any) {
      console.error(err);
      showNotice('Gagal menghapus berita.');
    }
  };

  // --- ANNOUNCEMENTS HANDLERS ---
  const handleOpenAnnModal = (item?: AnnouncementItem) => {
    if (item) {
      setEditingAnn(item);
      setAnnForm(item);
    } else {
      setEditingAnn(null);
      setAnnForm({
        title: '',
        content: '',
        priority: 'normal',
        targetAudience: 'Semua Warga Sekolah',
        status: 'published',
      });
    }
    setAnnModalOpen(true);
  };

  const handleSaveAnn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annForm.title?.trim() || !annForm.content?.trim()) return;

    setLoading(true);
    try {
      const now = new Date().toISOString().split('T')[0];
      const payload: Omit<AnnouncementItem, 'id'> = {
        title: annForm.title.trim(),
        content: annForm.content.trim(),
        priority: (annForm.priority as any) || 'normal',
        isUrgent: annForm.priority === 'urgent',
        targetAudience: annForm.targetAudience || 'Semua Warga Sekolah',
        date: now,
        publishedAt: now,
        status: (annForm.status as any) || 'published',
        createdAt: editingAnn?.createdAt || new Date().toISOString(),
      };

      if (editingAnn) {
        await updateAnnouncement(editingAnn.id, payload);
        setAnnouncements((prev) => prev.map((a) => (a.id === editingAnn.id ? { ...payload, id: editingAnn.id } : a)));
        showNotice('Pengumuman berhasil diperbarui.');
      } else {
        const id = await createAnnouncement(payload);
        setAnnouncements((prev) => [{ ...payload, id: id || `ann-${Date.now()}` }, ...prev]);
        showNotice('Pengumuman baru berhasil dipasang.');
      }
      setAnnModalOpen(false);
    } catch (err: any) {
      console.error(err);
      showNotice('Gagal menyimpan pengumuman: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnn = async (id: string, title: string) => {
    if (!confirm(`Hapus pengumuman "${title}"?`)) return;
    try {
      await deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      showNotice('Pengumuman telah dihapus.');
    } catch (err: any) {
      console.error(err);
      showNotice('Gagal menghapus pengumuman.');
    }
  };

  const filteredNews = newsList.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.category.toLowerCase().includes(search.toLowerCase())
  );

  const filteredAnn = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">Publikasi Warta &amp; Pengumuman Sekolah</h2>
          </div>
          <p className="text-xs text-slate-500">
            Publikasikan kabar capaian, kegiatan belajar, dan instruksi penting bagi civitas sekolah.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeTab === 'news' ? (
            <button
              onClick={() => handleOpenNewsModal()}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tulis Artikel Berita</span>
            </button>
          ) : (
            <button
              onClick={() => handleOpenAnnModal()}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Pengumuman Baru</span>
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
            onClick={() => setActiveTab('news')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'news'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Artikel Berita ({newsList.length})
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'announcements'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Papan Pengumuman ({announcements.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul atau topik..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
          />
        </div>
      </div>

      {/* TAB CONTENT 1: BERITA */}
      {activeTab === 'news' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Artikel &amp; Sampul</th>
                  <th className="px-4 py-3.5">Kategori</th>
                  <th className="px-4 py-3.5">Penulis</th>
                  <th className="px-4 py-3.5">Tanggal</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      Tidak ada artikel berita yang cocok dengan kata kunci pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredNews.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.featuredImage || item.imageUrl}
                            alt={item.title}
                            className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200"
                          />
                          <div className="space-y-0.5 max-w-sm">
                            <p className="font-bold text-slate-900 line-clamp-1">{item.title}</p>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{item.excerpt}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium">{item.author}</td>
                      <td className="px-4 py-3.5 text-slate-500">{item.publishedAt}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.status === 'published' ? 'Terbit' : 'Draf'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/berita/${item.slug || item.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Buka Artikel di Web Publik"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleOpenNewsModal(item)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Edit Artikel"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteNews(item.id, item.title)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus Artikel"
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

      {/* TAB CONTENT 2: PENGUMUMAN */}
      {activeTab === 'announcements' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Judul Pengumuman &amp; Isi</th>
                  <th className="px-4 py-3.5">Prioritas</th>
                  <th className="px-4 py-3.5">Sasaran</th>
                  <th className="px-4 py-3.5">Tanggal</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAnn.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                      Tidak ada data pengumuman yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredAnn.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="space-y-0.5 max-w-md">
                          <p className="font-bold text-slate-900">{item.title}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{item.content}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.priority === 'urgent'
                              ? 'bg-rose-100 text-rose-800'
                              : item.priority === 'important'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.priority === 'urgent' ? 'Mendesak' : item.priority === 'important' ? 'Penting' : 'Normal'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium">{item.targetAudience}</td>
                      <td className="px-4 py-3.5 text-slate-500">{item.date || item.publishedAt}</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenAnnModal(item)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAnn(item.id, item.title)}
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

      {/* EDITORIAL WRITER STUDIO (FULLSCREEN EXPERIENCE) */}
      {newsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex flex-col animate-in fade-in">
          <div className="bg-slate-50 flex-1 flex flex-col overflow-hidden">
            {/* Topbar Studio */}
            <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-xs z-20">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNewsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  title="Kembali ke Daftar"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">WRITER STUDIO</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-semibold text-slate-500">
                      {editingNews ? 'Mengedit Artikel' : 'Tulis Artikel Baru'}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 truncate max-w-xs sm:max-w-md">
                    {newsForm.title || 'Artikel Tanpa Judul'}
                  </h3>
                </div>
              </div>

              {/* View Switcher (Desktop) */}
              <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setStudioMode('edit')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    studioMode === 'edit'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Editor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStudioMode('split')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    studioMode === 'split'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Columns2 className="w-3.5 h-3.5" />
                  <span>Berdampingan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStudioMode('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    studioMode === 'preview'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Pratinjau</span>
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNewsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors hidden sm:inline-block"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveNews}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Menyimpan...' : editingNews ? 'Perbarui Artikel' : 'Terbitkan Artikel'}</span>
                </button>
              </div>
            </header>

            {/* Studio Workspace Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <form onSubmit={handleSaveNews} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* KOLOM EDITOR (Spans 8 or 12 cols) */}
                  <div
                    className={`${
                      studioMode === 'split' ? 'lg:col-span-7' : studioMode === 'preview' ? 'hidden' : 'lg:col-span-8 lg:col-start-3'
                    } space-y-6`}
                  >
                    {/* Judul Artikel Besar */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                          Judul Artikel Berita
                        </label>
                        <input
                          type="text"
                          required
                          value={newsForm.title}
                          onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                          placeholder="Tuliskan judul berita yang menarik di sini..."
                          className="w-full text-xl sm:text-3xl font-black text-slate-900 placeholder:text-slate-300 focus:outline-none leading-tight border-b-2 border-transparent focus:border-emerald-500 pb-2 transition-all"
                        />
                      </div>

                      {/* Slug URL Preview */}
                      <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-mono truncate">
                          URL Web: /berita/{newsForm.title ? generateReducedSlug(newsForm.title) : 'judul-berita'}
                        </span>
                      </div>
                    </div>

                    {/* Rich Text Toolbar & Content Area */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
                      {/* Formatting Toolbar */}
                      <div className="p-2.5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center gap-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 hidden sm:inline-block">
                          Format:
                        </span>

                        <button
                          type="button"
                          onClick={() => insertFormatting('\n## ', '', 'Judul Sub-bab')}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-200/70 hover:text-slate-900 transition-colors flex items-center gap-1"
                          title="Heading 2 (Sub-bab)"
                        >
                          <Heading className="w-3.5 h-3.5 text-emerald-700" />
                          <span>H2</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => insertFormatting('\n### ', '', 'Poin Pembahasan')}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-200/70 hover:text-slate-900 transition-colors flex items-center gap-1"
                          title="Heading 3"
                        >
                          <Heading className="w-3 h-3 text-slate-500" />
                          <span>H3</span>
                        </button>

                        <div className="h-4 w-px bg-slate-200 mx-1" />

                        <button
                          type="button"
                          onClick={() => insertFormatting('**', '**', 'teks tebal')}
                          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200/70 transition-colors"
                          title="Tebal (Bold)"
                        >
                          <Bold className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => insertFormatting('*', '*', 'teks miring')}
                          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200/70 transition-colors"
                          title="Miring (Italic)"
                        >
                          <Italic className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => insertFormatting('\n> ', '', 'Kutipan pernyataan tokoh/kepala sekolah...')}
                          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200/70 transition-colors"
                          title="Kutipan (Blockquote)"
                        >
                          <Quote className="w-4 h-4 text-emerald-700" />
                        </button>

                        <div className="h-4 w-px bg-slate-200 mx-1" />

                        <button
                          type="button"
                          onClick={() => insertFormatting('\n- ', '', 'Poin kegiatan')}
                          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200/70 transition-colors"
                          title="Daftar Poin (Bullet List)"
                        >
                          <List className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => insertFormatting('\n1. ', '', 'Langkah pertama')}
                          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200/70 transition-colors"
                          title="Daftar Berurutan (Numbered List)"
                        >
                          <ListOrdered className="w-4 h-4" />
                        </button>

                        <div className="h-4 w-px bg-slate-200 mx-1" />

                        <button
                          type="button"
                          onClick={() => {
                            const url = prompt('Masukkan URL foto kegiatan:');
                            if (url) {
                              const caption = prompt('Keterangan / Caption foto:') || 'Dokumentasi kegiatan';
                              insertFormatting(`\n\n![${caption}](${url})\n\n`);
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-200/70 transition-colors flex items-center gap-1.5"
                          title="Sisipkan Foto di Tengah Paragraf"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                          <span className="hidden sm:inline">Sisip Foto</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const url = prompt('Masukkan URL tautan / link:');
                            if (url) {
                              const text = prompt('Teks yang ditampilkan:') || 'Kunjungi tautan';
                              insertFormatting(`[${text}](${url})`);
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-200/70 transition-colors flex items-center gap-1.5"
                          title="Sisipkan Link"
                        >
                          <LinkIcon className="w-3.5 h-3.5 text-slate-600" />
                          <span className="hidden sm:inline">Tautan</span>
                        </button>
                      </div>

                      {/* Textarea Editor yang Luas */}
                      <div className="p-6">
                        <textarea
                          ref={contentTextareaRef}
                          rows={16}
                          required
                          value={newsForm.content}
                          onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                          placeholder="Tuliskan berita lengkap di sini... Anda dapat menggunakan toolbar di atas untuk menambahkan sub-judul (H2), kutipan, poin berbutir, atau foto tambahan di tengah artikel."
                          className="w-full text-sm sm:text-base text-slate-800 placeholder:text-slate-300 focus:outline-none leading-relaxed font-sans resize-y"
                        />
                      </div>
                    </div>

                    {/* Metadata Pengaturan (Kategori & Excerpt) */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                        Pengaturan Publikasi &amp; Penulis
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                          <select
                            value={newsForm.category}
                            onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          >
                            <option value="Akademik">Akademik</option>
                            <option value="Prestasi">Prestasi</option>
                            <option value="Kegiatan Siswa">Kegiatan Siswa</option>
                            <option value="Guru & Tenaga Kependidikan">Guru &amp; Tendik</option>
                            <option value="Kurikulum & P5">Kurikulum &amp; P5</option>
                            <option value="Umum">Umum</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Penulis Artikel</label>
                          <input
                            type="text"
                            value={newsForm.author || ''}
                            onChange={(e) => setNewsForm({ ...newsForm, author: e.target.value })}
                            placeholder="e.g. Humas Sekolah"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                          <select
                            value={newsForm.status}
                            onChange={(e) => setNewsForm({ ...newsForm, status: e.target.value as any })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          >
                            <option value="published">Terbit (Live di Web)</option>
                            <option value="draft">Draf (Disimpan Sementara)</option>
                          </select>
                        </div>
                      </div>

                      <FileUploadField
                        label="Foto Sampul Utama (Featured Image)"
                        value={newsForm.featuredImage || ''}
                        onChange={(url) => setNewsForm({ ...newsForm, featuredImage: url })}
                        folder="news"
                        placeholder="https://... atau unggah foto dari perangkat"
                      />

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Ringkasan Singkat (Excerpt)
                        </label>
                        <textarea
                          rows={2}
                          value={newsForm.excerpt}
                          onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                          placeholder="Ringkasan 1-2 kalimat yang akan muncul di kartu beranda dan pratinjau WhatsApp..."
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* KOLOM LIVE PREVIEW (Spans 5 or 12 cols) */}
                  <div
                    className={`${
                      studioMode === 'split' ? 'lg:col-span-5' : studioMode === 'edit' ? 'hidden' : 'lg:col-span-8 lg:col-start-3'
                    } space-y-4`}
                  >
                    <div className="flex items-center justify-between px-2">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Live Pratinjau Pembaca</span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {newsForm.status === 'published' ? 'Live di Web' : 'Draf'}
                      </span>
                    </div>

                    {/* Mock Browser Window */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden sticky top-6">
                      <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center gap-2 text-xs text-slate-400">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        </div>
                        <span className="font-mono text-[10px] truncate max-w-xs text-slate-500">
                          https://web-sekolah.sch.id/berita/{newsForm.title ? generateReducedSlug(newsForm.title) : 'detail'}
                        </span>
                      </div>

                      {/* Mock Article Page */}
                      <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                          {newsForm.category || 'Umum'}
                        </span>

                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                          {newsForm.title || 'Judul artikel Anda akan tampil di sini...'}
                        </h2>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 border-b border-slate-100 pb-3">
                          <User className="w-3 h-3" />
                          <span>{newsForm.author || 'Humas Sekolah'}</span>
                          <span>•</span>
                          <Calendar className="w-3 h-3" />
                          <span>Hari ini</span>
                        </div>

                        {newsForm.featuredImage && (
                          <div className="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={normalizeImageUrl(newsForm.featuredImage)}
                              alt="Cover"
                              className="w-full h-48 object-cover"
                            />
                          </div>
                        )}

                        {newsForm.excerpt && (
                          <p className="text-xs text-emerald-900 font-semibold italic bg-emerald-50/70 p-3 rounded-xl border-l-4 border-emerald-600">
                            “{newsForm.excerpt}”
                          </p>
                        )}

                        {/* Formatted Content Preview */}
                        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
                          {newsForm.content ? (
                            newsForm.content.split('\n\n').map((block, idx) => {
                              const trimmed = block.trim();
                              if (!trimmed) return null;

                              if (trimmed.startsWith('## ')) {
                                return (
                                  <h3 key={idx} className="text-base font-black text-slate-900 mt-4 mb-2">
                                    {trimmed.replace(/^##\s+/, '')}
                                  </h3>
                                );
                              }
                              if (trimmed.startsWith('### ')) {
                                return (
                                  <h4 key={idx} className="text-sm font-bold text-slate-900 mt-3 mb-1">
                                    {trimmed.replace(/^###\s+/, '')}
                                  </h4>
                                );
                              }
                              if (trimmed.startsWith('> ')) {
                                return (
                                  <blockquote key={idx} className="border-l-4 border-emerald-600 pl-3 py-1 bg-emerald-50/50 rounded-r-lg italic text-emerald-950">
                                    {trimmed.replace(/^>\s+/, '')}
                                  </blockquote>
                                );
                              }
                              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                                const items = trimmed.split('\n').map((l) => l.replace(/^[-*]\s+/, '').trim()).filter(Boolean);
                                return (
                                  <ul key={idx} className="list-disc list-inside space-y-1 pl-1">
                                    {items.map((it, i) => (
                                      <li key={i}>{it}</li>
                                    ))}
                                  </ul>
                                );
                              }
                              const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
                              if (imgMatch) {
                                return (
                                  <div key={idx} className="my-3 space-y-1">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={imgMatch[2]} alt={imgMatch[1]} className="rounded-xl max-h-48 w-full object-cover" />
                                    {imgMatch[1] && <p className="text-[10px] text-slate-400 italic text-center">{imgMatch[1]}</p>}
                                  </div>
                                );
                              }
                              return <p key={idx}>{trimmed}</p>;
                            })
                          ) : (
                            <p className="text-slate-400 italic">Mulai mengetik untuk melihat pratinjau artikel Anda di sini...</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT / TAMBAH PENGUMUMAN */}
      {annModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {editingAnn ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
              </h3>
              <button onClick={() => setAnnModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAnn} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Pengumuman</label>
                <input
                  type="text"
                  required
                  value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                  placeholder="e.g. Jadwal Asesmen Sumatif Akhir Semester Genap 2026"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prioritas</label>
                  <select
                    value={annForm.priority}
                    onChange={(e) => setAnnForm({ ...annForm, priority: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Penting</option>
                    <option value="urgent">Mendesak (Ticker Utama)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sasaran Target</label>
                  <input
                    type="text"
                    value={annForm.targetAudience}
                    onChange={(e) => setAnnForm({ ...annForm, targetAudience: e.target.value })}
                    placeholder="Semua Siswa, Wali Murid, dll"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Isi Pesan Pengumuman</label>
                <textarea
                  rows={4}
                  required
                  value={annForm.content}
                  onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                  placeholder="Instruksi pengumuman secara rinci..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAnnModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Pengumuman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
