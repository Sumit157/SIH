
import { initializeApp, getApps, getApp, App } from 'firebase/app';
import * as admin from 'firebase-admin';

// CLIENT-SIDE CONFIG
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app: App = !getApps().length ? initializeApp(firebaseConfig) : getApp();


// SERVER-SIDE/ADMIN CONFIG
let adminApp: admin.app.App;

if (!admin.apps.length) {
    const serviceAccount: admin.ServiceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };
    adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
} else {
    adminApp = admin.app();
}


export { app, adminApp };
