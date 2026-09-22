'use client';

import React, { useState } from 'react';
import { Users, GraduationCap, ArrowRight, Award, Search, BookOpen } from 'lucide-react';
import { TeacherItem } from '@/types';
import { normalizeImageUrl } from '@/lib/image-utils';

interface TeachersPreviewSectionProps {
  teachers: TeacherItem[];
  onOpenView: (viewName: string, data?: any) => void;
}

export function TeachersPreviewSection({ teachers, onOpenView }: TeachersPreviewSectionProps) {
  const [filter, setFilter] = useState<string>('all');

  const filtered =
    filter === 'all'
      ? teachers.slice(0, 4)
      : teachers.filter((t) => t.subject?.toLowerCase().includes(filter.toLowerCase())).slice(0, 4);

  return (
    <section className="bg-slate-50 border-y border-slate-200 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>Pendidik Berdedikasi &amp; Profesional</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Guru &amp; Tenaga Kependidikan
            </h2>
            <p className="text-sm text-slate-600 max-w-xl">
              Didukung oleh tenaga pendidik bersertifikasi, berpendidikan linier S1/S2 dari perguruan tinggi terkemuka, serta berkomitmen membina potensi setiap peserta didik.
            </p>
          </div>

          <button
            onClick={() => onOpenView('teachers')}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 self-start md:self-auto"
          >
            <span>Buka Seluruh Direktori Guru</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Teachers Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((teacher) => (
            <div
              key={teacher.id}
              onClick={() => onOpenView('teachers', teacher)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Photo Container */}
                <div className="h-64 sm:h-60 overflow-hidden relative bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      normalizeImageUrl(teacher.photoUrl) ||
                      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={teacher.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600/90 text-white uppercase tracking-wider backdrop-blur-xs">
                      {teacher.position || 'Guru Pengampu'}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="px-5 space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {teacher.name}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{teacher.subject || 'Bidang Studi Umum'}</span>
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {teacher.education || 'Sarjana Pendidikan'}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 group-hover:text-emerald-700 font-semibold transition-colors">
                <span>Lihat Profil &amp; Riwayat</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
