
'use server';

import {
  extractAnimalTraitsFromImage,
  ExtractAnimalTraitsFromImageOutput,
} from '@/ai/flows/extract-animal-traits-from-image';
import {
  automateATCScoreGeneration,
  AutomateATCScoreGenerationOutput,
} from '@/ai/flows/automate-atc-score-generation';
import { cookies } from 'next/headers';

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
