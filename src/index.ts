import 'dotenv/config'

import { createMcpServer } from '@genkit-ai/mcp';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';
import { ai } from './ai';
import { listUsersRepos, createRepo } from './github';

export const mainFlow = ai.defineFlow({
    name: 'mainFlow',
    inputSchema: z.object({message : z.string().describe('The users message')}),
    outputSchema: z.string(),
},
    async ({ message }) => {
        const chat = ai.chat({
            model: googleAI.model('gemini-2.5-flash'),
            tools: [listUsersRepos, createRepo],
            system: "You are a helpful GitHub assistant. You can list and create repositories. When asked to create a repository, if a name is not provided, ask for one."
        });
        const response = await chat.send(message);
        return response.text;
    })

const githubServer = createMcpServer(ai, {
    name: 'github-mcp-server',
})

githubServer.setup().then(() => {
    githubServer.start();
})


async function run() {
    // This function demonstrates a self-contained conversation using ai.chat().
    // It creates a new chat session that maintains history for the duration of this function.
    const chat = ai.chat({
        model: googleAI.model('gemini-2.5-flash'),
        tools: [listUsersRepos, createRepo],
        system: "You are a helpful GitHub assistant. You can list and create repositories. When asked to create a repository, if a name is not provided, ask for one."
    });

    let response = await chat.send("Can you create a repository for me?");
    console.log("Agent: ", response.text);
}

run();
