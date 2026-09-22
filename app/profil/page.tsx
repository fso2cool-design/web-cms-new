'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  BookOpen,
  UserCheck,
  Users,
  Award,
  Calendar,
  Home,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Building2,
  GraduationCap,
} from 'lucide-react';
import { PublicNavbar } from '@/components/layout/public-navbar';
import { PublicFooter } from '@/components/layout/public-footer';
import { getSchoolProfile } from '@/services/school.service';
import { getVisitorAnalytics } from '@/services/analytics.service';
import { initialSchoolProfile, initialVisitorAnalytics } from '@/lib/seed-data';
import { SchoolProfile, VisitorAnalytics } from '@/types';
import { normalizeImageUrl } from '@/lib/image-utils';

function ProfilContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(initialSchoolProfile);
  const [visitorAnalytics, setVisitorAnalytics] = useState<VisitorAnalytics>(initialVisitorAnalytics);
  const [activeTab, setActiveTab] = useState<string>(tabParam || 'visi-misi');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, analyticsRes] = await Promise.allSettled([
          getSchoolProfile(),
          getVisitorAnalytics(),
        ]);

        if (profileRes.status === 'fulfilled' && profileRes.value) {
          setSchoolProfile(profileRes.value);
          document.title = `Profil Sekolah | ${profileRes.value.name || 'Portal Resmi'}`;
        }
        if (analyticsRes.status === 'fulfilled' && analyticsRes.value) {
          setVisitorAnalytics(analyticsRes.value);
        }
      } catch (err) {
        console.warn('Error fetching school profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const tabs = [
    { id: 'visi-misi', label: 'Visi, Misi & Nilai', icon: BookOpen },
    { id: 'sambutan', label: 'Sambutan Kepala Sekolah', icon: UserCheck },
    { id: 'sejarah', label: 'Sejarah & Identitas', icon: Sparkles },
    { id: 'struktur', label: 'Struktur Organisasi', icon: Users },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <PublicNavbar
        schoolProfile={schoolProfile}
        onOpenView={(view) => {
          if (view === 'home') window.location.href = '/';
          else window.location.href = `/?view=${view}`;
        }}
        onOpenAdmin={() => {
          window.location.href = '/?admin=login';
        }}
      />

      <main className="flex-1">
        {/* Hero Header */}
        <section className="bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none" />
          <div className="max-w-6xl mx-auto space-y-6 relative z-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
              <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors">
                <Home className="w-3.5 h-3.5" />
                <span>Beranda</span>
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-500" />
              <span className="text-white">Profil Sekolah</span>
            </div>

            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>IDENTITAS RESMI INSTITUSI</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
                Mengenal Lebih Dekat {schoolProfile.shortName || schoolProfile.name}
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Komitmen kami dalam membina generasi muda yang berakhlak mulia, unggul dalam sains dan teknologi, serta berwawasan kebangsaan yang kokoh.
              </p>
            </div>
          </div>
        </section>

        {/* Tab Nav & Content */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          {/* Navigation Pills */}
          <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-3 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: VISI MISI */}
          {activeTab === 'visi-misi' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>VISI SEKOLAH</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
                  “{schoolProfile.vision || 'Terwujudnya Peserta Didik yang Beriman, Bertaqwa, Cerdas, Terampil, Mandiri, dan Berwawasan Global.'}”
                </h3>
              </div>

              <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>MISI SEKOLAH</span>
                </div>
                <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
                  {schoolProfile.mission ? (
                    schoolProfile.mission.split('\n').map((m, idx) => {
                      if (!m.trim()) return null;
                      return (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{m.replace(/^[-*\d.]+\s*/, '')}</span>
                        </div>
                      );
                    })
                  ) : (
                    <p>Misi sekolah memuat pembinaan akhlak, penguatan kurikulum, dan pengembangan potensi siswa.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SAMBUTAN KEPALA SEKOLAH */}
          {activeTab === 'sambutan' && (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs animate-in fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                <div className="lg:col-span-4 space-y-4">
                  <div className="rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        normalizeImageUrl(schoolProfile.principalPhoto) ||
                        'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={schoolProfile.principalName}
                      className="w-full h-80 object-cover object-top"
                    />
                  </div>
                  <div className="text-center space-y-1">
                    <h4 className="font-extrabold text-lg text-slate-900">{schoolProfile.principalName}</h4>
                    <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider">
                      {schoolProfile.principalRole || 'Kepala Sekolah'}
                    </p>
                    {schoolProfile.principalNip && (
                      <p className="text-xs text-slate-400">NIP: {schoolProfile.principalNip}</p>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>SAMBUTAN RESMI</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                    Membangun Generasi Emas yang Berkarakter dan Berdaya Saing Global
                  </h3>
                  <div className="prose prose-slate max-w-none text-sm sm:text-base text-slate-700 leading-relaxed space-y-4">
                    {schoolProfile.principalSpeech ? (
                      schoolProfile.principalSpeech.split('\n\n').map((p, idx) => (
                        <p key={idx}>{p}</p>
                      ))
                    ) : (
                      <p>Selamat datang di portal resmi sekolah kami. Kami berkomitmen menyelenggarakan pendidikan yang berpusat pada murid dengan nilai-nilai luhur dan integritas tinggi.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SEJARAH & IDENTITAS */}
          {activeTab === 'sejarah' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>SEJARAH PENDIRIAN</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  Perjalanan Menuju Keunggulan
                </h3>
                <div className="prose prose-slate max-w-none text-sm sm:text-base text-slate-700 leading-relaxed space-y-4">
                  {schoolProfile.history ? (
                    schoolProfile.history.split('\n\n').map((p, idx) => <p key={idx}>{p}</p>)
                  ) : (
                    <p>Sekolah didirikan dengan tujuan menjadi wadah pembinaan generasi penerus yang berilmu, beriman, dan berakhlak mulia di tengah perkembangan peradaban modern.</p>
                  )}
                </div>
              </div>

              {/* Data Identitas Statik */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">NPSN Resmi</span>
                  <p className="text-2xl font-black text-slate-900">{schoolProfile.npsn || '-'}</p>
                  <p className="text-xs text-slate-500">Kementerian Pendidikan Dasar &amp; Menengah</p>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Status Akreditasi</span>
                  <p className="text-2xl font-black text-emerald-700">Akreditasi {schoolProfile.accreditation || 'Unggul'}</p>
                  <p className="text-xs text-slate-500">Badan Akreditasi Nasional (BAN-PDM)</p>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Tahun Berdiri</span>
                  <p className="text-2xl font-black text-slate-900">{schoolProfile.establishedYear || '2020'}</p>
                  <p className="text-xs text-slate-500">Mencetak Lulusan Berkarakter</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STRUKTUR ORGANISASI */}
          {activeTab === 'struktur' && (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs space-y-8 animate-in fade-in">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <Users className="w-3.5 h-3.5" />
                  <span>TATA KELOLA &amp; MANAJEMEN</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  Struktur Organisasi Sekolah
                </h3>
                <p className="text-sm text-slate-500">
                  Kepemimpinan yang sinergis antara Kepala Sekolah, Dewan Guru, Komite Sekolah, dan Staf Tata Usaha.
                </p>
              </div>

              {schoolProfile.organizationChartUrl ? (
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={normalizeImageUrl(schoolProfile.organizationChartUrl)}
                    alt="Bagan Struktur Organisasi"
                    className="w-full max-h-[600px] object-contain mx-auto"
                  />
                </div>
              ) : (
                <div className="p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-300 text-center space-y-4 max-w-2xl mx-auto">
                  <div className="p-4 bg-emerald-700 text-white rounded-2xl font-bold text-base shadow-md">
                    Kepala Sekolah: {schoolProfile.principalName}
                  </div>
                  <div className="h-6 w-0.5 bg-slate-300 mx-auto" />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 shadow-xs">
                      Wakasek Bid. Kurikulum
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 shadow-xs">
                      Wakasek Bid. Kesiswaan
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 shadow-xs">
                      Wakasek Bid. Sarana &amp; Humas
                    </div>
                  </div>
                  <div className="h-6 w-0.5 bg-slate-300 mx-auto" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                    <div className="p-2.5 bg-white rounded-xl text-xs text-slate-700 font-medium border border-slate-200">
                      Dewan Guru &amp; Wali Kelas
                    </div>
                    <div className="p-2.5 bg-white rounded-xl text-xs text-slate-700 font-medium border border-slate-200">
                      Tata Usaha &amp; Tenaga Kependidikan
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <PublicFooter
        schoolProfile={schoolProfile}
        visitorAnalytics={visitorAnalytics}
        onOpenView={(view) => {
          if (view === 'home') window.location.href = '/';
          else window.location.href = `/?view=${view}`;
        }}
        onOpenAdmin={() => {
          window.location.href = '/?admin=login';
        }}
      />
    </div>
  );
}

export default function ProfilPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <ProfilContent />
    </Suspense>
  );
}
