'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  Heart,
} from 'lucide-react';
import { SchoolProfile, VisitorAnalytics } from '@/types';
import { VisitorStatsWidget } from '@/components/public/visitor-stats-widget';
import { normalizeImageUrl } from '@/lib/image-utils';

interface PublicFooterProps {
  schoolProfile: SchoolProfile;
  visitorAnalytics?: VisitorAnalytics;
  onOpenView: (viewName: string, data?: any) => void;
  onOpenAdmin: () => void;
}

export function PublicFooter({ schoolProfile, visitorAnalytics, onOpenView, onOpenAdmin }: PublicFooterProps) {
  const currentYear = new Date().getFullYear();
  const ppdbEnabled = schoolProfile.features?.ppdbEnabled ?? true;
  const documentsEnabled = schoolProfile.features?.documentsEnabled ?? true;
  const faqEnabled = schoolProfile.features?.faqEnabled ?? true;

  return (
    <footer className="w-full bg-slate-900 text-white border-t border-slate-800">
      {/* PPDB CTA Banner (Jika Aktif) */}
      {ppdbEnabled && (
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 border-b border-emerald-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  PPDB {schoolProfile.ppdbYear || ''} Telah Dibuka
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Bergabunglah Bersama Keluarga Besar {schoolProfile.name || 'Sekolah Kami'}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-xl">
                  Daftarkan putra-putri Anda secara online melalui portal resmi. Proses cepat, transparan, dan terintegrasi.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
                <Link
                  href="/ppdb"
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <span>Info &amp; Alur PPDB</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => onOpenView('ppdb-apply')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 border border-emerald-400/30"
                >
                  <span>Daftar Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Kolom 1: Identitas Sekolah (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              {schoolProfile.logo || schoolProfile.logoUrl ? (
                <div className="h-10 sm:h-11 flex items-center justify-center shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={normalizeImageUrl(schoolProfile.logo || schoolProfile.logoUrl)}
                    alt={schoolProfile.name || 'Logo Sekolah'}
                    className="h-9 sm:h-10 w-auto max-w-[56px] object-contain drop-shadow-xs"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black shadow overflow-hidden shrink-0">
                  <GraduationCap className="w-6 h-6 text-amber-300" />
                </div>
              )}
              <div>
                <h4 className="text-lg font-extrabold text-white tracking-tight">
                  {schoolProfile.name || 'Portal Sekolah'}
                </h4>
                <p className="text-xs text-emerald-400 font-medium">
                  NPSN: {schoolProfile.npsn || '-'} • {schoolProfile.accreditation ? `Akreditasi ${schoolProfile.accreditation}` : 'Belum Terakreditasi'}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed pr-4">
              {schoolProfile.description || 'Deskripsi profil sekolah (Silakan isi di panel admin).'}
            </p>

            <div className="pt-2 space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{schoolProfile.address || '-'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {schoolProfile.phone ? (
                    <a href={`tel:${schoolProfile.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-emerald-300 transition-colors">
                      {schoolProfile.phone}
                    </a>
                  ) : (
                    '-'
                  )}
                  {' / WA: '}
                  {schoolProfile.whatsapp ? (
                    <a
                      href={`https://wa.me/${schoolProfile.whatsapp.replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-emerald-300 font-semibold underline decoration-emerald-500/50 underline-offset-2 transition-colors"
                    >
                      {schoolProfile.whatsapp}
                    </a>
                  ) : (
                    '-'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                {schoolProfile.email ? (
                  <a href={`mailto:${schoolProfile.email}`} className="hover:text-emerald-300 transition-colors">
                    {schoolProfile.email}
                  </a>
                ) : (
                  <span>-</span>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{(schoolProfile.operatingHours || '-').replace(/WIB/g, 'WIT')}</span>
              </div>
            </div>
          </div>

          {/* Kolom 2: Profil & Akademik */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Profil &amp; Akademik</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link
                  href="/profil?tab=visi-misi"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span>Visi, Misi &amp; Tujuan</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/profil?tab=sambutan"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span>Sambutan Kepala Sekolah</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/profil?tab=sejarah"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span>Sejarah Singkat</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/akademik?tab=kurikulum"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span>Kurikulum Merdeka</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/akademik?tab=ekskul"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span>Ekstrakurikuler</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/akademik?tab=fasilitas"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span>Fasilitas Pembelajaran</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Layanan & Informasi */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Layanan Publik</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              {ppdbEnabled && (
                <li>
                  <Link
                    href="/ppdb"
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-emerald-300 font-medium"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Informasi PPDB {schoolProfile.ppdbYear || ''}</span>
                  </Link>
                </li>
              )}
              <li>
                <button
                  onClick={() => onOpenView('teachers')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span>Direktori Guru &amp; Staff</span>
                </button>
              </li>
              <li>
                <Link
                  href="/berita"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span>Warta Sekolah &amp; Agenda</span>
                </Link>
              </li>
              <li>
                <button
                  onClick={() => onOpenView('prestasi')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span>Prestasi Siswa &amp; Guru</span>
                </button>
              </li>
              {documentsEnabled && (
                <li>
                  <button
                    onClick={() => onOpenView('documents')}
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    <span>Unduh Dokumen &amp; Kalender</span>
                  </button>
                </li>
              )}
              {faqEnabled && (
                <li>
                  <button
                    onClick={() => onOpenView('faq')}
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    <span>Pertanyaan Umum (FAQ)</span>
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={() => onOpenView('contact')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span>Hubungi Kami</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Tautan Eksternal & Portals */}
          {/* 4. Tautan Resmi Lembaga / Kementerian */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Tautan Resmi</h4>
            {(() => {
              const isMadrasah =
                schoolProfile.name?.toLowerCase().includes('man ') ||
                schoolProfile.name?.toLowerCase().includes('mts') ||
                schoolProfile.name?.toLowerCase().includes('min ') ||
                schoolProfile.name?.toLowerCase().includes('madrasah') ||
                schoolProfile.shortName?.toLowerCase().includes('man') ||
                schoolProfile.shortName?.toLowerCase().includes('mts');

              const fallbackLinks = isMadrasah
                ? [
                    { title: 'Kementerian Agama RI', url: 'https://kemenag.go.id' },
                    { title: 'Portal EMIS Madrasah', url: 'https://emis.kemenag.go.id' },
                    { title: 'SIMPATIKA Kemenag', url: 'https://simpatika.kemenag.go.id' },
                    { title: 'Asesmen Nasional (ANBK)', url: 'https://anbk.kemdikbud.go.id' },
                  ]
                : [
                    { title: 'Kementerian Pendidikan', url: 'https://kemdikbud.go.id' },
                    { title: 'Portal Dapodikdasmen', url: 'https://dapo.kemdikbud.go.id' },
                    { title: 'Platform Merdeka Mengajar', url: 'https://guru.kemdikbud.go.id' },
                    { title: 'Pusat Prestasi Nasional', url: 'https://puspresnas.kemdikbud.go.id' },
                  ];

              const linksToDisplay =
                schoolProfile.officialLinks && schoolProfile.officialLinks.length > 0
                  ? schoolProfile.officialLinks
                  : fallbackLinks;

              return (
                <ul className="space-y-2.5 text-xs text-slate-400">
                  {linksToDisplay.map((link, idx) => (
                    <li key={idx}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-emerald-300 transition-colors flex items-center justify-between group"
                      >
                        <span>{link.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-300" />
                      </a>
                    </li>
                  ))}
                </ul>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Bottom Legal, Visitor Stats & Credits */}
      <div className="border-t border-slate-800 py-6 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-center md:text-left">
            © {currentYear} {schoolProfile.name || 'Portal Sekolah'}. Hak Cipta Dilindungi Undang-Undang.
          </p>

          {/* 1 Widget Statistik Pengunjung (Rapi, tanpa kartu, pas di bottom bar) */}
          <div className="flex items-center justify-center">
            <VisitorStatsWidget analytics={visitorAnalytics} />
          </div>

          <p className="flex items-center gap-1 text-center md:text-right">
            <span>Dikembangkan untuk kemajuan pendidikan Indonesia</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
