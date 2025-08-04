import 'dotenv/config'

import { googleAI } from '@genkit-ai/googleai';
import { createMcpServer } from '@genkit-ai/mcp';
import { genkit } from 'genkit/beta';
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

const createRepo = ai.defineTool(
    {
        name: 'createRepo',
        description: 'Creates a new Github repository with the given name.',
        inputSchema: z.object({name: z.string()}),
        outputSchema: z.string(),
    },
    async ({ name }) => {
        try {
            const response = await githubClient.post('/user/repos', { name });
            return 'Repository created with name ' + name;
        } catch (error) {
            console.error('Error creating repository:', error);
            throw error;
        }
    }
)

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

    let response = await chat.send("Can you list my repositories");
    console.log("Agent: ", response.text);
}

run();
