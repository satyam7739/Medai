
export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
  PreferNotToSay = 'Prefer not to say'
}

// 27 Languages (22 Scheduled + English + Hinglish + others common)
export type LanguageCode = 
  | 'en' | 'hi' | 'hinglish' | 'bn' | 'te' | 'mr' | 'ta' | 'ur' | 'gu' | 'kn' 
  | 'ml' | 'or' | 'pa' | 'as' | 'mai' | 'sat' | 'ks' | 'ne' | 'sd' | 'kok' 
  | 'doi' | 'mni' | 'brx' | 'sa' | 'bho' | 'raj' | 'eng_in';

export interface Caregiver {
  name: string;
  phone: string;
  relationship?: string;
  alertTrigger?: number; // e.g. 1 = Notify immediately after 1 missed dose
  alertMessage?: string; // Custom message text for Missed Doses
  sosMessage?: string;   // Custom message text for SOS
}

export interface UserProfile {
  name: string;
  age: number | string;
  gender: Gender;
  language: LanguageCode;
  profilePicture?: string; // Base64 string
  caregiver?: Caregiver;
  onboardingComplete: boolean;
  createdAt?: string;
}

export enum MedicineStatus {
  Pending = 'Pending',
  Taken = 'Taken',
  Skipped = 'Skipped',
  Missed = 'Missed'
}

export enum MedicineType {
  Tablet = 'Tablet',
  Capsule = 'Capsule',
  Syrup = 'Syrup',
  Injection = 'Injection',
  Drops = 'Drops',
  Cream = 'Cream',
  Inhaler = 'Inhaler',
  Other = 'Other'
}

export interface MedicineLog {
  date: string; // ISO Date string YYYY-MM-DD
  status: MedicineStatus;
  timestamp?: string;
}

export interface Medicine {
  id: string;
  name: string;
  dose: string;
  type: MedicineType; // Added Type
  frequency: number;
  times: string[]; // HH:MM (24h format stored, displayed as AM/PM)
  notes?: string;
  image?: string;
  logs: Record<string, MedicineStatus>;
  // Inventory / Stock Tracking
  currentStock?: number;
  lowStockThreshold?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  rating?: number;
  openNow?: boolean;
  distance?: string;
  stockStatus: 'High' | 'Medium' | 'Low' | 'Unknown';
  availableMedicines?: string[]; 
}

export type Theme = 'light' | 'dark';

export interface SnoozeData {
  medicineId: string;
  timeSlot: string;
  snoozedUntil: number;
}

// Health Report Types
export interface LabMetric {
  name: string;
  value: string;
  unit: string;
  status: 'Normal' | 'High' | 'Low' | 'Unknown';
}

export interface HealthInsight {
  title: string;
  description: string;
  icon: string; // emoji or icon name
  type: 'diet' | 'exercise' | 'lifestyle';
}

export interface LabReportAnalysis {
  id: string;
  date: string;
  title: string;
  metrics: LabMetric[];
  insights: HealthInsight[];
  summary: string;
}

export interface SavedReport extends LabReportAnalysis {
  savedAt: string;
}
