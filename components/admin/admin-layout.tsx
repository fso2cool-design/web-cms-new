'use client';

import React, { ReactNode } from 'react';
import {
  LayoutDashboard,
  Building2,
  Newspaper,
  CalendarDays,
  GraduationCap,
  Users,
  Trophy,
  Landmark,
  FileText,
  MessageSquare,
  HelpCircle,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Menu,
  X,
  Compass,
  Star,
  BarChart2,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';
import { SchoolProfile } from '@/types';

export type AdminTab =
  | 'overview'
  | 'profile'
  | 'news'
  | 'events'
  | 'teachers'
  | 'ppdb'
  | 'facilities'
  | 'extracurriculars'
  | 'achievements-gallery'
  | 'documents'
  | 'messages'
  | 'faqs'
  | 'reviews'
  | 'analytics';

interface AdminLayoutProps {
  children: ReactNode;
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  schoolProfile: SchoolProfile;
  onExitAdmin: () => void;
}

interface MenuCategory {
  title: string;
  items: {
    id: AdminTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
  }[];
}

export function AdminLayout({
  children,
  activeTab,
  onSelectTab,
  schoolProfile,
  onExitAdmin,
}: AdminLayoutProps) {
  const { appUser, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const menuCategories: MenuCategory[] = [
    {
      title: 'Utama & Pendaftaran',
      items: [
        {
          id: 'overview',
          label: 'Ringkasan Dashboard',
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
        {
          id: 'ppdb',
          label: 'Verifikasi PPDB 2026',
          icon: <GraduationCap className="w-4 h-4 text-emerald-400" />,
          badge: 'Prioritas',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        },
      ],
    },
    {
      title: 'Data & Akademik',
      items: [
        {
          id: 'profile',
          label: 'Profil & Identitas',
          icon: <Building2 className="w-4 h-4 text-blue-400" />,
        },
        {
          id: 'teachers',
          label: 'Dewan Guru & Tendik',
          icon: <Users className="w-4 h-4 text-cyan-400" />,
        },
        {
          id: 'facilities',
          label: 'Sarana & Fasilitas',
          icon: <Landmark className="w-4 h-4 text-amber-400" />,
        },
        {
          id: 'extracurriculars',
          label: 'Ekstrakurikuler',
          icon: <Compass className="w-4 h-4 text-indigo-400" />,
        },
      ],
    },
    {
      title: 'Publikasi & Media',
      items: [
        {
          id: 'news',
          label: 'Berita & Pengumuman',
          icon: <Newspaper className="w-4 h-4 text-teal-400" />,
        },
        {
          id: 'events',
          label: 'Agenda & Kalender',
          icon: <CalendarDays className="w-4 h-4 text-purple-400" />,
        },
        {
          id: 'achievements-gallery',
          label: 'Prestasi & Galeri Foto',
          icon: <Trophy className="w-4 h-4 text-yellow-400" />,
        },
        {
          id: 'documents',
          label: 'Pusat Unduhan Berkas',
          icon: <FileText className="w-4 h-4 text-sky-400" />,
        },
      ],
    },
    {
      title: 'Interaksi & Pengunjung',
      items: [
        {
          id: 'messages',
          label: 'Pesan & Aspirasi',
          icon: <MessageSquare className="w-4 h-4 text-rose-400" />,
        },
        {
          id: 'reviews',
          label: 'Moderasi Ulasan',
          icon: <Star className="w-4 h-4 text-amber-300" />,
          badge: 'Baru',
          badgeColor: 'bg-amber-400/20 text-amber-300 border border-amber-400/30',
        },
        {
          id: 'analytics',
          label: 'Statistik & Histats',
          icon: <BarChart2 className="w-4 h-4 text-emerald-400" />,
        },
        {
          id: 'faqs',
          label: 'Tanya Jawab (FAQ)',
          icon: <HelpCircle className="w-4 h-4 text-slate-400" />,
        },
      ],
    },
  ];

  const handleTabClick = (tab: AdminTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  // Cari label tab aktif
  const currentTabLabel =
    menuCategories.flatMap((c) => c.items).find((i) => i.id === activeTab)?.label || 'Ringkasan';

  return (
    <div className="h-screen w-full bg-slate-100 flex flex-col md:flex-row text-slate-900 font-sans overflow-hidden">
      {/* Mobile Topbar */}
      <header className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs shadow">
            CMS
          </div>
          <div>
            <h1 className="text-xs font-bold text-white line-clamp-1 leading-tight">
              {schoolProfile.shortName || schoolProfile.name || 'MAN Contoh'}
            </h1>
            <p className="text-[10px] text-emerald-400 font-mono">Panel Operator &amp; CMS</p>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-72 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 z-40 shrink-0 transition-transform duration-200 shadow-xl md:shadow-none ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header (Selalu terlihat di atas) */}
        <div className="p-4 border-b border-slate-800/90 flex items-center justify-between shrink-0 bg-slate-950/40">
          <div className="flex items-center gap-3 overflow-hidden">
            {schoolProfile.logoUrl ? (
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center overflow-hidden shadow-md shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={schoolProfile.logoUrl}
                  alt={schoolProfile.shortName || schoolProfile.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black text-base shadow-md shrink-0">
                <GraduationCap className="w-5 h-5 text-amber-300" />
              </div>
            )}
            <div className="overflow-hidden">
              <h2 className="text-xs font-black text-white tracking-tight truncate uppercase">
                {schoolProfile.shortName || schoolProfile.name || 'MAN CONTOH'}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-mono font-medium">Panel Admin CMS</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-3.5 py-2.5 mx-3 mt-3 mb-1 rounded-xl bg-slate-800/70 border border-slate-800 flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-inner">
            {appUser?.displayName?.charAt(0) || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{appUser?.displayName || 'Administrator'}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-wide">
                {appUser?.role || 'Superadmin'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation List Terkategori (Scrollable) */}
        <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto custom-scrollbar">
          {menuCategories.map((category, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 pt-1 pb-1">
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  {category.title}
                </p>
              </div>

              <div className="space-y-0.5">
                {category.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/60'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={isActive ? 'text-white' : 'text-slate-400 shrink-0'}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ml-1 shrink-0 ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : item.badgeColor || 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Actions (Sticky di bagian bawah sidebar) */}
        <div className="p-3 border-t border-slate-800/90 space-y-1.5 bg-slate-950/60 shrink-0">
          <button
            onClick={onExitAdmin}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-emerald-400 hover:text-white hover:bg-emerald-950/70 rounded-xl border border-emerald-900/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Lihat Website Publik</span>
            </div>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
              LIVE
            </span>
          </button>

          <button
            onClick={async () => {
              try {
                await signOut();
              } catch (err) {
                console.error('Logout error:', err);
              } finally {
                onExitAdmin();
              }
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Akun Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Canvas (Scroll Mandiri) */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50">
        {/* Desktop Topbar */}
        <div className="hidden md:flex bg-white border-b border-slate-200 px-6 sm:px-8 py-3.5 items-center justify-between shrink-0 z-20 shadow-xs">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="font-semibold text-slate-400">Portal Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-extrabold text-slate-800 tracking-tight">{currentTabLabel}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sistem Aktif</span>
            </div>

            <button
              onClick={onExitAdmin}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              <span>Buka Web Madrasah</span>
            </button>
          </div>
        </div>

        {/* Page Inner Container (Hanya area ini yang scroll) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
