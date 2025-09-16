import { config } from 'dotenv';
config({ path: '.env.local' });

import '@/ai/flows/extract-animal-traits-from-image.ts';
import '@/ai/flows/suggest-relevant-traits.ts';
import '@/ai/flows/automate-atc-score-generation.ts';
