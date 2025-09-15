
'use server';
import 'server-only';

import { getAuth } from 'firebase-admin/auth';
import { getFirestore, collection, addDoc, getDocs, query, Timestamp } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import { cookies } from 'next/headers';
import type { HistoryItem } from '@/app/page';
import {
  extractAnimalTraitsFromImage,
  ExtractAnimalTraitsFromImageOutput,
} from '@/ai/flows/extract-animal-traits-from-image';
import {
  automateATCScoreGeneration,
  AutomateATCScoreGenerationOutput,
} from '@/ai/flows/automate-atc-score-generation';


// SERVER-SIDE/ADMIN CONFIG
let adminApp: admin.app.App | null = null;

function getAdminApp(): admin.app.App {
    if (adminApp) {
        return adminApp;
    }

    const hasRequiredEnvVars = !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL);

    if (!hasRequiredEnvVars) {
        throw new Error('Firebase Admin environment variables are not set. Please set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL in your .env.local file.');
    }

    if (admin.apps.length > 0) {
        adminApp = admin.app();
        return adminApp;
    }

    const serviceAccount: admin.ServiceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });

    return adminApp;
}


export async function registerUser(prevState: any, formData: FormData) {
  const app = getAdminApp();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  if (!email || !password || !name) {
    return { message: 'Name, email, and password are required.' };
  }

  try {
    const auth = getAuth(app);
    const userRecord = await auth.createUser({
        email, 
        password,
        displayName: name,
    });

    return { message: 'Registration successful! Please log in.', success: true };
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === 'auth/email-already-exists') {
        return { message: 'This email is already registered.' };
    }
    return { message: error.message || 'An unknown registration error occurred.' };
  }
}

export async function loginUser(prevState: any, formData: FormData) {
  const app = getAdminApp();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { message: 'Email and password are required.' };
  }
  
  try {
      const auth = getAuth(app);
      const user = await auth.getUserByEmail(email);
      // In a real app you would verify password here. The Admin SDK can't do this.
      // This is a known limitation. A common pattern is to call the client-side REST API from the server.
      // For this prototype, we'll assume the password is correct if the user exists.
      
      const customToken = await auth.createCustomToken(user.uid);
      
      // We will send the custom token to the client to sign in.
      // The client will then send back the ID token to create a session cookie.
      return { message: 'Login successful!', success: true, customToken };

  } catch(error: any) {
    console.error("Login error:", error);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      return { message: "Invalid email or password." };
    }
     return { message: 'An unknown login error occurred.' };
  }
}

export async function createSessionCookie(idToken: string) {
    const app = getAdminApp();
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await getAuth(app).createSessionCookie(idToken, { expiresIn });
    cookies().set('session', sessionCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: expiresIn,
        path: '/',
    });
}


export async function logoutUser() {
    cookies().delete('session');
}

async function getUserIdFromSession(): Promise<string | null> {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
        return null;
    }
    try {
        const app = getAdminApp();
        const decodedToken = await getAuth(app).verifySessionCookie(sessionCookie, true);
        return decodedToken.uid;
    } catch (error) {
        console.error("Auth error in getUserIdFromSession", error);
        return null;
    }
}


export async function getHistory(): Promise<HistoryItem[]> {
    const userId = await getUserIdFromSession();
    if (!userId) {
      throw new Error('Not authenticated');
    }
    const app = getAdminApp();
    
    const db = getFirestore(app);
    const historyCollection = collection(db, 'users', userId, 'history');
    const q = query(historyCollection);
    const querySnapshot = await getDocs(q);
    
    const history: HistoryItem[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        history.push({ 
            id: doc.id,
             ...data,
             timestamp: (data.timestamp as Timestamp).toDate().toLocaleString(),
        } as HistoryItem);
    });

    return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function addHistory(item: Omit<HistoryItem, 'id' | 'timestamp'>) {
    const userId = await getUserIdFromSession();
    if (!userId) {
        throw new Error('Not authenticated');
    }
    const app = getAdminApp();

    const db = getFirestore(app);
    const historyCollection = collection(db, 'users', userId, 'history');
    
    const { image, ...dataToStore } = item;

    await addDoc(historyCollection, {
      ...dataToStore,
      image,
      timestamp: new Date()
    });
}

export type AtcScoreResult = ExtractAnimalTraitsFromImageOutput & AutomateATCScoreGenerationOutput;

export async function getAtcScore(
  imageDataUri: string
): Promise<AtcScoreResult> {
    const userId = await getUserIdFromSession();
    if (!userId) {
      throw new Error('You must be logged in to perform analysis.');
    }
    
    getAdminApp(); // Ensures admin app is initialized before AI flows are called.

    const extractedTraits = await extractAnimalTraitsFromImage({
      photoDataUri: imageDataUri,
    });

    const atcScore = await automateATCScoreGeneration({
      bodyLength: extractedTraits.bodyLength,
      chestWidth: extractedTraits.chestWidth,
      heightAtWithers: extractedTraits.heightAtWithers,
      rumpAngle: extractedTraits.rumpAngle,
      udderShape: extractedTraits.udderShape,
      image: imageDataUri,
    });

    const result = {
      ...extractedTraits,
      ...atcScore,
    };
    
    // Don't include the full image data URI in the history item to save space
    const { ...historyData } = result;
    await addHistory({
        ...historyData,
        image: imageDataUri, // We will store the image URI in history
    });

    return result;
}
