# IZI Health Deployment Guide

This project runs as three deployed services:

- Frontend: React/Vite static site
- Backend: Node/Express API
- ML service: FastAPI prediction and chatbot API

## Required Environment Variables

### Frontend

```env
VITE_API_URL=https://izi-health-backend.onrender.com
```

Vite reads this at build time, so redeploy the frontend after changing it.

### Backend

```env
DATABASE_URL=postgresql://...
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_URL=https://izi-health.onrender.com
ML_SERVICE_URL=https://izi-health-ml.onrender.com
CHATBOT_TIMEOUT_MS=15000
ADMIN_EMAIL=admin@izihealth.rw
ADMIN_PASSWORD=replace-before-production
ADMIN_NAME=IZI Health Admin
```

### ML Service

No secrets are required for the current local-model setup. The service expects
the `models/` and `data/` files to be present in the deployed source.

## Render Commands

### Frontend

Root directory:

```txt
izi-health/frontend
```

Build command:

```bash
npm install && npm run build
```

Publish directory:

```txt
dist
```

### Backend

Root directory:

```txt
izi-health/backend
```

Build command:

```bash
npm install && npm run migrate:deploy
```

Start command:

```bash
npm start
```

If the production database already has tables that were created before Prisma
migrations were added, baseline the existing database once before using
`migrate:deploy`:

```bash
npx prisma migrate resolve --applied 20260722000000_init
```

Use that only for an existing database that already matches the schema. Fresh
databases should run `npm run migrate:deploy` normally.

Create or update the admin account after migrations:

```bash
npm run seed:admin
```

### ML Service

Root directory:

```txt
izi-health/ml-service
```

Build command:

```bash
pip install -r requirements.txt
```

Start command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

## Health Checks

Backend:

```txt
https://izi-health-backend.onrender.com/api/health
https://izi-health-backend.onrender.com/api/db-health
```

ML service:

```txt
https://izi-health-ml.onrender.com/health
```

Frontend:

```txt
https://izi-health.onrender.com
```

## Common Deployment Issues

- If frontend calls show `undefined/api/...`, `VITE_API_URL` was missing during the frontend build.
- If login works locally but not on Render, confirm `DATABASE_URL` and migrations are correct.
- If chatbot responses are slow, the ML service is probably cold-starting or loading Sentence-BERT.
- If browser requests are blocked, set `FRONTEND_URL` on the backend to the exact frontend origin.
