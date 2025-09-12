// src/ai/flows/automate-atc-score-generation.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for automating ATC score generation based on extracted traits from animal images.
 *
 * - automateATCScoreGeneration - A function that triggers the ATC score generation process.
 * - AutomateATCScoreGenerationInput - The input type for the automateATCScoreGeneration function, including extracted animal traits.
 * - AutomateATCScoreGenerationOutput - The return type for the automateATCScoreGeneration function, providing the generated ATC scores and salient traits.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the extracted animal traits
const AutomateATCScoreGenerationInputSchema = z.object({
  bodyLength: z.number().describe('Body length of the animal in cm'),
  chestWidth: z.number().describe('Chest width of the animal in cm'),
  heightAtWithers: z.number().describe('Height at withers of the animal in cm'),
  rumpAngle: z.number().describe('Rump angle of the animal in degrees'),
  udderShape: z.string().describe('Shape of the udder (e.g., round, pendulous)'),
  image: z
    .string()
    .describe(
      "A photo of a the animal, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AutomateATCScoreGenerationInput = z.infer<typeof AutomateATCScoreGenerationInputSchema>;

// Define the output schema for the ATC scores
const AutomateATCScoreGenerationOutputSchema = z.object({
  atcScore: z.number().describe('Overall ATC score for the animal'),
  salientTraits: z.string().describe('The traits most salient to ATC score.'),
});
export type AutomateATCScoreGenerationOutput = z.infer<typeof AutomateATCScoreGenerationOutputSchema>;

// Exported function to trigger the ATC score generation flow
export async function automateATCScoreGeneration(
  input: AutomateATCScoreGenerationInput
): Promise<AutomateATCScoreGenerationOutput> {
  return automateATCScoreGenerationFlow(input);
}

// Define the prompt for generating ATC scores
const atcScorePrompt = ai.definePrompt({
  name: 'atcScorePrompt',
  input: {schema: AutomateATCScoreGenerationInputSchema},
  output: {schema: AutomateATCScoreGenerationOutputSchema},
  prompt: `You are an AI assistant specialized in evaluating animal body structures for dairy farming. You are part of the Rashtriya Gokul Mission. Given the following measurements and characteristics of a cattle or buffalo, generate an ATC (Animal Type Classification) score and list salient traits.

  Body Length: {{bodyLength}} cm
  Chest Width: {{chestWidth}} cm
  Height at Withers: {{heightAtWithers}} cm
  Rump Angle: {{rumpAngle}} degrees
  Udder Shape: {{udderShape}}
  Animal Image: {{media url=image}}

  Based on these traits, provide an overall ATC score and a brief explanation of which traits were most influential in determining the score. Explain why the listed salient traits are most important to the animal's score.
`,
});

// Define the Genkit flow for automating ATC score generation
const automateATCScoreGenerationFlow = ai.defineFlow(
  {
    name: 'automateATCScoreGenerationFlow',
    inputSchema: AutomateATCScoreGenerationInputSchema,
    outputSchema: AutomateATCScoreGenerationOutputSchema,
  },
  async input => {
    // Call the prompt to generate the ATC score and salient traits
    const {output} = await atcScorePrompt(input);
    return output!;
  }
);
