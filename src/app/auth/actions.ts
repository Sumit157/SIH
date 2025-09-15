
'use server';
import 'server-only';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { app, adminApp } from '@/lib/firebase';
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


export async function registerUser(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { message: 'Email and password are required.' };
  }

  try {
    const auth = getAuth(app);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    
    cookies().set('session', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return { message: 'Registration successful!', success: true };
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === 'auth/email-already-in-use') {
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

  try {
    const auth = getAuth(app);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();

    cookies().set('session', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    return { message: 'Login successful!', success: true };
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.code === 'auth/invalid-credential') {
        return { message: 'Incorrect email or password.' };
    }
    return { message: error.message || 'An unknown login error occurred.' };
  }
}

export async function logoutUser() {
    cookies().delete('session');
}

export async function getHistory(): Promise<HistoryItem[]> {
    const session = cookies().get('session')?.value;
    if (!session) {
      throw new Error('Not authenticated');
    }
    const decodedToken = await adminApp.auth().verifyIdToken(session);
    const userId = decodedToken.uid;
    
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
             // Firestore timestamps need to be converted
             timestamp: (data.timestamp as Timestamp).toDate().toLocaleString(),
        } as HistoryItem);
    });

    return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function addHistory(item: HistoryItem) {
    const session = cookies().get('session')?.value;
    if (!session) {
        throw new Error('Not authenticated');
    }
    const decodedToken = await adminApp.auth().verifyIdToken(session);
    const userId = decodedToken.uid;
    
    const db = getFirestore(adminApp);
    const historyCollection = collection(db, 'users', userId, 'history');
    
    // Firestore cannot store Data URIs directly if they are too long.
    // It's better to store just the analysis data. The image is already on the client.
    const { image, ...dataToStore } = item;

    await addDoc(historyCollection, {
      ...dataToStore,
      timestamp: new Date()
    });
}

export type AtcScoreResult = ExtractAnimalTraitsFromImageOutput & AutomateATCScoreGenerationOutput;

export async function getAtcScore(
  imageDataUri: string
): Promise<AtcScoreResult> {
  try {
    const session = cookies().get('session')?.value;
    if (!session) {
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
    
    return {
      ...extractedTraits,
      ...atcScore,
    };
  } catch (error) {
    console.error('Error in ATC score generation flow:', error);
    throw new Error('Failed to generate ATC score.');
  }
}
