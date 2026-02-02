# Deployment Guide for belac.fun

## Current Status

✅ Code committed to GitHub: https://github.com/BELACAI/belac-fun

## What's Left

### 1. Cloudflare Pages (Frontend)

Manual setup required (API token permissions issue):

1. Go to https://dash.cloudflare.com/
2. Pages → Create project
3. Connect GitHub: Select BELACAI/belac-fun
4. Build settings:
   - Build command: `cd apps/belac-website/frontend && npm install && npm run build`
   - Output directory: `apps/belac-website/frontend/dist`
5. Deploy

### 2. Railway (Backend)

1. Go to https://railway.app/
2. New Project → GitHub Repo → BELACAI/belac-fun
3. Add service: Node.js
4. Set start command: `npm start` from `apps/belac-website/backend`
5. Deploy

### 3. Domain Setup

After both are deployed:
1. In Cloudflare: Add DNS records pointing belac.fun to both services
2. Or update nameservers if belac.fun is managed elsewhere

## Environment Variables

### Cloudflare Pages
- No env vars needed for frontend

### Railway
- `PORT=3000` (already in Dockerfile)

## GitHub Actions

The workflow is set up in `.github/workflows/deploy.yml` but requires:
- Cloudflare API token with correct permissions
- Railway token with deployment permissions

Once manual setup is complete, future pushes will auto-deploy.
