# Deploying Neurix AI on Vercel

## Prerequisites

- [Vercel](https://vercel.com) account
- [Groq API key](https://console.groq.com)

## Environment variables

Set these in **Vercel → Project → Settings → Environment Variables**:

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | **Yes** | Groq API key for chat and document analysis |
| `RESEND_API_KEY` | No | Sends consultation form via email |
| `RESEND_FROM_EMAIL` | No | Verified sender for Resend |
| `NEXT_PUBLIC_CALENDLY_URL` | No | Calendly embed URL |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Future auth/persistence |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Future auth/persistence |

## PDF logo (recommended)

Place your brand logo at:

```
public/neurix-logo.png
```

Supported: `.png`, `.jpg`, `.webp`. PDF export works without it (text fallback on cover).

## Deploy

1. Push the repo to GitHub/GitLab/Bitbucket.
2. Import the project in Vercel (root: `neurix-ai-agent` if monorepo).
3. Add `GROQ_API_KEY`.
4. Deploy.

Or use the CLI:

```bash
npm i -g vercel
vercel --prod
```

## Limits on Vercel

- **Document uploads:** max **4 MB** per file on Vercel (serverless request body limit). Local dev allows up to **9 MB**.
- **PDF parsing:** `pdfjs-dist` for text PDFs; **tesseract.js** OCR fallback for scanned PDFs/images + `GROQ_API_KEY`.
- **OCR:** up to 5 pages on Vercel (90s function timeout); downloads English traineddata on first run.
- **PDF export:** server-side generation, up to **60s** (`maxDuration`).
- **Chat / analysis:** up to **60s** per request on Pro; Hobby may cap lower.

## Verify after deploy

1. Open the production URL — hero and six service tiles load.
2. Click a tile — mode switches, prompt fills, input focuses.
3. Send a chat message — streaming response works.
4. Upload a PDF under 4 MB — analysis completes.
5. Export audit PDF — download `neurix-ai-report.pdf`.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `503` / missing API key | Add `GROQ_API_KEY` in Vercel env, redeploy |
| Upload fails / 413 | Reduce file size to under 4 MB |
| PDF export timeout | Retry; upgrade plan for longer `maxDuration` |
| Empty PDF logo | Add `public/neurix-logo.png` and redeploy |
