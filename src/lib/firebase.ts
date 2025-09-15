
import { initializeApp, getApps, getApp, App } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// CLIENT-SIDE CONFIG
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase app (client-side)
const app: App = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);


export { app, auth };
