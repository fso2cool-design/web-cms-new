'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Calendar,
  User,
  ArrowRight,
  ChevronRight,
  Home,
  Tag,
  BookOpen,
  Filter,
  Sparkles,
} from 'lucide-react';
import { PublicNavbar } from '@/components/layout/public-navbar';
import { PublicFooter } from '@/components/layout/public-footer';
import { getPublishedNews } from '@/services/news.service';
import { getSchoolProfile } from '@/services/school.service';
import { getVisitorAnalytics } from '@/services/analytics.service';
import { initialSchoolProfile, initialNews, initialVisitorAnalytics } from '@/lib/seed-data';
import { NewsItem, SchoolProfile, VisitorAnalytics } from '@/types';
import { normalizeImageUrl } from '@/lib/image-utils';

export default function BeritaArchivePage() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(initialSchoolProfile);
  const [visitorAnalytics, setVisitorAnalytics] = useState<VisitorAnalytics>(initialVisitorAnalytics);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    async function loadData() {
      try {
        const [newsRes, profileRes, analyticsRes] = await Promise.allSettled([
          getPublishedNews(100),
          getSchoolProfile(),
          getVisitorAnalytics(),
        ]);

        if (newsRes.status === 'fulfilled' && Array.isArray(newsRes.value) && newsRes.value.length > 0) {
          setNewsList(newsRes.value);
        } else {
          setNewsList(initialNews);
        }

        if (profileRes.status === 'fulfilled' && profileRes.value) {
          setSchoolProfile(profileRes.value);
          document.title = `Warta & Berita Terkini | ${profileRes.value.name || 'Portal Sekolah'}`;
        }

        if (analyticsRes.status === 'fulfilled' && analyticsRes.value) {
          setVisitorAnalytics(analyticsRes.value);
        }
      } catch (err) {
        console.warn('Error fetching news archive:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Extract unique categories
  const categories = useMemo(() => {
    const raw = newsList.map((n) => n.category?.trim()).filter(Boolean) as string[];
    const unique = Array.from(new Set(raw));
    return ['all', ...(unique.length > 0 ? unique : ['Akademik', 'Prestasi', 'Kegiatan Siswa', 'Guru & Tendik'])];
  }, [newsList]);

  // Filtered news
  const filteredNews = useMemo(() => {
    return newsList.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.excerpt && item.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.author && item.author.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [newsList, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header & Navbar */}
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

      <main className="flex-1">
        {/* Hero Banner Katalog */}
        <section className="bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full filter blur-3xl pointer-events-none" />

          <div className="max-w-6xl mx-auto space-y-6 relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
              <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors">
                <Home className="w-3.5 h-3.5" />
                <span>Beranda</span>
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-500" />
              <span className="text-white">Warta &amp; Berita</span>
            </div>

            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>KABAR SEKOLAH RESMI</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
                Pusat Informasi &amp; Kabar Terkini
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Dokumentasi prestasi, agenda kegiatan kurikuler, dan dinamika pembelajaran di {schoolProfile.name}.
              </p>
            </div>

            {/* Search Bar */}
            <div className="pt-4 max-w-xl">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari berita berdasarkan judul, topik, atau kata kunci..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/15 transition-all shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-3.5 text-xs text-slate-400 hover:text-white"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1 mr-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat === 'all' ? 'Semua Kategori' : cat}
              </button>
            ))}
          </div>

          {/* News Cards Grid */}
          {loading ? (
            <div className="py-24 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-500 text-sm font-medium">Memuat warta sekolah...</p>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Tidak ada berita yang ditemukan</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                {searchQuery
                  ? `Tidak ada artikel yang cocok dengan kata kunci "${searchQuery}". Coba gunakan kata kunci lain.`
                  : 'Belum ada artikel yang dipublikasikan pada kategori ini.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors"
                >
                  Tampilkan Semua Berita
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredNews.map((item) => {
                const coverImage =
                  normalizeImageUrl(item.featuredImage || item.imageUrl) ||
                  'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80';

                return (
                  <article
                    key={item.id}
                    className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
                  >
                    {/* Cover Image Container */}
                    <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-[11px] font-black uppercase tracking-wider shadow-sm">
                          {item.category || 'Umum'}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                          <span className="flex items-center gap-1 text-slate-500">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{item.publishedAt || 'Terbaru'}</span>
                          </span>
                          <span>•</span>
                          <span className="truncate max-w-[140px] flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            <span>{item.author && !item.author.includes('SMAN 1 Cerdas') ? item.author : 'Humas Sekolah'}</span>
                          </span>
                        </div>

                        <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">
                          {item.title}
                        </h2>

                        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                          {item.excerpt || item.content?.substring(0, 140)}...
                        </p>
                      </div>

                      {/* Read Link */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <Link
                          href={`/berita/${item.slug || item.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 group-hover:text-emerald-800 transition-colors"
                        >
                          <span>Baca Artikel Lengkap</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
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
