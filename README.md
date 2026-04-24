# JSI Portfolio

Personal portfolio built with React + Vite, including a portfolio chatbot that can adapt to mixed language, messy input, and route requests between Groq and Gemini on the backend.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create local environment file by copying `.env.example` to `.env.local`.

3. Set your API keys in `.env.local`:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
GEMINI_MODEL=gemini-2.5-flash
GROQ_MODEL=llama-3.3-70b-versatile
ALLOWED_ORIGIN=http://localhost:5173,http://localhost:3000
ASSET_SIGNING_SECRET=replace_with_a_long_random_secret
GMAIL_SMTP_USER=yourgmail@gmail.com
GMAIL_SMTP_APP_PASSWORD=your_gmail_app_password
CONTACT_TO_EMAIL=your_inbox@example.com
```

`GROQ_API_KEY` is recommended so the chat route can choose between both providers. If only one provider key is present, the backend falls back to the available provider automatically. `GEMINI_MODEL` and `GROQ_MODEL` are optional overrides if you change providers or model versions.

4. Run development server:

```bash
npm run dev
```

This runs full-stack local development with backend API routes (chat + protected assets).

It starts:
- Vite frontend at `http://localhost:5173`
- Local API server at `http://localhost:8787`

If you only need frontend-only Vite dev (no backend API routes):

```bash
npm run dev:vite
```

Optional (requires Vercel login):

```bash
npm run dev:vercel
```

## Vercel deployment

Add this environment variable in Vercel Dashboard:

- `GEMINI_API_KEY`
- `GROQ_API_KEY`
- `GEMINI_MODEL` (optional)
- `GROQ_MODEL` (optional)
- `ALLOWED_ORIGIN` (your production origin, e.g. `https://your-domain.vercel.app`)
- `ASSET_SIGNING_SECRET` (long random value for signed image URLs)
- `GMAIL_SMTP_USER` (the Gmail account used to send form emails)
- `GMAIL_SMTP_APP_PASSWORD` (16-character Google app password)
- `CONTACT_TO_EMAIL` (where portfolio form messages should be delivered)

Do not place the API key in frontend code.

## Security controls implemented

- Secrets are read only in `api/chat.js` from server environment variables.
- Contact form submissions are delivered server-side via `api/contact.js`.
- Contact emails are sent through Gmail SMTP using app-password auth.
- Frontend calls only `/api/chat`; no direct external AI API call from client code.
- API route enforces `POST` + JSON payload validation.
- API routes reject missing/invalid origin in production and block unsafe cross-site request contexts.
- Inputs are sanitized and length-limited before provider requests.
- In-memory rate limiting is enabled per client IP.
- Request body size limits are enforced at API route level.
- Prompt-injection style requests are rejected with a safe fallback response.
- Chatbot is scoped to portfolio-related topics only.
- Server errors returned to clients are generic and do not expose provider internals or secret names.
- Sensitive profile/certificate/project images are served through signed backend URLs (`/api/asset-token` and `/api/secure-asset`).
- Signed asset requests are validated with strict token/query length checks and restrictive response headers.
- Strict response headers are applied via `vercel.json` (CSP, frame blocking, MIME sniffing protection, and transport hardening).

## Secret handling policy

- Never commit `.env`, `.env.local`, or credential files.
- Keep `.env.example` as placeholders only.
- Configure real secrets in Vercel Project Settings > Environment Variables.
- Rotate API keys immediately if a leak is suspected.
- Rotate app passwords immediately if a leak is suspected.

## Secret incident response

If secrets were ever committed or shared, treat them as compromised:

- Rotate `GEMINI_API_KEY` immediately.
- Revoke and re-create `GMAIL_SMTP_APP_PASSWORD` immediately.
- Replace `ASSET_SIGNING_SECRET` with a new high-entropy value.
- Confirm updated values are set only in host environment variable settings.

## Pre-deploy security checks

Run these before each release:

```bash
npm run lint
npm run build
npm run test:chat
```

If this project is inside a Git repository, also run:

```bash
git grep -nEi "gemini_api_key|api[_-]?key|secret|token|password|sk-"
git log -p --all -- .env .env.local
```

## Chatbot behavior

- Backend route: `api/chat.js`
- Smoke test: `npm run test:chat`
- Session memory: frontend sends prior chat history with each request
- Language handling: English, Tagalog, and Taglish responses based on user style
- Input handling: vague, messy, slang-heavy, and incomplete portfolio questions are interpreted before answering
- Tone adaptation: friendly, casual, confused, frustrated, excited, formal, or neutral tone matching
- Internal model routing: shorter conversational requests prefer Groq, longer reasoning-heavy requests prefer Gemini, with automatic fallback when only one key is configured
- Out-of-scope behavior: unrelated requests are refused with the same safe fallback message
- Out-of-scope fallback message:

```text
I can only answer questions related to my portfolio.
```

`npm run test:chat` calls the backend handler directly with representative conversational and reasoning-heavy prompts, so you can verify the chat route without starting the local API server first.
