'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  LogIn,
  LogOut,
  AlertCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToDashboard: () => void;
}

export function AdminLoginModal({ isOpen, onClose, onGoToDashboard }: AdminLoginModalProps) {
  const { user, appUser, isAdmin, signInWithGoogle, signInWithEmail, signOut } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'email' | 'google'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Mohon masukkan alamat email dan kata sandi.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signInWithEmail(email.trim(), password);
      onClose();
      onGoToDashboard();
    } catch (err: any) {
      console.warn('Email sign-in error:', err);
      let errorMsg = 'Gagal masuk. Periksa kembali email dan kata sandi Anda.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMsg = 'Email atau kata sandi salah. Pastikan password yang dibuat di Firebase sudah sesuai.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Format alamat email tidak valid.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMsg = 'Terlalu banyak percobaan gagal. Silakan coba beberapa saat lagi.';
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      onClose();
      onGoToDashboard();
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      setError(
        err.message || 'Gagal masuk dengan Google Sign-in. Pastikan popup tidak diblokir oleh browser.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-5 p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto shadow-2xs">
            <Lock className="w-5 h-5 text-slate-700" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Masuk Sistem
          </h3>
          <p className="text-xs text-slate-400">
            Silakan masukkan kredensial akun Anda
          </p>
        </div>

        {error && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Status Pengguna Aktif */}
        {appUser ? (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                {appUser.displayName?.charAt(0) || 'U'}
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900">{appUser.displayName}</p>
                <p className="text-[11px] text-slate-500">{appUser.email}</p>
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                  Role: {appUser.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => {
                  onClose();
                  onGoToDashboard();
                }}
                className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Buka Dashboard</span>
              </button>
              <button
                onClick={signOut}
                className="py-2.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Akun</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pilihan Metode Login (Tab) */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('email');
                  setError(null);
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  loginMethod === 'email'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email &amp; Sandi</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('google');
                  setError(null);
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  loginMethod === 'google'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Akun Google</span>
              </button>
            </div>

            {loginMethod === 'email' ? (
              /* Formulir Login Email & Password */
              <form onSubmit={handleEmailLogin} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Alamat Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder=""
                      autoComplete="email"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Kata Sandi</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder=""
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4 text-emerald-200" />
                  <span>{loading ? 'Memverifikasi...' : 'Masuk'}</span>
                </button>
              </form>
            ) : (
              /* Opsi Login Google */
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                  <p className="text-xs font-semibold text-slate-700">Masuk Akun Google</p>
                  <p className="text-[11px] text-slate-500">
                    Gunakan akun Google yang telah didaftarkan dalam sistem.
                  </p>
                </div>

                <button
                  type="button"
                  id="btn-google-admin-login"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4 text-emerald-200" />
                  <span>{loading ? 'Memproses Masuk...' : 'Masuk dengan Google'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
