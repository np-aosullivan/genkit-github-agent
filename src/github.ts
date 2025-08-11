import axios from 'axios';
import { ai } from './ai';
import { z } from 'zod';


const githubClient = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
    'Accept': 'application/json',
  },
});


export const listUsersRepos = ai.defineTool(
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

export const createRepo = ai.defineTool(
    {
        name: 'createRepo',
        description: 'Creates a new Github repository with the given name.',
        inputSchema: z.object({name: z.string()}),
        outputSchema: z.string(),
    },
    async ({ name }) => {
        try {
            const response = await githubClient.post('/user/repos', { name });
            return 'Repository created with name ' + response.data.name;
        } catch (error) {

            console.error('Error creating repository:', error);
            throw error;
        }
    }
)

export const deleteRepo = ai.defineTool(
    {
        name: 'deleteRepo',
        description: 'Deletes a Github repository with the given name.',
        inputSchema: z.object({name: z.string()}),
        outputSchema: z.string(),
    },
    async ({ name }) => {
        try {
            const response = await githubClient.get('/user');
            const owner = response.data.login;
            await githubClient.delete(`/repos/${owner}/${name}`);
            return `Repository ${name} deleted.`;
        } catch (error) {
            console.error('Error deleting repository:', error);
            throw error;
        }
    }
)