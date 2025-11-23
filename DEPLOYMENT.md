# Safro Deployment

This project is configured for deployment to:
- **Backend Services**: Render
- **Frontend**: Vercel

## Quick Deploy

### 1. Push to GitHub
```bash
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/Safro.git
git push -u origin main
```

### 2. Deploy Backend (Render)
- Go to render.com
- New → Blueprint
- Connect repo (auto-detects `render.yaml`)
- Add `OPENAI_API_KEY` environment variable

### 3. Deploy Frontend (Vercel)
- Go to vercel.com
- Import repo
- Root directory: `frontend`
- Add environment variables:
  - `NEXT_PUBLIC_API_GATEWAY_URL`
  - `NEXT_PUBLIC_AI_GATEWAY_URL`

See [walkthrough.md](file:///home/kaftandev/.gemini/antigravity/brain/0062eb21-8586-4d20-ad2a-4eb3072798a3/walkthrough.md) for detailed instructions.

## Configuration Files

- `render.yaml` - Render deployment config
- `frontend/next.config.ts` - Next.js config for Vercel
- `frontend/vercel.json` - Vercel config (optional)

## Architecture

```
Frontend (Vercel)
    ↓
API Gateway (Render) → PostgreSQL (Render)
    ↓
AI Gateway (Render) → OpenAI API
    ↓
ICP Canisters (Internet Computer)
```
