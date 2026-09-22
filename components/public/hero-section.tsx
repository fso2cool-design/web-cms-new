'use client';

import React from 'react';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  Download,
  BookOpen,
  Award,
  Users,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { SchoolProfile } from '@/types';
import { normalizeImageUrl } from '@/lib/image-utils';

interface HeroSectionProps {
  schoolProfile: SchoolProfile;
  onOpenView: (viewName: string, data?: any) => void;
}

export function HeroSection({ schoolProfile, onOpenView }: HeroSectionProps) {
  return (
    <div className="relative bg-slate-900 text-white overflow-hidden">
      {/* Background Graphic & Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/90 via-slate-900/95 to-slate-950 z-10" />
      <div
        className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-35 filter blur-[0.5px] scale-105 transition-transform duration-1000"
        style={{
          backgroundImage: `url(${
            normalizeImageUrl(schoolProfile.heroImages?.[0]) ||
            'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=2000&q=80'
          })`,
        }}
      />

      {/* Decorative Gradient Blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/20 rounded-full filter blur-3xl pointer-events-none z-10" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/15 rounded-full filter blur-3xl pointer-events-none z-10" />

      {/* Hero Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 z-20">
        <div className="max-w-3xl space-y-6">
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{schoolProfile.excellenceBadge || 'Sekolah Penggerak'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 text-slate-200 text-xs font-semibold border border-slate-700 backdrop-blur-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{schoolProfile.accreditation || 'Terakreditasi'}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 text-xs font-medium border border-slate-700">
              <span>NPSN: {schoolProfile.npsn || '20101234'}</span>
            </span>
          </div>

          {/* Main Title / Headline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              {schoolProfile.slogan ? (
                <span>{schoolProfile.slogan}</span>
              ) : (
                <>
                  Membangun Generasi <br />
                  <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200 bg-clip-text text-transparent">
                    Cerdas, Berkarakter,
                  </span>{' '}
                  &amp; Berdaya Saing Global
                </>
              )}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
              Selamat datang di portal resmi <strong className="text-white">{schoolProfile.name}</strong>. {schoolProfile.description || 'Pusat keunggulan akademik, pengembangan karakter, dan inovasi pendidikan terpadu.'}
            </p>
          </div>

          {/* Action Callouts */}
          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            {(schoolProfile.features?.ppdbEnabled ?? true) && (
              <button
                id="hero-btn-ppdb"
                onClick={() => onOpenView('ppdb-apply')}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-emerald-900/40 hover:shadow-emerald-900/60 transition-all flex items-center gap-2.5 group"
              >
                <GraduationCap className="w-5 h-5 text-slate-950 group-hover:scale-110 transition-transform" />
                <span>Daftar PPDB {schoolProfile.ppdbYear || ''}</span>
                <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            <button
              id="hero-btn-profile"
              onClick={() => onOpenView('profile', 'visi-misi')}
              className="px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-sm sm:text-base border border-slate-700 backdrop-blur-sm transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Profil &amp; Visi Misi</span>
            </button>

            {(schoolProfile.features?.documentsEnabled ?? true) && (
              <button
                id="hero-btn-brochure"
                onClick={() => onOpenView('documents')}
                className="px-4 py-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-sm border border-slate-700/60 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>Unduh Brosur</span>
              </button>
            )}
          </div>
        </div>

        {/* Floating Quick Stats Card / Metric Counter Grid (Dynamic from schoolProfile) */}
        <div className="mt-14 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400">
              <Users className="w-5 h-5" />
              <span className="text-2xl sm:text-3xl font-black text-white">
                {schoolProfile.studentCount ? `${schoolProfile.studentCount}+` : '850+'}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-400">Peserta Didik Aktif</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-teal-400">
              <GraduationCap className="w-5 h-5" />
              <span className="text-2xl sm:text-3xl font-black text-white">
                {schoolProfile.teacherCount ? `${schoolProfile.teacherCount}` : '52'}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-400">Guru &amp; Tenaga Pendidik</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400">
              <Award className="w-5 h-5" />
              <span className="text-2xl sm:text-3xl font-black text-white">
                {schoolProfile.graduationRate || '98.4%'}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-400">Tingkat Kelulusan &amp; Sukses PTN</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-400">
              <Sparkles className="w-5 h-5" />
              <span className="text-2xl sm:text-3xl font-black text-white">
                {schoolProfile.classCount ? `${schoolProfile.classCount}` : '36'}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-400">Rombongan Belajar (Rombel)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
