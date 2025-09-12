
import { initializeApp, getApps, getApp } from 'firebase/app';

export const firebaseConfig = {
  projectId: "studio-7182137680-2f186",
  appId: "1:768557266209:web:d913222dfe8e581e647a60",
  storageBucket: "studio-7182137680-2f186.firebasestorage.app",
  apiKey: "AIzaSyDTte2v2eXZxotfSqmXF8biQOJ6OhjWMlA",
  authDomain: "studio-7182137680-2f186.firebaseapp.com",
  messagingSenderId: "768557266209"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
