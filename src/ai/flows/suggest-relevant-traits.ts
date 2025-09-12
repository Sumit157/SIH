'use server';

/**
 * @fileOverview A flow to suggest the most relevant traits influencing the ATC score for a given animal.
 *
 * - suggestRelevantTraits - A function that suggests relevant traits.
 * - SuggestRelevantTraitsInput - The input type for the suggestRelevantTraits function.
 * - SuggestRelevantTraitsOutput - The return type for the suggestRelevantTraits function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SuggestRelevantTraitsInputSchema = z.object({
  animalType: z.string().describe('The type of animal (e.g., cattle, buffalo).'),
  atcScore: z.number().describe('The overall ATC score for the animal.'),
  traitData: z.record(z.number()).describe('A record of extracted traits and their corresponding numerical values.'),
});

export type SuggestRelevantTraitsInput = z.infer<typeof SuggestRelevantTraitsInputSchema>;

const SuggestRelevantTraitsOutputSchema = z.object({
  relevantTraits: z.array(z.string()).describe('An array of the most relevant traits influencing the ATC score, with explanations.'),
});

export type SuggestRelevantTraitsOutput = z.infer<typeof SuggestRelevantTraitsOutputSchema>;

export async function suggestRelevantTraits(input: SuggestRelevantTraitsInput): Promise<SuggestRelevantTraitsOutput> {
  return suggestRelevantTraitsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelevantTraitsPrompt',
  input: {
    schema: SuggestRelevantTraitsInputSchema,
  },
  output: {
    schema: SuggestRelevantTraitsOutputSchema,
  },
  prompt: `You are an expert in dairy farming and animal classification. Given the following information about an animal, identify the most relevant traits influencing its ATC score.

Animal Type: {{{animalType}}}
ATC Score: {{{atcScore}}}
Trait Data: {{{traitData}}}

Consider which traits have the largest impact on the overall score and provide a brief explanation for each.

Output the traits as an array of strings, each including the trait name and explanation.

For example:
[
  "Body Length: This trait is important because...",
  "Chest Width: This trait contributes to...",
]`,
});

const suggestRelevantTraitsFlow = ai.defineFlow(
  {
    name: 'suggestRelevantTraitsFlow',
    inputSchema: SuggestRelevantTraitsInputSchema,
    outputSchema: SuggestRelevantTraitsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
