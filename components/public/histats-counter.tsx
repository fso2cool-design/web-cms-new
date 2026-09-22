'use client';

import React, { useEffect } from 'react';

declare global {
  interface Window {
    _Hasync?: any[];
  }
}

interface HistatsCounterProps {
  histatsId?: string;
  className?: string;
  showLabel?: boolean;
}

export function HistatsCounter({
  histatsId = '5052606',
  className = '',
  showLabel = true,
}: HistatsCounterProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Inisialisasi _Hasync untuk pelacakan resmi Histats
    window._Hasync = window._Hasync || [];
    window._Hasync.push([
      'Histats.startgif',
      `1,${histatsId},4,10047,"div#histatsC {position: absolute;top:0px;left:0px;}body>div#histatsC {position: fixed;}"`
    ]);
    window._Hasync.push(['Histats.fasi', '1']);
    window._Hasync.push(['Histats.track_hits', '']);

    // Sisipkan script pelacak resmi js15_gif_as.js
    const scriptId = 'histats-gif-async-script';
    if (!document.getElementById(scriptId)) {
      const hs = document.createElement('script');
      hs.id = scriptId;
      hs.type = 'text/javascript';
      hs.async = true;
      hs.src = '//s10.histats.com/js15_gif_as.js';
      const target = document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0];
      if (target) {
        target.appendChild(hs);
      }
    }
  }, [histatsId]);

  return (
    <div
      id="histats-container"
      className={`inline-flex items-center gap-2 ${className}`}
    >
      {showLabel && (
        <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
          Pengunjung:
        </span>
      )}
      <a
        href={`https://www.histats.com/viewstats/?sid=${histatsId}`}
        title="Lihat Statistik Pengunjung Lengkap (Histats)"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center hover:opacity-80 transition-opacity"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://s4is.histats.com/stats/i/${histatsId}.gif?${histatsId}&103`}
          alt="Histats Hit Counter"
          className="border-0 rounded"
          width={80}
          height={20}
        />
      </a>
    </div>
  );
}
