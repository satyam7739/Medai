import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyANjztVITP5_pUfjwUwqQbj6Sx_5Sst1iE",
  authDomain: "medai-994cc.firebaseapp.com",
  projectId: "medai-994cc",
  storageBucket: "medai-994cc.firebasestorage.app",
  messagingSenderId: "703856520470",
  appId: "1:703856520470:web:8ce6e6578a12b2b6237437",
  measurementId: "G-BQ8T77WQ63"
};

let app;
try {
  // Prevent "Firebase App named '[DEFAULT]' already exists" error during hot-reload
  if (getApps().length > 0) {
    app = getApp();
    console.log("Firebase App already initialized");
  } else {
    app = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
  }
} catch (error: any) {
  console.error("Firebase Initialization Error:", error.message || error);
  // Re-throw to ensure we don't fail silently
  throw error;
}

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// Log initialization status
console.log("Firebase Auth Initialized:", !!auth);

export { auth, db };