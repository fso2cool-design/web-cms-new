'use client';

import React, { useState } from 'react';
import {
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Filter,
  ShieldCheck,
  Search,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { SchoolReview } from '@/types';
import { updateReviewStatus, deleteSchoolReview } from '@/services/review.service';

interface AdminReviewsProps {
  reviews: SchoolReview[];
  onRefresh: () => void;
}

export function AdminReviews({ reviews, onRefresh }: AdminReviewsProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const filteredReviews = reviews.filter((r) => {
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.role && r.role.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const approvedCount = reviews.filter((r) => r.status === 'approved').length;
  const rejectedCount = reviews.filter((r) => r.status === 'rejected').length;

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    setActionLoadingId(id);
    setFeedback(null);
    try {
      await updateReviewStatus(id, status);
      setFeedback({
        text: `Status ulasan berhasil diperbarui menjadi ${
          status === 'approved' ? 'Disetujui (Tampil di Web)' : status === 'rejected' ? 'Ditolak' : 'Menunggu'
        }.`,
        type: 'success',
      });
      onRefresh();
    } catch (err: any) {
      setFeedback({ text: err?.message || 'Gagal memperbarui status ulasan.', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus ulasan ini secara permanen?')) return;
    setActionLoadingId(id);
    try {
      await deleteSchoolReview(id);
      setFeedback({ text: 'Ulasan berhasil dihapus.', type: 'success' });
      onRefresh();
    } catch (err: any) {
      setFeedback({ text: err?.message || 'Gagal menghapus ulasan.', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Moderasi Ulasan &amp; Testimoni
            </h2>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold animate-pulse">
                {pendingCount} Menunggu Persetujuan
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola, setujui, dan tampilkan testimoni positif dari orang tua murid, alumni, dan masyarakat di beranda web.
          </p>
        </div>

        {/* Status Counters */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              filterStatus === 'pending'
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            Menunggu ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              filterStatus === 'approved'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            Disetujui ({approvedCount})
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              filterStatus === 'all'
                ? 'bg-slate-800 text-white border-slate-900 shadow-xs'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            Semua ({reviews.length})
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-xs opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pengulas, peran, atau kata kunci testimoni..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">Tidak ada ulasan yang sesuai</h3>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery ? 'Coba ubah kata kunci pencarian Anda.' : 'Belum ada ulasan dalam kategori ini.'}
            </p>
          </div>
        ) : (
          filteredReviews.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all ${
                item.status === 'pending'
                  ? 'border-amber-300 bg-amber-50/20 shadow-xs'
                  : item.status === 'approved'
                  ? 'border-slate-200 hover:border-emerald-300'
                  : 'border-slate-200 opacity-60'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  {/* Status and Rating */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {item.status === 'approved' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Disetujui (Tampil di Web)</span>
                      </span>
                    )}
                    {item.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Menunggu Peninjauan Admin</span>
                      </span>
                    )}
                    {item.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        <span>Ditolak</span>
                      </span>
                    )}

                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-1">
                        {item.rating} / 5
                      </span>
                    </div>

                    <span className="text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Author Name and Role */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
                    <p className="text-xs font-semibold text-emerald-700">{item.role}</p>
                  </div>

                  {/* Comment Body */}
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    &ldquo;{item.comment}&rdquo;
                  </p>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {item.status !== 'approved' && (
                    <button
                      disabled={actionLoadingId === item.id}
                      onClick={() => handleUpdateStatus(item.id, 'approved')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Setujui (Tampilkan)</span>
                    </button>
                  )}

                  {item.status !== 'rejected' && (
                    <button
                      disabled={actionLoadingId === item.id}
                      onClick={() => handleUpdateStatus(item.id, 'rejected')}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Tolak / Sembunyikan</span>
                    </button>
                  )}

                  <button
                    disabled={actionLoadingId === item.id}
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Hapus Ulasan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
