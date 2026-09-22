import {
  SchoolProfile,
  NewsItem,
  AnnouncementItem,
  EventItem,
  TeacherItem,
  AchievementItem,
  GalleryItem,
  FacilityItem,
  ExtracurricularItem,
  DocumentItem,
  FAQItem,
  SchoolReview,
  VisitorAnalytics,
} from '@/types';

export const initialSchoolProfile: SchoolProfile = {
  name: 'Nama Sekolah',
  shortName: 'Portal Sekolah',
  npsn: '',
  nss: '',
  accreditation: '',
  slogan: 'Slogan atau motto sekolah',
  description: 'Deskripsi profil sekolah (Silakan isi di panel admin).',
  history: '',
  vision: '',
  mission: '',
  address: 'Alamat Sekolah',
  email: 'info@sekolah.sch.id',
  phone: '-',
  whatsapp: '-',
  website: '-',
  googleMapsUrl: '',
  latitude: 0,
  longitude: 0,
  principalName: 'Nama Kepala Sekolah',
  principalRole: 'Kepala Sekolah',
  principalNip: '',
  principalEducation: '',
  principalSpeech: 'Sambutan Kepala Sekolah (Silakan isi di panel admin).',
  principalPhoto: '',
  operatingHours: '-',
  logoUrl: '',
  studentCount: 0,
  teacherCount: 0,
  classCount: 0,
  graduationRate: '',
  excellenceBadge: '',
  ppdbYear: '',
  establishedYear: '',
  educationLevel: '',
  organizationChartUrl: '',
  ppdbTracks: [],
  curriculumDetails: {
    intrakurikuler: '',
    kokurikuler: '',
    ekstrakurikuler: '',
  },
  officialLinks: [],
  socialMedia: {
    facebook: '',
    instagram: '',
    youtube: '',
    tiktok: '',
  },
  features: {
    ppdbEnabled: false,
    galleryEnabled: false,
    documentsEnabled: false,
    faqEnabled: false,
    alumniEnabled: false,
  },
};

export const initialTeachers: TeacherItem[] = [];

export const initialNews: NewsItem[] = [];

export const initialAnnouncements: AnnouncementItem[] = [];

export const initialEvents: EventItem[] = [];

export const initialAchievements: AchievementItem[] = [];

export const initialFacilities: FacilityItem[] = [];

export const initialExtracurriculars: ExtracurricularItem[] = [];

export const initialGalleries: GalleryItem[] = [];

export const initialDocuments: DocumentItem[] = [];

export const initialFAQs: FAQItem[] = [];

export const initialReviews: SchoolReview[] = [];

export const initialVisitorAnalytics: VisitorAnalytics = {
  today: 0,
  yesterday: 0,
  last7Days: 0,
  last30Days: 0,
  total: 0,
  lastUpdated: new Date().toISOString(),
};

