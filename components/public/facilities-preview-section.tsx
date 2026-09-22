'use client';

import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Building2 } from 'lucide-react';
import { FacilityItem } from '@/types';
import { normalizeImageUrl } from '@/lib/image-utils';

interface FacilitiesPreviewSectionProps {
  facilities: FacilityItem[];
  onOpenView: (viewName: string, data?: any) => void;
}

export function FacilitiesPreviewSection({ facilities, onOpenView }: FacilitiesPreviewSectionProps) {
  return (
    <section className="bg-slate-50 border-t border-slate-200 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>Sarana &amp; Prasarana Pembelajaran</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Fasilitas Modern Penunjang Bakat
            </h2>
            <p className="text-sm text-slate-600 max-w-xl">
              Lingkungan kampus yang asri, berwawasan adiwiyata, serta dilengkapi fasilitas pembelajaran terdepan untuk mendukung riset, olahraga, seni, dan pengembangan karakter.
            </p>
          </div>

          <button
            onClick={() => onOpenView('akademik', 'fasilitas')}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 self-start md:self-auto"
          >
            <span>Seluruh Fasilitas Sekolah</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {facilities.slice(0, 4).map((fac) => (
            <div
              key={fac.id}
              onClick={() => onOpenView('akademik', 'fasilitas')}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-44 overflow-hidden relative bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      normalizeImageUrl(fac.photoUrl || fac.imageUrl) ||
                      'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={fac.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 left-2 bg-emerald-700/90 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                    Kapasitas: {fac.capacity || 'Standar'}
                  </div>
                </div>

                <div className="px-4 pb-2 space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {fac.name}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {fac.description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
                <span>Rincian Sarana</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
