# AML Service

AI-powered sanctions screening service using an agentic approach with OpenAI and Effect.

## Overview

The AML Service provides comprehensive sanctions screening for entities (individuals and organizations) using an AI agent powered by OpenAI. The agent intelligently searches across multiple sanction lists including:

- **OFAC (Office of Foreign Assets Control)** - US Treasury sanctions including SDN list
- **EU Sanctions** - European Union consolidated sanctions list
- **UN Sanctions** - United Nations Security Council sanctions

## Features

- **Agentic Approach**: Uses @effect/ai to create an intelligent agent that autonomously decides which sanction lists to search and how to interpret results
- **Multi-Source Screening**: Comprehensively searches across OFAC, EU, and UN sanctions lists
- **Smart Matching**: Detects exact matches, partial matches, and aliases
- **Confidence Scoring**: Provides confidence levels (0.0 - 1.0) for each screening result
- **Actionable Recommendations**: Offers compliance officers clear next steps
- **Batch Processing**: Check multiple entities in a single request
- **REST API**: Easy integration with other services
- **CLI Tool**: Command-line interface for quick checks

## Architecture

Built with **Effect** for type-safe, functional programming:

- **Effect**: Composable, type-safe error handling and resource management
- **@effect/platform**: Effect's platform-agnostic HTTP server
- **@effect/platform-node**: Node.js runtime for Effect platform
- **@effect/ai**: Agentic AI framework for building intelligent agents
- **@effect/ai-openai**: OpenAI integration for @effect/ai
- **OpenAI**: GPT-4 for intelligent decision making

## Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure your OpenAI API key
# Edit .env and add your OPENAI_API_KEY
```

## Environment Variables

Create a `.env` file with the following variables:

```bash
# OpenAI Configuration (Required)
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.1

# Server Configuration (Optional)
PORT=3001
HOST=0.0.0.0
```

## Usage

### Start the HTTP Server

```bash
# Build the project
npm run build

# Start the server
npm start
```

The server will start on `http://localhost:3001` by default.

### API Endpoints

#### 1. Health Check

```bash
GET /api/sanction/health
```

Response:
```json
{
  "status": "healthy",
  "service": "aml-service",
  "timestamp": "2025-11-02T10:30:00.000Z"
}
```

#### 2. Check Single Entity

```bash
POST /api/sanction/check
Content-Type: application/json

{
  "entityName": "ABC Holdings"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "entityName": "ABC Holdings",
    "isSanctioned": true,
    "confidence": 0.95,
    "matchedLists": [
      "OFAC SDN List"
    ],
    "reasoning": "Exact match found on OFAC SDN List. Entity 'ABC Holdings' is listed under SDN with aliases 'ABC Corp' and 'ABC Ltd' for terrorism financing.",
    "recommendations": [
      "Do not process any transactions with this entity",
      "Report to compliance team immediately",
      "Document all findings in compliance management system"
    ],
    "checkedAt": "2025-11-02T10:30:00.000Z"
  }
}
```

#### 3. Batch Check Multiple Entities

```bash
POST /api/sanction/check/batch
Content-Type: application/json

{
  "entities": [
    "ABC Holdings",
    "XYZ Corporation",
    "Safe Company Inc"
  ]
}
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "entityName": "ABC Holdings",
      "isSanctioned": true,
      "confidence": 0.95,
      "matchedLists": ["OFAC SDN List"],
      "reasoning": "...",
      "recommendations": ["..."],
      "checkedAt": "2025-11-02T10:30:00.000Z"
    },
    {
      "entityName": "XYZ Corporation",
      "isSanctioned": false,
      "confidence": 0.98,
      "matchedLists": [],
      "reasoning": "...",
      "recommendations": ["..."],
      "checkedAt": "2025-11-02T10:30:00.000Z"
    }
  ],
  "summary": {
    "total": 3,
    "sanctioned": 1,
    "cleared": 2
  }
}
```

### CLI Tool

Check a single entity from the command line:

```bash
# Build first
npm run build

# Check an entity
npm run check:entity -- "ABC Holdings"
```

Output:
```
🔍 Checking sanctions for: "ABC Holdings"

⏳ Running comprehensive sanctions screening...

═══════════════════════════════════════════════════════
                 SANCTION CHECK RESULT
═══════════════════════════════════════════════════════
Entity Name:        ABC Holdings
Status:             ⚠️  SANCTIONED
Confidence:         95.0%
Checked At:         2025-11-02T10:30:00.000Z
───────────────────────────────────────────────────────

📋 Matched Lists (1):
   1. OFAC SDN List

💭 Reasoning:
Exact match found on OFAC SDN List...

📝 Recommendations (3):
   1. Do not process any transactions with this entity
   2. Report to compliance team immediately
   3. Document all findings in compliance management system

═══════════════════════════════════════════════════════
```

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Type check
npm run typecheck

# Lint code
npm run lint
```

## How It Works

### Agentic Approach

The service uses an AI agent that:

1. **Analyzes the request**: Understands the entity name and context
2. **Plans the search**: Decides which sanction lists to query
3. **Executes tools**: Calls search tools for OFAC, EU, and UN lists
4. **Evaluates results**: Analyzes matches for quality and relevance
5. **Provides assessment**: Returns a structured response with confidence scoring

### Tools Available to the Agent

1. **searchOFACSanctions**: Search OFAC/SDN sanctions list
2. **searchEUSanctions**: Search EU consolidated sanctions list
3. **searchUNSanctions**: Search UN Security Council sanctions list

The agent can call multiple tools and make up to 5 steps to thoroughly investigate an entity.

### System Prompt

The agent is configured with expert knowledge in AML compliance and follows strict guidelines to:
- Be thorough and conservative
- Check all available sources
- Provide detailed reasoning
- Offer actionable recommendations

## Integration Examples

### Node.js/TypeScript

```typescript
async function checkEntity(entityName: string) {
  const response = await fetch('http://localhost:3001/api/sanction/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ entityName }),
  });

  const result = await response.json();
  return result.data;
}

// Usage
const result = await checkEntity('ABC Holdings');
if (result.isSanctioned) {
  console.log('⚠️ Entity is sanctioned!');
  console.log('Matched lists:', result.matchedLists);
}
```

### cURL

```bash
curl -X POST http://localhost:3001/api/sanction/check \
  -H "Content-Type: application/json" \
  -d '{"entityName": "ABC Holdings"}'
```

## Production Considerations

### Current Implementation

The service currently uses **mock sanction data** for demonstration purposes. In production, you should:

1. **Integrate Real Data Sources**:
   - Connect to official OFAC API
   - Subscribe to EU sanctions XML feeds
   - Access UN sanctions API

2. **Add Caching**:
   - Cache sanction lists locally
   - Update periodically (daily/weekly)
   - Reduce API calls and latency

3. **Database Integration**:
   - Store screening results for audit trail
   - Track entity screening history
   - Support compliance reporting

4. **Enhanced Security**:
   - Add authentication/authorization
   - Rate limiting
   - API key management

### Replacing Mock Data

Update the tool implementations in `src/services/sanction.service.ts:95-101`:

```typescript
// Example: Real OFAC API integration
const searchOFACSanctionsTool = AiToolkit.toolDef({
  name: "searchOFACSanctions",
  // ... config
  run: ({ entityName }) =>
    Effect.gen(function* () {
      // Call actual OFAC API
      const response = yield* Effect.tryPromise(() =>
        fetch(`https://api.ofac.treasury.gov/search?name=${entityName}`)
      );
      const data = yield* Effect.tryPromise(() => response.json());

      // Parse and return results
      return parseOFACResults(data);
    }),
});
```

## Troubleshooting

### OpenAI API Errors

```
Error: Invalid API key
```
- Verify your `OPENAI_API_KEY` in `.env`
- Ensure you have credits in your OpenAI account

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3001
```
- Change `PORT` in `.env` to a different port
- Or stop the process using port 3001

### TypeScript Errors

```
npm run typecheck
```
- Run type checking to see detailed errors
- Ensure all dependencies are installed

## License

MIT

## Contributing

Contributions welcome! Please follow the existing code patterns using Effect.
