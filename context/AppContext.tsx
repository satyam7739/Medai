
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, Medicine, MedicineStatus, Theme, Gender, SnoozeData, LanguageCode, SavedReport, LabReportAnalysis } from '../types';
import { TRANSLATIONS } from '../constants';
import { auth, db } from '../services/firebaseConfig';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  deleteDoc
} from 'firebase/firestore';

interface AppContextType {
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  demoLogin: () => void;
  signup: (email: string, password?: string, name?: string) => Promise<void>;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, token: string, name?: string) => Promise<void>;
  logout: () => void;
  user: UserProfile;
  updateUser: (data: Partial<UserProfile>) => void;
  updateProfilePic: (base64: string) => void;
  medicines: Medicine[];
  addMedicine: (med: Medicine) => void;
  editMedicine: (med: Medicine) => Promise<void>;
  removeMedicine: (id: string) => void;
  updateMedicineStatus: (medId: string, timeSlot: string, status: MedicineStatus) => void;
  snoozeMedicine: (medId: string, timeSlot: string, durationMinutes: number) => void;
  activeSnoozes: SnoozeData[];
  theme: Theme;
  toggleTheme: () => void;
  sosActive: boolean;
  triggerSOS: (active: boolean) => void;
  notifyCaregiver: (medicineName: string, issue: string, scheduledTime?: string) => void;
  resetData: () => void;
  savedReports: SavedReport[];
  saveReport: (report: LabReportAnalysis) => void;
  removeReport: (id: string) => void;
  t: (key: string) => string;
}

const defaultUser: UserProfile = {
  name: '',
  age: '',
  gender: Gender.PreferNotToSay,
  language: 'en',
  onboardingComplete: false
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);

  // Local-only state for Snoozes (temporary actions) and Theme
  const [activeSnoozes, setActiveSnoozes] = useState<SnoozeData[]>(() => {
    const saved = localStorage.getItem('medai_snoozes');
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.filter((s: SnoozeData) => s.snoozedUntil > Date.now());
  });

  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('medai_theme') as Theme) || 'light';
  });

  const [sosActive, setSosActive] = useState(false);

  // --- Theme & Snooze Persistence (Local) ---
  useEffect(() => {
    localStorage.setItem('medai_snoozes', JSON.stringify(activeSnoozes));
  }, [activeSnoozes]);

  useEffect(() => {
    localStorage.setItem('medai_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // --- Firebase Auth & Data Loading ---
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(err => {
      console.warn("Persistence note:", err);
    });

    // Check if demo user is active in localStorage
    const savedDemo = localStorage.getItem('medai_demo_active');
    if (savedDemo === 'true') {
      try {
        const demoUser = localStorage.getItem('medai_user');
        const demoMeds = localStorage.getItem('medai_medicines');
        const demoReps = localStorage.getItem('medai_reports');
        if (demoUser) setUser(JSON.parse(demoUser));
        if (demoMeds) setMedicines(JSON.parse(demoMeds));
        if (demoReps) setSavedReports(JSON.parse(demoReps));
        setIsAuthenticated(true);
        setAuthLoading(false);
        return;
      } catch (e) {
        console.error("Failed to parse demo state", e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setAuthLoading(true);
        // Load data FIRST, then set authenticated
        await loadUserData(currentUser.uid);
        setIsAuthenticated(true);
        setAuthLoading(false);
      } else {
        const isDemo = localStorage.getItem('medai_demo_active') === 'true';
        if (!isDemo) {
          setIsAuthenticated(false);
          setUser(defaultUser);
          setMedicines([]);
          setSavedReports([]);
        }
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userSnapshot = await getDoc(userDocRef);

      if (userSnapshot.exists()) {
        const profile = userSnapshot.data();
        
        setUser({
          name: profile.name || '',
          age: profile.age || '',
          gender: (profile.gender as Gender) || Gender.PreferNotToSay,
          language: (profile.language as LanguageCode) || 'en',
          caregiver: profile.caregiver,
          profilePicture: profile.profilePicture,
          onboardingComplete: profile.onboardingComplete === undefined ? true : profile.onboardingComplete
        });
      } else {
        console.warn("User authenticated but no profile found in DB");
      }

      const medicinesRef = collection(db, 'users', userId, 'medicines');
      const medsSnapshot = await getDocs(medicinesRef);
      
      const mappedMeds: Medicine[] = medsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          dose: data.dose,
          type: data.type,
          frequency: data.frequency,
          times: data.times || [],
          notes: data.notes,
          image: data.image,
          logs: data.logs || {},
          currentStock: data.currentStock,
          lowStockThreshold: data.lowStockThreshold
        };
      });
      setMedicines(mappedMeds);

      const reportsRef = collection(db, 'users', userId, 'reports');
      const reportsSnapshot = await getDocs(reportsRef);
      
      const mappedReports: SavedReport[] = reportsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          date: data.date,
          title: data.title,
          metrics: data.metrics || [],
          insights: data.insights || [],
          summary: data.summary,
          savedAt: data.savedAt
        } as SavedReport;
      });
      setSavedReports(mappedReports.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()));

    } catch (error) {
      console.error("Failed to load user data from Firebase:", error);
    }
  };

  const demoLogin = () => {
    const sampleUser: UserProfile = {
      name: 'Rahul Sharma',
      age: 36,
      gender: Gender.Male,
      language: 'en',
      onboardingComplete: true,
      caregiver: {
        name: 'Priya Sharma',
        phone: '+91 98765 43210',
        relationship: 'Spouse',
        sosMessage: 'Urgent: Rahul needs medical attention! Location shared.'
      }
    };

    const sampleMeds: Medicine[] = [
      {
        id: 'med_demo_1',
        name: 'Dolo 650 (Paracetamol)',
        dose: '650mg',
        type: 'Tablet' as any,
        frequency: 2,
        times: ['09:00', '21:00'],
        notes: 'Take after meals for fever or body ache',
        currentStock: 12,
        lowStockThreshold: 5,
        logs: {
          [`${new Date().toISOString().split('T')[0]}-09:00`]: MedicineStatus.Taken
        }
      },
      {
        id: 'med_demo_2',
        name: 'Metformin 500mg',
        dose: '500mg',
        type: 'Tablet' as any,
        frequency: 2,
        times: ['08:30', '20:30'],
        notes: 'Take with morning and evening meal',
        currentStock: 4, // low stock to demonstrate auto-refill alert
        lowStockThreshold: 5,
        logs: {}
      },
      {
        id: 'med_demo_3',
        name: 'Vitamin D3 60K',
        dose: '60000 IU',
        type: 'Capsule' as any,
        frequency: 1,
        times: ['14:00'],
        notes: 'Weekly dose on Sundays',
        currentStock: 8,
        lowStockThreshold: 3,
        logs: {}
      }
    ];

    const sampleReports: SavedReport[] = [
      {
        id: 'rep_demo_1',
        date: new Date().toISOString().split('T')[0],
        title: 'Comprehensive Health & Lipid Panel',
        summary: 'Overall profile shows well-managed glucose levels and normal kidney function. Slight elevation in LDL cholesterol.',
        metrics: [
          { name: 'Fasting Blood Sugar', value: '98', unit: 'mg/dL', status: 'Normal' },
          { name: 'HbA1c', value: '5.6', unit: '%', status: 'Normal' },
          { name: 'Total Cholesterol', value: '208', unit: 'mg/dL', status: 'High' },
          { name: 'Hemoglobin', value: '14.2', unit: 'g/dL', status: 'Normal' }
        ],
        insights: [
          { title: 'Heart Health', description: 'Incorporate 30 minutes of aerobic exercise and omega-3 rich food.', icon: '🥗', type: 'diet' },
          { title: 'Hydration', description: 'Maintain 2.5 - 3 liters of water intake daily.', icon: '💧', type: 'lifestyle' }
        ],
        savedAt: new Date().toISOString()
      }
    ];

    localStorage.setItem('medai_demo_active', 'true');
    localStorage.setItem('medai_user', JSON.stringify(sampleUser));
    localStorage.setItem('medai_medicines', JSON.stringify(sampleMeds));
    localStorage.setItem('medai_reports', JSON.stringify(sampleReports));

    setUser(sampleUser);
    setMedicines(sampleMeds);
    setSavedReports(sampleReports);
    setIsAuthenticated(true);
  };

  const notifyCaregiver = (medicineName: string, issue: string, scheduledTime?: string) => {
    if (user.caregiver?.phone) {
      const timeStr = scheduledTime ? ` (Scheduled: ${scheduledTime})` : '';
      const defaultMsg = `Alert: ${user.name} has missed ${medicineName}${timeStr}. Status: ${issue}`;
      
      const finalMsg = user.caregiver.alertMessage 
        ? user.caregiver.alertMessage.replace('{medicine}', medicineName).replace('{issue}', issue)
        : defaultMsg;

      console.log(`[CAREGIVER ALERT SENT] To: ${user.caregiver.name} (${user.caregiver.phone})`);
      alert(`⚠️ CAREGIVER NOTIFIED ⚠️\n\nTo: ${user.caregiver.name}\nMsg: "${finalMsg}"`);
    }
  };

  const checkRecentMissedDoses = (currentMeds: Medicine[]) => {
    let missedCount = 0;
    currentMeds.forEach(med => {
      Object.values(med.logs).forEach((status) => {
        if (status === MedicineStatus.Missed) missedCount++;
      });
    });

    if (missedCount >= 2) {
      notifyCaregiver("Multiple Medicines", `User has missed ${missedCount} doses recently.`);
    }
  };

  // --- Actions ---

  const login = async (email: string, password?: string) => {
    if (!password) throw new Error("Password is required");
    const result = await signInWithEmailAndPassword(auth, email, password);
    if (result.user) {
       // Check if profile exists. ONLY create default if missing.
       // This prevents overwriting existing users.
       const userRef = doc(db, 'users', result.user.uid);
       const snap = await getDoc(userRef);
       if (!snap.exists()) {
         await setDoc(userRef, { 
             email: result.user.email,
             onboardingComplete: false, // New profile -> needs onboarding
             language: 'en',
             createdAt: new Date().toISOString()
         });
       }
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    if (result.user) {
       const userRef = doc(db, 'users', result.user.uid);
       const snap = await getDoc(userRef);
       if (!snap.exists()) {
          await setDoc(userRef, { 
             name: result.user.displayName || 'User',
             email: result.user.email,
             onboardingComplete: false, // New profile -> needs onboarding
             language: 'en',
             createdAt: new Date().toISOString()
          });
       } 
    }
  };

  const signup = async (email: string, password?: string, name?: string) => {
    if (!password) throw new Error("Password is required");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;

    // Explicitly creating a NEW profile
    const newProfile = {
      name: name || '',
      onboardingComplete: false,
      language: 'en',
      createdAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, 'users', userId), newProfile);
  };

  const sendOtp = async (phone: string) => { throw new Error("Not implemented"); };
  const verifyOtp = async (phone: string, token: string, name?: string) => { throw new Error("Not implemented"); };

  const logout = async () => {
    localStorage.removeItem('medai_demo_active');
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Sign out note:", e);
    }
    setIsAuthenticated(false);
    setUser(defaultUser);
    setMedicines([]);
    setSavedReports([]);
  };

  const updateUser = async (data: Partial<UserProfile>) => {
    setUser(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('medai_user', JSON.stringify(updated));
      return updated;
    });
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      await setDoc(doc(db, 'users', userId), data, { merge: true });
    } catch (err) {
      console.warn("Firestore update user note:", err);
    }
  };

  const updateProfilePic = (base64: string) => { updateUser({ profilePicture: base64 }); };

  const addMedicine = async (med: Medicine) => {
    setMedicines(prev => {
      const updated = [...prev, med];
      localStorage.setItem('medai_medicines', JSON.stringify(updated));
      return updated;
    });
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      await setDoc(doc(db, 'users', userId, 'medicines', med.id), med);
    } catch (err) {
      console.warn("Firestore add med note:", err);
    }
  };

  const editMedicine = async (updatedMed: Medicine) => {
    setMedicines(prev => {
      const updated = prev.map(m => m.id === updatedMed.id ? updatedMed : m);
      localStorage.setItem('medai_medicines', JSON.stringify(updated));
      return updated;
    });
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const { logs, ...rest } = updatedMed; 
    try {
      await updateDoc(doc(db, 'users', userId, 'medicines', updatedMed.id), { ...rest });
    } catch (err) {
      console.warn("Firestore edit med note:", err);
    }
  };

  const removeMedicine = async (id: string) => {
    setMedicines(prev => {
      const updated = prev.filter(m => m.id !== id);
      localStorage.setItem('medai_medicines', JSON.stringify(updated));
      return updated;
    });
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      await deleteDoc(doc(db, 'users', userId, 'medicines', id));
    } catch (err) {
      console.warn("Firestore delete med note:", err);
    }
  };

  const updateMedicineStatus = async (medId: string, timeSlot: string, status: MedicineStatus) => {
    const todayKey = new Date().toISOString().split('T')[0];
    const logKey = `${todayKey}-${timeSlot}`;

    if (status === MedicineStatus.Taken || status === MedicineStatus.Skipped) {
      setActiveSnoozes(prev => prev.filter(s => !(s.medicineId === medId && s.timeSlot === timeSlot)));
    }

    let updatedMed: Medicine | undefined;
    let newMedicinesList: Medicine[] = [];

    setMedicines(prev => {
      newMedicinesList = prev.map(med => {
        if (med.id !== medId) return med;
        
        const oldStatus = med.logs[logKey];
        let newStock = med.currentStock;
        
        if (typeof newStock === 'number') {
          if (status === MedicineStatus.Taken && oldStatus !== MedicineStatus.Taken) {
            newStock = Math.max(0, newStock - 1);
          } else if (oldStatus === MedicineStatus.Taken && status !== MedicineStatus.Taken) {
            newStock = newStock + 1;
          }
        }
        
        const newLogs = { ...med.logs, [logKey]: status };
        updatedMed = { ...med, logs: newLogs, currentStock: newStock };
        return updatedMed;
      });
      localStorage.setItem('medai_medicines', JSON.stringify(newMedicinesList));
      return newMedicinesList;
    });

    if (updatedMed) {
      const userId = auth.currentUser?.uid;
      if (userId) {
        try {
          await updateDoc(doc(db, 'users', userId, 'medicines', medId), {
             logs: updatedMed.logs,
             currentStock: updatedMed.currentStock
          });
        } catch (err) {
          console.warn("Firestore update log note:", err);
        }
      }
      if (status === MedicineStatus.Missed) {
        checkRecentMissedDoses(newMedicinesList);
      }
    }
  };

  const snoozeMedicine = (medId: string, timeSlot: string, durationMinutes: number) => {
    const snoozedUntil = Date.now() + (durationMinutes * 60 * 1000);
    const newSnooze: SnoozeData = { medicineId: medId, timeSlot, snoozedUntil };
    setActiveSnoozes(prev => {
      const filtered = prev.filter(s => !(s.medicineId === medId && s.timeSlot === timeSlot));
      return [...filtered, newSnooze];
    });
  };

  const saveReport = async (report: LabReportAnalysis) => {
    const newReport: SavedReport = { ...report, savedAt: new Date().toISOString() };
    setSavedReports(prev => {
      const updated = [newReport, ...prev];
      localStorage.setItem('medai_reports', JSON.stringify(updated));
      return updated;
    });
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      await setDoc(doc(db, 'users', userId, 'reports', report.id), newReport);
    } catch (err) {
      console.warn("Firestore save report note:", err);
    }
  };

  const removeReport = async (id: string) => {
    setSavedReports(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem('medai_reports', JSON.stringify(updated));
      return updated;
    });
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      await deleteDoc(doc(db, 'users', userId, 'reports', id));
    } catch (err) {
      console.warn("Firestore remove report note:", err);
    }
  };

  const triggerSOS = (active: boolean) => { setSosActive(active); };

  const toggleTheme = () => { setTheme(prev => prev === 'light' ? 'dark' : 'light'); };

  const resetData = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      try {
        await updateDoc(doc(db, 'users', userId), { onboardingComplete: false, caregiver: null });
        const medCol = collection(db, 'users', userId, 'medicines');
        const medSnapshot = await getDocs(medCol);
        await Promise.all(medSnapshot.docs.map(d => deleteDoc(d.ref)));
        const reportCol = collection(db, 'users', userId, 'reports');
        const repSnapshot = await getDocs(reportCol);
        await Promise.all(repSnapshot.docs.map(d => deleteDoc(d.ref)));
      } catch (err) {
        console.warn("Firestore reset note:", err);
      }
    }
    localStorage.clear();
    setUser(defaultUser);
    setMedicines([]);
    setSavedReports([]);
    setActiveSnoozes([]);
  };

  const t = (key: string): string => {
    const langCode = user.language || 'en';
    const dict = TRANSLATIONS[langCode] || TRANSLATIONS['en'];
    return dict[key] || TRANSLATIONS['en'][key] || key;
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <AppContext.Provider value={{
      isAuthenticated, login, loginWithGoogle, demoLogin, signup, sendOtp, verifyOtp, logout,
      user, updateUser, updateProfilePic,
      medicines, addMedicine, editMedicine, removeMedicine, updateMedicineStatus,
      snoozeMedicine, activeSnoozes,
      theme, toggleTheme, sosActive, triggerSOS, notifyCaregiver, resetData,
      savedReports, saveReport, removeReport, t
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
