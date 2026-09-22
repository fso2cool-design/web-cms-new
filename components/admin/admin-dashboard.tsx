'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout, AdminTab } from './admin-layout';
import { AdminOverview } from './modules/admin-overview';
import { AdminProfile } from './modules/admin-profile';
import { AdminNews } from './modules/admin-news';
import { AdminEvents } from './modules/admin-events';
import { AdminTeachers } from './modules/admin-teachers';
import { AdminPPDB } from './modules/admin-ppdb';
import { AdminFacilities } from './modules/admin-facilities';
import { AdminExtracurriculars } from './modules/admin-extracurriculars';
import { AdminAchievementsGallery } from './modules/admin-achievements-gallery';
import { AdminDocuments } from './modules/admin-documents';
import { AdminMessages } from './modules/admin-messages';
import { AdminFAQs } from './modules/admin-faqs';
import { AdminReviews } from './modules/admin-reviews';
import { AdminAnalytics } from './modules/admin-analytics';
import {
  SchoolProfile,
  NewsItem,
  EventItem,
  TeacherItem,
  PPDBApplicantItem,
  ContactMessage,
  AnnouncementItem,
  AchievementItem,
  FacilityItem,
  ExtracurricularItem,
  GalleryItem,
  DownloadDocumentItem,
  FAQItem,
  SchoolReview,
  VisitorAnalytics,
} from '@/types';
import { getAllNews } from '@/services/news.service';
import { getAllAnnouncements } from '@/services/announcement.service';
import { getAllEvents } from '@/services/event.service';
import { getAllTeachers } from '@/services/teacher.service';
import { getAllAchievements } from '@/services/achievement.service';
import { getAllFacilities } from '@/services/facility.service';
import { getAllExtracurricularsAdmin } from '@/services/extracurricular.service';
import { getAllGalleries } from '@/services/gallery.service';
import { getAllDocuments } from '@/services/document.service';
import { getAllContactMessages } from '@/services/contact.service';
import { getAllApplicants } from '@/services/ppdb.service';
import { getAllFAQs } from '@/services/faq.service';
import { getAllReviewsAdmin } from '@/services/review.service';
import { getVisitorAnalytics } from '@/services/analytics.service';

interface AdminDashboardProps {
  initialProfile: SchoolProfile;
  initialNews?: NewsItem[];
  initialAnnouncements?: AnnouncementItem[];
  initialEvents?: EventItem[];
  initialTeachers?: TeacherItem[];
  initialAchievements?: AchievementItem[];
  initialFacilities?: FacilityItem[];
  initialExtracurriculars?: ExtracurricularItem[];
  initialGalleries?: GalleryItem[];
  initialDocuments?: DownloadDocumentItem[];
  initialFAQs?: FAQItem[];
  initialApplicants?: PPDBApplicantItem[];
  initialMessages?: ContactMessage[];
  initialReviews?: SchoolReview[];
  initialAnalytics?: VisitorAnalytics;
  onExitAdmin: () => void;
  onProfileUpdated?: (profile: SchoolProfile) => void;
}

export function AdminDashboard({
  initialProfile,
  initialNews = [],
  initialAnnouncements = [],
  initialEvents = [],
  initialTeachers = [],
  initialAchievements = [],
  initialFacilities = [],
  initialExtracurriculars = [],
  initialGalleries = [],
  initialDocuments = [],
  initialFAQs = [],
  initialApplicants = [],
  initialMessages = [],
  initialReviews = [],
  initialAnalytics,
  onExitAdmin,
  onProfileUpdated,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [profile, setProfile] = useState<SchoolProfile>(initialProfile);

  // Module states
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [teachers, setTeachers] = useState<TeacherItem[]>(initialTeachers);
  const [achievements, setAchievements] = useState<AchievementItem[]>(initialAchievements);
  const [facilities, setFacilities] = useState<FacilityItem[]>(initialFacilities);
  const [extracurriculars, setExtracurriculars] = useState<ExtracurricularItem[]>(initialExtracurriculars);
  const [galleries, setGalleries] = useState<GalleryItem[]>(initialGalleries);
  const [documents, setDocuments] = useState<DownloadDocumentItem[]>(initialDocuments);
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFAQs);
  const [applicants, setApplicants] = useState<PPDBApplicantItem[]>(initialApplicants);
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [reviews, setReviews] = useState<SchoolReview[]>(initialReviews);
  const [analytics, setAnalytics] = useState<VisitorAnalytics | undefined>(initialAnalytics);

  const refreshReviews = async () => {
    try {
      const r = await getAllReviewsAdmin();
      if (r) setReviews(r);
    } catch (e) {
      console.warn('Error refreshing reviews:', e);
    }
  };

  // Initial load / fetch live data from Firestore on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [n, a, e, t, ach, f, ex, g, d, fq, app, m, rev, stats] = await Promise.all([
          getAllNews(),
          getAllAnnouncements(),
          getAllEvents(),
          getAllTeachers(),
          getAllAchievements(),
          getAllFacilities(),
          getAllExtracurricularsAdmin(),
          getAllGalleries(),
          getAllDocuments(),
          getAllFAQs(),
          getAllApplicants(),
          getAllContactMessages(),
          getAllReviewsAdmin(),
          getVisitorAnalytics(),
        ]);
        if (n && n.length > 0) setNews(n);
        if (a && a.length > 0) setAnnouncements(a);
        if (e && e.length > 0) setEvents(e);
        if (t && t.length > 0) setTeachers(t);
        if (ach && ach.length > 0) setAchievements(ach);
        if (f && f.length > 0) setFacilities(f);
        if (ex && ex.length > 0) setExtracurriculars(ex);
        if (g && g.length > 0) setGalleries(g);
        if (d && d.length > 0) setDocuments(d);
        if (fq && fq.length > 0) setFaqs(fq);
        if (app && app.length > 0) setApplicants(app);
        if (m && m.length > 0) setMessages(m);
        if (rev && rev.length > 0) setReviews(rev);
        if (stats) setAnalytics(stats);
      } catch (err) {
        console.warn('Admin live data load error:', err);
      }
    }

    loadData();
  }, []);

  const handleProfileUpdated = (updated: SchoolProfile) => {
    setProfile(updated);
    if (onProfileUpdated) {
      onProfileUpdated(updated);
    }
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      schoolProfile={profile}
      onExitAdmin={onExitAdmin}
    >
      {activeTab === 'overview' && (
        <AdminOverview
          schoolProfile={profile}
          newsList={news}
          events={events}
          teachers={teachers}
          ppdbApplicants={applicants}
          messages={messages}
          onNavigateTab={setActiveTab}
        />
      )}

      {activeTab === 'profile' && (
        <AdminProfile
          schoolProfile={profile}
          onProfileUpdated={handleProfileUpdated}
        />
      )}

      {activeTab === 'news' && (
        <AdminNews
          initialNews={news}
          initialAnnouncements={announcements}
        />
      )}

      {activeTab === 'events' && (
        <AdminEvents
          initialEvents={events}
        />
      )}

      {activeTab === 'teachers' && (
        <AdminTeachers
          initialTeachers={teachers}
        />
      )}

      {activeTab === 'ppdb' && (
        <AdminPPDB
          initialApplicants={applicants}
          schoolProfile={profile}
          onProfileUpdated={handleProfileUpdated}
        />
      )}

      {activeTab === 'facilities' && (
        <AdminFacilities
          initialFacilities={facilities}
        />
      )}

      {activeTab === 'extracurriculars' && (
        <AdminExtracurriculars
          initialExtracurriculars={extracurriculars}
        />
      )}

      {activeTab === 'achievements-gallery' && (
        <AdminAchievementsGallery
          key={`gal-ach-${galleries.length}-${achievements.length}`}
          initialAchievements={achievements}
          initialGalleries={galleries}
        />
      )}

      {activeTab === 'documents' && (
        <AdminDocuments
          initialDocuments={documents}
        />
      )}

      {activeTab === 'messages' && (
        <AdminMessages
          initialMessages={messages}
        />
      )}

      {activeTab === 'faqs' && (
        <AdminFAQs
          initialFAQs={faqs}
        />
      )}

      {activeTab === 'reviews' && (
        <AdminReviews
          reviews={reviews}
          onRefresh={refreshReviews}
        />
      )}

      {activeTab === 'analytics' && (
        <AdminAnalytics
          analytics={analytics}
        />
      )}
    </AdminLayout>
  );
}
