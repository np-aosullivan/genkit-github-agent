# GitHub Genkit Agent

This is a sample project demonstrating how to build a simple AI agent using [Genkit](https://firebase.google.com/docs/genkit). The agent connects to the GitHub API to retrieve information about a user's repositories based on natural language prompts.

## Features

- **Genkit Integration**: Built with the Genkit framework for robust AI flow and tool management.
- **GitHub API Tool**: Includes a Genkit tool that makes authenticated calls to the GitHub API to list a user's repositories.
- **Natural Language Understanding**: Uses a Google Gemini model to interpret user requests and decide when to use the GitHub tool.
- **Local Testing**: Can be run directly via Node.js or explored through the Genkit Developer UI.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm, yarn, or pnpm

You will also need:
- A **GitHub Personal Access Token (PAT)**
- A **Gemini API Key**

### Creating a GitHub Personal Access Token

1.  Go to your [GitHub Developer Settings](https://github.com/settings/tokens).
2.  Click **Generate new token** (fine-grained).
3.  Give your token a name.
4.  For **Repository** access, choose **All Repositories**.
5.  Under **Permissions**, make sure the **Repositoreies** header is selected and click **Add Permissions**. 
6.  Select the **Actions** permission, this is required to allow the agent to access your private and public repositories.
7.  Click **Generate** and copy the token. You will not be able to see it again.

### Creating a Gemini API Key

1.  Go to Google AI Studio.
2.  Sign in with your Google account if you haven't already.
3.  Click **Create API key in new project**.
4.  Copy the generated API key.

## Getting Started

Follow these steps to get the project up and running on your local machine.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd github-genkit-agent
```

### 2. Install Dependencies

Install the necessary Node.js packages.

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root of the project directory:

```bash
touch .env
```

Open the `.env` file and add your GitHub Personal Access Token that you created earlier.

```env
# .env
GITHUB_TOKEN=YourGitHubPersonalAccessTokenHere
GEMINI_API_KEY=YourGeminiApiKeyHere
```

## Usage

There are two primary ways to run and interact with this agent.

### 1. Run the Flow Directly

The `src/index.ts` file includes a `run()` function that executes the `mainFlow` with a sample prompt. This is useful for quick testing from the command line.

You can execute it using `ts-node`:

```bash
npx ts-node src/index.ts
```

The script will call the flow with the message "Please get the names of all my github repositories" and print the AI's response to the console.

### 2. Use the Genkit Developer UI

The Genkit Developer UI provides a rich interface for inspecting, running, and debugging your flows and tools.

To start the UI, run:

```bash
genkit start
```

Now, open your web browser and navigate to **http://localhost:4000**. From the UI, you can:
- Select `mainFlow`.
- Enter a message in the "message" input field (e.g., "list my repos").
- Click "Run" to see the flow execute, including any tool calls and the final output.

## How It Works

- **`src/index.ts`**: This is the main entry point of the application. It initializes Genkit, the Google AI plugin, and the Axios client for GitHub.
- **`ai.defineTool('listUsersRepos')`**: This function defines a tool that Genkit can use. It makes an authenticated GET request to the GitHub `/user/repos` endpoint and returns an array of repository names.
- **`ai.prompt('githubPrompt')`**: This loads the prompt from `/prompt/githubPrompt.prompt` (not shown). This prompt file instructs the Gemini model on its task and makes it aware of the `listUsersRepos` tool.
- **`ai.defineFlow('mainFlow')`**: This is the primary flow. It receives a user's message, passes it to the `githubPrompt`, and allows the model to decide whether to call the `listUsersRepos` tool to answer the request.
- **`createMcpServer`**: This sets up the server that hosts the Genkit Developer UI, allowing you to interact with your defined flows and tools.
