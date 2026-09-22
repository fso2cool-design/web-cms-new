'use client';

import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { FAQItem, SchoolProfile } from '@/types';
import { submitContactMessage } from '@/services/contact.service';

interface FAQContactSectionProps {
  faqs: FAQItem[];
  schoolProfile: SchoolProfile;
}

export function FAQContactSection({ faqs, schoolProfile }: FAQContactSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const faqEnabled = schoolProfile.features?.faqEnabled ?? true;

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Pertanyaan Umum');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = useMemo(() => {
    const rawCategories = faqs.map((f) => f.category?.trim()).filter(Boolean) as string[];
    const unique = Array.from(new Set(rawCategories));
    return ['all', ...(unique.length > 0 ? unique : ['PPDB', 'Akademik', 'Umum'])];
  }, [faqs]);

  const filteredFaqs =
    activeCategory === 'all'
      ? faqs
      : faqs.filter((f) => f.category?.toLowerCase() === activeCategory.toLowerCase());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Mohon lengkapi Nama, Email, dan Isi Pesan.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await submitContactMessage({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        subject: subject.trim(),
        message: message.trim(),
      });
      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err) {
      console.error('Contact submission error:', err);
      setError('Gagal mengirim pesan. Silakan hubungi kami via WhatsApp atau telepon langsung.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className={`grid grid-cols-1 ${faqEnabled ? 'lg:grid-cols-12 gap-12' : 'max-w-3xl mx-auto'}`}>
        {/* Kolom Kiri: FAQ (Spans 7 cols on lg) */}
        {faqEnabled && (
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" />
                <span>Pusat Bantuan &amp; Informasi</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Pertanyaan yang Sering Diajukan (FAQ)
              </h2>
              <p className="text-sm text-slate-600">
                Temukan jawaban cepat seputar tata cara pendaftaran, kurikulum, dan fasilitas belajar di sekolah kami.
              </p>
            </div>

            {/* Filter FAQ */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setOpenIndex(0);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeCategory === cat
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'Semua Pertanyaan' : cat}
                </button>
              ))}
            </div>

            {/* FAQ Accordion List */}
            <div className="space-y-3 pt-2">
              {filteredFaqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div
                    key={faq.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all duration-200"
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className="w-full text-left p-4.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                        <span>{faq.question}</span>
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="p-4.5 pt-1 text-sm text-slate-600 border-t border-slate-100 bg-slate-50/50 leading-relaxed space-y-2">
                        <p>{faq.answer}</p>
                        <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
                          <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                            Kategori: {faq.category}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Kolom Kanan: Form Kontak & Hubungi Kami (Spans 5 cols on lg or full width if FAQ disabled) */}
        <div className={faqEnabled ? 'lg:col-span-5 space-y-6' : 'w-full space-y-6'}>
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                <MessageSquare className="w-4 h-4" />
                <span>Layanan Aspirasi &amp; Pengaduan</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Kirim Pesan ke Sekolah</h3>
              <p className="text-xs text-slate-500">
                Punya pertanyaan spesifik atau kendala? Tim Humas &amp; Tata Usaha kami siap merespons pesan Anda.
              </p>
            </div>

            {success ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-emerald-900">Pesan Berhasil Terkirim!</h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Terima kasih telah menghubungi kami. Pesan Anda telah tersimpan di sistem kami dan akan segera ditindaklanjuti oleh petugas sekolah.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Kirim Pesan Baru
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Bapak/Ibu Hendra Wijaya"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Aktif <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      No. WhatsApp / HP
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0812xxxxxxx"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Topik Pertanyaan</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none"
                  >
                    <option value="">Pilih Topik Pertanyaan...</option>
                    <option value={`Informasi PPDB ${schoolProfile.ppdbYear || ''}`}>Informasi Pendaftaran / PPDB {schoolProfile.ppdbYear || ''}</option>
                    <option value="Kerjasama & Kemitraan">Kerjasama &amp; Kemitraan</option>
                    <option value="Administrasi Siswa & Mutasi">Administrasi Siswa &amp; Mutasi</option>
                    <option value="Kerjasama & Kunjungan">Kerjasama &amp; Kunjungan</option>
                    <option value="Pertanyaan Umum">Pertanyaan Umum Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Isi Pesan <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tuliskan pertanyaan atau informasi yang Anda butuhkan secara jelas..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Mengirim Pesan...' : 'Kirim Pesan Sekarang'}</span>
                </button>
              </form>
            )}

            {/* Quick Contact Details */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Telepon: {schoolProfile.phone || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Respon cepat di jam kerja: {(schoolProfile.operatingHours || '-').replace(/WIB/g, 'WIT')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
