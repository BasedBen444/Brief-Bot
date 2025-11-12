# Brief-Bot

BriefBot is a lightweight web app that simulates how calendar-triggered briefs are generated for upcoming meetings. It combines a TypeScript Express backend with a React + Vite frontend to showcase the end-to-end flow described in the product specification.

## Features

- **Calendar-aware playground** – Fill in meeting metadata, invite description, and linked materials to preview the generated brief.
- **Auto-structured brief** – The backend applies deterministic parsing to create the JSON schema and one-pager layout described in the system prompt.
- **Audience-sensitive context** – Context bullets are automatically compressed for exec audiences.
- **RAG-ready architecture** – Materials are treated as vector search results so the brief focuses on relevant snippets.

## Tech stack

- React 18 + TypeScript + Vite
- Express.js + TypeScript
- React Query for client-side mutations
- Zod validation on the API

## Getting started

```bash
npm install
npm run dev
```

The command above installs dependencies for both the frontend and backend, then runs them concurrently on:

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## API

`POST /api/brief`

Request body:

```json
{
  "event": {
    "title": "string",
    "datetime": "ISO-8601",
    "attendees": ["string"],
    "audience": "exec|ic|mixed",
    "description": "string"
  },
  "materials": [
    {
      "title": "string",
      "url": "string",
      "content": "string",
      "lastModified": "ISO-8601",
      "isLatestVersion": true
    }
  ]
}
```

Response body:

```json
{
  "brief": { "...": "See specification" },
  "onePager": "markdown"
}
```

The backend uses heuristics to extract options, risks, decisions, and actions from the invite text and linked material summaries.

## Future integrations

- Replace heuristics with an LLM call using the provided system prompt for higher-fidelity summaries.
- Connect to Google or Microsoft calendar + docs APIs to ingest real events and attachments.
- Persist briefs, actions, and analytics to a database for follow-up nudges.
