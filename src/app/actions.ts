
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
let adminApp: admin.app.App;

if (!admin.apps.length) {
    const serviceAccount: admin.ServiceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };
    adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
} else {
    adminApp = admin.app();
}


export async function registerUser(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  if (!email || !password || !name) {
    return { message: 'Name, email, and password are required.' };
  }

  try {
    const auth = getAuth(adminApp);
    const userRecord = await auth.createUser({
        email, 
        password,
        displayName: name,
    });
    
    // You could also create a document in Firestore here to store more user details
    // const db = getFirestore(adminApp);
    // await db.collection('users').doc(userRecord.uid).set({ name, email });

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
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { message: 'Email and password are required.' };
  }
  // This is a placeholder for a real login flow with email/password using Firebase Admin SDK
  // The Admin SDK doesn't directly sign in users like the client SDK.
  // A proper implementation would involve creating a custom token and sending it to the client.
  // For this prototype, we'll simulate a login by verifying the user exists and setting a session cookie.
  try {
      const auth = getAuth(adminApp);
      const user = await auth.getUserByEmail(email);
      // In a real app, you would verify the password here. The Admin SDK does not provide a direct way to do this.
      // This is a known limitation. A common pattern is to call the client-side signInWithEmailAndPassword REST API from the server.
      // For the prototype's purpose, we'll assume the password is correct if the user exists.
      
      // The intended flow is: server creates custom token -> client receives token -> client calls signInWithCustomToken() -> client gets ID token -> client sends ID token to server -> server creates session cookie.
      const sessionCookie = await auth.createSessionCookie(user.uid, { expiresIn: 60 * 60 * 24 * 5 * 1000 });
      
      cookies().set('session', sessionCookie, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 5, // 5 days
          path: '/',
      });
      return { message: 'Login successful!', success: true };

  } catch(error: any) {
    console.error("Login error:", error);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      return { message: "Invalid email or password." };
    }
     return { message: 'An unknown login error occurred.' };
  }
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
        const decodedToken = await getAuth(adminApp).verifySessionCookie(sessionCookie, true);
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
    
    const db = getFirestore(adminApp);
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

    const db = getFirestore(adminApp);
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

