'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  BookOpen,
  Award,
  Sparkles,
  Search,
  Home,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Users,
  Compass,
} from 'lucide-react';
import { PublicNavbar } from '@/components/layout/public-navbar';
import { PublicFooter } from '@/components/layout/public-footer';
import { getSchoolProfile } from '@/services/school.service';
import { getPublishedFacilities } from '@/services/facility.service';
import { getActiveExtracurriculars } from '@/services/extracurricular.service';
import { getVisitorAnalytics } from '@/services/analytics.service';
import {
  initialSchoolProfile,
  initialFacilities,
  initialExtracurriculars,
  initialVisitorAnalytics,
} from '@/lib/seed-data';
import { SchoolProfile, FacilityItem, ExtracurricularItem, VisitorAnalytics } from '@/types';
import { normalizeImageUrl } from '@/lib/image-utils';

function AkademikContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(initialSchoolProfile);
  const [facilities, setFacilities] = useState<FacilityItem[]>(initialFacilities);
  const [extracurriculars, setExtracurriculars] = useState<ExtracurricularItem[]>(initialExtracurriculars);
  const [visitorAnalytics, setVisitorAnalytics] = useState<VisitorAnalytics>(initialVisitorAnalytics);

  const [activeTab, setActiveTab] = useState<string>(tabParam || 'kurikulum');
  const [loading, setLoading] = useState(true);

  // Ekskul Filter
  const [ekskulSearch, setEkskulSearch] = useState('');
  const [selectedEkskulCategory, setSelectedEkskulCategory] = useState('all');

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, facRes, ekskulRes, analyticsRes] = await Promise.allSettled([
          getSchoolProfile(),
          getPublishedFacilities(),
          getActiveExtracurriculars(),
          getVisitorAnalytics(),
        ]);

        if (profileRes.status === 'fulfilled' && profileRes.value) {
          setSchoolProfile(profileRes.value);
          document.title = `Akademik & Kurikulum | ${profileRes.value.name || 'Portal Resmi'}`;
        }
        if (facRes.status === 'fulfilled' && Array.isArray(facRes.value) && facRes.value.length > 0) {
          setFacilities(facRes.value);
        }
        if (ekskulRes.status === 'fulfilled' && Array.isArray(ekskulRes.value) && ekskulRes.value.length > 0) {
          setExtracurriculars(ekskulRes.value);
        }
        if (analyticsRes.status === 'fulfilled' && analyticsRes.value) {
          setVisitorAnalytics(analyticsRes.value);
        }
      } catch (err) {
        console.warn('Error fetching akademik data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const tabs = [
    { id: 'kurikulum', label: 'Kurikulum Merdeka & P5', icon: BookOpen },
    { id: 'ekskul', label: 'Ekstrakurikuler Siswa', icon: Award },
    { id: 'fasilitas', label: 'Sarana & Prasarana', icon: Building2 },
  ];

  // Ekskul Categories
  const ekskulCategories = useMemo(() => {
    const raw = extracurriculars.map((e) => e.category?.trim()).filter(Boolean) as string[];
    return ['all', ...Array.from(new Set(raw))];
  }, [extracurriculars]);

  const filteredEkskuls = useMemo(() => {
    return extracurriculars.filter((item) => {
      const matchCat =
        selectedEkskulCategory === 'all' || item.category?.toLowerCase() === selectedEkskulCategory.toLowerCase();
      const matchSearch =
        !ekskulSearch.trim() ||
        item.name.toLowerCase().includes(ekskulSearch.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(ekskulSearch.toLowerCase())) ||
        (item.mentor && item.mentor.toLowerCase().includes(ekskulSearch.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [extracurriculars, selectedEkskulCategory, ekskulSearch]);

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
              <span className="text-white">Akademik &amp; Sarana</span>
            </div>

            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>PENDIDIKAN &amp; PEMBINAAN SISWA</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
                Kurikulum Unggulan &amp; Ekosistem Belajar
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Menumbuhkan daya nalar kritis, kreativitas, kepemimpinan, dan kemandirian peserta didik melalui Kurikulum Merdeka dan sarana penunjang yang representatif.
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

          {/* TAB 1: KURIKULUM MERDEKA */}
          {activeTab === 'kurikulum' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>IMPLEMENTASI KURIKULUM MERDEKA</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
                  Pembelajaran Terdiferensiasi Berbasis Karakter &amp; Potensi Siswa
                </h3>
                <div className="prose prose-slate max-w-none text-sm sm:text-base text-slate-700 leading-relaxed space-y-4">
                  <p>
                    {schoolProfile.curriculumOverview ||
                      `${schoolProfile.name} menerapkan Kurikulum Merdeka secara menyeluruh, mengedepankan pembelajaran bermakna yang disesuaikan dengan bakat, minat, dan kesiapan belajar masing-masing peserta didik.`}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      <span>Intrakurikuler</span>
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {schoolProfile.curriculumDetails?.intrakurikuler ||
                        'Mata pelajaran inti dengan fokus pada penguatan kompetensi literasi, numerasi, dan sains teknologi.'}
                    </p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Projek P5</span>
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {schoolProfile.curriculumDetails?.kokurikuler ||
                        'Projek Penguatan Profil Pelajar Pancasila untuk menanamkan gotong royong, kemandirian, dan bernalar kritis.'}
                    </p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-600" />
                      <span>Ekstrakurikuler</span>
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {schoolProfile.curriculumDetails?.ekstrakurikuler ||
                        'Wadah penyaluran bakat kepemimpinan, seni budaya, olahraga, keagamaan, dan riset ilmiah.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EKSTRAKURIKULER */}
          {activeTab === 'ekskul' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                {/* Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {ekskulCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedEkskulCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        selectedEkskulCategory === cat
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {cat === 'all' ? 'Semua Bidang' : cat}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={ekskulSearch}
                    onChange={(e) => setEkskulSearch(e.target.value)}
                    placeholder="Cari nama ekskul..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  />
                </div>
              </div>

              {filteredEkskuls.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 text-slate-500 text-sm">
                  Tidak ada ekstrakurikuler yang sesuai pencarian.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEkskuls.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                            {item.category || 'Umum'}
                          </span>
                          {item.schedule && (
                            <span className="text-[11px] text-slate-400 font-medium">{item.schedule}</span>
                          )}
                        </div>

                        <h4 className="text-lg font-bold text-slate-900">{item.name}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {item.description || 'Kegiatan pembinaan bakat dan minat siswa.'}
                        </p>
                      </div>

                      {item.mentor && (
                        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Pembina: {item.mentor}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FASILITAS */}
          {activeTab === 'fasilitas' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {facilities.map((fac) => (
                  <div
                    key={fac.id}
                    className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                  >
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          normalizeImageUrl(fac.imageUrl) ||
                          'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={fac.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-6 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h4 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {fac.name}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {fac.description || 'Fasilitas representatif untuk menunjang kenyamanan kegiatan belajar mengajar.'}
                        </p>
                      </div>
                      {fac.capacity && (
                        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                          Kapasitas: {fac.capacity} orang
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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

export default function AkademikPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <AkademikContent />
    </Suspense>
  );
}
