import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ---------------------------------------------------------------------------
// Firebase config — all values are read from EXPO_PUBLIC_FIREBASE_* env vars.
// Set these in your .env file (never commit .env to Git).
// ---------------------------------------------------------------------------
const firebaseConfig = {
  apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Warn in development if any required env variable is missing.
if (__DEV__) {
  const missing = Object.entries(firebaseConfig)
    .filter(([, v]) => !v)
    .map(([k]) => `EXPO_PUBLIC_FIREBASE_${k.replace(/([A-Z])/g, "_$1").toUpperCase()}`);
  if (missing.length > 0) {
    console.warn(
      "[firebaseConfig] Missing environment variables:\n" +
      missing.map((k) => `  • ${k}`).join("\n") +
      "\n  App will run in mock/offline mode."
    );
  }
}

// App runs in mock mode when the API key is absent (e.g. dev without .env).
const isMock = !firebaseConfig.apiKey;

// Initialize Firebase only when all config values are present.
const app = isMock
  ? null
  : (!getApps().length ? initializeApp(firebaseConfig) : getApp());

export const auth    = app ? getAuth(app)      : null;
export const db      = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app)   : null;

// Use this flag throughout the app to switch between Firebase and local fallbacks.
export const isFirebaseConfigured = !isMock;
