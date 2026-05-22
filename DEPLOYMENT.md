# Deploying Neurix AI on Vercel

## Prerequisites

- [Vercel](https://vercel.com) account
- [Groq API key](https://console.groq.com)

## Environment variables

Set these in **Vercel → Project → Settings → Environment Variables**:

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | **Yes** | Groq API key for chat and document analysis |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | **Yes** (feedback) | `service_f6im496` — enable for **Production** + **Preview** |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | **Yes** (feedback) | `template_kcy56eb` |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | **Yes** (feedback) | EmailJS public key (not private key) |
| `RESEND_API_KEY` | No | Consultation form email (Resend) |
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
6. Submit feedback — success toast; email arrives at neurix26@gmail.com.

## EmailJS (feedback form)

1. Add all three `NEXT_PUBLIC_EMAILJS_*` variables in Vercel (names must match exactly).
2. Check **Production** (and Preview if you test preview URLs).
3. **Redeploy** after adding or changing env vars (`NEXT_PUBLIC_*` are baked in at build time).
4. In [EmailJS](https://dashboard.emailjs.com/) → **Account** → **Security**, allow your domains:
   - `localhost`
   - `*.vercel.app`
   - your custom production domain (e.g. `your-app.com`)
5. Template `template_kcy56eb` must use variables: `{{email}}`, `{{message}}`, `{{category}}` and send **To:** `neurix26@gmail.com`.

If feedback fails in production, open the browser console and look for `[EmailJS]` logs (service ID, template ID, public key exists).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `503` / missing API key | Add `GROQ_API_KEY` in Vercel env, redeploy |
| Upload fails / 413 | Reduce file size to under 4 MB |
| PDF export timeout | Retry; upgrade plan for longer `maxDuration` |
| Empty PDF logo | Add `public/neurix-logo.png` and redeploy |
| Feedback works locally, fails on Vercel | Add `NEXT_PUBLIC_EMAILJS_*` in Vercel → enable Production → **Redeploy**. Whitelist domain in EmailJS Security |
| `[EmailJS] public key exists: false` | Env vars missing at build; set in Vercel and redeploy |
| EmailJS 403 / domain error | Add production URL in EmailJS Account → Security |
