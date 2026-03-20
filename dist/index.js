"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'https://api.metacall.io';
const TOKEN = process.env['METACALL_TOKEN'];
if (!TOKEN) {
    process.stderr.write('Error: METACALL_TOKEN environment variable is not set.\n');
    process.exit(1);
}
const api = axios_1.default.create({
    baseURL: BASE_URL,
    headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
    },
});
const server = new mcp_js_1.McpServer({
    name: 'metacall-mcp',
    version: '1.0.0',
});
// ─── Tool 1: list_deployments ────────────────────────────────────────────────
server.tool('list_deployments', 'List all active deployments on your MetaCall FaaS account.', {}, async () => {
    const response = await api.get('/api/deploy/list');
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(response.data, null, 2),
            },
        ],
    };
});
// ─── Tool 2: call_function ───────────────────────────────────────────────────
server.tool('call_function', 'Call a deployed function on MetaCall FaaS.', {
    suffix: zod_1.z.string().describe('The deployment suffix/path (e.g. "my-app")'),
    name: zod_1.z.string().describe('The function name to call'),
    args: zod_1.z.array(zod_1.z.unknown()).describe('Array of arguments to pass to the function'),
}, async ({ suffix, name, args }) => {
    const response = await api.post('/api/call', { suffix, name, args });
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(response.data, null, 2),
            },
        ],
    };
});
// ─── Tool 3: deploy_from_repo ────────────────────────────────────────────────
server.tool('deploy_from_repo', 'Deploy a repository to MetaCall FaaS from a Git URL.', {
    url: zod_1.z.string().url().describe('The Git repository URL to deploy'),
    plan: zod_1.z
        .enum(['essential', 'standard', 'professional'])
        .optional()
        .describe('The MetaCall plan to use (default: essential)'),
}, async ({ url, plan }) => {
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
});
// ─── Start ───────────────────────────────────────────────────────────────────
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    process.stderr.write('MetaCall MCP Server running...\n');
}
main().catch(err => {
    process.stderr.write(`Fatal error: ${String(err)}\n`);
    process.exit(1);
});
//# sourceMappingURL=index.js.map