
'use server';
import 'server-only';

import { getFirestore, collection, addDoc, getDocs, query, Timestamp } from 'firebase-admin/firestore';
import { adminApp } from '@/lib/firebase';
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
