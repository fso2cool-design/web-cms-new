'use client';

import React from 'react';
import {
  BellRing,
  BookMarked,
  HeartHandshake,
  Cpu,
  Trophy,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react';
import { AnnouncementItem } from '@/types';

interface QuickInfoSectionProps {
  announcements: AnnouncementItem[];
  onOpenView: (viewName: string, data?: any) => void;
}

export function QuickInfoSection({ announcements, onOpenView }: QuickInfoSectionProps) {
  const urgentAnnouncement =
    announcements.find((a) => a.isUrgent) || announcements[0];

  const pillars = [
    {
      icon: BookMarked,
      color: 'bg-emerald-600',
      textColor: 'text-white',
      bgColor: 'bg-emerald-700',
      title: 'Kurikulum Merdeka Unggul',
      desc: 'Diferensiasi pembelajaran mendalam, penguatan literasi sains-digital, dan Projek Penguatan Profil Pelajar Pancasila (P5).',
      actionText: 'Pelajari Kurikulum',
      viewTarget: 'akademik',
      subTarget: 'kurikulum',
      gridClass: 'md:col-span-2 md:row-span-2',
      isDark: true,
    },
    {
      icon: HeartHandshake,
      color: 'bg-blue-100 text-blue-600',
      textColor: 'text-slate-800',
      bgColor: 'bg-white',
      title: 'Karakter & Nilai Luhur',
      desc: 'Pembiasaan ibadah rutin dan penguatan budaya 5S.',
      actionText: 'Visi Misi',
      viewTarget: 'profile',
      subTarget: 'visi-misi',
      gridClass: 'md:col-span-2 md:row-span-1',
      isDark: false,
    },
    {
      icon: Cpu,
      color: 'bg-purple-100 text-purple-600',
      textColor: 'text-slate-800',
      bgColor: 'bg-slate-50',
      title: 'Fasilitas Mendukung',
      desc: 'Lingkungan belajar yang nyaman, asri, dan dilengkapi fasilitas pendukung pembelajaran terkini.',
      actionText: 'Fasilitas',
      viewTarget: 'akademik',
      subTarget: 'fasilitas',
      gridClass: 'md:col-span-1 md:row-span-1',
      isDark: false,
    },
    {
      icon: Trophy,
      color: 'bg-amber-100 text-amber-600',
      textColor: 'text-slate-800',
      bgColor: 'bg-amber-50',
      title: 'Ragam Ekstrakurikuler',
      desc: 'Wadah eksplorasi minat & bakat siswa untuk menorehkan prestasi.',
      actionText: 'Daftar Ekskul',
      viewTarget: 'akademik',
      subTarget: 'ekskul',
      gridClass: 'md:col-span-1 md:row-span-1',
      isDark: false,
    },
  ];

  return (
    <section className="relative z-30 -mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Pengumuman Mendesak / Running Announcement Bar */}
      {urgentAnnouncement && (
        <div
          onClick={() => onOpenView('news', urgentAnnouncement)}
          className="bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:shadow-emerald-500/20 hover:-translate-y-1 transition-all duration-300 border border-white group"
        >
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <BellRing className="w-6 h-6 text-emerald-600 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 px-2 py-0.5 rounded text-rose-600">
                  PENGUMUMAN PENTING
                </span>
                <span className="text-xs font-semibold text-slate-500 hidden md:inline">
                  {urgentAnnouncement.publishedAt || 'Terbaru'}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1">
                {urgentAnnouncement.title}
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-full shrink-0 w-full sm:w-auto justify-center transition-colors">
            <span>Baca Pengumuman</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      )}

      {/* 4 Pilar Utama Sekolah - BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
        {pillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <div
              key={idx}
              className={`rounded-3xl p-6 sm:p-8 ${pillar.bgColor} ${pillar.gridClass} shadow-xl shadow-slate-200/50 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group overflow-hidden relative cursor-pointer border border-black/5`}
              onClick={() => onOpenView(pillar.viewTarget, pillar.subTarget)}
            >
              {/* Decorative circle for dynamic feel */}
              <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10 transition-transform duration-700 group-hover:scale-150 ${pillar.isDark ? 'bg-white' : 'bg-current'}`} />
              
              <div className="space-y-4 relative z-10">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform ${pillar.color}`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className={`text-xl sm:text-2xl font-black tracking-tight mb-2 ${pillar.textColor}`}>
                    {pillar.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${pillar.isDark ? 'text-emerald-100' : 'text-slate-600'}`}>
                    {pillar.desc}
                  </p>
                </div>
              </div>

              <div className={`pt-6 mt-4 flex items-center gap-2 relative z-10 ${pillar.isDark ? 'text-white' : 'text-slate-800'}`}>
                <span className="text-sm font-bold uppercase tracking-wider">{pillar.actionText}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${pillar.isDark ? 'bg-white/20 group-hover:bg-white text-emerald-800' : 'bg-slate-200 group-hover:bg-emerald-500 group-hover:text-white'}`}>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
