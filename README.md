# Open5e Developer Chatbot

A RAG-powered chatbot for developers working with the [Open5e](https://open5e.com) ecosystem. Ask questions about the Django REST API backend and Nuxt.js frontend source code with live GitHub source citations.

## Live Demo

- **Chat UI**: https://mnehmos.github.io/mnehmos.open5e.rag.website/
- **API Endpoint**: https://open5e-rag-chatbot-production.up.railway.app

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      GitHub Pages                                │
│                   (Astro Static Site)                           │
│         https://mnehmos.github.io/mnehmos.open5e.rag.website    │
└─────────────────────────────┬───────────────────────────────────┘
                              │ POST /chat
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Railway                                   │
│              (Node.js RAG Server + HTTP API)                    │
│        https://open5e-rag-chatbot-production.up.railway.app     │
│                              │                                   │
│  ┌───────────────┐  ┌────────┴────────┐  ┌──────────────────┐  │
│  │ Vector Search │  │ OpenRouter LLM  │  │ Source Citations │  │
│  │ (484 chunks)  │  │ (OSS 120B)      │  │ (GitHub URLs)    │  │
│  └───────────────┘  └─────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Indexed Sources

| Repository | Description | Files Indexed |
|------------|-------------|---------------|
| [open5e-api](https://github.com/open5e/open5e-api) | Django REST API backend | Models, Views, Serializers, Tests |
| [open5e](https://github.com/open5e/open5e) | Nuxt.js frontend | Pages, Components, Composables |

### Index Stats

| Metric | Count |
|--------|-------|
| Total Sources | 214 |
| Text Chunks | 484 |
| Vector Embeddings | 484 |
| Embedding Model | text-embedding-3-large |

## Features

- **Hybrid Search**: Combines keyword matching with semantic vector search
- **Anchor Term Detection**: Prioritizes exact matches for identifiers (room codes, class names)
- **Live Source Citations**: Every answer links directly to GitHub source files
- **Streaming Responses**: Real-time token streaming via Server-Sent Events
- **OpenRouter Integration**: Uses OSS 120B model via OpenRouter API

## Project Structure

```
mnehmos.open5e.rag.website/
├── src/
│   └── index.ts          # Express server with RAG + LLM endpoints
├── data/
│   ├── chunks.jsonl      # Indexed text chunks
│   └── vectors.jsonl     # Vector embeddings
├── website/              # Astro static site (GitHub Pages)
│   └── src/
│       └── components/
│           └── ChatInterface.astro
├── sources.jsonl         # Source registry with GitHub URLs
├── project.json          # IndexFoundry project manifest
├── Dockerfile            # Production container
└── railway.toml          # Railway deployment config
```

## Local Development

### Prerequisites

- Node.js 18+
- OpenRouter API key (or OpenAI API key)

### Setup

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Set environment variable
export OPENROUTER_API_KEY=your_key_here

# Start server
npm start
```

Server runs at `http://localhost:8080`

### Website Development

```bash
cd website
npm install
npm run dev
```

Website runs at `http://localhost:4321`

## API Endpoints

### Health Check
```bash
curl https://open5e-rag-chatbot-production.up.railway.app/health
```

Response:
```json
{
  "status": "ok",
  "project": "Open5e Developer RAG Server",
  "chunks": 484,
  "vectors": 484,
  "sources": 214,
  "uptime": 123
}
```

### Chat (RAG + LLM)
```bash
curl -X POST https://open5e-rag-chatbot-production.up.railway.app/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "How does the Monster model work?"}'
```

Returns Server-Sent Events stream:
```
data: {"type":"sources","sources":[...]}

data: {"type":"delta","text":"The"}

data: {"type":"delta","text":" Monster"}

data: {"type":"done"}
```

### Search Only (No LLM)
```bash
curl -X POST https://open5e-rag-chatbot-production.up.railway.app/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Monster model", "mode": "hybrid", "top_k": 10}'
```

### List Sources
```bash
curl https://open5e-rag-chatbot-production.up.railway.app/sources
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | HTTP server port (default: 8080) |
| `OPENROUTER_API_KEY` | Yes* | OpenRouter API key for chat endpoint |
| `OPENAI_API_KEY` | Yes* | OpenAI API key (fallback if no OpenRouter key) |
| `OPENAI_MODEL` | No | Model override (default: openai/gpt-oss-120b for OpenRouter) |

*One of `OPENROUTER_API_KEY` or `OPENAI_API_KEY` is required for the `/chat` endpoint.

## Deployment

### Railway (Production)

The project is deployed to Railway via CLI:

```bash
# Link to project (first time only)
railway link

# Deploy
railway up --service open5e-rag-chatbot

# Set environment variables
railway variables --service open5e-rag-chatbot \
  --set "OPENROUTER_API_KEY=your_key"
```

### GitHub Pages (Frontend)

The static website is deployed via GitHub Actions on push to `master`:

```bash
cd website
npm run build
# Deployed automatically via .github/workflows/deploy.yml
```

## MCP Integration

This server also exposes MCP (Model Context Protocol) tools for use with Claude and other MCP clients:

```json
{
  "mcpServers": {
    "open5e-rag": {
      "command": "node",
      "args": ["path/to/dist/index.js"]
    }
  }
}
```

### Available MCP Tools

- `search` - RAG search across Open5e source code
- `get_chunk` - Retrieve a specific chunk by ID
- `list_sources` - List all indexed sources
- `stats` - Get index statistics

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Frontend**: Astro, TypeScript
- **Vector Search**: In-memory cosine similarity
- **Embeddings**: OpenAI text-embedding-3-large
- **LLM**: OpenRouter (OSS 120B model)
- **Hosting**: Railway (API), GitHub Pages (UI)
- **Indexing**: [IndexFoundry](https://github.com/Mnehmos/mnehmos.index-foundry.mcp)

## License

MIT

---

*Built with [IndexFoundry](https://github.com/Mnehmos/mnehmos.index-foundry.mcp) - RAG pipeline toolkit*
