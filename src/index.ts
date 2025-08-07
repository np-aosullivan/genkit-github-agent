import 'dotenv/config'

import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';
import { ai } from './ai';
import { listUsersRepos, createRepo } from './github';

const chatConfig = {
        model: googleAI.model('gemini-2.5-flash'),
        tools: [listUsersRepos, createRepo],
        system: `You are a helpful and friendly GitHub assistant. 
            
        Your abilities include:
        - Listing repositories
        - Creating new repositories

        If you cannot help the user with their query, just explain to them what you are able to do for them.
    `,
}

export const mainFlow = ai.defineFlow({
    name: 'mainFlow',
    inputSchema: z.object({message : z.string().describe('The users message')}),
    outputSchema: z.string(),
},
    async ({ message }) => {
        const chat = ai.chat(chatConfig);
        const response = await chat.send(message);
        return response.text;
    })

// The following `run` function is a demonstration of a self-contained conversation.
// If you want to run it as a standalone script, you can comment out the
// `githubServer` startup code above and uncomment the code below.
//
// import { createInterface } from 'node:readline/promises';

// async function run() {
//     const chat = ai.chat(chatConfig);
//      const readline = createInterface(process.stdin, process.stdout);
     
//     while (true) {
//     const userInput = await readline.question("You: ");
//     const response = await chat.send(userInput);
//     console.log(response.text);
//     }
// }
// run();
