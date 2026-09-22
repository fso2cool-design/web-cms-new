'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Calendar,
  User,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Clock,
  Tag,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Sparkles,
  ChevronRight,
  Home,
  MessageCircle,
} from 'lucide-react';
import { PublicNavbar } from '@/components/layout/public-navbar';
import { PublicFooter } from '@/components/layout/public-footer';
import { getNewsById, getPublishedNews } from '@/services/news.service';
import { getSchoolProfile } from '@/services/school.service';
import { getVisitorAnalytics } from '@/services/analytics.service';
import { initialSchoolProfile, initialNews, initialVisitorAnalytics } from '@/lib/seed-data';
import { NewsItem, SchoolProfile, VisitorAnalytics } from '@/types';
import { normalizeImageUrl } from '@/lib/image-utils';

export default function SingleNewsDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [news, setNews] = useState<NewsItem | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(initialSchoolProfile);
  const [visitorAnalytics, setVisitorAnalytics] = useState<VisitorAnalytics>(initialVisitorAnalytics);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadArticle() {
      if (!id) return;
      try {
        const [profileRes, analyticsRes, allNewsRes] = await Promise.allSettled([
          getSchoolProfile(),
          getVisitorAnalytics(),
          getPublishedNews(10),
        ]);

        if (profileRes.status === 'fulfilled' && profileRes.value) {
          setSchoolProfile(profileRes.value);
        }
        if (analyticsRes.status === 'fulfilled' && analyticsRes.value) {
          setVisitorAnalytics(analyticsRes.value);
        }

        let foundArticle: NewsItem | null = null;
        try {
          foundArticle = await getNewsById(id as string);
        } catch (e) {
          console.warn('Direct getNewsById failed, falling back to array search:', e);
        }

        // Fallback to array search if direct query failed or returned null
        let allArticles: NewsItem[] = [];
        if (allNewsRes.status === 'fulfilled' && Array.isArray(allNewsRes.value)) {
          allArticles = allNewsRes.value;
        } else {
          allArticles = initialNews;
        }

        if (!foundArticle) {
          foundArticle = allArticles.find((n) => n.id === id || n.slug === id) || null;
        }

        setNews(foundArticle);

        if (foundArticle) {
          document.title = `${foundArticle.title} | ${schoolProfile.shortName || schoolProfile.name || 'Portal Sekolah'}`;
          // Set related news (exclude current)
          const related = allArticles.filter((n) => n.id !== foundArticle?.id).slice(0, 3);
          setRelatedNews(related);
        }
      } catch (err) {
        console.error('Error fetching news detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
  }, [id, schoolProfile.name, schoolProfile.shortName]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    if (typeof window !== 'undefined' && news) {
      const text = `*${news.title}*\n\nBaca artikel selengkapnya di portal resmi ${schoolProfile.name}:\n${window.location.href}`;
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  };

  // Estimate read time
  const readTime = Math.max(1, Math.ceil((news?.content?.length || 500) / 750));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navbar */}
      <PublicNavbar
        schoolProfile={schoolProfile}
        onOpenView={(view) => {
          if (view === 'home') {
            window.location.href = '/';
          } else {
            window.location.href = `/?view=${view}`;
          }
        }}
        onOpenAdmin={() => {
          window.location.href = '/?admin=login';
        }}
      />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-8 overflow-x-auto pb-1">
            <Link href="/" className="hover:text-emerald-700 flex items-center gap-1 transition-colors shrink-0">
              <Home className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <Link href="/berita" className="hover:text-emerald-700 transition-colors shrink-0">
              Warta &amp; Berita
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="text-slate-800 truncate max-w-xs">{news?.title || 'Memuat...'}</span>
          </nav>

          {loading ? (
            <div className="py-24 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-500 text-sm font-medium">Memuat artikel berita...</p>
            </div>
          ) : !news ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4 max-w-xl mx-auto my-12">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Artikel Tidak Ditemukan</h2>
              <p className="text-sm text-slate-500">
                Maaf, artikel berita yang Anda cari mungkin telah dipindahkan, diarsipkan, atau tautan yang Anda gunakan tidak valid.
              </p>
              <div className="pt-4">
                <Link
                  href="/berita"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors shadow-md"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Katalog Berita</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Kolom Kiri: Artikel Utama (8 Cols) */}
              <article className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-8">
                {/* Header Artikel */}
                <header className="space-y-4 border-b border-slate-100 pb-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
                      {news.category || 'Warta Sekolah'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{readTime} menit membaca</span>
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    {news.title}
                  </h1>

                  {/* Meta Bar Penulis & Tanggal */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-sm">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{news.author || 'Humas Sekolah'}</p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Dipublikasikan pada {news.publishedAt || 'Terbaru'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Tombol Share WhatsApp Cepat di Atas */}
                    <button
                      onClick={handleShareWhatsApp}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-colors border border-emerald-200/60"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>Bagikan ke WA</span>
                    </button>
                  </div>
                </header>

                {/* Foto Utama / Cover Image */}
                {(news.featuredImage || news.imageUrl) && (
                  <div className="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={normalizeImageUrl(news.featuredImage || news.imageUrl)}
                      alt={news.title}
                      className="w-full h-auto max-h-[500px] object-cover"
                    />
                    <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500 italic">
                      Dokumentasi resmi kegiatan: {news.title}
                    </div>
                  </div>
                )}

                {/* Excerpt / Ringkasan Tebal */}
                {news.excerpt && (
                  <div className="p-5 bg-emerald-50/70 border-l-4 border-emerald-600 rounded-r-2xl">
                    <p className="text-sm sm:text-base font-semibold text-emerald-950 leading-relaxed italic">
                      “{news.excerpt}”
                    </p>
                  </div>
                )}

                {/* Isi Tulisan Utama (Body Article) */}
                <div className="prose prose-slate max-w-none text-sm sm:text-base text-slate-700 leading-relaxed space-y-4">
                  {news.content?.split('\n\n').map((paragraph, idx) => {
                    if (!paragraph.trim()) return null;
                    return (
                      <p key={idx} className="leading-relaxed">
                        {paragraph}
                      </p>
                    );
                  }) || <p>{news.content}</p>}
                </div>

                {/* Section Berbagi / Social Share Box */}
                <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/80 p-6 rounded-2xl">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Suka dengan kabar ini?</h4>
                    <p className="text-xs text-slate-500">Bagikan artikel ini kepada rekan, siswa, dan wali murid.</p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleShareWhatsApp}
                      className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      onClick={handleCopyLink}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Tersalin!' : 'Salin Link'}</span>
                    </button>
                  </div>
                </div>
              </article>

              {/* Kolom Kanan: Sidebar (4 Cols) */}
              <aside className="lg:col-span-4 space-y-8">
                {/* Warta Terkait / Lainnya */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Kabar Lainnya</span>
                    </h3>
                    <Link href="/berita" className="text-xs text-emerald-700 font-bold hover:underline">
                      Lihat Semua
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {relatedNews.length === 0 ? (
                      <p className="text-xs text-slate-400">Belum ada warta lainnya.</p>
                    ) : (
                      relatedNews.map((item) => (
                        <Link
                          key={item.id}
                          href={`/berita/${item.id}`}
                          className="flex gap-3 group items-start hover:bg-slate-50 p-2 rounded-xl transition-colors"
                        >
                          <div className="w-18 h-18 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={
                                normalizeImageUrl(item.featuredImage || item.imageUrl) ||
                                'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400&q=80'
                              }
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="space-y-1 flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-emerald-700 uppercase">
                              {item.category || 'Umum'}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                              {item.title}
                            </h4>
                            <p className="text-[10px] text-slate-400">{item.publishedAt}</p>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>

                {/* Banner Mini PPDB */}
                <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-950 text-white rounded-3xl p-6 shadow-lg border border-emerald-800 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>PPDB ONLINE {schoolProfile.ppdbYear || ''}</span>
                  </div>
                  <h4 className="text-lg font-bold leading-snug">Pendaftaran Peserta Didik Baru Telah Dibuka</h4>
                  <p className="text-xs text-emerald-100/80 leading-relaxed">
                    Bergabunglah bersama keluarga besar {schoolProfile.name}. Dapatkan pendidikan berkualitas dengan fasilitas unggulan.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/?view=ppdb-apply"
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow transition-colors"
                    >
                      <span>Daftar Sekarang</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <PublicFooter
        schoolProfile={schoolProfile}
        visitorAnalytics={visitorAnalytics}
        onOpenView={(view) => {
          if (view === 'home') {
            window.location.href = '/';
          } else {
            window.location.href = `/?view=${view}`;
          }
        }}
        onOpenAdmin={() => {
          window.location.href = '/?admin=login';
        }}
      />
    </div>
  );
}
