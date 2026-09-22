'use client';

import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Eye,
  Edit,
  Phone,
  MessageCircle,
  FileText,
  AlertCircle,
  Plus,
  X,
  Printer,
  ChevronRight,
  SlidersHorizontal,
  Save,
  Sparkles,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { PPDBApplicantItem, SchoolProfile } from '@/types';
import {
  getAllApplicants,
  updateApplicantStatus,
  submitPPDBApplication,
} from '@/services/ppdb.service';
import { updateSchoolProfile } from '@/services/school.service';

interface AdminPPDBProps {
  initialApplicants: PPDBApplicantItem[];
  schoolProfile?: SchoolProfile;
  onProfileUpdated?: (profile: SchoolProfile) => void;
}

export function AdminPPDB({ initialApplicants, schoolProfile, onProfileUpdated }: AdminPPDBProps) {
  const defaultTracks = [
    'Zonasi',
    'Afirmasi',
    'Prestasi Akademik / Non-Akademik',
    'Perpindahan Tugas Orang Tua / Wali',
  ];

  const [activeSubTab, setActiveSubTab] = useState<'applicants' | 'tracks'>('applicants');
  const [tracks, setTracks] = useState<string[]>(
    schoolProfile?.ppdbTracks && schoolProfile.ppdbTracks.length > 0
      ? schoolProfile.ppdbTracks
      : defaultTracks
  );
  const [newTrackInput, setNewTrackInput] = useState('');
  const [savingTracks, setSavingTracks] = useState(false);

  const [applicants, setApplicants] = useState<PPDBApplicantItem[]>(initialApplicants);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [trackFilter, setTrackFilter] = useState<string>('all');

  const [selectedApplicant, setSelectedApplicant] = useState<PPDBApplicantItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Verification form state inside modal
  const [actionStatus, setActionStatus] = useState<PPDBApplicantItem['status']>('verified');
  const [actionNotes, setActionNotes] = useState('');

  // Add Manual Applicant Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    fullName: '',
    nisn: '',
    previousSchool: '',
    entryTrack: (tracks[0] || 'Zonasi') as any,
    parentName: '',
    phone: '',
    address: '',
  });

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleAddTrack = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTrackInput.trim();
    if (!trimmed) return;
    if (tracks.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      showNotice(`Jalur "${trimmed}" sudah ada di dalam daftar.`);
      return;
    }
    setTracks([...tracks, trimmed]);
    setNewTrackInput('');
    showNotice(`Jalur "${trimmed}" ditambahkan ke daftar.`);
  };

  const handleRemoveTrack = (indexToRemove: number) => {
    if (tracks.length <= 1) {
      showNotice('Minimal harus ada 1 jalur pendaftaran yang aktif.');
      return;
    }
    const removedName = tracks[indexToRemove];
    setTracks(tracks.filter((_, idx) => idx !== indexToRemove));
    showNotice(`Jalur "${removedName}" dihapus dari daftar.`);
  };

  const handleApplyPreset = (presetTracks: string[]) => {
    setTracks(presetTracks);
    showNotice('Preset jalur diterapkan. Silakan klik "Simpan Konfigurasi Jalur" untuk menyimpan ke database.');
  };

  const handleSaveTracks = async () => {
    if (!schoolProfile) return;
    setSavingTracks(true);
    try {
      await updateSchoolProfile({ ...schoolProfile, ppdbTracks: tracks });
      if (onProfileUpdated) {
        onProfileUpdated({ ...schoolProfile, ppdbTracks: tracks });
      }
      showNotice('Konfigurasi jalur pendaftaran PPDB berhasil disimpan ke basis data!');
    } catch (err: any) {
      console.error(err);
      showNotice('Gagal menyimpan jalur: ' + (err.message || 'Kesalahan sistem'));
    } finally {
      setSavingTracks(false);
    }
  };

  const handleOpenDetail = (item: PPDBApplicantItem) => {
    setSelectedApplicant(item);
    setActionStatus(item.status);
    setActionNotes(item.notes || '');
  };

  const handleUpdateStatus = async () => {
    if (!selectedApplicant) return;
    setLoading(true);
    try {
      await updateApplicantStatus(selectedApplicant.id, actionStatus, actionNotes);
      setApplicants((prev) =>
        prev.map((a) =>
          a.id === selectedApplicant.id
            ? { ...a, status: actionStatus, notes: actionNotes }
            : a
        )
      );
      setSelectedApplicant((prev) =>
        prev ? { ...prev, status: actionStatus, notes: actionNotes } : null
      );
      showNotice(`Status pendaftar ${selectedApplicant.fullName} berhasil diperbarui.`);
    } catch (err: any) {
      console.error(err);
      showNotice('Gagal memperbarui status: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveManualApplicant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.fullName.trim() || !manualForm.nisn.trim()) return;

    setLoading(true);
    try {
      const res = await submitPPDBApplication({
        fullName: manualForm.fullName.trim(),
        nisn: manualForm.nisn.trim(),
        previousSchool: manualForm.previousSchool.trim() || 'SMP Pendaftar',
        entryTrack: manualForm.entryTrack,
        parentName: manualForm.parentName.trim() || 'Orang Tua',
        phone: manualForm.phone.trim() || '08123456789',
        address: manualForm.address.trim() || 'Kota Domisili',
        birthDate: '2010-06-01',
        gender: 'L',
      });

      if (res?.applicant) {
        setApplicants((prev) => [res.applicant, ...prev]);
        showNotice(`Pendaftar baru ${res.applicant.fullName} (${res.applicant.registrationNumber}) berhasil didaftarkan.`);
      }
      setAddModalOpen(false);
      setManualForm({
        fullName: '',
        nisn: '',
        previousSchool: '',
        entryTrack: 'Zonasi',
        parentName: '',
        phone: '',
        address: '',
      });
    } catch (err: any) {
      console.error(err);
      showNotice('Gagal menambahkan pendaftar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = applicants.filter((a) => {
    const matchesSearch =
      a.fullName.toLowerCase().includes(search.toLowerCase()) ||
      a.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
      a.nisn.toLowerCase().includes(search.toLowerCase()) ||
      a.previousSchool.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesTrack = trackFilter === 'all' || a.entryTrack === trackFilter;

    return matchesSearch && matchesStatus && matchesTrack;
  });

  const countPending = applicants.filter((a) => a.status === 'submitted').length;
  const countVerified = applicants.filter((a) => a.status === 'verified').length;
  const countAccepted = applicants.filter((a) => a.status === 'accepted').length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">
              Meja Verifikasi &amp; Pengaturan PPDB {schoolProfile?.ppdbYear ? `(${schoolProfile.ppdbYear})` : '2026/2027'}
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Kelola pendaftar baru, verifikasi berkas persyaratan, dan tentukan jalur penerimaan siswa sesuai regulasi.
          </p>
        </div>

        {activeSubTab === 'applicants' ? (
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Input Pendaftar Manual (Offline)</span>
          </button>
        ) : (
          <button
            onClick={handleSaveTracks}
            disabled={savingTracks}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>{savingTracks ? 'Menyimpan...' : 'Simpan Konfigurasi Jalur'}</span>
          </button>
        )}
      </div>

      {notice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Sub-Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('applicants')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'applicants'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>1. Verifikasi Berkas Pendaftar ({applicants.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('tracks')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'tracks'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>2. Pengaturan Jalur Pendaftaran ({tracks.length} Jalur)</span>
        </button>
      </div>

      {/* SUB-TAB 2: KONFIGURASI JALUR PENDAFTARAN */}
      {activeSubTab === 'tracks' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-emerald-900">
                Kustomisasi Jalur Penerimaan Siswa Baru
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sesuaikan jalur masuk dengan jenis kelembagaan (Sekolah Negeri Kemdikbud, Madrasah Kemenag, atau Sekolah Swasta).
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveTracks}
              disabled={savingTracks}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingTracks ? 'Menyimpan...' : 'Simpan Jalur'}</span>
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Gunakan Format Jalur Cepat (Preset Otomatis):
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  handleApplyPreset([
                    'Zonasi',
                    'Afirmasi',
                    'Prestasi Akademik / Non-Akademik',
                    'Perpindahan Tugas Orang Tua / Wali',
                  ])
                }
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <span>🏛️ Sekolah Negeri (Kemdikbud)</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleApplyPreset([
                    'Reguler',
                    'Prestasi Akademik & Keagamaan',
                    'Tahfidz Al-Qur\'an',
                    'Afirmasi / KIP',
                    'Bakat & Minat',
                  ])
                }
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <span>🕌 Madrasah (Kemenag: MTs / MA)</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleApplyPreset([
                    'Reguler Gelombang 1',
                    'Reguler Gelombang 2',
                    'Jalur Prestasi Unggulan',
                    'Beasiswa Prestasi / Kemitraan',
                  ])
                }
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <span>🏫 Sekolah Swasta / Khusus</span>
              </button>
            </div>
          </div>

          {/* Form Add Track */}
          <form onSubmit={handleAddTrack} className="flex gap-2">
            <input
              type="text"
              value={newTrackInput}
              onChange={(e) => setNewTrackInput(e.target.value)}
              placeholder="Ketik nama jalur baru (e.g. Jalur Tahfidz, Kelas Khusus Olahraga, dll.)..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Jalur</span>
            </button>
          </form>

          {/* Tracks List */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 block">
              Daftar Jalur Aktif yang Akan Muncul di Formulir Publik ({tracks.length} Jalur):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tracks.map((trackName, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs group hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{trackName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTrack(idx)}
                    title="Hapus Jalur"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: VERIFIKASI PENDAFTAR */}
      {activeSubTab === 'applicants' && (
        <>
          {/* Metric Tabs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Total Berkas Masuk</span>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{applicants.length}</p>
            </div>
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 shadow-2xs">
              <span className="text-[11px] font-bold text-amber-900 uppercase">Menunggu Verifikasi</span>
              <p className="text-2xl font-black text-amber-700 mt-0.5">{countPending}</p>
            </div>
            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 shadow-2xs">
              <span className="text-[11px] font-bold text-blue-900 uppercase">Berkas Sah</span>
              <p className="text-2xl font-black text-blue-700 mt-0.5">{countVerified}</p>
            </div>
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-900 uppercase">Resmi Diterima</span>
              <p className="text-2xl font-black text-emerald-700 mt-0.5">{countAccepted}</p>
            </div>
          </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama siswa, NISN, nomor registrasi, atau asal SMP..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="submitted">Menunggu Verifikasi</option>
            <option value="verified">Berkas Terverifikasi</option>
            <option value="accepted">Diterima</option>
            <option value="rejected">Ditolak</option>
          </select>

          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="all">Semua Jalur</option>
            {tracks.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table of Applicants */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">No. Registrasi &amp; Calon Siswa</th>
                <th className="px-4 py-3.5">NISN / NIK</th>
                <th className="px-4 py-3.5">Asal SMP</th>
                <th className="px-4 py-3.5">Jalur Masuk</th>
                <th className="px-4 py-3.5">Kontak Ortu</th>
                <th className="px-4 py-3.5">Status Berkas</th>
                <th className="px-5 py-3.5 text-right">Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    Tidak ada calon peserta didik yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900">{item.fullName}</p>
                        <p className="text-[11px] font-mono text-emerald-800 font-semibold">{item.registrationNumber}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">{item.nisn}</td>
                    <td className="px-4 py-3.5 font-medium">{item.previousSchool}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[10px]">
                        {item.entryTrack || 'Zonasi'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        <p className="font-medium text-slate-800">{item.parentName}</p>
                        <p className="text-[11px] text-slate-500">{item.phone || item.parentPhone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1 ${
                          item.status === 'submitted'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : item.status === 'verified'
                            ? 'bg-blue-100 text-blue-900'
                            : item.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-rose-100 text-rose-900'
                        }`}
                      >
                        {item.status === 'submitted' && <Clock className="w-3 h-3" />}
                        {item.status === 'verified' && <UserCheck className="w-3 h-3" />}
                        {item.status === 'accepted' && <CheckCircle2 className="w-3 h-3" />}
                        {item.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        <span>
                          {item.status === 'submitted'
                            ? 'Menunggu'
                            : item.status === 'verified'
                            ? 'Terverifikasi'
                            : item.status === 'accepted'
                            ? 'Diterima'
                            : 'Ditolak'}
                        </span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenDetail(item)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-bold text-xs transition-colors inline-flex items-center gap-1 border border-slate-200"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Periksa</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* DETAIL & VERIFICATION MODAL */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Lembar Verifikasi Berkas Calon Peserta Didik</h3>
                <p className="text-[11px] font-mono text-emerald-400">{selectedApplicant.registrationNumber}</p>
              </div>
              <button onClick={() => setSelectedApplicant(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Detail Data Calon Siswa */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-slate-500">Nama Lengkap:</span>
                    <p className="font-bold text-slate-900 text-sm">{selectedApplicant.fullName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Jalur Pendaftaran:</span>
                    <p className="font-bold text-emerald-800 text-sm">{selectedApplicant.entryTrack}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-500">NISN:</span>
                    <p className="font-mono font-bold text-slate-800">{selectedApplicant.nisn}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">NIK KK:</span>
                    <p className="font-mono font-bold text-slate-800">{selectedApplicant.nik || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Jenis Kelamin:</span>
                    <p className="font-bold text-slate-800">
                      {selectedApplicant.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Tempat, Tgl Lahir:</span>
                    <p className="font-bold text-slate-800">
                      {selectedApplicant.birthPlace || 'Jakarta'}, {selectedApplicant.birthDate}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Asal Sekolah:</span>
                    <p className="font-bold text-slate-800">{selectedApplicant.previousSchool}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Nama Orang Tua:</span>
                    <p className="font-bold text-slate-800">{selectedApplicant.parentName}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-slate-500">Alamat Tempat Tinggal:</span>
                    <p className="font-medium text-slate-800">{selectedApplicant.address}</p>
                  </div>

                  {selectedApplicant.phone && (
                    <a
                      href={`https://wa.me/${selectedApplicant.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Hubungi WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Form Aksi Verifikasi Panitia */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Keputusan Panitia Penerimaan
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Penetapan</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'submitted', label: 'Menunggu', color: 'border-amber-400 bg-amber-50' },
                      { id: 'verified', label: 'Terverifikasi', color: 'border-blue-400 bg-blue-50' },
                      { id: 'accepted', label: 'Diterima', color: 'border-emerald-500 bg-emerald-50' },
                      { id: 'rejected', label: 'Ditolak', color: 'border-rose-400 bg-rose-50' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setActionStatus(opt.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                          actionStatus === opt.id
                            ? `${opt.color} ring-2 ring-emerald-600`
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan / Instruksi Panitia (Akan muncul saat siswa melacak statusnya)
                  </label>
                  <textarea
                    rows={3}
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="e.g. Berkas administrasi lengkap. Silakan hadir saat daftar ulang membawa dokumen asli."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedApplicant(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleUpdateStatus}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-colors"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Verifikasi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INPUT MANUAL APPLICANT */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Input Pendaftar Baru (Pelayanan Offline)</h3>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualApplicant} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Calon Siswa</label>
                <input
                  type="text"
                  required
                  value={manualForm.fullName}
                  onChange={(e) => setManualForm({ ...manualForm, fullName: e.target.value })}
                  placeholder="Nama Lengkap"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NISN (10 Digit)</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={manualForm.nisn}
                    onChange={(e) => setManualForm({ ...manualForm, nisn: e.target.value })}
                    placeholder="00xxxxxxx"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pilihan Jalur</label>
                  <select
                    value={manualForm.entryTrack}
                    onChange={(e) => setManualForm({ ...manualForm, entryTrack: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {tracks.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Asal Sekolah (SMP)</label>
                  <input
                    type="text"
                    required
                    value={manualForm.previousSchool}
                    onChange={(e) => setManualForm({ ...manualForm, previousSchool: e.target.value })}
                    placeholder="SMP Asal"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Orang Tua</label>
                  <input
                    type="text"
                    required
                    value={manualForm.parentName}
                    onChange={(e) => setManualForm({ ...manualForm, parentName: e.target.value })}
                    placeholder="Nama Orang Tua"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp Orang Tua</label>
                <input
                  type="text"
                  required
                  value={manualForm.phone}
                  onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                  placeholder="08123456789"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-colors"
                >
                  {loading ? 'Mendaftarkan...' : 'Daftarkan Calon Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
