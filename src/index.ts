import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import axios from 'axios';

const BASE_URL = 'https://api.metacall.io';
const TOKEN = process.env['METACALL_TOKEN'];

if (!TOKEN) {
    process.stderr.write('Error: METACALL_TOKEN environment variable is not set.\n');
    process.exit(1);
}

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
    },
});

const server = new McpServer({
    name: 'metacall-mcp',
    version: '1.0.0',
});

// ─── Tool 1: list_deployments ────────────────────────────────────────────────
server.tool(
    'list_deployments',
    'List all active deployments on your MetaCall FaaS account.',
    {},
    async () => {
        const response = await api.get('/api/deploy/list');
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(response.data, null, 2),
                },
            ],
        };
    }
);

// ─── Tool 2: call_function ───────────────────────────────────────────────────
server.tool(
    'call_function',
    'Call a deployed function on MetaCall FaaS.',
    {
        suffix: z.string().describe('The deployment suffix/path (e.g. "my-app")'),
        name: z.string().describe('The function name to call'),
        args: z.array(z.unknown()).describe('Array of arguments to pass to the function'),
    },
    async ({ suffix, name, args }) => {
        const response = await api.post('/api/call', { suffix, name, args });
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(response.data, null, 2),
                },
            ],
        };
    }
);

// ─── Tool 3: deploy_from_repo ────────────────────────────────────────────────
server.tool(
    'deploy_from_repo',
    'Deploy a repository to MetaCall FaaS from a Git URL.',
    {
        url: z.string().url().describe('The Git repository URL to deploy'),
        plan: z
            .enum(['essential', 'standard', 'professional'])
            .optional()
            .describe('The MetaCall plan to use (default: essential)'),
    },
    async ({ url, plan }) => {
        const response = await api.post('/api/repository/add', {
            url,
            plan: plan ?? 'essential',
        });
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(response.data, null, 2),
                },
            ],
        };
    }
);

// ─── Start ───────────────────────────────────────────────────────────────────
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    process.stderr.write('MetaCall MCP Server running...\n');
}

main().catch(err => {
    process.stderr.write(`Fatal error: ${String(err)}\n`);
    process.exit(1);
});
