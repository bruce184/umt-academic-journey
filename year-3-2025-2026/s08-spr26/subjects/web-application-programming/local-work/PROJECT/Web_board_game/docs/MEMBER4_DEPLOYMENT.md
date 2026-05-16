# Member 4 Deployment Notes

## Target Stack
- Frontend: Vercel
- Backend: Render
- Database: Supabase

## Branch Strategy
- Staging branch: `integration/merge-member-branches`
- Production branch after smoke pass: `main`

Do not merge into `main` until the staging HTTPS build passes the full smoke checklist.

## Repo Files Used For Deploy
- [render.yaml](../render.yaml)
- [frontend/vercel.json](../frontend/vercel.json)

## Backend Env On Render
- `DATABASE_URL`
- `NODE_ENV=production`
- `JWT_SECRET`
- `API_KEY`
- `APP_ORIGIN`
- `BACKEND_PUBLIC_URL`
- `EMAIL_USER`
- `EMAIL_PASS`

Meaning:
- `APP_ORIGIN` = frontend public URL on Vercel
- `BACKEND_PUBLIC_URL` = backend public URL on Render

## Frontend Env On Vercel
- `VITE_API_BASE_URL`
- `VITE_ADMIN_API_KEY`

Meaning:
- `VITE_API_BASE_URL` = Render backend HTTPS URL
- `VITE_ADMIN_API_KEY` = same value as backend `API_KEY`

## Render Setup
- Service type: Web Service
- Branch: `integration/merge-member-branches`
- Root directory: repo root
- Runtime: Node
- Region: Singapore
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/health`

## Vercel Setup
- Project root: `frontend`
- Framework preset: Vite
- Branch: `integration/merge-member-branches`
- Build command: `npm run build`
- Output directory: `dist`

## Database Setup
Run from a machine that already has the correct deploy `DATABASE_URL`:

```powershell
npx knex migrate:latest
npx knex seed:run
```

Do not run seed automatically on every deploy. Only run it when preparing or resetting demo data.

## Staging Smoke Checklist

### Backend
- `GET /health` returns `200`
- `/api-docs` returns `401` without `x-api-key`
- `/api-docs` returns `200` with admin JWT + valid `x-api-key`

### Frontend
- Deep links open directly:
  - `/hub`
  - `/rankings`
  - `/games/:id`
  - `/profile`
  - `/admin/users`
- Login works for admin and user
- Register sends a real verify email
- Reset password sends a real email
- Save/load works for at least one game
- Review submit/update works
- Rankings work for `global`, `friends`, and `me`
- Admin can update a user
- Admin can update game timer or board size

### Cross-Origin And URLs
- Browser requests from the Vercel URL are accepted by backend CORS
- Email verify/reset links open the Vercel frontend, not localhost
- OpenAPI JSON shows `BACKEND_PUBLIC_URL`, not frontend URL

## Production Release
After staging passes:

1. Merge `integration/merge-member-branches` into `main`
2. Point Vercel and Render production deploys to `main`
3. Redeploy
4. Update `APP_ORIGIN` and `BACKEND_PUBLIC_URL` if production URLs changed
5. Run the short production smoke:
   - login
   - one save/load flow
   - one review flow
   - admin docs
   - register/reset email

## Current Limitation
The repo is deploy-ready, but actual cloud deployment still requires authenticated access to the Vercel and Render accounts from the operator machine.
