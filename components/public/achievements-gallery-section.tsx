'use client';

import React, { useState } from 'react';
import { Trophy, Image as ImageIcon, Sparkles, Award, ArrowRight, ExternalLink, Calendar } from 'lucide-react';
import { AchievementItem, GalleryItem } from '@/types';
import { normalizeImageUrl, getAlternativeImageUrls, getGallerySourceUrl, getImagePreviewUrls } from '@/lib/image-utils';

interface AchievementsGallerySectionProps {
  achievements: AchievementItem[];
  galleries: GalleryItem[];
  onOpenView: (viewName: string, data?: any) => void;
  galleryEnabled?: boolean;
}

export function AchievementsGallerySection({
  achievements,
  galleries,
  onOpenView,
  galleryEnabled = true,
}: AchievementsGallerySectionProps) {
  const [activeTab, setActiveTab] = useState<'achievements' | 'gallery'>('achievements');

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      {/* Section Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Karya &amp; Rekam Jejak</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Prestasi &amp; Dokumentasi Sekolah
          </h2>
        </div>

        {/* Tab Toggle */}
        {galleryEnabled && (
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'achievements'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Prestasi Siswa ({achievements.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'gallery'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
              <span>Galeri Foto ({galleries.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* Konten Tab Prestasi */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {achievements.slice(0, 3).map((ach) => {
              const levelBadgeColors: Record<string, string> = {
                Internasional: 'bg-rose-100 text-rose-800 border-rose-200',
                Nasional: 'bg-amber-100 text-amber-800 border-amber-200',
                Provinsi: 'bg-blue-100 text-blue-800 border-blue-200',
                Kota: 'bg-emerald-100 text-emerald-800 border-emerald-200',
              };

              return (
                <div
                  key={ach.id}
                  onClick={() => onOpenView('prestasi', ach)}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="h-48 overflow-hidden relative bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          normalizeImageUrl(ach.photoUrl || (ach as any).imageUrl) ||
                          'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={ach.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span
                        className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-xs ${
                          levelBadgeColors[ach.level] || 'bg-slate-100 text-slate-800 border-slate-200'
                        }`}
                      >
                        Tingkat {ach.level}
                      </span>
                      <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-0.5 rounded">
                        Tahun {ach.year}
                      </div>
                    </div>

                    <div className="px-5 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold">
                        <Award className="w-4 h-4" />
                        <span>{ach.ranking}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                        {ach.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Peraih: <strong className="text-slate-800">{ach.studentName}</strong>
                      </p>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {ach.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
                    <span>Lihat Rincian Prestasi</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => onOpenView('prestasi')}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors inline-flex items-center gap-2 shadow-sm"
            >
              <span>Lihat Seluruh Torehan Prestasi Sekolah</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Konten Tab Galeri */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleries.slice(0, 4).map((gal) => {
              const source = getGallerySourceUrl(gal);
              const candidates = source ? getImagePreviewUrls(source) : [];
              const initialSrc = candidates[0] || source || 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80';

              return (
                <div
                  key={gal.id}
                  onClick={() => onOpenView('gallery', gal)}
                  className="group relative h-56 rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-lg transition-all cursor-pointer bg-slate-900"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={initialSrc}
                    alt={gal.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const currentAttempt = parseInt(target.dataset.attempt || '0', 10);
                      const nextAttempt = currentAttempt + 1;

                      if (nextAttempt < candidates.length) {
                        target.dataset.attempt = nextAttempt.toString();
                        target.src = candidates[nextAttempt];
                      } else {
                        target.onerror = null;
                        target.src = 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80';
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/20 backdrop-blur-xs text-white">
                      {gal.category || 'Kegiatan'}
                    </span>
                    <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 line-clamp-1">
                      {gal.title}
                    </h4>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => onOpenView('gallery')}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors inline-flex items-center gap-2 shadow-sm"
            >
              <span>Buka Galeri Foto &amp; Video Kegiatan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
