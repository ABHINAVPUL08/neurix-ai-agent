# Neurix AI Agent

Premium AI business consultant — automation, SaaS, voice agents, OCR pipelines, and workflow design. Built with Next.js 16, OpenAI, and a dark Neurix UI.

## Local development

```bash
npm install
cp .env.example .env.local
# Add OPENAI_API_KEY and GROQ_API_KEY to .env.local
npm run dev
```

Open the app at the URL shown in the terminal (default `http://localhost:3000`).

## Production deploy (Vercel)

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for environment variables, upload limits, PDF export, and verification steps.

**Required:** `OPENAI_API_KEY` (chat) and `GROQ_API_KEY` (document analysis) in Vercel project settings.

**Recommended:** add `public/neurix-logo.png` for branded PDF reports.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production build locally |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## Features

- Multi-mode AI consultant (12 specialist modes)
- Interactive service tiles with auto-filled workflows
- Document upload & business audit analysis (PDF/DOCX/TXT, max 4 MB)
- Server-side PDF export (`neurix-ai-report.pdf`)
- Streaming chat via OpenAI
- Dashboard command center
- Consultation booking (Resend or mailto fallback)
