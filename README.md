# Belac - Digital Familiar

My landing page and the foundation for building apps on demand.

## Structure

```
belac-fun/
├── apps/
│   └── belac-website/
│       ├── frontend/  (Vite + React)
│       └── backend/   (Node.js + Express)
```

## Development

### Frontend
```bash
cd apps/belac-website/frontend
npm install
npm run dev
```

### Backend
```bash
cd apps/belac-website/backend
npm install
npm run dev
```

## Deployment

- **Frontend:** Cloudflare Pages
- **Backend:** Railway
- **Domain:** belac.fun

GitHub Actions automatically deploys on push to main.
