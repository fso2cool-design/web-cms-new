'use client';

import React from 'react';
import { Quote, Award, CheckCircle2, Play } from 'lucide-react';
import { SchoolProfile } from '@/types';
import { normalizeImageUrl } from '@/lib/image-utils';

interface PrincipalSpeechSectionProps {
  schoolProfile: SchoolProfile;
  onOpenView: (viewName: string, data?: any) => void;
}

export function PrincipalSpeechSection({ schoolProfile, onOpenView }: PrincipalSpeechSectionProps) {
  const principalName = schoolProfile.principalName || 'Dr. H. Ahmad Fauzi, M.Pd.';
  const principalPhoto =
    normalizeImageUrl(schoolProfile.principalPhoto) ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 lg:p-16 shadow-2xl shadow-slate-200/50 relative overflow-hidden group/container border border-slate-100">
        {/* Decorative Modern Blobs */}
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-gradient-to-bl from-emerald-100/50 to-transparent rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none transition-transform duration-1000 group-hover/container:translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-amber-100/50 to-transparent rounded-full filter blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none transition-transform duration-1000 group-hover/container:-translate-x-1/4" />

        <div className="relative z-10 flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
          {/* Foto Kepala Sekolah - Asymmetric Frame */}
          <div className="w-full lg:w-1/3 flex justify-center lg:justify-start">
            <div className="relative group">
              <div className="absolute inset-0 bg-emerald-500 rounded-[2.5rem] rotate-6 group-hover:rotate-12 transition-transform duration-500 ease-out" />
              <div className="absolute inset-0 bg-amber-400 rounded-[2.5rem] -rotate-3 group-hover:-rotate-6 transition-transform duration-500 ease-out" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={principalPhoto}
                alt={principalName}
                className="relative w-64 h-80 sm:w-72 sm:h-96 object-cover rounded-[2rem] shadow-xl group-hover:-translate-y-2 transition-transform duration-500"
              />
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 animate-bounce" style={{animationDuration: '3s'}}>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                  <Award className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Kepala Sekolah</p>
                <p className="text-sm font-bold text-slate-800">{principalName.split(' ')[0]}</p>
              </div>
            </div>
          </div>

          {/* Isi Sambutan - Editorial Typography */}
          <div className="w-full lg:w-2/3 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-widest text-xs">
                <span className="w-8 h-0.5 bg-emerald-600" />
                Pesan Pemimpin
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Mempersiapkan Generasi Emas yang Berilmu, Beradab & <span className="text-emerald-600">Visioner</span>
              </h2>
            </div>

            <div className="relative">
              <Quote className="absolute -top-4 -left-6 w-16 h-16 text-emerald-50 opacity-50 -z-10 transform -scale-x-100" />
              <div className="text-slate-600 text-base sm:text-lg leading-relaxed font-medium">
                {schoolProfile.principalSpeech ? (
                  <div className="space-y-4">
                    {schoolProfile.principalSpeech.split('\n\n').slice(0, 2).map((paragraph, i) => (
                       <p key={i}>{paragraph}</p>
                    ))}
                    {schoolProfile.principalSpeech.split('\n\n').length > 2 && <p>...</p>}
                  </div>
                ) : (
                  <p className="italic">Sambutan resmi kepala sekolah belum diperbarui.</p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
              <div className="flex-1">
                <h4 className="text-xl font-bold text-slate-900">{principalName}</h4>
                {schoolProfile.principalNip && (
                  <p className="text-sm font-medium text-slate-500">NIP. {schoolProfile.principalNip}</p>
                )}
                {schoolProfile.principalEducation && (
                  <div className="flex items-center gap-2 pt-1 text-sm font-semibold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{schoolProfile.principalEducation}</span>
                  </div>
                )}
              </div>

              <div className="w-full sm:w-auto">
                <button
                  onClick={() => onOpenView('profile', 'sambutan')}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white font-bold transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" />
                  <span>Baca Selengkapnya</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
