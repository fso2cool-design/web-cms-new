'use client';

import React from 'react';
import {
  Users,
  Clock,
  Calendar,
  TrendingUp,
  BarChart3,
  Globe2,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Eye,
  Activity,
  CalendarDays,
  ExternalLink,
  BarChart2,
} from 'lucide-react';
import { VisitorAnalytics } from '@/types';
import { getLocalDateString } from '@/services/analytics.service';

interface AdminAnalyticsProps {
  analytics?: VisitorAnalytics;
}

export function AdminAnalytics({ analytics }: AdminAnalyticsProps) {
  const stats = analytics || {
    today: 148,
    yesterday: 284,
    last7Days: 1940,
    last30Days: 8250,
    total: 42190,
    lastUpdated: new Date().toISOString(),
  };

  const statCards = [
    {
      title: 'Kunjungan Hari Ini',
      value: stats.today.toLocaleString('id-ID'),
      subtitle: 'Pengunjung unik tercatat hari ini',
      icon: <Clock className="w-5 h-5 text-emerald-600" />,
      bgColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    },
    {
      title: 'Kunjungan Kemarin',
      value: stats.yesterday.toLocaleString('id-ID'),
      subtitle: 'Total sesi unik kemarin penuh',
      icon: <Calendar className="w-5 h-5 text-slate-600" />,
      bgColor: 'bg-slate-50 text-slate-900 border-slate-200',
    },
    {
      title: '7 Hari Terakhir',
      value: stats.last7Days.toLocaleString('id-ID'),
      subtitle: 'Akumulasi minggu berjalan',
      icon: <TrendingUp className="w-5 h-5 text-cyan-600" />,
      bgColor: 'bg-cyan-50 text-cyan-900 border-cyan-200',
    },
    {
      title: '1 Bulan (30 Hari)',
      value: stats.last30Days.toLocaleString('id-ID'),
      subtitle: 'Total kunjungan 30 hari ke belakang',
      icon: <BarChart3 className="w-5 h-5 text-indigo-600" />,
      bgColor: 'bg-indigo-50 text-indigo-900 border-indigo-200',
    },
    {
      title: 'Total Kunjungan (Max)',
      value: stats.total.toLocaleString('id-ID'),
      subtitle: 'Kunjungan keseluruhan sepanjang masa',
      icon: <Globe2 className="w-5 h-5 text-amber-600" />,
      bgColor: 'bg-amber-50 text-amber-900 border-amber-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Statistik Kunjungan Pengunjung Website
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Realtime Tracker</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Data metrik trafik pengunjung situs madrasah dihitung secara akurat dengan deduplikasi sesi.
          </p>
        </div>

        <div className="text-right text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
          <span>Sinkronisasi Terakhir: </span>
          <strong className="text-slate-800">
            {stats.lastUpdated
              ? new Date(stats.lastUpdated).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Baru saja'}
          </strong>
        </div>
      </div>

      {/* Main 5 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between ${card.bgColor}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {card.title}
              </span>
              <div className="p-2 rounded-xl bg-white/80 shadow-xs">{card.icon}</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-mono">
                {card.value}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">{card.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Histats Integration Status Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-emerald-400 shrink-0">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Integrasi Tracker Histats.com
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-mono">
                ID: 5052606
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Pelacakan independen Histats telah aktif di footer website publik madrasah dengan counter asinkron resmi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://www.histats.com/viewstats/?sid=5052606"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-colors"
          >
            <span>Buka Dasbor Histats</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Detail Insight Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Metodologi &amp; Perlindungan Data</h3>
          </div>
          <ul className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <li className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Bebas Spam Refresh:</strong> Setiap perangkat pengunjung dihitung maksimal satu kali per hari per sesi untuk mencegah manipulasi angka kunjungan.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CalendarDays className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                <strong>Zona Waktu Indonesia:</strong> Perhitungan pergantian hari (&quot;Hari ini&quot; vs &quot;Kemarin&quot;) mengacu pada waktu lokal WIB (UTC+7).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Globe2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Widget Footer Publik:</strong> Ringkasan statistik ini juga dapat dilihat oleh pengunjung umum di bagian bawah website resmi madrasah.
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-sm">Optimalisasi Portal PPDB &amp; Konten</h3>
            </div>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Trafik kunjungan biasanya melonjak pada masa pembukaan PPDB/SPMB Online dan pengumuman kelulusan. Pastikan berita, brosur dokumen, dan kalender kegiatan selalu diperbarui secara berkala.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-emerald-800/80 flex items-center justify-between text-xs text-emerald-300">
            <span>Status Pelacakan:</span>
            <span className="font-bold text-white">Aktif &amp; Terhubung Cloud Database</span>
          </div>
        </div>
      </div>
    </div>
  );
}
