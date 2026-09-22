'use client';

import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Users,
  Award,
  Calendar,
  FileText,
  Download,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  GraduationCap,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Compass,
  User,
} from 'lucide-react';
import { initialExtracurriculars } from '@/lib/seed-data';
import {
  SchoolProfile,
  TeacherItem,
  NewsItem,
  AnnouncementItem,
  EventItem,
  AchievementItem,
  GalleryItem,
  DocumentItem,
  PPDBApplicantItem,
  FacilityItem,
  ExtracurricularItem,
} from '@/types';
import { submitPPDBApplication, getApplicantByRegNumber } from '@/services/ppdb.service';
import { normalizeImageUrl, getAlternativeImageUrls, getGallerySourceUrl, getImagePreviewUrls } from '@/lib/image-utils';

interface PublicViewsModalProps {
  viewName: string | null;
  initialData?: any;
  onClose: () => void;
  schoolProfile: SchoolProfile;
  teachers: TeacherItem[];
  newsList: NewsItem[];
  announcements: AnnouncementItem[];
  events: EventItem[];
  achievements: AchievementItem[];
  galleries: GalleryItem[];
  documents: DocumentItem[];
  facilities?: FacilityItem[];
  extracurriculars?: ExtracurricularItem[];
}

export function PublicViewsModal({
  viewName,
  initialData,
  onClose,
  schoolProfile,
  teachers,
  newsList,
  announcements,
  events,
  achievements,
  galleries,
  documents,
  facilities = [],
  extracurriculars = [],
}: PublicViewsModalProps) {
  if (!viewName || viewName === 'home') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header Modal */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              {viewName === 'profile' && <BookOpen className="w-5 h-5 text-amber-300" />}
              {viewName === 'akademik' && <Award className="w-5 h-5 text-amber-300" />}
              {viewName === 'teachers' && <Users className="w-5 h-5 text-amber-300" />}
              {viewName === 'news' && <Calendar className="w-5 h-5 text-amber-300" />}
              {viewName === 'prestasi' && <Award className="w-5 h-5 text-amber-300" />}
              {viewName === 'gallery' && <Sparkles className="w-5 h-5 text-amber-300" />}
              {viewName === 'documents' && <FileText className="w-5 h-5 text-amber-300" />}
              {viewName === 'ppdb-apply' && <GraduationCap className="w-5 h-5 text-amber-300" />}
              {viewName === 'ppdb-status' && <Search className="w-5 h-5 text-amber-300" />}
              {viewName === 'faq' && <HelpCircle className="w-5 h-5 text-amber-300" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {viewName === 'profile' && 'Profil Lembaga Sekolah'}
                {viewName === 'akademik' && 'Akademik & Kurikulum'}
                {viewName === 'teachers' && 'Direktori Pendidik & Tenaga Kependidikan'}
                {viewName === 'news' && 'Pusat Berita, Pengumuman & Agenda'}
                {viewName === 'prestasi' && 'Torehan Prestasi Siswa & Guru'}
                {viewName === 'gallery' && 'Dokumentasi Galeri Sekolah'}
                {viewName === 'documents' && 'Pusat Unduhan Berkas & Dokumen'}
                {viewName === 'ppdb-apply' && `Formulir Pendaftaran PPDB Online ${schoolProfile.ppdbYear || ''}`}
                {viewName === 'ppdb-status' && 'Pencarian & Cek Status Berkas PPDB'}
                {viewName === 'faq' && 'Pertanyaan Umum (FAQ)'}
              </h3>
              <p className="text-xs text-slate-400">
                {schoolProfile.name} • NPSN: {schoolProfile.npsn}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Tutup jendela"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body Area (Scrollable) */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
          {viewName === 'profile' && (
            <ProfileView schoolProfile={schoolProfile} subSection={typeof initialData === 'string' ? initialData : undefined} />
          )}
          {viewName === 'akademik' && (
            <AkademikView
              schoolProfile={schoolProfile}
              facilities={facilities}
              extracurriculars={extracurriculars}
              subSection={typeof initialData === 'string' ? initialData : undefined}
            />
          )}
          {viewName === 'teachers' && (
            <TeachersView teachers={teachers} initialTeacher={typeof initialData === 'object' ? initialData : undefined} />
          )}
          {viewName === 'news' && (
            <NewsView
              newsList={newsList}
              announcements={announcements}
              events={events}
              initialData={initialData}
            />
          )}
          {viewName === 'prestasi' && (
            <AchievementsView achievements={achievements} initialAchievement={typeof initialData === 'object' ? initialData : undefined} />
          )}
          {viewName === 'gallery' && (
            <GalleriesView galleries={galleries} />
          )}
          {viewName === 'documents' && (
            <DocumentsView documents={documents} />
          )}
          {viewName === 'ppdb-apply' && (
            <PPDBApplyView
              schoolName={schoolProfile?.name}
              ppdbYear={schoolProfile?.ppdbYear}
              ppdbTracks={schoolProfile?.ppdbTracks}
            />
          )}
          {viewName === 'ppdb-status' && (
            <PPDBStatusView schoolName={schoolProfile?.name} />
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SUB VIEW 1: PROFIL SEKOLAH
// -------------------------------------------------------------
function ProfileView({ schoolProfile, subSection }: { schoolProfile: SchoolProfile; subSection?: string }) {
  const [activeTab, setActiveTab] = useState<string>(subSection || 'visi-misi');

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-3 -mx-1 px-1 scrollbar-none flex-nowrap">
        {[
          { id: 'visi-misi', label: 'Visi, Misi & Tujuan' },
          { id: 'sambutan', label: 'Sambutan Kepala Sekolah' },
          { id: 'sejarah', label: 'Sejarah & Identitas' },
          { id: 'struktur', label: 'Struktur Organisasi' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeTab === tab.id
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'visi-misi' && (
        <div className="space-y-6">
          {/* Card Visi */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>VISI SEKOLAH</span>
            </div>
            <h4 className="text-xl font-extrabold text-slate-900 leading-snug">
              “{schoolProfile.vision || 'Terwujudnya Peserta Didik yang Beriman, Bertaqwa, Cerdas, Terampil, Mandiri, dan Berwawasan Global.'}”
            </h4>
          </div>

          {/* Card Misi */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>MISI SEKOLAH</span>
            </div>
            <ul className="space-y-3 text-sm text-slate-700">
              {(Array.isArray(schoolProfile.mission)
                ? schoolProfile.mission
                : typeof schoolProfile.mission === 'string' && schoolProfile.mission.includes('\n')
                ? schoolProfile.mission.split('\n').filter((m) => m.trim().length > 0)
                : typeof schoolProfile.mission === 'string' && schoolProfile.mission.length > 0
                ? [schoolProfile.mission]
                : [
                    'Menyelenggarakan proses pembelajaran berdiferensiasi yang aktif, inovatif, dan berpusat pada peserta didik.',
                    'Menumbuhkan penghayatan terhadap ajaran agama serta budaya bangsa sebagai sumber kearifan berperilaku.',
                    'Meningkatkan kompetensi literasi, numerasi, dan sains digital berbasis teknologi informasi modern.',
                    'Membina bakat, minat, dan potensi kepemimpinan siswa melalui kegiatan ekstrakurikuler terarah.',
                    'Mewujudkan lingkungan sekolah yang asri, bersih, ramah anak, dan berwawasan lingkungan hidup.',
                  ]
              ).map((misi: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{misi}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'sambutan' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-slate-100 pb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={normalizeImageUrl(schoolProfile.principalPhoto) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
              alt={schoolProfile.principalName}
              className="w-24 h-28 object-cover rounded-2xl shadow border border-slate-200"
            />
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-lg font-bold text-slate-900">{schoolProfile.principalName}</h4>
              <p className="text-xs text-emerald-700 font-semibold">Kepala Sekolah {schoolProfile.name}</p>
              {schoolProfile.principalNip && (
                <p className="text-xs text-slate-500">NIP. {schoolProfile.principalNip}</p>
              )}
            </div>
          </div>
          <div className="space-y-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            <p>
              {schoolProfile.principalSpeech ||
                'Puji syukur ke hadirat Tuhan Yang Maha Esa atas rahmat dan karunia-Nya sehingga website resmi sekolah kami dapat hadir sebagai sarana publikasi dan komunikasi. Kami berkomitmen untuk terus berinovasi dan memberikan layanan pendidikan terbaik bagi seluruh peserta didik.'}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'sejarah' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 text-sm text-slate-700 leading-relaxed">
          <h4 className="text-base font-bold text-slate-900">Sejarah Pendirian &amp; Perkembangan</h4>
          <p>
            {schoolProfile.history ||
              'Didirikan pada tahun 1985, sekolah ini telah melalui perjalanan panjang dalam mencerdaskan kehidupan bangsa. Dimulai dengan fasilitas awal yang sederhana, kini sekolah telah bertransformasi menjadi salah satu institusi pendidikan rujukan di tingkat provinsi dan nasional dengan predikat Akreditasi A (Unggul).'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-xs text-slate-500">Tahun Berdiri</span>
              <p className="text-base font-bold text-slate-900">{schoolProfile.establishedYear || '1985'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-xs text-slate-500">Status Akreditasi</span>
              <p className="text-base font-bold text-emerald-700">{schoolProfile.accreditation || 'A (Unggul)'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-xs text-slate-500">NPSN</span>
              <p className="text-base font-bold text-slate-900">{schoolProfile.npsn || '20101234'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-xs text-slate-500">Bentuk Pendidikan</span>
              <p className="text-base font-bold text-slate-900">{schoolProfile.educationLevel || 'SMA / Negeri'}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'struktur' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-base font-bold text-slate-900">Bagan Struktur Organisasi Sekolah</h4>
              <p className="text-xs text-slate-500">Struktur kepemimpinan, tenaga pendidik, dan tata usaha resmi.</p>
            </div>
            {schoolProfile.organizationChartUrl && (
              <a
                href={schoolProfile.organizationChartUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors w-fit"
              >
                <span>Lihat Gambar Penuh</span>
                <span>↗</span>
              </a>
            )}
          </div>

          {schoolProfile.organizationChartUrl ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-2 sm:p-4 overflow-hidden text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={normalizeImageUrl(schoolProfile.organizationChartUrl)}
                  alt={`Bagan Struktur Organisasi ${schoolProfile.name}`}
                  className="w-full max-h-[500px] object-contain mx-auto rounded-xl shadow-xs bg-white"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              {/* Collapsible details for textual fallback */}
              <details className="group border border-slate-200 rounded-xl bg-slate-50/70 p-3">
                <summary className="text-xs font-bold text-slate-700 cursor-pointer list-none flex items-center justify-between">
                  <span>Lihat Diagram Hirarki Teks</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="p-4 mt-3 bg-white rounded-xl border border-slate-200 text-center space-y-2">
                  <div className="w-full max-w-sm mx-auto p-3 bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs">
                    Kepala Sekolah: {schoolProfile.principalName}
                  </div>
                  <div className="h-4 w-0.5 bg-slate-300 mx-auto" />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-xl mx-auto">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-800">
                      Wakasek Kurikulum
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-800">
                      Wakasek Kesiswaan
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-800">
                      Wakasek Sarpras &amp; Humas
                    </div>
                  </div>
                  <div className="h-4 w-0.5 bg-slate-300 mx-auto" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md mx-auto">
                    <div className="p-2 bg-slate-50 rounded-lg text-[11px] text-slate-700">Dewan Guru &amp; Wali Kelas</div>
                    <div className="p-2 bg-slate-50 rounded-lg text-[11px] text-slate-700">Kepala Tata Usaha &amp; Tendik</div>
                  </div>
                </div>
              </details>
            </div>
          ) : (
            <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
              <div className="w-full max-w-sm mx-auto p-3.5 bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md">
                Kepala Sekolah: {schoolProfile.principalName}
              </div>
              <div className="h-6 w-0.5 bg-slate-300 mx-auto" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto">
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs">
                  Wakasek Bid. Kurikulum
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs">
                  Wakasek Bid. Kesiswaan
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs">
                  Wakasek Bid. Sarana &amp; Humas
                </div>
              </div>
              <div className="h-6 w-0.5 bg-slate-300 mx-auto" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                <div className="p-2.5 bg-slate-100 rounded-xl text-xs text-slate-700 font-medium">Dewan Guru &amp; Wali Kelas</div>
                <div className="p-2.5 bg-slate-100 rounded-xl text-xs text-slate-700 font-medium">Kepala Tata Usaha &amp; Tendik</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// SUB VIEW 2: AKADEMIK & KURIKULUM
// -------------------------------------------------------------
function AkademikView({
  schoolProfile,
  facilities = [],
  extracurriculars = [],
  subSection,
}: {
  schoolProfile: SchoolProfile;
  facilities?: FacilityItem[];
  extracurriculars?: ExtracurricularItem[];
  subSection?: string;
}) {
  const [activeTab, setActiveTab] = useState(subSection || 'kurikulum');
  const [ekskulSearch, setEkskulSearch] = useState('');
  const [selectedEkskulCat, setSelectedEkskulCat] = useState('all');

  const sourceEkskul =
    extracurriculars && extracurriculars.length > 0
      ? extracurriculars
      : initialExtracurriculars;

  const activeEkskul = sourceEkskul.filter((item) => item.isActive !== false);

  const categories = [
    'all',
    ...Array.from(new Set(activeEkskul.map((item) => item.category || 'Umum'))),
  ];

  const filteredEkskul = activeEkskul.filter((item) => {
    const matchCat =
      selectedEkskulCat === 'all' || (item.category || 'Umum') === selectedEkskulCat;
    const matchSearch =
      item.name.toLowerCase().includes(ekskulSearch.toLowerCase()) ||
      (item.mentor && item.mentor.toLowerCase().includes(ekskulSearch.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(ekskulSearch.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-3 -mx-1 px-1 scrollbar-none flex-nowrap">
        {[
          { id: 'kurikulum', label: 'Kurikulum Merdeka' },
          { id: 'ekskul', label: 'Ekstrakurikuler' },
          { id: 'fasilitas', label: 'Sarana & Fasilitas' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeTab === tab.id
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'kurikulum' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-5 text-sm text-slate-700 leading-relaxed">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>IMPLEMENTASI KURIKULUM MERDEKA</span>
          </div>
          <h4 className="text-xl font-bold text-slate-900">
            Pembelajaran Berdiferensiasi &amp; Penguatan Karakter Profil Pelajar Pancasila (P5)
          </h4>
          <p>
            {schoolProfile.curriculumOverview ||
              'Sekolah ini menerapkan Kurikulum Merdeka secara mandiri berbagi. Pembelajaran difokuskan pada penguasaan materi esensial, pengembangan karakter, serta eksplorasi minat siswa melalui pemilihan mata pelajaran pilihan di fase F (kelas XI dan XII).'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Intrakurikuler</h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                {schoolProfile.curriculumDetails?.intrakurikuler ||
                  'Mata pelajaran umum dan pilihan (Fisika, Kimia, Biologi, Matematika Lanjut, Ekonomi, Sosiologi, Geografi, Informatika, Bahasa Asing).'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Kokurikuler (P5 / Karakter)</h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                {schoolProfile.curriculumDetails?.kokurikuler ||
                  'Tema: Gaya Hidup Berkelanjutan, Rekayasa & Teknologi, Suara Demokrasi, Bhinneka Tunggal Ika, dan Kewirausahaan.'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Ekstrakurikuler</h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                {schoolProfile.curriculumDetails?.ekstrakurikuler ||
                  'Pengembangan minat, bakat, kepemimpinan, kepramukaan, dan persiapan kompetisi olimpiade/lomba nasional.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ekskul' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Daftar Cabang Ekstrakurikuler Aktif
                </h4>
                <p className="text-xs text-slate-500">
                  Wadah pengembangan minat, bakat, kepemimpinan, olahraga, sains, dan kesenian siswa.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari ekskul atau pembina..."
                  value={ekskulSearch}
                  onChange={(e) => setEkskulSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedEkskulCat(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    selectedEkskulCat === cat
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'Semua Kategori' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEkskul.map((ek) => (
              <div
                key={ek.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="h-40 bg-slate-100 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        normalizeImageUrl(ek.photo) ||
                        'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={ek.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                        {ek.category || 'Umum'}
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 left-3 right-3">
                      <h5 className="text-white font-bold text-sm leading-tight drop-shadow-sm">
                        {ek.name}
                      </h5>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <User className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="font-semibold text-slate-700 line-clamp-1">
                        Pembina: {ek.mentor || 'Tim Pembina Sekolah'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="text-slate-600 line-clamp-1">
                        {ek.schedule || 'Jadwal Mingguan'}
                      </span>
                    </div>

                    {ek.description && (
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed pt-1">
                        {ek.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-4 pb-3.5 pt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Pendaftaran Terbuka
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredEkskul.length === 0 && (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
              <Compass className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500">
                Tidak ada ekstrakurikuler yang sesuai dengan filter atau kata kunci pencarian.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'fasilitas' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
          <h4 className="text-base font-bold text-slate-900">Sarana Pendukung Pembelajaran</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {facilities.length > 0
              ? facilities.map((f) => (
                  <div key={f.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    {(f.photoUrl || f.imageUrl) && (
                      <div className="h-32 rounded-lg overflow-hidden relative mb-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={normalizeImageUrl(f.photoUrl || f.imageUrl)} alt={f.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-bold text-emerald-800">{f.name}</h5>
                      {f.capacity && (
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
                          {f.capacity}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">{f.description}</p>
                  </div>
                ))
              : [
                  { name: 'Laboratorium Sains Terpadu (Fisika, Kimia, Biologi)', desc: 'Peralatan mikroskop digital, fume hood, dan instrumen praktikum terstandar.' },
                  { name: 'Laboratorium Komputer & Multimedia', desc: '40 unit PC modern dengan koneksi internet Gigabit untuk pembelajaran TIK & ANBK.' },
                  { name: 'Perpustakaan Digital (E-Library)', desc: 'Koleksi ribuan buku referensi fisik dan akses portal jurnal elektronik nasional.' },
                  { name: 'Gelanggang Olahraga & Lapangan Multifungsi', desc: 'Fasilitas basket, voli, futsal, dan bulutangkis berlantai standar kompetisi.' },
                ].map((f, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <h5 className="text-sm font-bold text-emerald-800">{f.name}</h5>
                    <p className="text-xs text-slate-600">{f.desc}</p>
                  </div>
                ))}
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// SUB VIEW 3: DIREKTORI GURU & TENDIK
// -------------------------------------------------------------
function TeachersView({ teachers, initialTeacher }: { teachers: TeacherItem[]; initialTeacher?: TeacherItem }) {
  const [search, setSearch] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherItem | null>(initialTeacher || null);

  const filtered = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.position?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Filter */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari guru berdasarkan nama, mata pelajaran, atau posisi..."
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
        />
      </div>

      {selectedTeacher ? (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-6">
          <button
            onClick={() => setSelectedTeacher(null)}
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            ← Kembali ke Seluruh Guru
          </button>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={normalizeImageUrl(selectedTeacher.photoUrl) || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80'}
              alt={selectedTeacher.name}
              className="w-36 h-44 object-cover rounded-2xl shadow border border-slate-200"
            />
            <div className="space-y-3 flex-1">
              <div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {selectedTeacher.position || 'Tenaga Pendidik'}
                </span>
                <h4 className="text-xl font-bold text-slate-900 mt-1">{selectedTeacher.name}</h4>
                {selectedTeacher.nip && <p className="text-xs text-slate-500">NIP: {selectedTeacher.nip}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500">Mata Pelajaran:</span>
                  <p className="font-bold text-slate-800">{selectedTeacher.subject || 'Umum'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500">Pendidikan Terakhir:</span>
                  <p className="font-bold text-slate-800">{selectedTeacher.education || 'S1 Pendidikan'}</p>
                </div>
              </div>

              {selectedTeacher.bio && (
                <div className="pt-2 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                  <p className="font-semibold text-slate-800 mb-1">Motto / Profil Singkat:</p>
                  <p>{selectedTeacher.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTeacher(t)}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={normalizeImageUrl(t.photoUrl) || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'}
                alt={t.name}
                className="w-16 h-20 object-cover rounded-xl shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="space-y-1 flex-1 overflow-hidden">
                <h5 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                  {t.name}
                </h5>
                <p className="text-xs text-emerald-800 font-semibold truncate">{t.subject || 'Guru Pengampu'}</p>
                <p className="text-[11px] text-slate-500 truncate">{t.education || 'Sarjana Pendidikan'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// SUB VIEW 4: WARTA, BERITA & AGENDA
// -------------------------------------------------------------
function NewsView({
  newsList,
  announcements,
  events,
  initialData,
}: {
  newsList: NewsItem[];
  announcements: AnnouncementItem[];
  events: EventItem[];
  initialData?: any;
}) {
  const [activeTab, setActiveTab] = useState<string>(initialData?.tab || 'berita');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(
    initialData && 'content' in initialData ? initialData : null
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'berita', label: `Berita (${newsList.length})` },
          { id: 'pengumuman', label: `Pengumuman (${announcements.length})` },
          { id: 'agenda', label: `Agenda Sekolah (${events.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSelectedNews(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'berita' && (
        <div>
          {selectedNews ? (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-6">
              <button
                onClick={() => setSelectedNews(null)}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                ← Kembali ke Daftar Berita
              </button>

              <div className="space-y-3">
                <span className="px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">
                  {selectedNews.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {selectedNews.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 pb-4 border-b border-slate-100">
                  <span>Oleh: {selectedNews.authorName || 'Humas Sekolah'}</span>
                  <span>•</span>
                  <span>Dipublikasikan: {selectedNews.publishedAt}</span>
                </div>
              </div>

              {(selectedNews.featuredImage || selectedNews.imageUrl) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={normalizeImageUrl(selectedNews.featuredImage || selectedNews.imageUrl)}
                  alt={selectedNews.title}
                  className="w-full max-h-96 object-cover rounded-2xl"
                />
              )}

              <div className="prose max-w-none text-sm sm:text-base text-slate-700 leading-relaxed space-y-4">
                {selectedNews.content}
              </div>
            </div>
          ) : newsList.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500">
              Belum ada warta atau berita yang dipublikasikan.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {newsList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedNews(item)}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group p-4 space-y-3"
                >
                  <div className="space-y-2">
                    <div className="h-40 rounded-xl overflow-hidden bg-slate-100 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={normalizeImageUrl(item.featuredImage || item.imageUrl) || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute top-2 left-2 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">{item.publishedAt}</div>
                    <h5 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {item.title}
                    </h5>
                    <p className="text-xs text-slate-600 line-clamp-2">{item.excerpt}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">Baca Selengkapnya →</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'pengumuman' && (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-amber-100 text-amber-900">
                  Target: {ann.targetAudience}
                </span>
                <span className="text-xs text-slate-400">{ann.publishedAt}</span>
              </div>
              <h4 className="text-base font-bold text-slate-900">{ann.title}</h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{ann.content}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'agenda' && (
        <div className="space-y-4">
          {events.map((evt) => (
            <div key={evt.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-start gap-4">
              <div className="w-14 h-16 rounded-xl bg-emerald-100 text-emerald-800 flex flex-col items-center justify-center shrink-0 border border-emerald-200">
                <span className="text-xs font-bold uppercase">{evt.startDate.split('-')[1]}</span>
                <span className="text-lg font-black">{evt.startDate.split('-')[2]}</span>
              </div>
              <div className="space-y-1.5 flex-1">
                <h4 className="text-sm sm:text-base font-bold text-slate-900">{evt.title}</h4>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{evt.time}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{evt.location}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-600 pt-1">{evt.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// SUB VIEW 5: PRESTASI SEKOLAH
// -------------------------------------------------------------
function AchievementsView({
  achievements,
  initialAchievement,
}: {
  achievements: AchievementItem[];
  initialAchievement?: AchievementItem;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-amber-100 text-amber-900">
                  Tingkat {ach.level} • {ach.year}
                </span>
                <span className="text-xs font-bold text-emerald-700">{ach.ranking}</span>
              </div>
              <h4 className="text-base font-bold text-slate-900">{ach.title}</h4>
              <p className="text-xs font-semibold text-slate-700">Peraih: {ach.studentName}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{ach.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SUB VIEW 6: GALERI FOTO
// -------------------------------------------------------------
function GalleriesView({ galleries }: { galleries: GalleryItem[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  if (galleries.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500">
        Belum ada dokumentasi kegiatan atau foto galeri yang dipublikasikan.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 cursor-pointer shadow-lg"
        >
          {(() => {
            const source = getGallerySourceUrl(selectedPhoto);
            const candidates = source ? getImagePreviewUrls(source) : [];
            const initialSrc = candidates[0] || source || 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80';

            return (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={initialSrc}
                alt={selectedPhoto.title}
                className="w-full max-h-96 object-contain rounded-xl bg-black/40"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const currentAttempt = parseInt(target.dataset.attempt || '0', 10);
                  const nextAttempt = currentAttempt + 1;

                  if (nextAttempt < candidates.length) {
                    target.dataset.attempt = nextAttempt.toString();
                    target.src = candidates[nextAttempt];
                  } else {
                    target.onerror = null;
                    target.src = 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80';
                  }
                }}
              />
            );
          })()}
          <div className="text-center">
            <h4 className="text-sm font-bold">{selectedPhoto.title}</h4>
            <p className="text-xs text-slate-400">{selectedPhoto.description}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {galleries.map((gal) => {
          const source = getGallerySourceUrl(gal);
          const candidates = source ? getImagePreviewUrls(source) : [];
          const initialSrc = candidates[0] || source || 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80';

          return (
            <div
              key={gal.id}
              onClick={() => setSelectedPhoto(gal)}
              className="h-44 rounded-2xl overflow-hidden relative cursor-pointer group bg-slate-900 border border-slate-200 shadow-2xs"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={initialSrc}
                alt={gal.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const currentAttempt = parseInt(target.dataset.attempt || '0', 10);
                  const nextAttempt = currentAttempt + 1;

                  if (nextAttempt < candidates.length) {
                    target.dataset.attempt = nextAttempt.toString();
                    target.src = candidates[nextAttempt];
                  } else {
                    target.onerror = null;
                    target.src = 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 text-white">
                <span className="text-xs font-bold line-clamp-1">{gal.title}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SUB VIEW 7: PUSAT UNDUHAN DOKUMEN
// -------------------------------------------------------------
function DocumentsView({ documents }: { documents: DocumentItem[] }) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 leading-relaxed">
        Silakan unduh dokumen publik, format formulir, kalender akademik, serta regulasi sekolah di bawah ini.
      </div>

      <div className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="space-y-0.5">
                <h5 className="text-sm font-bold text-slate-900">{doc.title}</h5>
                <p className="text-xs text-slate-500">
                  Kategori: {doc.category} • Ukuran: {doc.fileSize || '1.2 MB'} • Format: {doc.fileType?.toUpperCase() || 'PDF'}
                </p>
              </div>
            </div>

            <a
              href={doc.fileUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-2xs transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unduh Berkas</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SUB VIEW 8: FORMULIR PENDAFTARAN PPDB ONLINE
// -------------------------------------------------------------
function PPDBApplyView({
  schoolName,
  ppdbYear,
  ppdbTracks,
}: {
  schoolName?: string;
  ppdbYear?: string;
  ppdbTracks?: string[];
}) {
  const defaultTracks = [
    'Zonasi',
    'Afirmasi',
    'Prestasi Akademik / Non-Akademik',
    'Perpindahan Tugas Orang Tua / Wali',
  ];
  const activeTracks = ppdbTracks && ppdbTracks.length > 0 ? ppdbTracks : defaultTracks;

  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [nisn, setNisn] = useState('');
  const [nik, setNik] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDate, setBirthDate] = useState('2010-05-12');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [religion, setReligion] = useState('Islam');
  const [previousSchool, setPreviousSchool] = useState('');
  const [entryTrack, setEntryTrack] = useState<string>(activeTracks[0] || 'Zonasi');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !nisn.trim() || !parentName.trim() || !phone.trim() || !previousSchool.trim()) {
      setError('Mohon lengkapi seluruh field wajib berbintang merah.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await submitPPDBApplication({
        fullName: fullName.trim(),
        nisn: nisn.trim(),
        nik: nik.trim() || undefined,
        birthPlace: birthPlace.trim() || 'Jakarta',
        birthDate,
        gender,
        religion,
        previousSchool: previousSchool.trim(),
        entryTrack,
        parentName: parentName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim(),
      });

      if (res?.registrationNumber) {
        setSubmittedId(res.registrationNumber);
      }
    } catch (err: any) {
      console.error('PPDB submit error:', err);
      setError('Gagal mengirimkan formulir PPDB. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  if (submittedId) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-6 max-w-xl mx-auto shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h4 className="text-2xl font-black text-slate-900">Pendaftaran Berhasil Disimpan!</h4>
          <p className="text-sm text-slate-600">
            Terima kasih telah melakukan pendaftaran di {schoolName || 'Sekolah Kami'}. Simpan dan catat Nomor Registrasi resmi Anda di bawah ini:
          </p>
        </div>

        <div className="p-4 bg-emerald-50 border-2 border-emerald-400/50 rounded-2xl">
          <span className="text-xs text-emerald-800 font-semibold uppercase tracking-wider">Nomor Registrasi PPDB</span>
          <p className="text-2xl sm:text-3xl font-mono font-black text-emerald-950 mt-1">{submittedId}</p>
        </div>

        <div className="text-xs text-slate-500 text-left bg-slate-50 p-4 rounded-xl space-y-1.5 border border-slate-200">
          <p className="font-bold text-slate-800">Langkah Selanjutnya:</p>
          <p>1. Simpan nomor pendaftaran ini atau ambil tangkapan layar (screenshot).</p>
          <p>2. Pantau status verifikasi berkas secara berkala melalui menu <strong>Cek Status PPDB</strong>.</p>
          <p>3. Siapkan dokumen fisik saat proses verifikasi berkas atau daftar ulang di sekolah.</p>
        </div>

        <button
          onClick={() => {
            setSubmittedId(null);
            setFullName('');
            setNisn('');
          }}
          className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition-colors"
        >
          Daftar Calon Siswa Lainnya
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-6">
      <div className="space-y-1 border-b border-slate-200 pb-4">
        <h4 className="text-lg font-bold text-slate-900">
          Formulir Pendaftaran Siswa Baru (PPDB {ppdbYear || ''})
        </h4>
        <p className="text-xs text-slate-500">
          Isilah formulir di bawah ini dengan data yang valid dan sesuai dokumen Kartu Keluarga / Akta Kelahiran.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Identitas Calon Siswa */}
      <div className="space-y-4">
        <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">A. Identitas Calon Peserta Didik</h5>
        
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Nama Lengkap Calon Siswa <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Muhammad Alif Pratama"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              NISN (Nomor Induk Siswa Nasional) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={10}
              value={nisn}
              onChange={(e) => setNisn(e.target.value)}
              placeholder="10 digit NISN"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">NIK (Nomor Induk Kependudukan)</label>
            <input
              type="text"
              maxLength={16}
              value={nik}
              onChange={(e) => setNik(e.target.value)}
              placeholder="16 digit NIK KK"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tempat Lahir</label>
            <input
              type="text"
              value={birthPlace}
              onChange={(e) => setBirthPlace(e.target.value)}
              placeholder="Kota lahir"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Lahir</label>
            <input
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Asal Sekolah & Jalur */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">B. Asal Sekolah &amp; Jalur Pendaftaran</h5>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Asal Sekolah (SMP / MTs) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={previousSchool}
              onChange={(e) => setPreviousSchool(e.target.value)}
              placeholder="e.g. SMP Negeri 1 Jakarta"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pilihan Jalur Masuk</label>
            <select
              value={entryTrack}
              onChange={(e) => setEntryTrack(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-semibold text-slate-800"
            >
              {activeTracks.map((tr) => (
                <option key={tr} value={tr}>
                  {tr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Data Orang Tua / Wali */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">C. Data Orang Tua &amp; Kontak</h5>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap Orang Tua / Wali <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="Nama Ayah/Ibu/Wali"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              No. WhatsApp / HP Aktif <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0812xxxxxxxx"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap Domisili Siswa</label>
          <textarea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:bg-slate-400 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
      >
        <GraduationCap className="w-5 h-5 text-amber-300" />
        <span>{loading ? 'Menyimpan Berkas Pendaftaran...' : 'Kirim Formulir Pendaftaran PPDB'}</span>
      </button>
    </form>
  );
}

// -------------------------------------------------------------
// SUB VIEW 9: CEK STATUS PENDAFTARAN PPDB
// -------------------------------------------------------------
function PPDBStatusView({ schoolName }: { schoolName?: string }) {
  const [regNum, setRegNum] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PPDBApplicantItem | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNum.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const data = await getApplicantByRegNumber(regNum.trim());
      setResult(data);
    } catch (e) {
      console.error(e);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const statusBadge: Record<string, { label: string; color: string }> = {
    submitted: { label: 'Menunggu Verifikasi Berkas', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    verified: { label: 'Berkas Terverifikasi Sah', color: 'bg-blue-100 text-blue-900 border-blue-300' },
    accepted: { label: `SELAMAT! DITERIMA DI ${schoolName ? schoolName.toUpperCase() : 'SEKOLAH KAMI'}`, color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    rejected: { label: 'Berkas Belum Memenuhi Syarat', color: 'bg-rose-100 text-rose-900 border-rose-300' },
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6 max-w-xl mx-auto shadow-xs">
      <div className="text-center space-y-1">
        <h4 className="text-xl font-bold text-slate-900">Pelacakan Status Berkas PPDB</h4>
        <p className="text-xs text-slate-500">
          Masukkan Nomor Registrasi yang Anda terima saat mendaftar (contoh: PPDB-2026-xxxxxx).
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          required
          value={regNum}
          onChange={(e) => setRegNum(e.target.value)}
          placeholder="PPDB-2026-..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? 'Mencari...' : 'Lacak'}</span>
        </button>
      </form>

      {searched && (
        <div className="pt-4 border-t border-slate-100">
          {result ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border text-center font-bold text-sm ${statusBadge[result.status]?.color}`}>
                {statusBadge[result.status]?.label || result.status}
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Nomor Registrasi:</span>
                  <span className="font-mono font-bold text-slate-900">{result.registrationNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Nama Calon Siswa:</span>
                  <span className="font-bold text-slate-900">{result.fullName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">NISN:</span>
                  <span className="font-bold text-slate-900">{result.nisn}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Asal Sekolah:</span>
                  <span className="font-bold text-slate-900">{result.previousSchool}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Jalur Pendaftaran:</span>
                  <span className="font-bold text-emerald-800">{result.entryTrack}</span>
                </div>
                {result.notes && (
                  <div className="pt-2 text-slate-700">
                    <span className="font-bold text-slate-800">Catatan Panitia:</span>
                    <p className="mt-0.5 p-2 bg-white rounded border border-slate-200">{result.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-rose-600 bg-rose-50 rounded-2xl border border-rose-200 space-y-1">
              <p className="font-bold">Nomor Registrasi Tidak Ditemukan</p>
              <p className="text-slate-600">
                Pastikan nomor pendaftaran yang Anda masukkan benar. Jika ada kendala, hubungi panitia via WhatsApp sekolah.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
