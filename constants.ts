import { LanguageCode, MedicineType } from './types';

export const APP_NAME = "Med AI";

export const DISCLAIMER_TEXT = "Medical Disclaimer: Med AI is an assistive tool and does not provide medical diagnosis. Always consult a doctor for health advice.";

// All 22 Scheduled Languages of India + English + Hinglish + Others
export const INDIAN_LANGUAGES: { code: LanguageCode; label: string; nativeName: string }[] = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिंदी' },
  { code: 'hinglish', label: 'Hinglish', nativeName: 'Hinglish' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'ur', label: 'Urdu', nativeName: 'اُردُو' },
  { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'or', label: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'pa', label: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'as', label: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'mai', label: 'Maithili', nativeName: 'मैथिली' },
  { code: 'sat', label: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  { code: 'ks', label: 'Kashmiri', nativeName: 'कश्मीरी' },
  { code: 'ne', label: 'Nepali', nativeName: 'नेपाली' },
  { code: 'sd', label: 'Sindhi', nativeName: 'सिन्धी' },
  { code: 'kok', label: 'Konkani', nativeName: 'कोंकणी' },
  { code: 'doi', label: 'Dogri', nativeName: 'डोगरी' },
  { code: 'mni', label: 'Manipuri', nativeName: 'মৈতৈলোন্' },
  { code: 'brx', label: 'Bodo', nativeName: 'बर\'' },
  { code: 'sa', label: 'Sanskrit', nativeName: 'संस्कृतम्' },
  { code: 'bho', label: 'Bhojpuri', nativeName: 'भोजपुरी' },
  { code: 'raj', label: 'Rajasthani', nativeName: 'राजस्थानी' },
];

export const MEDICINE_TYPES = [
  { type: MedicineType.Tablet, label: 'Tablet', icon: '💊' },
  { type: MedicineType.Capsule, label: 'Capsule', icon: '💊' },
  { type: MedicineType.Syrup, label: 'Syrup', icon: '🧪' },
  { type: MedicineType.Injection, label: 'Injection', icon: '💉' },
  { type: MedicineType.Drops, label: 'Drops', icon: '💧' },
  { type: MedicineType.Cream, label: 'Cream', icon: '🧴' },
  { type: MedicineType.Inhaler, label: 'Inhaler', icon: '💨' },
  { type: MedicineType.Other, label: 'Other', icon: '📦' },
];

export const MOCK_EMERGENCY_NUMBERS = [
  { name: 'Emergency Services', number: '112' },
  { name: 'Ambulance', number: '102' },
  { name: 'Police', number: '100' },
];

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

export const timeToMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

// Simple Translation Dictionary
export const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    greeting_morning: "Good Morning",
    greeting_afternoon: "Good Afternoon",
    greeting_evening: "Good Evening",
    quick_actions: "Quick Actions",
    add_med: "Add Med",
    symptoms: "Symptoms",
    pharmacy: "Pharmacy",
    reports: "Health Reports",
    insights: "Insights",
    auto_refill: "Auto Refill",
    vitals: "Vitals",
    todays_schedule: "Today's Schedule",
    view_all: "View All",
    no_meds: "No medicines scheduled for today.",
    take_now: "Take Now",
    snooze: "Snooze",
    missed: "Missed",
    taken: "Taken",
    skipped: "Skipped",
    pending: "Pending",
    profile: "Profile",
    language: "Language",
    appearance: "Appearance",
    caregiver: "Caregiver",
    logout: "Log Out",
    reset_data: "Reset App Data",
    stock_level: "Stock Level",
    refill_alert: "Low Stock Alert",
    order_online: "Order Online",
    inventory: "Inventory",
  },
  hi: {
    greeting_morning: "सुप्रभात",
    greeting_afternoon: "शुभ अपराह्न",
    greeting_evening: "शुभ संध्या",
    quick_actions: "त्वरित कार्रवाई",
    add_med: "दवा जोड़ें",
    symptoms: "लक्षण",
    pharmacy: "फार्मेसी",
    reports: "हेल्थ रिपोर्ट",
    insights: "इनसाइट्स",
    auto_refill: "ऑटो रिफिल",
    vitals: "वाइटल्स",
    todays_schedule: "आज का शेड्यूल",
    view_all: "सभी देखें",
    no_meds: "आज के लिए कोई दवा निर्धारित नहीं है।",
    take_now: "अभी लें",
    snooze: "स्नूज़",
    missed: "छूट गई",
    taken: "ले ली",
    skipped: "छोड़ दी",
    pending: "लंबित",
    profile: "प्रोफ़ाइल",
    language: "भाषा",
    appearance: "दिखावट",
    caregiver: "देखभाल करने वाला",
    logout: "लॉग आउट करें",
    reset_data: "ऐप डेटा रीसेट करें",
    stock_level: "स्टॉक स्तर",
    refill_alert: "कम स्टॉक चेतावनी",
    order_online: "ऑनलाइन ऑर्डर करें",
    inventory: "इन्वेंटरी",
  },
};