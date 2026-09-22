'use client';

import React, { useState } from 'react';
import {
  Star,
  MessageSquareHeart,
  Send,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  HeartHandshake,
} from 'lucide-react';
import { SchoolReview, ReviewRole } from '@/types';
import { submitSchoolReview } from '@/services/review.service';

interface SchoolReviewsSectionProps {
  reviews: SchoolReview[];
  onOpenView: (viewName: string, data?: any) => void;
  onReviewSubmitted?: () => void;
}

const REVIEW_ROLES: ReviewRole[] = [
  'Orang Tua / Wali Murid',
  'Alumni',
  'Peserta Didik / Siswa',
  'Tokoh / Masyarakat',
  'Mitra Lembaga',
];

export function SchoolReviewsSection({
  reviews,
  onOpenView,
  onReviewSubmitted,
}: SchoolReviewsSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<string>('Orang Tua / Wali Murid');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Hitung rata-rata rating
  const approvedReviews = reviews.filter((r) => r.status === 'approved');
  const totalReviews = approvedReviews.length;
  const averageRating =
    totalReviews > 0
      ? (approvedReviews.reduce((acc, curr) => acc + (curr.rating || 5), 0) / totalReviews).toFixed(1)
      : '5.0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      setErrorMessage('Mohon lengkapi nama dan ulasan Anda.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await submitSchoolReview({
        name: name.trim(),
        role,
        rating,
        comment: comment.trim(),
      });

      setSuccessMessage(true);
      setName('');
      setComment('');
      setRating(5);
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal mengirim ulasan. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="school-reviews-section"
      aria-label="Ulasan dan Testimoni Madrasah"
      className="py-16 sm:py-20 bg-gradient-to-b from-slate-50 via-emerald-50/30 to-slate-50 border-t border-slate-200/80 relative overflow-hidden"
    >
      {/* Background Decorative Accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wide">
              <MessageSquareHeart className="w-3.5 h-3.5 text-emerald-700" />
              <span>TESTIMONI &amp; KEPERCAYAAN MASYARAKAT</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Kata Mereka Tentang Madrasah &amp; Sekolah Kami
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Pengalaman langsung orang tua murid, alumni, peserta didik, dan tokoh masyarakat terhadap kualitas pendidikan, bimbingan akhlak, dan fasilitas kami.
            </p>
          </div>

          {/* Rating Summary Card & Action Button */}
          <div className="flex flex-wrap items-center gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm shrink-0">
            <div className="flex items-center gap-3 pr-4 border-r border-slate-200">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {averageRating}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="w-4 h-4 fill-amber-400"
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Dari <strong className="text-slate-700">{totalReviews}</strong> Ulasan Terverifikasi
                </p>
              </div>
            </div>

            <button
              id="btn-open-review-modal"
              onClick={() => {
                setSuccessMessage(false);
                setModalOpen(true);
              }}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Tulis Ulasan</span>
            </button>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {approvedReviews.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Rating stars & verified badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-4 h-4 ${
                          starIdx <= item.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Terverifikasi</span>
                  </span>
                </div>

                {/* Comment quote */}
                <p className="text-slate-700 text-sm leading-relaxed line-clamp-5 italic">
                  &ldquo;{item.comment}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-5 mt-5 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                  {item.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-900 text-sm truncate">
                    {item.name}
                  </h4>
                  <p className="text-xs text-emerald-700 font-medium truncate">
                    {item.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer View All Reviews Button */}
        {approvedReviews.length > 4 && (
          <div className="text-center mt-10">
            <button
              onClick={() => onOpenView('reviews')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold border border-slate-300 shadow-xs transition-colors"
            >
              <span>Lihat Semua {approvedReviews.length} Ulasan Komunitas</span>
              <ChevronRight className="w-4 h-4 text-emerald-600" />
            </button>
          </div>
        )}
      </div>

      {/* Modal Dialog: Tulis Ulasan Madrasah */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            id="review-submit-modal"
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between border-b border-emerald-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-800/80 text-amber-400">
                  <MessageSquareHeart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Tulis Ulasan &amp; Testimoni</h3>
                  <p className="text-xs text-emerald-200">Bagikan pengalaman Anda bersama madrasah kami</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {successMessage ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">Ulasan Berhasil Dikirim!</h4>
                  <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Terima kasih atas apresiasi dan masukan Anda. Ulasan Anda akan ditinjau oleh pihak madrasah sebelum ditampilkan secara publik.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => setModalOpen(false)}
                      className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow transition-colors"
                    >
                      Selesai
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                      {errorMessage}
                    </div>
                  )}

                  {/* Rating Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Beri Penilaian Bintang (1 - 5) *
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 text-slate-300 hover:scale-110 transition-transform"
                          aria-label={`Rating ${star} bintang`}
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= (hoverRating || rating)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-bold text-amber-600">
                        {hoverRating || rating} / 5 Bintang
                      </span>
                    </div>
                  </div>

                  {/* Nama Lengkap */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Lengkap Anda *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Hj. Maryam / Ahmad Fauzi"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>

                  {/* Hubungan / Peran */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Hubungan dengan Sekolah / Madrasah *
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                    >
                      {REVIEW_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pesan Testimoni */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ulasan &amp; Pesan Testimoni *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tuliskan pengalaman Anda mengenai pembelajaran, kedisiplinan, bimbingan akhlak, atau fasilitas sekolah..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      * Ulasan akan dimoderasi terlebih dahulu demi menjaga etika dan ketertiban informasi.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Mengirim...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirimkan Ulasan</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
