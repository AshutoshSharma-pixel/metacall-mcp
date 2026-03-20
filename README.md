# MetaCall MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that exposes MetaCall FaaS operations as AI-callable tools, letting LLMs like Claude manage your MetaCall deployments directly.

## What this POC does

This server wraps three MetaCall API endpoints as MCP tools:

| Tool | Description | Underlying API |
|---|---|---|
| `list_deployments` | Lists all active FaaS deployments on your account | `GET /api/deploy/list` |
| `call_function` | Calls a deployed function by name with arguments | `POST /api/call` |
| `deploy_from_repo` | Deploys a Git repository to MetaCall FaaS | `POST /api/repository/add` |

## Prerequisites

- Node.js ≥ 18
- A [MetaCall account](https://dashboard.metacall.io) with an API token

## Setup

```bash
npm install
```

## Configuration

Export your MetaCall API token as an environment variable before running:

```bash
export METACALL_TOKEN=your_token_here
```

You can find your token in the [MetaCall Dashboard](https://dashboard.metacall.io) under **Settings → API Tokens**.

## Running

```bash
npm run start
```

On success you'll see on stderr:
```
MetaCall MCP Server running...
```

The server communicates over **stdio**, so Claude Desktop connects to it as a subprocess.

## Connecting to Claude Desktop

Add the following to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "metacall": {
      "command": "npm",
      "args": ["run", "start"],
      "cwd": "/path/to/metacall-mcp",
      "env": {
        "METACALL_TOKEN": "your_token_here"
      }
    }
  }
}
```

Restart Claude Desktop and you'll see the MetaCall tools available in the tools panel.

## Tool Reference

### `list_deployments`
No parameters. Returns a JSON array of all deployments on your account.

### `call_function`
| Parameter | Type | Description |
|---|---|---|
| `suffix` | string | Deployment path/suffix (e.g. `"my-app"`) |
| `name` | string | Function name to call |
| `args` | array | Arguments to pass to the function |

### `deploy_from_repo`
| Parameter | Type | Description |
|---|---|---|
| `url` | string | Git repository URL |
| `plan` | string? | `essential` \| `standard` \| `professional` (default: `essential`) |

## Building

```bash
npm run build
# Output goes to ./dist/
```
