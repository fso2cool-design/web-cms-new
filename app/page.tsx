'use client';

import React, { useState, useEffect } from 'react';
import { PublicNavbar } from '@/components/layout/public-navbar';
import { PublicFooter } from '@/components/layout/public-footer';
import { HeroSection } from '@/components/public/hero-section';
import { RunningTextTicker } from '@/components/public/running-text-ticker';
import { GallerySlideshow } from '@/components/public/gallery-slideshow';
import { QuickInfoSection } from '@/components/public/quick-info-section';
import { PrincipalSpeechSection } from '@/components/public/principal-speech-section';
import { NewsEventsSection } from '@/components/public/news-events-section';
import { TeachersPreviewSection } from '@/components/public/teachers-preview-section';
import { AchievementsGallerySection } from '@/components/public/achievements-gallery-section';
import { FacilitiesPreviewSection } from '@/components/public/facilities-preview-section';
import { PPDBCTABanner } from '@/components/public/ppdb-cta-banner';
import { FAQContactSection } from '@/components/public/faq-contact-section';
import { SchoolReviewsSection } from '@/components/public/school-reviews-section';
import { WhatsAppFloatingBtn } from '@/components/public/whatsapp-floating-btn';
import { PublicViewsModal } from '@/components/public/public-views-modal';
import { AdminLoginModal } from '@/components/admin/admin-login-modal';
import { AdminDashboard } from '@/components/admin/admin-dashboard';

// Services
import { getSchoolProfile } from '@/services/school.service';
import { getPublishedNews } from '@/services/news.service';
import { getPublishedAnnouncements } from '@/services/announcement.service';
import { getPublishedEvents } from '@/services/event.service';
import { getActiveTeachers } from '@/services/teacher.service';
import { getAllAchievements } from '@/services/achievement.service';
import { getPublishedFacilities } from '@/services/facility.service';
import { getPublishedGalleries } from '@/services/gallery.service';
import { getPublishedDocuments } from '@/services/document.service';
import { getPublishedFAQs } from '@/services/faq.service';
import { getActiveExtracurriculars } from '@/services/extracurricular.service';
import { getApprovedReviews } from '@/services/review.service';
import { trackVisitor, getVisitorAnalytics } from '@/services/analytics.service';

// Fallback seed data
import {
  initialSchoolProfile,
  initialNews,
  initialAnnouncements,
  initialEvents,
  initialTeachers,
  initialAchievements,
  initialFacilities,
  initialExtracurriculars,
  initialGalleries,
  initialDocuments,
  initialFAQs,
  initialReviews,
  initialVisitorAnalytics,
} from '@/lib/seed-data';

import {
  SchoolProfile,
  NewsItem,
  AnnouncementItem,
  EventItem,
  TeacherItem,
  AchievementItem,
  FacilityItem,
  ExtracurricularItem,
  GalleryItem,
  DocumentItem,
  FAQItem,
  SchoolReview,
  VisitorAnalytics,
} from '@/types';

export default function HomePage() {
  const [loading, setLoading] = useState(true);

  // App Data States
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(initialSchoolProfile);
  const [newsList, setNewsList] = useState<NewsItem[]>(initialNews);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [teachers, setTeachers] = useState<TeacherItem[]>(initialTeachers);
  const [achievements, setAchievements] = useState<AchievementItem[]>(initialAchievements);
  const [facilities, setFacilities] = useState<FacilityItem[]>(initialFacilities);
  const [extracurriculars, setExtracurriculars] = useState<ExtracurricularItem[]>(initialExtracurriculars);
  // Start with empty array so seed Unsplash galleries are never shown before Firestore responds
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFAQs);
  const [reviews, setReviews] = useState<SchoolReview[]>(initialReviews);
  const [visitorAnalytics, setVisitorAnalytics] = useState<VisitorAnalytics>(initialVisitorAnalytics);

  // Modal / Active View States
  const [activeModalView, setActiveModalView] = useState<string | null>(null);
  const [modalInitialData, setModalInitialData] = useState<any>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Dynamic Browser Tab Title & Favicon synchronization
  useEffect(() => {
    const schoolName = schoolProfile.name?.trim() || 'Portal Sekolah';
    const slogan = schoolProfile.slogan?.trim() || 'Sistem Informasi Sekolah';

    if (activeModalView === 'admin-cms') {
      document.title = `Panel Admin CMS | ${schoolProfile.shortName || schoolName}`;
    } else {
      document.title = `${schoolName} - ${slogan}`;
    }

    if (schoolProfile.logoUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = schoolProfile.logoUrl;
    }
  }, [schoolProfile.name, schoolProfile.slogan, schoolProfile.shortName, schoolProfile.logoUrl, activeModalView]);

  const refreshPublicData = async () => {
    try {
      const [
        profileRes,
        newsRes,
        announceRes,
        eventsRes,
        teachersRes,
        achieveRes,
        facilRes,
        extraRes,
        galleryRes,
        docRes,
        faqRes,
        revRes,
        analyticsRes,
      ] = await Promise.allSettled([
        getSchoolProfile(),
        getPublishedNews(),
        getPublishedAnnouncements(),
        getPublishedEvents(),
        getActiveTeachers(),
        getAllAchievements(),
        getPublishedFacilities(),
        getActiveExtracurriculars(),
        getPublishedGalleries(),
        getPublishedDocuments(),
        getPublishedFAQs(),
        getApprovedReviews(),
        getVisitorAnalytics(),
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value) setSchoolProfile(profileRes.value);
      if (newsRes.status === 'fulfilled' && Array.isArray(newsRes.value)) setNewsList(newsRes.value);
      if (announceRes.status === 'fulfilled' && Array.isArray(announceRes.value)) setAnnouncements(announceRes.value);
      if (eventsRes.status === 'fulfilled' && Array.isArray(eventsRes.value)) setEvents(eventsRes.value);
      if (teachersRes.status === 'fulfilled' && Array.isArray(teachersRes.value)) setTeachers(teachersRes.value);
      if (achieveRes.status === 'fulfilled' && Array.isArray(achieveRes.value)) setAchievements(achieveRes.value);
      if (facilRes.status === 'fulfilled' && Array.isArray(facilRes.value)) setFacilities(facilRes.value);
      if (extraRes.status === 'fulfilled' && Array.isArray(extraRes.value)) setExtracurriculars(extraRes.value);

      if (galleryRes.status === 'fulfilled' && Array.isArray(galleryRes.value)) {
        const galleryData = galleryRes.value;
        if (process.env.NODE_ENV !== 'production' || typeof window !== 'undefined') {
          console.info('[Homepage Gallery] Firestore result received (refreshPublicData)');
          console.info(`[Homepage Gallery DEBUG] Firestore gallery count: ${galleryData.length}`);
        }
        setGalleries(galleryData);
      } else {
        if (galleryRes.status === 'rejected') {
          console.warn('[Homepage Gallery] (refreshPublicData) fetch failed:', galleryRes.reason);
        }
        setGalleries([]);
      }

      if (docRes.status === 'fulfilled' && Array.isArray(docRes.value)) setDocuments(docRes.value);
      if (faqRes.status === 'fulfilled' && Array.isArray(faqRes.value)) setFaqs(faqRes.value);
      if (revRes.status === 'fulfilled' && Array.isArray(revRes.value)) setReviews(revRes.value);
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value) setVisitorAnalytics(analyticsRes.value);
    } catch (err) {
      console.warn('Public data refresh error:', err);
    }
  };

  useEffect(() => {
    let isSubscribed = true;

    async function loadPortalData() {
      try {
        // Track visitor session
        trackVisitor().catch((e) => console.warn('Visitor tracking error:', e));

        const [
          profileRes,
          newsRes,
          announceRes,
          eventsRes,
          teachersRes,
          achieveRes,
          facilRes,
          extraRes,
          galleryRes,
          docRes,
          faqRes,
          revRes,
          analyticsRes,
        ] = await Promise.allSettled([
          getSchoolProfile(),
          getPublishedNews(),
          getPublishedAnnouncements(),
          getPublishedEvents(),
          getActiveTeachers(),
          getAllAchievements(),
          getPublishedFacilities(),
          getActiveExtracurriculars(),
          getPublishedGalleries(),
          getPublishedDocuments(),
          getPublishedFAQs(),
          getApprovedReviews(),
          getVisitorAnalytics(),
        ]);

        if (!isSubscribed) return;
        if (profileRes.status === 'fulfilled' && profileRes.value) setSchoolProfile(profileRes.value);
        if (newsRes.status === 'fulfilled' && Array.isArray(newsRes.value)) setNewsList(newsRes.value);
        if (announceRes.status === 'fulfilled' && Array.isArray(announceRes.value)) setAnnouncements(announceRes.value);
        if (eventsRes.status === 'fulfilled' && Array.isArray(eventsRes.value)) setEvents(eventsRes.value);
        if (teachersRes.status === 'fulfilled' && Array.isArray(teachersRes.value)) setTeachers(teachersRes.value);
        if (achieveRes.status === 'fulfilled' && Array.isArray(achieveRes.value)) setAchievements(achieveRes.value);
        if (facilRes.status === 'fulfilled' && Array.isArray(facilRes.value)) setFacilities(facilRes.value);
        if (extraRes.status === 'fulfilled' && Array.isArray(extraRes.value)) setExtracurriculars(extraRes.value);

        if (galleryRes.status === 'fulfilled' && Array.isArray(galleryRes.value)) {
          const galleryData = galleryRes.value;
          if (process.env.NODE_ENV !== 'production' || typeof window !== 'undefined') {
            console.info('[Homepage Gallery] Firestore result received');
            console.info(`[Homepage Gallery DEBUG] Firestore gallery count: ${galleryData.length}`);
            console.info(`[Homepage Gallery DEBUG] Firestore gallery IDs:`, galleryData.map((g) => g.id));
            console.info(`[Homepage Gallery DEBUG] Firestore gallery imageUrls:`, galleryData.map((g) => g.imageUrl || '(empty)'));
          }
          setGalleries(galleryData);
        } else {
          if (galleryRes.status === 'rejected') {
            console.warn('[Homepage Gallery] Firestore fetch failed:', galleryRes.reason);
          }
          setGalleries([]);
        }

        if (docRes.status === 'fulfilled' && Array.isArray(docRes.value)) setDocuments(docRes.value);
        if (faqRes.status === 'fulfilled' && Array.isArray(faqRes.value)) setFaqs(faqRes.value);
        if (revRes.status === 'fulfilled' && Array.isArray(revRes.value)) setReviews(revRes.value);
        if (analyticsRes.status === 'fulfilled' && analyticsRes.value) setVisitorAnalytics(analyticsRes.value);
      } catch (err) {
        console.warn('Failed to load portal data from Firestore:', err);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    }

    loadPortalData();

    // Listen to real-time updates dispatched from CMS admin actions
    const handleCmsUpdate = () => {
      refreshPublicData();
    };

    window.addEventListener('school-cms-updated', handleCmsUpdate);
    window.addEventListener('cms-data-updated', handleCmsUpdate);

    return () => {
      isSubscribed = false;
      window.removeEventListener('school-cms-updated', handleCmsUpdate);
      window.removeEventListener('cms-data-updated', handleCmsUpdate);
    };
  }, []);

  const handleOpenView = (viewName: string, data?: any) => {
    if (viewName === 'home') {
      setActiveModalView(null);
      setModalInitialData(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    if (viewName === 'contact') {
      setActiveModalView(null);
      setModalInitialData(null);
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    setModalInitialData(data || null);
    setActiveModalView(viewName);
  };

  const handleCloseModal = () => {
    const wasAdmin = activeModalView === 'admin-cms';
    setActiveModalView(null);
    setModalInitialData(null);
    if (wasAdmin) {
      refreshPublicData();
    }
  };

  const handleOpenAdmin = () => {
    setLoginModalOpen(true);
  };

  if (activeModalView === 'admin-cms') {
    return (
      <AdminDashboard
        initialProfile={schoolProfile}
        initialNews={newsList}
        initialAnnouncements={announcements}
        initialEvents={events}
        initialTeachers={teachers}
        initialAchievements={achievements}
        initialFacilities={facilities}
        initialGalleries={galleries}
        initialDocuments={documents}
        initialFAQs={faqs}
        initialReviews={reviews}
        initialAnalytics={visitorAnalytics}
        onExitAdmin={() => {
          setActiveModalView(null);
          refreshPublicData();
        }}
        onProfileUpdated={(updated) => setSchoolProfile(updated)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. Header & Navbar Publik */}
      <PublicNavbar
        schoolProfile={schoolProfile}
        onOpenView={handleOpenView}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* 1.1 Running Text Pengumuman Sekolah (Ticker Marquee) */}
      <RunningTextTicker
        announcements={announcements}
        onOpenView={handleOpenView}
      />

      {/* 1.2 Banner Slideshow Utama (Lebar Penuh, Terang, Menggabungkan Galeri & Prestasi) */}
      <GallerySlideshow
        galleries={galleries}
        achievements={achievements}
        onOpenView={handleOpenView}
      />

      {/* Main Content Areas */}
      <main className="flex-1 bg-slate-50">
        {/* 1.3 Hero Text & Info Cepat (Di bawah Slider) */}
        <HeroSection
          schoolProfile={schoolProfile}
          onOpenView={handleOpenView}
        />

        {/* 2. Pengumuman Mendesak & 4 Pilar Utama Sekolah */}
        <div className="relative z-30 -mt-12 mb-12">
          <QuickInfoSection
            announcements={announcements}
            onOpenView={handleOpenView}
          />
        </div>

        {/* 3. Sambutan Kepala Sekolah */}
        <PrincipalSpeechSection
          schoolProfile={schoolProfile}
          onOpenView={handleOpenView}
        />

        {/* 4. Berita & Agenda Terkini */}
        <NewsEventsSection
          newsList={newsList}
          announcements={announcements}
          events={events}
          onOpenView={handleOpenView}
        />

        {/* 5. Direktori & Profil Pendidik */}
        <TeachersPreviewSection
          teachers={teachers}
          onOpenView={handleOpenView}
        />

        {/* 6. Galeri & Prestasi (Digabung di bawah untuk layout lebih rapi) */}
        <AchievementsGallerySection
          achievements={achievements}
          galleries={galleries}
          onOpenView={handleOpenView}
        />

        {/* 7. Fasilitas Utama & Lingkungan Sekolah */}
        <FacilitiesPreviewSection
          facilities={facilities}
          onOpenView={handleOpenView}
        />

        {/* 8. Call to Action: Penerimaan Peserta Didik Baru (PPDB) */}
        <PPDBCTABanner
          schoolName={schoolProfile.name}
          ppdbYear={schoolProfile.ppdbYear}
          onOpenView={handleOpenView}
        />

        {/* 9. Pusat Informasi & Interaksi Masyarakat */}
        <div id="contact" className="bg-white border-t border-slate-200/50 scroll-mt-24">
          <FAQContactSection
            faqs={faqs}
            schoolProfile={schoolProfile}
          />
        </div>

        {/* 10. Ulasan & Testimoni Masyarakat */}
        <SchoolReviewsSection
          reviews={reviews}
          onOpenView={handleOpenView}
          onReviewSubmitted={refreshPublicData}
        />
      </main>

      {/* 11. Footer Resmi Sekolah dengan Statistik Pengunjung */}
      <PublicFooter
        schoolProfile={schoolProfile}
        visitorAnalytics={visitorAnalytics}
        onOpenView={handleOpenView}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* 12. Floating WhatsApp Helpdesk Button */}
      <WhatsAppFloatingBtn
        schoolProfile={schoolProfile}
      />

      {/* 13. Interactive Multi-Views Modal (Profil, Berita Detail, Agenda, Guru, PPDB, Dokumen) */}
      <PublicViewsModal
        viewName={activeModalView}
        initialData={modalInitialData}
        onClose={handleCloseModal}
        schoolProfile={schoolProfile}
        teachers={teachers}
        newsList={newsList}
        announcements={announcements}
        events={events}
        achievements={achievements}
        galleries={galleries}
        documents={documents}
        facilities={facilities}
        extracurriculars={extracurriculars}
      />

      {/* 14. Admin & Staff Login Modal (Google Auth + 1-Click Demo) */}
      <AdminLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onGoToDashboard={() => {
          setLoginModalOpen(false);
          // In Phase 3, this transitions to the admin CMS dashboard!
          handleOpenView('admin-cms');
        }}
      />
    </div>
  );
}
