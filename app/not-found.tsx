import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-6xl font-black text-emerald-400">404</h1>
        <h2 className="text-xl font-bold">Halaman Tidak Ditemukan</h2>
        <p className="text-sm text-slate-400">
          Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
