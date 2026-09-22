export type UserRole =
  | 'superadmin'
  | 'admin'
  | 'editor'
  | 'kepala_sekolah'
  | 'guru'
  | 'staff';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  createdAt?: string;
}

export interface SchoolProfile {
  name: string;
  shortName: string;
  npsn: string;
  nss?: string;
  accreditation: string;
  slogan: string;
  tagline?: string;
  description: string;
  history: string;
  vision: string;
  mission: string;
  address: string;
  email: string;
  phone: string;
  whatsapp: string;
  website?: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
  principalName: string;
  principalRole?: string;
  principalNip?: string;
  principalEducation?: string;
  principalSpeech: string;
  principalPhoto: string;
  operatingHours?: string;
  logoUrl: string;
  logo?: string;
  heroImages?: string[];
  curriculumOverview?: string;
  faviconUrl?: string;
  excellenceBadge?: string;
  ppdbYear?: string;
  establishedYear?: string;
  educationLevel?: string;
  organizationChartUrl?: string;
  ppdbTracks?: string[];
  curriculumDetails?: {
    intrakurikuler?: string;
    kokurikuler?: string;
    ekstrakurikuler?: string;
  };
  officialLinks?: Array<{ title: string; url: string }>;
  studentCount: number;
  teacherCount: number;
  classCount: number;
  graduationRate?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    twitter?: string;
  };
  features?: {
    ppdbEnabled: boolean;
    galleryEnabled: boolean;
    documentsEnabled: boolean;
    faqEnabled: boolean;
    alumniEnabled: boolean;
  };
  updatedAt?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  imageUrl?: string;
  category: string;
  author: string;
  authorName?: string;
  authorId?: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'important' | 'urgent';
  isUrgent?: boolean;
  targetAudience?: string;
  status: 'draft' | 'published' | 'archived';
  attachmentUrl?: string;
  attachmentName?: string;
  date: string;
  publishedAt?: string;
  expiredDate?: string;
  createdAt: string;
}

export interface EventItem {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  date?: string;
  time: string;
  location: string;
  description: string;
  category: 'akademik' | 'ujian' | 'rapat' | 'kegiatan siswa' | 'lomba' | 'ppdb' | 'libur' | 'lainnya' | string;
  status: 'draft' | 'published';
  createdAt?: string;
}

export interface TeacherItem {
  id: string;
  name: string;
  nip?: string;
  role: string;
  position?: string;
  subject: string;
  education: string;
  photo?: string;
  photoUrl?: string;
  bio?: string;
  category:
    | 'kepala_sekolah'
    | 'guru'
    | 'wali_kelas'
    | 'tenaga_administrasi'
    | 'pustakawan'
    | 'laboran'
    | 'staf'
    | string;
  order: number;
  isActive: boolean;
}

export interface AchievementItem {
  id: string;
  title: string;
  studentName: string;
  recipient?: string;
  competitionName?: string;
  category?: string;
  className?: string;
  field?: string;
  level: 'Sekolah' | 'Kecamatan' | 'Kabupaten/Kota' | 'Provinsi' | 'Nasional' | 'Internasional';
  rank: string;
  ranking?: string;
  organizer: string;
  year: string;
  photo?: string;
  photoUrl?: string;
  imageUrl?: string;
  description: string;
  createdAt?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  coverUrl?: string;
  imageUrl?: string;
  category?: string;
  date: string;
  images?: string[];
  status?: 'draft' | 'published';
  createdAt: string;
}

export interface FacilityItem {
  id: string;
  name: string;
  description: string;
  photo?: string;
  photoUrl?: string;
  imageUrl?: string;
  category?: string;
  capacity?: string;
  condition: string;
  status: 'draft' | 'published';
  createdAt?: string;
}

export interface ExtracurricularItem {
  id: string;
  name: string;
  category?: string;
  mentor: string;
  schedule: string;
  description: string;
  photo: string;
  isActive: boolean;
}

export interface DocumentItem {
  id: string;
  title: string;
  description: string;
  category: 'akademik' | 'formulir' | 'panduan' | 'ppdb' | 'kurikulum' | 'surat' | 'lainnya' | string;
  fileUrl: string;
  fileName?: string;
  fileSize: string;
  fileType?: string;
  downloadCount: number;
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt: string;
}

export type DownloadDocumentItem = DocumentItem;

export interface PPDBApplicantItem {
  id: string;
  registrationNumber: string;
  fullName: string;
  nik?: string;
  nisn: string;
  birthPlace?: string;
  birthDate: string;
  gender: 'L' | 'P';
  religion?: string;
  address: string;
  previousSchool: string;
  parentName: string;
  parentPhone?: string;
  phone?: string;
  email?: string;
  entryTrack?: string;
  chosenMajor?: string;
  status: 'draft' | 'submitted' | 'verified' | 'rejected' | 'accepted' | 'notAccepted';
  notes?: string;
  documents?: {
    kkUrl?: string;
    aktaUrl?: string;
    ijazahUrl?: string;
    fotoUrl?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface ContactMessageItem {
  id: string;
  name: string;
  senderName?: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export type ContactMessage = ContactMessageItem;

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  status: 'draft' | 'published';
  createdAt?: string;
}

export interface AuditLogItem {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  documentId?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export type ReviewRole =
  | 'Orang Tua / Wali Murid'
  | 'Alumni'
  | 'Peserta Didik / Siswa'
  | 'Tokoh / Masyarakat'
  | 'Mitra Lembaga';

export interface SchoolReview {
  id: string;
  name: string;
  role: ReviewRole | string;
  rating: number; // 1 to 5
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  avatarUrl?: string;
  isVerified?: boolean;
}

export interface VisitorAnalytics {
  today: number;
  yesterday: number;
  last7Days: number;
  last30Days: number;
  total: number;
  lastUpdated?: string;
}

