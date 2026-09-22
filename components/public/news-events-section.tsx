'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Bell,
} from 'lucide-react';
import { NewsItem, AnnouncementItem, EventItem } from '@/types';
import { normalizeImageUrl } from '@/lib/image-utils';

interface NewsEventsSectionProps {
  newsList: NewsItem[];
  announcements: AnnouncementItem[];
  events: EventItem[];
  onOpenView: (viewName: string, data?: any) => void;
}

export function NewsEventsSection({
  newsList,
  announcements,
  events,
  onOpenView,
}: NewsEventsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'Prestasi', 'Akademik', 'Kesiswaan', 'Kegiatan'];

  const filteredNews =
    selectedCategory === 'all'
      ? newsList
      : newsList.filter((n) => n.category.toLowerCase() === selectedCategory.toLowerCase());

  const featuredNews = filteredNews[0] || newsList[0];
  const sideNews = filteredNews.slice(1, 4);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        {/* Kolom Kiri: Warta & Berita Sekolah (Spans 8 cols on lg) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b-2 border-slate-900 pb-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-black uppercase tracking-widest mb-2">
                <Sparkles className="w-5 h-5" />
                <span>Warta Utama</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
                Berita Terkini
              </h2>
            </div>

            {/* Filter Kategori */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all uppercase tracking-wider ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-md scale-105'
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400 hover:text-slate-900'
                  }`}
                >
                  {cat === 'all' ? 'Semua' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Konten Berita Utama & Daftar */}
          {featuredNews ? (
            <div className="space-y-6">
              {/* Berita Utama (Featured Card - Editorial Cover) */}
              <Link
                href={`/berita/${featuredNews.slug || featuredNews.id}`}
                className="group relative block h-[28rem] rounded-3xl overflow-hidden shadow-2xl shadow-slate-300/50 cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    normalizeImageUrl(featuredNews.featuredImage || featuredNews.imageUrl) ||
                    'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80'
                  }
                  alt={featuredNews.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                
                {/* Dark Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
                
                <div className="absolute top-6 left-6 flex items-center gap-2">
                  <span className="bg-emerald-500 text-white text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg">
                    {featuredNews.category}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-3 text-sm text-emerald-300 font-semibold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5 bg-slate-950/50 backdrop-blur px-3 py-1 rounded-full">
                      <Calendar className="w-4 h-4" />
                      <span>{featuredNews.publishedAt || 'Terbaru'}</span>
                    </div>
                  </div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white group-hover:text-emerald-300 transition-colors leading-tight line-clamp-3">
                    {featuredNews.title}
                  </h3>
                  <p className="text-slate-300 text-sm sm:text-base line-clamp-2 max-w-3xl">
                    {featuredNews.excerpt || featuredNews.content?.substring(0, 150)}...
                  </p>
                </div>
              </Link>

              {/* Berita Tambahan Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {sideNews.map((item) => (
                  <Link
                    key={item.id}
                    href={`/berita/${item.slug || item.id}`}
                    className="group block cursor-pointer space-y-4"
                  >
                    <div className="h-48 rounded-2xl overflow-hidden bg-slate-100 relative shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          normalizeImageUrl(item.featuredImage || item.imageUrl) ||
                          'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow">
                        {item.category}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{item.publishedAt}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Tombol Menuju Katalog Arsip Berita Penuh */}
              <div className="pt-4 flex justify-center sm:justify-start">
                <Link
                  href="/berita"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all group"
                >
                  <span>Buka Semua Kabar &amp; Warta Sekolah</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-500 font-medium">
              Belum ada berita pada kategori ini.
            </div>
          )}
        </div>

        {/* Kolom Kanan: Agenda & Pengumuman (Spans 4 cols on lg) */}
        <div className="lg:col-span-4 space-y-8 lg:mt-16">
          {/* Agenda Kegiatan Terdekat */}
          <div className="bg-slate-900 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group/agenda">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="flex items-end justify-between border-b border-slate-700/50 pb-4 mb-6 relative z-10">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">Agenda</h3>
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mt-1">Bulan Ini</p>
              </div>
              <button
                onClick={() => onOpenView('news', { tab: 'agenda' })}
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors shadow-lg"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 relative z-10">
              {events.slice(0, 4).map((evt) => {
                const dateParts = evt.startDate?.split('-') || ['2026', '07', '15'];
                const day = dateParts[2] || '15';
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                const month = monthNames[parseInt(dateParts[1], 10) - 1] || 'Bulan';

                return (
                  <div
                    key={evt.id}
                    onClick={() => onOpenView('news', { tab: 'agenda', selectedEvent: evt })}
                    className="flex items-start gap-4 group cursor-pointer"
                  >
                    {/* Badge Tanggal */}
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-300 flex flex-col items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors shadow-md border border-slate-700 group-hover:border-emerald-400">
                      <span className="text-xs uppercase font-bold tracking-widest">{month}</span>
                      <span className="text-xl font-black leading-none">{day}</span>
                    </div>

                    <div className="space-y-1.5 flex-1 pt-1">
                      <h4 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                        {evt.title}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>{evt.time || '08.00 - Selesai'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pengumuman Terkini */}
          <div className="bg-emerald-600 rounded-[2rem] p-8 shadow-xl relative overflow-hidden group/announce">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full filter blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-black tracking-tight text-white">Pengumuman</h3>
            </div>

            <div className="space-y-4 relative z-10">
              {announcements.slice(0, 3).map((ann) => (
                <div
                  key={ann.id}
                  onClick={() => onOpenView('news', { tab: 'pengumuman', selectedAnnouncement: ann })}
                  className="p-4 rounded-2xl bg-emerald-700/50 hover:bg-emerald-800/80 transition-colors cursor-pointer group space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-300 px-2.5 py-0.5 rounded-full">
                      {ann.targetAudience || 'Umum'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                    {ann.title}
                  </h4>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center relative z-10">
               <button
                  onClick={() => onOpenView('news', { tab: 'pengumuman' })}
                  className="text-xs font-bold text-emerald-100 hover:text-white uppercase tracking-wider flex items-center justify-center gap-1 mx-auto"
                >
                  <span>Arsip Pengumuman</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
