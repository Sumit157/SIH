'use server';
/**
 * @fileOverview An AI agent that extracts animal traits from an image.
 *
 * - extractAnimalTraitsFromImage - A function that handles the animal trait extraction process.
 * - ExtractAnimalTraitsFromImageInput - The input type for the extractAnimalTraitsFromImage function.
 * - ExtractAnimalTraitsFromImageOutput - The return type for the extractAnimalTraitsFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractAnimalTraitsFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of an animal, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // prettier-ignore
    ),
});
export type ExtractAnimalTraitsFromImageInput = z.infer<
  typeof ExtractAnimalTraitsFromImageInputSchema
>;

const ExtractAnimalTraitsFromImageOutputSchema = z.object({
  bodyLength: z.number().describe('The body length of the animal in cm.'),
  chestWidth: z.number().describe('The chest width of the animal in cm.'),
  heightAtWithers: z
    .number()
    .describe('The height at withers of the animal in cm.'),
  rumpAngle: z.number().describe('The rump angle of the animal in degrees.'),
  udderShape: z.string().describe('The shape of the udder.'),
});
export type ExtractAnimalTraitsFromImageOutput = z.infer<
  typeof ExtractAnimalTraitsFromImageOutputSchema
>;

export async function extractAnimalTraitsFromImage(
  input: ExtractAnimalTraitsFromImageInput
): Promise<ExtractAnimalTraitsFromImageOutput> {
  return extractAnimalTraitsFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractAnimalTraitsFromImagePrompt',
  input: {schema: ExtractAnimalTraitsFromImageInputSchema},
  output: {schema: ExtractAnimalTraitsFromImageOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an expert in animal husbandry, with a deep understanding of animal anatomy and trait measurement.

You will use the provided image to identify and measure key body parameters of the animal.

Analyze the animal in the photo and extract the following traits:
- Body Length (cm)
- Chest Width (cm)
- Height at Withers (cm)
- Rump Angle (degrees)
- Udder Shape

Photo: {{media url=photoDataUri}}

Ensure that the measurements are as accurate as possible, and provide the udder shape as a descriptive string (e.g., \'bowl shaped\', \'pendulous\'). Return measurements in cm and degrees.`, // prettier-ignore
});

const extractAnimalTraitsFromImageFlow = ai.defineFlow(
  {
    name: 'extractAnimalTraitsFromImageFlow',
    inputSchema: ExtractAnimalTraitsFromImageInputSchema,
    outputSchema: ExtractAnimalTraitsFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The model did not return a response.');
    }
    return output;
  }
);
