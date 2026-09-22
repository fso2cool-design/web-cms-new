'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { SchoolProfile } from '@/types';
import { initialSchoolProfile } from '@/lib/seed-data';
import { getSchoolProfile } from '@/services/school.service';
import { normalizeImageUrl } from '@/lib/image-utils';
import {
  Loader2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  LogIn,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { appUser, loading: authLoading, signInWithEmail, signInWithGoogle } = useAuth();
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(initialSchoolProfile);
  const [profileLoading, setProfileLoading] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const p = await getSchoolProfile();
        if (p) {
          setSchoolProfile(p);
          document.title = `Login Operator CMS | ${p.name || 'Portal Sekolah'}`;
        }
      } catch (err) {
        console.warn('Failed to load school profile for admin:', err);
      } finally {
        setProfileLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Mohon masukkan alamat email dan kata sandi.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      await signInWithEmail(email.trim(), password);
    } catch (err: any) {
      console.warn('Email sign-in error:', err);
      let msg = 'Gagal masuk. Periksa kembali email dan kata sandi Anda.';
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        msg = 'Email atau kata sandi tidak cocok. Pastikan akun telah terdaftar di Firebase Auth.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Format alamat email tidak valid.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Terlalu banyak percobaan gagal. Silakan tunggu sejenak sebelum mencoba lagi.';
      }
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSubmit = async () => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      setErrorMessage(
        err.message || 'Gagal masuk dengan Google Sign-In. Pastikan pop-up browser tidak diblokir.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-9 h-9 text-emerald-400 animate-spin" />
        <p className="text-xs text-slate-400 font-mono tracking-wide">
          Memuat Sistem Panel Administrasi Sekolah...
        </p>
      </div>
    );
  }

  // Jika sudah terotentikasi, tampilkan Admin Dashboard
  if (appUser) {
    return (
      <AdminDashboard
        initialProfile={schoolProfile}
        onExitAdmin={() => router.push('/')}
        onProfileUpdated={(updated) => setSchoolProfile(updated)}
      />
    );
  }

  // Jika belum terotentikasi, tampilkan Laman Login Mandiri
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Navigation */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between z-10 py-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-300 transition-colors bg-slate-900/60 hover:bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-800 backdrop-blur-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda Publik</span>
        </Link>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sistem Informasi Terpusat</span>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="max-w-md w-full mx-auto my-auto z-10 py-8">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Logo & School Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50 p-2.5">
              {schoolProfile.logo || schoolProfile.logoUrl ? (
                <img
                  src={normalizeImageUrl(schoolProfile.logo || schoolProfile.logoUrl)}
                  alt={schoolProfile.name}
                  className="w-full h-full object-contain filter drop-shadow"
                />
              ) : (
                <GraduationCap className="w-8 h-8 text-amber-300" />
              )}
            </div>

            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {schoolProfile.shortName || schoolProfile.name || 'Panel Administrator'}
              </h1>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Masuk ke dashboard untuk mengelola berita, agenda, guru, direktori PPDB, dan konfigurasi profil sekolah.
              </p>
            </div>
          </div>

          {/* Error Alert Box */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {/* Email & Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Alamat Email Operator</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sekolah.sch.id"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Kata Sandi (*Password*)</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>{submitting ? 'Memverifikasi Kredensial...' : 'Masuk ke Panel Admin'}</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider relative">
              atau
            </span>
          </div>

          {/* Google Sign-in Alternative */}
          <button
            type="button"
            onClick={handleGoogleSubmit}
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-3 transition-colors cursor-pointer hover:border-slate-600 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Masuk dengan Google Workspace</span>
          </button>

          {/* Security Notice */}
          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-500">
              Akses terbatas hanya untuk staf, guru, dan tim pengelola resmi {schoolProfile.name || 'sekolah'}.
            </p>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="max-w-6xl mx-auto w-full text-center text-[11px] text-slate-500 z-10 py-2">
        <p>© {new Date().getFullYear()} {schoolProfile.name || 'Portal Sekolah'}. Sistem Manajemen Konten Sekolah.</p>
      </footer>
    </div>
  );
}
