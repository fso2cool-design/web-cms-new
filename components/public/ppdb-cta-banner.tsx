'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Calendar,
  FileCheck2,
  Users2,
  Clock,
  ArrowRight,
  Search,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface PPDBCTABannerProps {
  onOpenView: (viewName: string, data?: any) => void;
  schoolName?: string;
  faqEnabled?: boolean;
  ppdbYear?: string;
}

export function PPDBCTABanner({ onOpenView, schoolName, faqEnabled = true, ppdbYear = '2026/2027' }: PPDBCTABannerProps) {
  const steps = [
    {
      num: '01',
      title: 'Registrasi Akun & Data Diri',
      desc: 'Pengisian biodata siswa, NISN, data orang tua, dan pilihan jalur pendaftaran.',
    },
    {
      num: '02',
      title: 'Unggah Berkas & Nilai Rapor',
      desc: 'Scan Kartu Keluarga, Akta Kelahiran, Surat Keterangan Lulus, dan piagam prestasi.',
    },
    {
      num: '03',
      title: 'Verifikasi Berkas Panitia',
      desc: 'Validasi dokumen oleh panitia PPDB sekolah secara transparan dan akuntabel.',
    },
    {
      num: '04',
      title: 'Pengumuman & Daftar Ulang',
      desc: 'Cek kelulusan online dengan nomor registrasi dan konfirmasi daftar ulang.',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden border border-emerald-800/60">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-10">
          {/* Header */}
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow">
              <GraduationCap className="w-4 h-4" />
              <span>PPDB ONLINE {ppdbYear}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Raih Masa Depan Gemilang Bersama Kami
            </h2>

            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
              Penerimaan Peserta Didik Baru (PPDB) {schoolName ? `di ${schoolName}` : ''} Tahun Ajaran {ppdbYear} telah dibuka secara daring. Jalur Zonasi, Afirmasi, Prestasi Akademik/Non-Akademik, dan Perpindahan Tugas Orang Tua.
            </p>
          </div>

          {/* 4 Tahapan Pendaftaran */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((step) => (
              <div
                key={step.num}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-3"
              >
                <span className="text-2xl font-black text-amber-300 font-mono">{step.num}</span>
                <h4 className="text-sm font-bold text-white leading-snug">{step.title}</h4>
                <p className="text-xs text-emerald-100/80 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-emerald-800/80 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <Link
                id="cta-ppdb-register-btn"
                href="/ppdb"
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm sm:text-base shadow-lg transition-all flex items-center justify-center gap-2 group"
              >
                <GraduationCap className="w-5 h-5 text-slate-950 group-hover:scale-110 transition-transform" />
                <span>Isi Formulir Pendaftaran Sekarang</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                id="cta-ppdb-check-btn"
                href="/ppdb?tab=status"
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-sm border border-emerald-700/60 backdrop-blur-sm transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4 text-emerald-400" />
                <span>Cek Status Pendaftaran</span>
              </Link>
            </div>

            {faqEnabled && (
              <button
                onClick={() => onOpenView('faq')}
                className="text-xs text-emerald-200 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-amber-300" />
                <span>Pertanyaan Seputar PPDB? Baca FAQ</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
