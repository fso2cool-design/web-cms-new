'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Trash2,
  Mail,
  Phone,
  MessageCircle,
  Clock,
  Eye,
  X,
} from 'lucide-react';
import { ContactMessage } from '@/types';
import {
  getAllContactMessages,
  markContactMessageRead,
  deleteContactMessage,
} from '@/services/contact.service';

interface AdminMessagesProps {
  initialMessages: ContactMessage[];
}

export function AdminMessages({ initialMessages }: AdminMessagesProps) {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [search, setSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleOpenDetail = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      try {
        await markContactMessageRead(msg.id);
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m))
        );
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus pesan dari ${name}?`)) return;
    try {
      await deleteContactMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
      showNotice('Pesan telah dihapus.');
    } catch (err) {
      console.error(err);
      showNotice('Gagal menghapus pesan.');
    }
  };

  const filtered = messages.filter(
    (m) =>
      (m.senderName || m.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.subject || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.message || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">Kotak Aspirasi &amp; Pesan Masyarakat</h2>
          </div>
          <p className="text-xs text-slate-500">
            Daftar pertanyaan, permohonan informasi, dan masukan dari calon wali murid serta masyarakat umum.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          Total: {messages.length} Pesan ({messages.filter((m) => !m.isRead).length} Belum Dibaca)
        </div>
      </div>

      {notice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari pengirim, subjek, atau pesan..."
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
        />
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Belum ada pesan atau aspirasi yang masuk.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenDetail(item)}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer ${
                  !item.isRead ? 'bg-emerald-50/40 font-semibold' : ''
                }`}
              >
                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center gap-2.5">
                    {!item.isRead ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" />
                    )}
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {item.senderName || item.name || 'Tamu / Warga'}
                    </p>
                    <span className="text-[11px] text-slate-500 font-normal truncate">
                      &lt;{item.email}&gt;
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-800">{item.subject}</p>
                  <p className="text-xs text-slate-600 line-clamp-1">{item.message}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span className="text-[10px] text-slate-400">{item.createdAt}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id, item.senderName || item.name || 'Pengirim');
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* DETAIL MESSAGE MODAL */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Rincian Pesan / Aspirasi</h3>
                <p className="text-[11px] text-slate-400">{selectedMessage.createdAt}</p>
              </div>
              <button onClick={() => setSelectedMessage(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Pengirim:</span>
                  <span className="font-bold text-slate-900">
                    {selectedMessage.senderName || selectedMessage.name || 'Warga'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-mono font-medium text-slate-800">{selectedMessage.email}</span>
                </div>
                {selectedMessage.phone && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">No. Telepon / WA:</span>
                    <span className="font-mono font-bold text-emerald-800">{selectedMessage.phone}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Subjek:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedMessage.subject}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Isi Pesan:</label>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {selectedMessage.phone && (
                    <a
                      href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Balas via WhatsApp</span>
                    </a>
                  )}
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Tanggapan:%20${encodeURIComponent(
                      selectedMessage.subject
                    )}`}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Balas Email</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
