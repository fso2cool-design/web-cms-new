'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  GraduationCap,
  FileCheck2,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Phone,
  Mail,
  Home,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { PublicNavbar } from '@/components/layout/public-navbar';
import { PublicFooter } from '@/components/layout/public-footer';
import { getSchoolProfile } from '@/services/school.service';
import { submitPPDBApplication, getApplicantByRegNumber } from '@/services/ppdb.service';
import { getVisitorAnalytics } from '@/services/analytics.service';
import { initialSchoolProfile, initialVisitorAnalytics } from '@/lib/seed-data';
import { SchoolProfile, PPDBApplicantItem, VisitorAnalytics } from '@/types';

function PPDBContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(initialSchoolProfile);
  const [visitorAnalytics, setVisitorAnalytics] = useState<VisitorAnalytics>(initialVisitorAnalytics);
  const [activeTab, setActiveTab] = useState<'daftar' | 'status'>(tabParam === 'status' ? 'status' : 'daftar');
  const [loading, setLoading] = useState(true);

  // FORM STATES
  const [fullName, setFullName] = useState('');
  const [nisn, setNisn] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [selectedTrack, setSelectedTrack] = useState('Zonasi');
  const [previousSchool, setPreviousSchool] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [address, setAddress] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // TRACKING STATES
  const [trackQuery, setTrackQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<PPDBApplicantItem | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    if (tabParam === 'status') setActiveTab('status');
    else if (tabParam === 'daftar') setActiveTab('daftar');
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
          document.title = `Penerimaan Siswa Baru (PPDB) | ${profileRes.value.name || 'Portal Resmi'}`;
        }
        if (analyticsRes.status === 'fulfilled' && analyticsRes.value) {
          setVisitorAnalytics(analyticsRes.value);
        }
      } catch (err) {
        console.warn('Error fetching PPDB profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !nisn.trim() || !previousSchool.trim() || !parentPhone.trim()) {
      setError('Mohon lengkapi seluruh kolom wajib yang bertanda (*).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitPPDBApplication({
        fullName: fullName.trim(),
        nisn: nisn.trim(),
        birthPlace: birthPlace.trim(),
        birthDate: birthDate || '2010-01-01',
        gender,
        entryTrack: selectedTrack,
        previousSchool: previousSchool.trim(),
        parentName: parentName.trim(),
        parentPhone: parentPhone.trim(),
        address: address.trim(),
      });

      if (res && res.registrationNumber) {
        setSubmittedId(res.registrationNumber);
      }
    } catch (err: any) {
      setError(err?.message || 'Terjadi kendala saat mengirim pendaftaran. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const result = await getApplicantByRegNumber(trackQuery.trim());
      if (result) {
        setSearchResult(result);
      } else {
        setSearchError('Nomor registrasi tidak ditemukan. Pastikan nomor yang dimasukkan sudah sesuai.');
      }
    } catch (err: any) {
      setSearchError('Gagal memverifikasi status pendaftaran. Periksa koneksi internet Anda.');
    } finally {
      setIsSearching(false);
    }
  };

  const tracks =
    schoolProfile.ppdbTracks && schoolProfile.ppdbTracks.length > 0
      ? schoolProfile.ppdbTracks
      : ['Zonasi Domisili', 'Prestasi Akademik / Non-Akademik', 'Afirmasi / KIP', 'Perpindahan Tugas Orang Tua'];

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
              <span className="text-white">Portal PPDB Online</span>
            </div>

            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider">
                <GraduationCap className="w-4 h-4" />
                <span>PENDAFTARAN SISWA BARU {schoolProfile.ppdbYear || '2026/2027'}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
                Mari Bergabung Bersama {schoolProfile.shortName || schoolProfile.name}
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Pendaftaran resmi peserta didik baru tahun ajaran {schoolProfile.ppdbYear || '2026/2027'}. Proses seleksi transparan, akuntabel, dan berbasis prestasi serta zonasi.
              </p>
            </div>
          </div>
        </section>

        {/* Tab Selector & Main Content */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          {/* Tabs */}
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs max-w-md mx-auto">
            <button
              onClick={() => {
                setActiveTab('daftar');
                setSubmittedId(null);
              }}
              className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'daftar'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Formulir Pendaftaran</span>
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'status'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Cek Status Berkas</span>
            </button>
          </div>

          {/* TAB 1: FORMULIR PENDAFTARAN */}
          {activeTab === 'daftar' && (
            <div className="animate-in fade-in">
              {submittedId ? (
                /* Sukses Pendaftaran */
                <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 text-center space-y-6 shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900">Pendaftaran Berhasil Terkirim!</h3>
                    <p className="text-sm text-slate-600 max-w-md mx-auto">
                      Terima kasih telah mendaftar di {schoolProfile.name}. Simpan dan catat Nomor Registrasi resmi Anda di bawah ini:
                    </p>
                  </div>

                  <div className="p-6 bg-emerald-50 border-2 border-emerald-400/50 rounded-2xl max-w-md mx-auto">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      Nomor Registrasi PPDB Anda
                    </span>
                    <p className="text-2xl sm:text-3xl font-mono font-black text-emerald-950 mt-1">
                      {submittedId}
                    </p>
                  </div>

                  <div className="text-xs text-slate-600 text-left bg-slate-50 p-5 rounded-2xl space-y-2 max-w-md mx-auto border border-slate-200">
                    <p className="font-bold text-slate-900">Langkah Selanjutnya:</p>
                    <p>1. Simpan nomor pendaftaran ini atau ambil tangkapan layar (screenshot).</p>
                    <p>2. Pantau verifikasi berkas melalui tab <strong>Cek Status Berkas</strong>.</p>
                    <p>3. Panitia PPDB akan menghubungi nomor WhatsApp orang tua untuk jadwal verifikasi berkas fisik.</p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setSubmittedId(null);
                        setFullName('');
                        setNisn('');
                        setPreviousSchool('');
                        setParentPhone('');
                      }}
                      className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors"
                    >
                      Daftar Calon Siswa Baru Lainnya
                    </button>
                  </div>
                </div>
              ) : (
                /* Form Pendaftaran */
                <form
                  onSubmit={handleSubmit}
                  className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-6"
                >
                  <div className="border-b border-slate-100 pb-4 space-y-1">
                    <h3 className="text-xl font-bold text-slate-900">Formulir Biodata Calon Siswa</h3>
                    <p className="text-xs text-slate-500">
                      Mohon mengisi data dengan lengkap sesuai Kartu Keluarga (KK) dan Ijazah/Rapor SMP.
                    </p>
                  </div>

                  {error && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Jalur Pendaftaran */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Pilihan Jalur Pendaftaran *
                    </label>
                    <select
                      value={selectedTrack}
                      onChange={(e) => setSelectedTrack(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    >
                      {tracks.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Data Siswa */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Lengkap Siswa *</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Sesuai Akta Kelahiran"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">NISN (10 Digit) *</label>
                      <input
                        type="text"
                        required
                        value={nisn}
                        onChange={(e) => setNisn(e.target.value)}
                        placeholder="Contoh: 0081234567"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Tempat Lahir</label>
                      <input
                        type="text"
                        value={birthPlace}
                        onChange={(e) => setBirthPlace(e.target.value)}
                        placeholder="Kota / Kabupaten"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Tanggal Lahir</label>
                      <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Jenis Kelamin</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-semibold"
                      >
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>
                  </div>

                  {/* Asal Sekolah */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Asal Sekolah Sebelumnya (SMP/MTs) *
                    </label>
                    <input
                      type="text"
                      required
                      value={previousSchool}
                      onChange={(e) => setPreviousSchool(e.target.value)}
                      placeholder="e.g. SMP Negeri 1 / MTs Swasta"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Data Orang Tua */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Orang Tua / Wali</label>
                      <input
                        type="text"
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        placeholder="Nama Ayah / Ibu / Wali"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        No. WhatsApp Aktif Orang Tua *
                      </label>
                      <input
                        type="tel"
                        required
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        placeholder="e.g. 08123456789"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Alamat Tempat Tinggal</label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Nama jalan, RT/RW, Kelurahan, Kecamatan"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>{isSubmitting ? 'Mengirim Data...' : 'Kirim Formulir Pendaftaran'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: CEK STATUS PENDAFTARAN */}
          {activeTab === 'status' && (
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
              <div className="border-b border-slate-100 pb-4 space-y-1 text-center max-w-md mx-auto">
                <h3 className="text-xl font-bold text-slate-900">Pelacakan Status Berkas PPDB</h3>
                <p className="text-xs text-slate-500">
                  Masukkan Nomor Registrasi yang Anda dapatkan saat mendaftar (misal: PPDB-2026-XXXXX).
                </p>
              </div>

              <form onSubmit={handleTrack} className="max-w-md mx-auto space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={trackQuery}
                    onChange={(e) => setTrackQuery(e.target.value)}
                    placeholder="Ketikkan Nomor Registrasi..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>{isSearching ? 'Memeriksa Berkas...' : 'Lacak Status Sekarang'}</span>
                </button>
              </form>

              {searchError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-bold max-w-md mx-auto flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}

              {searchResult && (
                <div className="max-w-md mx-auto p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <span className="text-xs font-bold text-slate-500">Status Pendaftaran:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        searchResult.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : searchResult.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : searchResult.status === 'verified'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {searchResult.status === 'accepted'
                        ? 'DITERIMA'
                        : searchResult.status === 'rejected'
                        ? 'TIDAK LOLOS'
                        : searchResult.status === 'verified'
                        ? 'TERVERIFIKASI'
                        : 'DALAM PENINJAUAN'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nama Calon Siswa:</span>
                      <span className="font-bold text-slate-900">{searchResult.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">NISN:</span>
                      <span className="font-mono">{searchResult.nisn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Jalur:</span>
                      <span className="font-semibold text-emerald-700">{searchResult.entryTrack || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Asal Sekolah:</span>
                      <span>{searchResult.previousSchool}</span>
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

export default function PPDBPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <PPDBContent />
    </Suspense>
  );
}
