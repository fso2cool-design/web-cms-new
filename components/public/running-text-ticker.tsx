'use client';

import React, { useState } from 'react';
import { Volume2, ChevronRight, AlertCircle } from 'lucide-react';
import { AnnouncementItem } from '@/types';

interface RunningTextTickerProps {
  announcements: AnnouncementItem[];
  onOpenView: (viewName: string, data?: any) => void;
  customText?: string;
}

export function RunningTextTicker({
  announcements,
  onOpenView,
  customText,
}: RunningTextTickerProps) {
  const [isPaused, setIsPaused] = useState(false);

  // Filter published announcements or fallback text
  const activeAnnouncements = announcements.filter(
    (a) => a.status === 'published' || !a.status
  );

  const tickerItems =
    activeAnnouncements.length > 0
      ? activeAnnouncements
      : [
          {
            id: 'default-1',
            title: customText || 'Selamat datang di Portal Resmi Madrasah / Sekolah. Informasi Penerimaan Peserta Didik Baru (PPDB) Tahun Ajaran 2026/2027 telah dibuka.',
            priority: 'urgent',
            date: new Date().toISOString().split('T')[0],
          } as AnnouncementItem,
        ];

  return (
    <div
      id="running-text-ticker-bar"
      className="bg-emerald-950 border-b border-emerald-800/80 text-white relative z-20 shadow-xs overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-10 text-xs sm:text-sm">
        {/* Fixed Badge Label */}
        <div className="flex items-center gap-2 pr-3 py-1 bg-emerald-950 font-bold shrink-0 border-r border-emerald-800/80 z-10">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
          </span>
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="uppercase tracking-wider text-[11px] font-black text-emerald-200">
            Pengumuman
          </span>
        </div>

        {/* Marquee Content */}
        <div
          className="flex-1 overflow-hidden relative ml-3 cursor-pointer select-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div
            className={`flex items-center gap-8 whitespace-nowrap will-change-transform ${
              isPaused ? '[animation-play-state:paused]' : ''
            }`}
            style={{
              animation: 'ticker 35s linear infinite',
            }}
          >
            {/* Repeated twice to ensure seamless continuous loop */}
            {[...tickerItems, ...tickerItems].map((item, idx) => (
              <button
                key={`${item.id}-${idx}`}
                onClick={() => onOpenView('announcements', item)}
                className="inline-flex items-center gap-2 text-slate-200 hover:text-amber-300 transition-colors group text-left"
              >
                {item.priority === 'urgent' && (
                  <span className="px-1.5 py-0.5 rounded-sm bg-rose-600/90 text-white text-[10px] font-bold tracking-tight">
                    PENTING
                  </span>
                )}
                <span className="font-medium text-xs sm:text-sm group-hover:underline">
                  {item.title}
                </span>
                <ChevronRight className="w-3 h-3 text-emerald-400 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                <span className="text-emerald-700 mx-2 select-none">•</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Link to All Announcements */}
        <div className="hidden md:flex items-center pl-3 bg-emerald-950 shrink-0 border-l border-emerald-800/80 z-10">
          <button
            onClick={() => onOpenView('announcements')}
            className="text-[11px] font-semibold text-emerald-300 hover:text-white transition-colors"
          >
            Semua Info &rarr;
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes ticker {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
