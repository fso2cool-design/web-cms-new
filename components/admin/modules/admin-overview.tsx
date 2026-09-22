'use client';

import React from 'react';
import {
  Users,
  GraduationCap,
  Newspaper,
  CalendarDays,
  MessageSquare,
  Trophy,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  FileText,
  AlertCircle,
} from 'lucide-react';
import {
  SchoolProfile,
  NewsItem,
  EventItem,
  TeacherItem,
  PPDBApplicantItem,
  ContactMessage,
} from '@/types';
import { AdminTab } from '../admin-layout';

interface AdminOverviewProps {
  schoolProfile: SchoolProfile;
  newsList: NewsItem[];
  events: EventItem[];
  teachers: TeacherItem[];
  ppdbApplicants: PPDBApplicantItem[];
  messages: ContactMessage[];
  onNavigateTab: (tab: AdminTab) => void;
}

export function AdminOverview({
  schoolProfile,
  newsList,
  events,
  teachers,
  ppdbApplicants,
  messages,
  onNavigateTab,
}: AdminOverviewProps) {
  const pendingPPDB = ppdbApplicants.filter((a) => a.status === 'submitted');
  const unreadMessages = messages.filter((m) => !m.isRead);

  const stats = [
    {
      title: 'Pendaftar PPDB 2026',
      value: ppdbApplicants.length,
      badge: `${pendingPPDB.length} Butuh Verifikasi`,
      badgeColor: pendingPPDB.length > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800',
      icon: <GraduationCap className="w-6 h-6 text-emerald-600" />,
      tab: 'ppdb' as AdminTab,
    },
    {
      title: 'Dewan Guru & Tendik',
      value: teachers.length,
      badge: 'Data Aktif',
      badgeColor: 'bg-blue-100 text-blue-800',
      icon: <Users className="w-6 h-6 text-blue-600" />,
      tab: 'teachers' as AdminTab,
    },
    {
      title: 'Artikel & Warta Berita',
      value: newsList.length,
      badge: 'Terpublikasi',
      badgeColor: 'bg-amber-100 text-amber-800',
      icon: <Newspaper className="w-6 h-6 text-amber-600" />,
      tab: 'news' as AdminTab,
    },
    {
      title: 'Agenda & Kalender',
      value: events.length,
      badge: 'Kegiatan Aktif',
      badgeColor: 'bg-purple-100 text-purple-800',
      icon: <CalendarDays className="w-6 h-6 text-purple-600" />,
      tab: 'events' as AdminTab,
    },
    {
      title: 'Pesan & Aspirasi',
      value: messages.length,
      badge: `${unreadMessages.length} Belum Dibaca`,
      badgeColor: unreadMessages.length > 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800',
      icon: <MessageSquare className="w-6 h-6 text-teal-600" />,
      tab: 'messages' as AdminTab,
    },
    {
      title: 'Total Siswa Aktif',
      value: schoolProfile.studentCount || 842,
      badge: `Akreditasi ${schoolProfile.accreditation || 'A'}`,
      badgeColor: 'bg-emerald-100 text-emerald-800',
      icon: <Trophy className="w-6 h-6 text-amber-600" />,
      tab: 'profile' as AdminTab,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Pusat Kendali &amp; Sistem Informasi Sekolah</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Selamat Datang di Panel CMS {schoolProfile.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Kelola identitas resmi sekolah, publikasikan berita dan pengumuman, perbarui agenda kegiatan, verifikasi berkas pendaftar PPDB Online, dan tanggapi aspirasi masyarakat dalam satu platform terpadu.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('ppdb')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-amber-300" />
              <span>Verifikasi PPDB ({pendingPPDB.length})</span>
            </button>
            <button
              onClick={() => onNavigateTab('news')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-2"
            >
              <Newspaper className="w-4 h-4 text-slate-400" />
              <span>Tulis Berita Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((stat, i) => (
          <div
            key={i}
            onClick={() => onNavigateTab(stat.tab)}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-3xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {stat.value}
                </h3>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${stat.badgeColor}`}>
                {stat.badge}
              </span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Kelola</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Section: Recent PPDB & Recent Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pendaftar PPDB Terbaru */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">Pendaftar PPDB Terbaru</h3>
            </div>
            <button
              onClick={() => onNavigateTab('ppdb')}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              Lihat Semua ({ppdbApplicants.length})
            </button>
          </div>

          {ppdbApplicants.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Belum ada berkas pendaftar PPDB masuk.</p>
          ) : (
            <div className="space-y-2.5">
              {ppdbApplicants.slice(0, 4).map((applicant) => (
                <div
                  key={applicant.id}
                  onClick={() => onNavigateTab('ppdb')}
                  className="p-3 bg-slate-50 hover:bg-emerald-50/50 rounded-xl border border-slate-200/80 transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 truncate">{applicant.fullName}</p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">
                      {applicant.registrationNumber} • {applicant.previousSchool}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                      applicant.status === 'submitted'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : applicant.status === 'verified'
                        ? 'bg-blue-100 text-blue-900'
                        : applicant.status === 'accepted'
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-rose-100 text-rose-900'
                    }`}
                  >
                    {applicant.status === 'submitted'
                      ? 'Menunggu'
                      : applicant.status === 'verified'
                      ? 'Terverifikasi'
                      : applicant.status === 'accepted'
                      ? 'Diterima'
                      : 'Ditolak'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pesan / Aspirasi Publik Masuk */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-teal-700" />
              <h3 className="text-sm font-bold text-slate-900">Pesan &amp; Aspirasi Publik Masuk</h3>
            </div>
            <button
              onClick={() => onNavigateTab('messages')}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              Buka Kotak Masuk ({messages.length})
            </button>
          </div>

          {messages.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Belum ada pesan masyarakat masuk.</p>
          ) : (
            <div className="space-y-2.5">
              {messages.slice(0, 4).map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => onNavigateTab('messages')}
                  className={`p-3 rounded-xl border transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                    msg.isRead
                      ? 'bg-slate-50 border-slate-200/80'
                      : 'bg-emerald-50/70 border-emerald-200'
                  }`}
                >
                  <div className="space-y-0.5 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900 truncate">{msg.senderName}</p>
                      {!msg.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-1">{msg.message}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{msg.createdAt}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System & Identity Highlights */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Informasi Identitas &amp; Teknis Lembaga</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500">Nama Sekolah:</span>
            <p className="font-bold text-slate-900 truncate">{schoolProfile.name}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500">NPSN / NSS:</span>
            <p className="font-bold text-slate-900">{schoolProfile.npsn} / {schoolProfile.nss || '-'}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500">Kepala Sekolah:</span>
            <p className="font-bold text-slate-900 truncate">{schoolProfile.principalName}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500">Basis Data:</span>
            <p className="font-bold text-emerald-700">Firestore (cms-sekolah)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
