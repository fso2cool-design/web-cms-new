'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Menu,
  X,
  GraduationCap,
  Sparkles,
  ChevronDown,
  UserCheck,
  Search,
  BookOpen,
  Calendar,
  Users,
  Award,
  Image as ImageIcon,
  FileText,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  LogIn,
  Lock,
} from 'lucide-react';
import { SchoolProfile } from '@/types';
import { useAuth } from '@/lib/firebase/auth-context';
import { normalizeImageUrl } from '@/lib/image-utils';

interface PublicNavbarProps {
  schoolProfile: SchoolProfile;
  onOpenView: (viewName: string, data?: any) => void;
  onOpenAdmin: () => void;
}

const emptySubscribe = () => () => {};

export function PublicNavbar({ schoolProfile, onOpenView, onOpenAdmin }: PublicNavbarProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [akademikDropdownOpen, setAkademikDropdownOpen] = useState(false);
  const [infoDropdownOpen, setInfoDropdownOpen] = useState(false);
  const { appUser, isAdmin } = useAuth();

  const ppdbEnabled = schoolProfile.features?.ppdbEnabled ?? true;
  const galleryEnabled = schoolProfile.features?.galleryEnabled ?? true;
  const documentsEnabled = schoolProfile.features?.documentsEnabled ?? true;
  const faqEnabled = schoolProfile.features?.faqEnabled ?? true;

  const handleNavClick = (viewName: string, data?: any) => {
    onOpenView(viewName, data);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setAkademikDropdownOpen(false);
    setInfoDropdownOpen(false);
  };

  return (
    <header className="w-full sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200 overflow-x-clip">
      {/* Top Bar Informasi & Pengumuman */}
      <div className="bg-emerald-800 text-white text-xs py-2 px-4 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          {/* Kontak & Jam Operasional */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 text-emerald-100">
            <span className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap">
              <Phone className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span>{schoolProfile.phone || '-'}</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap">
              <Mail className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span className="truncate max-w-[200px]">{schoolProfile.email || '-'}</span>
            </span>
            <span className="hidden xl:flex items-center gap-1.5 text-emerald-200 whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{(schoolProfile.operatingHours || '-').replace(/WIB/g, 'WIT')}</span>
            </span>
          </div>

          {/* Quick Notice & Admin Access */}
          <div className="flex items-center gap-2.5 sm:gap-3 whitespace-nowrap">
            {ppdbEnabled ? (
              <Link
                id="btn-topbar-ppdb"
                href="/ppdb"
                className="flex items-center gap-1.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 hover:text-white px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-emerald-700/50 transition-colors cursor-pointer shrink-0"
                title="Buka Pendaftaran PPDB"
              >
                <Sparkles className="w-3 h-3 text-amber-300 animate-pulse shrink-0" />
                <span>PPDB {schoolProfile.ppdbYear || ''} Dibuka!</span>
              </Link>
            ) : (
              <div className="flex items-center gap-1.5 bg-emerald-950/60 text-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-emerald-800/50 shrink-0">
                <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>{schoolProfile.excellenceBadge || (schoolProfile.accreditation ? `Akreditasi ${schoolProfile.accreditation}` : 'Belum Terakreditasi')}</span>
              </div>
            )}

            {/* Quick Admin Access indicator */}
            {mounted && isAdmin ? (
              <Link
                id="btn-nav-admin-dashboard"
                href="/admin"
                className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all shadow-2xs shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Panel Admin ({appUser?.displayName?.split(' ')[0] || 'Admin'})</span>
              </Link>
            ) : (
              <Link
                id="btn-nav-login"
                href="/admin"
                className="flex items-center gap-1 hover:text-white text-emerald-200/90 text-[11px] transition-colors shrink-0"
                title="Akses Sistem"
              >
                <Lock className="w-3 h-3 shrink-0" />
                <span>Masuk</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2 sm:gap-4">
          {/* Logo & School Identity (Responsive with max-width and line-clamp) */}
          <div
            className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer select-none group shrink-0"
            onClick={() => handleNavClick('home')}
            id="brand-header"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-700 to-teal-800 text-white flex items-center justify-center font-black text-2xl shadow-md group-hover:scale-105 transition-transform duration-200 border border-emerald-500/30 shrink-0">
              {schoolProfile.logo || schoolProfile.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={normalizeImageUrl(schoolProfile.logo || schoolProfile.logoUrl)}
                  alt={schoolProfile.name}
                  className="w-9 h-9 sm:w-10 sm:h-10 object-contain"
                />
              ) : (
                <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300" />
              )}
            </div>
            <div className="max-w-[130px] sm:max-w-[180px] md:max-w-[210px] xl:max-w-[260px] 2xl:max-w-[320px]">
              <span className="font-extrabold text-sm sm:text-base xl:text-lg text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors leading-tight line-clamp-2 block">
                {schoolProfile.name || 'Portal Sekolah'}
              </span>
              <p className="text-[11px] text-slate-500 line-clamp-1 hidden sm:block truncate mt-0.5">
                {schoolProfile.slogan || schoolProfile.tagline || 'Slogan Belum Diatur'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links (Clean grouping, guaranteed no line breaking) */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 text-xs xl:text-sm font-medium text-slate-700">
            <button
              id="nav-link-home"
              onClick={() => handleNavClick('home')}
              className="px-2 xl:px-3 py-2 rounded-lg hover:text-emerald-700 hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              Beranda
            </button>

            {/* Dropdown Profil */}
            <div className="relative">
              <button
                id="nav-link-profile-toggle"
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setAkademikDropdownOpen(false);
                  setInfoDropdownOpen(false);
                }}
                onMouseEnter={() => {
                  setProfileDropdownOpen(true);
                  setAkademikDropdownOpen(false);
                  setInfoDropdownOpen(false);
                }}
                className="px-2 xl:px-3 py-2 rounded-lg hover:text-emerald-700 hover:bg-slate-100 flex items-center gap-1 transition-colors whitespace-nowrap"
              >
                <span>Profil</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                  className="absolute left-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <Link
                    href="/profil?tab=visi-misi"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="w-full text-left px-4 py-2 hover:bg-emerald-50 hover:text-emerald-700 text-xs xl:text-sm flex items-center gap-2.5 text-slate-700"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Visi, Misi &amp; Tujuan</span>
                  </Link>
                  <Link
                    href="/profil?tab=sambutan"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="w-full text-left px-4 py-2 hover:bg-emerald-50 hover:text-emerald-700 text-xs xl:text-sm flex items-center gap-2.5 text-slate-700"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Sambutan Kepala Sekolah</span>
                  </Link>
                  <Link
                    href="/profil?tab=sejarah"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="w-full text-left px-4 py-2 hover:bg-emerald-50 hover:text-emerald-700 text-xs xl:text-sm flex items-center gap-2.5 text-slate-700"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Sejarah &amp; Identitas</span>
                  </Link>
                  <Link
                    href="/profil?tab=struktur"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="w-full text-left px-4 py-2 hover:bg-emerald-50 hover:text-emerald-700 text-xs xl:text-sm flex items-center gap-2.5 text-slate-700"
                  >
                    <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Struktur Organisasi</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Dropdown Akademik & Sarana */}
            <div className="relative">
              <button
                id="nav-link-akademik-toggle"
                onClick={() => {
                  setAkademikDropdownOpen(!akademikDropdownOpen);
                  setProfileDropdownOpen(false);
                  setInfoDropdownOpen(false);
                }}
                onMouseEnter={() => {
                  setAkademikDropdownOpen(true);
                  setProfileDropdownOpen(false);
                  setInfoDropdownOpen(false);
                }}
                className="px-2 xl:px-3 py-2 rounded-lg hover:text-emerald-700 hover:bg-slate-100 flex items-center gap-1 transition-colors whitespace-nowrap"
              >
                <span>Akademik</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {akademikDropdownOpen && (
                <div
                  onMouseLeave={() => setAkademikDropdownOpen(false)}
                  className="absolute left-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <Link
                    href="/akademik?tab=kurikulum"
                    onClick={() => setAkademikDropdownOpen(false)}
                    className="w-full text-left px-4 py-2 hover:bg-emerald-50 hover:text-emerald-700 text-xs xl:text-sm flex items-center gap-2.5 text-slate-700"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Kurikulum Merdeka</span>
                  </Link>
                  <Link
                    href="/akademik?tab=ekskul"
                    onClick={() => setAkademikDropdownOpen(false)}
                    className="w-full text-left px-4 py-2 hover:bg-emerald-50 hover:text-emerald-700 text-xs xl:text-sm flex items-center gap-2.5 text-slate-700"
                  >
                    <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Ekstrakurikuler</span>
                  </Link>
                  <Link
                    href="/akademik?tab=fasilitas"
                    onClick={() => setAkademikDropdownOpen(false)}
                    className="w-full text-left px-4 py-2 hover:bg-emerald-50 hover:text-emerald-700 text-xs xl:text-sm flex items-center gap-2.5 text-slate-700"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Fasilitas &amp; Lab</span>
                  </Link>
                </div>
              )}
            </div>

            <button
              id="nav-link-teachers"
              onClick={() => handleNavClick('teachers')}
              className="px-2 xl:px-3 py-2 rounded-lg hover:text-emerald-700 hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              Guru &amp; Tendik
            </button>

            <Link
              id="nav-link-news"
              href="/berita"
              className="px-2 xl:px-3 py-2 rounded-lg hover:text-emerald-700 hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              Berita &amp; Agenda
            </Link>

            <button
              id="nav-link-prestasi"
              onClick={() => handleNavClick('prestasi')}
              className="px-2 xl:px-3 py-2 rounded-lg hover:text-emerald-700 hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              Prestasi
            </button>

            {/* Dropdown Informasi (Galeri, Unduhan, FAQ) */}
            {(galleryEnabled || documentsEnabled || faqEnabled) && (
              <div className="relative">
                <button
                  id="nav-link-info-toggle"
                  onClick={() => {
                    setInfoDropdownOpen(!infoDropdownOpen);
                    setProfileDropdownOpen(false);
                    setAkademikDropdownOpen(false);
                  }}
                  onMouseEnter={() => {
                    setInfoDropdownOpen(true);
                    setProfileDropdownOpen(false);
                    setAkademikDropdownOpen(false);
                  }}
                  className="px-2 xl:px-3 py-2 rounded-lg hover:text-emerald-700 hover:bg-slate-100 flex items-center gap-1 transition-colors whitespace-nowrap"
                >
                  <span>Informasi</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {infoDropdownOpen && (
                  <div
                    onMouseLeave={() => setInfoDropdownOpen(false)}
                    className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    {galleryEnabled && (
                      <button
                        onClick={() => handleNavClick('gallery')}
                        className="w-full text-left px-4 py-2 hover:bg-emerald-50 hover:text-emerald-700 text-xs xl:text-sm flex items-center gap-2.5 text-slate-700"
                      >
                        <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Galeri Foto &amp; Kegiatan</span>
                      </button>
                    )}
                    {documentsEnabled && (
                      <button
                        onClick={() => handleNavClick('documents')}
                        className="w-full text-left px-4 py-2 hover:bg-emerald-50 hover:text-emerald-700 text-xs xl:text-sm flex items-center gap-2.5 text-slate-700"
                      >
                        <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Pusat Unduhan Berkas</span>
                      </button>
                    )}
                    {faqEnabled && (
                      <button
                        onClick={() => handleNavClick('faq')}
                        className="w-full text-left px-4 py-2 hover:bg-emerald-50 hover:text-emerald-700 text-xs xl:text-sm flex items-center gap-2.5 text-slate-700"
                      >
                        <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Tanya Jawab (FAQ)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            <button
              id="nav-link-contact"
              onClick={() => handleNavClick('contact')}
              className="px-2 xl:px-3 py-2 rounded-lg hover:text-emerald-700 hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              Kontak
            </button>
          </nav>

          {/* Action CTA Buttons (Responsive sizing, no awkward line breaking) */}
          {ppdbEnabled && (
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <Link
                id="btn-ppdb-cek-status"
                href="/ppdb?tab=status"
                className="hidden 2xl:flex px-2.5 xl:px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors items-center gap-1.5 whitespace-nowrap"
                title="Cek Status Pendaftaran PPDB"
              >
                <Search className="w-3.5 h-3.5 shrink-0" />
                <span>Cek Status PPDB</span>
              </Link>

              <Link
                id="btn-ppdb-register"
                href="/ppdb"
                className="px-3 xl:px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 rounded-lg shadow-2xs hover:shadow transition-all flex items-center gap-1.5 group whitespace-nowrap shrink-0"
              >
                <GraduationCap className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform shrink-0" />
                <span>Daftar PPDB</span>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            {ppdbEnabled && (
              <Link
                id="btn-mobile-ppdb"
                href="/ppdb"
                className="sm:hidden px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg"
              >
                PPDB
              </Link>
            )}
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Buka menu navigasi"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top duration-200 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
            <Link
              href="/ppdb"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2 px-3 text-xs font-bold bg-emerald-600 text-white rounded-lg text-center flex items-center justify-center gap-1"
            >
              🎓 Daftar PPDB
            </Link>
            <Link
              href="/ppdb?tab=status"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2 px-3 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-center flex items-center justify-center gap-1"
            >
              🔍 Cek Status
            </Link>
          </div>

          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full text-left px-3 py-2.5 rounded-lg text-slate-800 hover:bg-slate-100 font-medium text-sm flex items-center gap-2"
          >
            <span>Beranda</span>
          </Link>

          <div className="border-t border-slate-100 pt-2 space-y-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Profil Sekolah</p>
            <Link
              href="/profil?tab=visi-misi"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 text-sm flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Visi, Misi &amp; Tujuan</span>
            </Link>
            <Link
              href="/profil?tab=sambutan"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 text-sm flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Sambutan Kepala Sekolah</span>
            </Link>
            <Link
              href="/profil?tab=sejarah"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 text-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Sejarah &amp; Identitas</span>
            </Link>
            <Link
              href="/profil?tab=struktur"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 text-sm flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Struktur Organisasi</span>
            </Link>
          </div>

          <div className="border-t border-slate-100 pt-2 space-y-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Akademik &amp; Sarana</p>
            <Link
              href="/akademik?tab=kurikulum"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 text-sm flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Kurikulum Merdeka</span>
            </Link>
            <Link
              href="/akademik?tab=ekskul"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 text-sm flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Ekstrakurikuler</span>
            </Link>
            <Link
              href="/akademik?tab=fasilitas"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 text-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Fasilitas &amp; Lab</span>
            </Link>
          </div>

          <div className="border-t border-slate-100 pt-2 space-y-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Informasi &amp; Layanan</p>
            <button
              onClick={() => handleNavClick('teachers')}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-emerald-50 text-sm flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Direktori Guru &amp; Tendik</span>
            </button>
            <Link
              href="/berita"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-emerald-50 text-sm flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Berita, Pengumuman &amp; Agenda</span>
            </Link>
            <button
              onClick={() => handleNavClick('prestasi')}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-emerald-50 text-sm flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Prestasi Siswa</span>
            </button>
            {galleryEnabled && (
              <button
                onClick={() => handleNavClick('gallery')}
                className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-emerald-50 text-sm flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>Galeri Foto &amp; Kegiatan</span>
              </button>
            )}
            {documentsEnabled && (
              <button
                onClick={() => handleNavClick('documents')}
                className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-emerald-50 text-sm flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Pusat Unduhan Berkas</span>
              </button>
            )}
            {faqEnabled && (
              <button
                onClick={() => handleNavClick('faq')}
                className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-emerald-50 text-sm flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>FAQ Tanya Jawab</span>
              </button>
            )}
            <button
              onClick={() => handleNavClick('contact')}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-emerald-50 text-sm flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Kontak &amp; Lokasi</span>
            </button>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 px-3 bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span>{mounted && isAdmin ? 'Masuk Panel Admin' : 'Login Operator / Guru'}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
