import 'dotenv/config'

import { googleAI } from '@genkit-ai/googleai';
import { createMcpServer } from '@genkit-ai/mcp';
import { genkit } from 'genkit';
import { z } from 'zod';
import axios from 'axios';

const ai = genkit({
    plugins: [
        googleAI(),
    ],
    model: googleAI.model('gemini-2.5-flash')
})

const githubClient = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
    'Accept': 'application/json',
  },
});

const githubPrompt = ai.prompt('githubPrompt')

const listUsersRepos = ai.defineTool(
    {
        name: 'listUsersRepos',
        description: 'Lists the names of the authenticated user\'s Github repositories.',
        outputSchema: z.array(z.string()),
    },
    async () => {
        try {
            const response = await githubClient.get('/user/repos');
            return response.data.map((repo: { name: string }) => repo.name);
        } catch (error) {
            console.error('Error fetching from Github API:', error);
            // Re-throw the error to let the flow handle it.
            throw error;
        }
    }
);

export const mainFlow = ai.defineFlow({
    name: 'mainFlow',
    inputSchema: z.object({message : z.string().describe('The users message')}),
    outputSchema: z.string(),
}, 
async ({ message }) => {
    const response = await githubPrompt({ message });    
    return response.text;
})

const githubServer = createMcpServer(ai, {
    name: 'github-mcp-server',
})

githubServer.setup().then(() => {
    githubServer.start();
})


async function run() {
    const response = await mainFlow({message: 'Please get the names of all my github repositories.'})
    console.log(response)
}

run()
