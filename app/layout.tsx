import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'SMA ISLAM AL FITYATU ASHABUL KAHFI',
  description: 'Portal resmi SMA ISLAM AL FITYATU ASHABUL KAHFI. Pusat keunggulan akademik, pengembangan karakter, dan inovasi pendidikan terpadu.',
  openGraph: {
    title: 'SMA ISLAM AL FITYATU ASHABUL KAHFI',
    description: 'Portal resmi SMA ISLAM AL FITYATU ASHABUL KAHFI. Pusat keunggulan akademik, pengembangan karakter, dan inovasi pendidikan terpadu.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SMA ISLAM AL FITYATU ASHABUL KAHFI',
    description: 'Portal resmi SMA ISLAM AL FITYATU ASHABUL KAHFI. Pusat keunggulan akademik, pengembangan karakter, dan inovasi pendidikan terpadu.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id" className="overflow-x-hidden">
      <body suppressHydrationWarning className="antialiased text-slate-900 bg-slate-50 min-h-screen overflow-x-hidden w-full max-w-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
