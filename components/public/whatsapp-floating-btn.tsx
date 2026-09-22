'use client';

import React, { useState } from 'react';
import { MessageCircle, X, Send, PhoneCall } from 'lucide-react';
import { SchoolProfile } from '@/types';

interface WhatsAppFloatingBtnProps {
  schoolProfile: SchoolProfile;
}

export function WhatsAppFloatingBtn({ schoolProfile }: WhatsAppFloatingBtnProps) {
  const [isOpen, setIsOpen] = useState(false);
  const schoolName = schoolProfile.name || 'Sekolah';
  const ppdbYear = schoolProfile.ppdbYear || '2026/2027';
  const defaultMsg = `Halo Panitia PPDB / Humas ${schoolName}, saya ingin bertanya seputar pendaftaran dan informasi sekolah...`;
  const [msg, setMsg] = useState(defaultMsg);

  const rawPhone = schoolProfile.whatsapp || schoolProfile.phone || '081234567890';
  const cleanPhone = rawPhone.replace(/\D/g, '').replace(/^0/, '62');

  const handleSend = () => {
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      {/* Pop-up Mini Chat Dialog */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold leading-tight">Hotline WhatsApp Sekolah</h4>
                <p className="text-[11px] text-emerald-100">Layanan Informasi &amp; Humas</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-slate-50 space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <p className="font-semibold text-slate-900">Selamat datang di Helpdesk Sekolah!</p>
              <p className="text-slate-600">
                Ada pertanyaan tentang PPDB {ppdbYear} atau informasi sekolah? Sampaikan langsung via obrolan WhatsApp:
              </p>
            </div>

            <textarea
              rows={3}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              className="w-full p-2.5 bg-white rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Tulis pesan pertanyaan..."
            />

            <button
              onClick={handleSend}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Mulai Chat di WhatsApp</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        id="btn-floating-whatsapp"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white p-3.5 sm:px-4 sm:py-3.5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Hubungi WhatsApp Sekolah"
      >
        <MessageCircle className="w-6 h-6 fill-white text-[#25D366]" />
        <span className="hidden sm:inline text-xs font-bold tracking-wide">
          Chat WhatsApp Sekolah
        </span>
      </button>
    </div>
  );
}
