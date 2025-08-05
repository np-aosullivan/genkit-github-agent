import { genkit } from 'genkit/beta';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
    plugins: [
        googleAI(),
    ],
    model: googleAI.model('gemini-2.5-flash')
})