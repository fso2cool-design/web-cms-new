import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import {
  initialSchoolProfile,
  initialTeachers,
  initialNews,
  initialAnnouncements,
  initialEvents,
  initialAchievements,
  initialFacilities,
  initialExtracurriculars,
  initialGalleries,
  initialDocuments,
  initialFAQs,
} from '@/lib/seed-data';

export async function seedAllSchoolData(): Promise<{ success: boolean; message: string }> {
  try {
    // 1. School Profile
    await setDoc(doc(db, 'schoolProfile', 'general'), initialSchoolProfile);

    // 2. Teachers
    for (const t of initialTeachers) {
      await setDoc(doc(db, 'teachers', t.id), t);
    }

    // 3. News
    for (const n of initialNews) {
      await setDoc(doc(db, 'news', n.id), n);
    }

    // 4. Announcements
    for (const a of initialAnnouncements) {
      await setDoc(doc(db, 'announcements', a.id), a);
    }

    // 5. Events
    for (const e of initialEvents) {
      await setDoc(doc(db, 'events', e.id), e);
    }

    // 6. Achievements
    for (const ach of initialAchievements) {
      await setDoc(doc(db, 'achievements', ach.id), ach);
    }

    // 7. Facilities
    for (const f of initialFacilities) {
      await setDoc(doc(db, 'facilities', f.id), f);
    }

    // 8. Extracurriculars
    for (const ex of initialExtracurriculars) {
      await setDoc(doc(db, 'extracurriculars', ex.id), ex);
    }

    // 9. Galleries
    for (const g of initialGalleries) {
      await setDoc(doc(db, 'galleries', g.id), g);
    }

    // 10. Documents
    for (const d of initialDocuments) {
      await setDoc(doc(db, 'documents', d.id), d);
    }

    // 11. FAQs
    for (const faq of initialFAQs) {
      await setDoc(doc(db, 'faqs', faq.id), faq);
    }

    return {
      success: true,
      message: 'Database berhasil diisi dengan data awal sekolah!',
    };
  } catch (error) {
    console.error('Failed to seed school data:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Gagal mengisi data awal database',
    };
  }
}
