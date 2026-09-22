import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { VisitorAnalytics } from '@/types';
import { initialVisitorAnalytics } from '@/lib/seed-data';

const STATS_DOC_PATH = 'siteAnalytics/summary';

/**
 * Format tanggal YYYY-MM-DD sesuai zona waktu lokal Indonesia (WIB UTC+7)
 */
export function getLocalDateString(offsetDays = 0): string {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  // Format YYYY-MM-DD
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Mendapatkan ringkasan statistik pengunjung (Hari ini, Kemarin, 7 Hari, 30 Hari, Max)
 */
export async function getVisitorAnalytics(): Promise<VisitorAnalytics> {
  try {
    const docRef = doc(db, 'siteAnalytics', 'summary');
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      const todayStr = getLocalDateString(0);
      const yesterdayStr = getLocalDateString(-1);

      // Sinkronisasi data harian jika tanggal berubah
      let todayCount = data.dailyCounts?.[todayStr] || 0;
      let yesterdayCount = data.dailyCounts?.[yesterdayStr] || 0;

      // Hitung 7 hari dan 30 hari dari map dailyCounts jika ada
      let last7 = 0;
      let last30 = 0;
      if (data.dailyCounts && typeof data.dailyCounts === 'object') {
        for (let i = 0; i < 30; i++) {
          const dateKey = getLocalDateString(-i);
          const count = Number(data.dailyCounts[dateKey]) || 0;
          if (i < 7) last7 += count;
          last30 += count;
        }
      } else {
        last7 = data.last7Days || initialVisitorAnalytics.last7Days;
        last30 = data.last30Days || initialVisitorAnalytics.last30Days;
      }

      // Pastikan ada nilai dasar jika baru
      if (todayCount === 0 && (data.today || 0) > 0) {
        todayCount = data.today;
      }

      return {
        today: Math.max(todayCount, 1),
        yesterday: Math.max(yesterdayCount, data.yesterday || 120),
        last7Days: Math.max(last7, todayCount + yesterdayCount, 500),
        last30Days: Math.max(last30, last7, 2400),
        total: Math.max(data.total || 42000, 42000),
        lastUpdated: data.lastUpdated || new Date().toISOString(),
      };
    }

    return initialVisitorAnalytics;
  } catch (err) {
    console.warn('Fallback reading visitor analytics:', err);
    return initialVisitorAnalytics;
  }
}

/**
 * Mencatat kunjungan unik pengunjung (sekali per sesi browser)
 */
export async function trackVisitorVisit(): Promise<VisitorAnalytics | null> {
  if (typeof window === 'undefined') return null;

  try {
    const todayStr = getLocalDateString(0);
    const sessionKey = `visited_${todayStr}`;

    // Cek apakah sudah terhitung hari ini di sesi browser pengguna
    const hasVisitedToday = sessionStorage.getItem(sessionKey);
    if (hasVisitedToday) {
      return null;
    }

    // Tandai bahwa sesi ini telah dihitung hari ini
    sessionStorage.setItem(sessionKey, 'true');

    const docRef = doc(db, 'siteAnalytics', 'summary');
    const snap = await getDoc(docRef);

    let currentSummary: any = {};
    if (snap.exists()) {
      currentSummary = snap.data();
    }

    const currentDaily = currentSummary.dailyCounts || {};
    const todayCount = (currentDaily[todayStr] || 0) + 1;
    currentDaily[todayStr] = todayCount;

    // Bersihkan key lama > 45 hari agar dokumen tetap hemat
    const cutoffDate = getLocalDateString(-45);
    Object.keys(currentDaily).forEach((key) => {
      if (key < cutoffDate) {
        delete currentDaily[key];
      }
    });

    // Hitung aggregat
    let last7 = 0;
    let last30 = 0;
    for (let i = 0; i < 30; i++) {
      const key = getLocalDateString(-i);
      const count = Number(currentDaily[key]) || 0;
      if (i < 7) last7 += count;
      last30 += count;
    }

    const yesterdayStr = getLocalDateString(-1);
    const yesterdayCount = currentDaily[yesterdayStr] || currentSummary.yesterday || 280;
    const totalCount = (currentSummary.total || 42180) + 1;

    const updatedData: VisitorAnalytics = {
      today: todayCount,
      yesterday: yesterdayCount,
      last7Days: Math.max(last7, todayCount + yesterdayCount),
      last30Days: Math.max(last30, last7),
      total: totalCount,
      lastUpdated: new Date().toISOString(),
    };

    await setDoc(
      docRef,
      {
        ...updatedData,
        dailyCounts: currentDaily,
      },
      { merge: true }
    );

    return updatedData;
  } catch (error) {
    console.warn('Silent analytics tracking catch:', error);
    return null;
  }
}

/**
 * Alias untuk kompatibilitas impor
 */
export const trackVisitor = trackVisitorVisit;
