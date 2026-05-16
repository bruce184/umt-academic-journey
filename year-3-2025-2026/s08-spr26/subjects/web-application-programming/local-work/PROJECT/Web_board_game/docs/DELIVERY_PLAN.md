# Web Board Game Delivery Status

This document replaces the earlier "future plan" with the current status of the integrated branch.

## Target

Reach a submission-safe build for the course rubric:

- feature-complete locally
- demo-ready from `migrate + seed`
- documented env flow
- meaningful git history
- only deploy-specific items left open if hosting has not been completed yet

## Completed Areas

### Application Architecture
- React SPA with browser routes
- Express REST API
- Feature-based controllers, services, routes, and middleware
- Knex migrations and seeds
- Supabase-backed Postgres environment

### Client Experience
- Public auth flow: login, register, verify-register, reset-password, verify-reset
- Distinct client layout with navbar, board area, controls, player info, and footer
- Light/Dark mode
- Retro hub and matrix interaction
- Dedicated game route per game
- Rankings page with filters and pagination
- Review/rating UI inside game pages

### Games
- Tic-Tac-Toe
- Caro 5
- Caro 4
- Snake
- Match-3
- Memory
- Free Draw

Implemented across the game system:
- matrix rendering
- 5-button interaction
- save/load
- help/instructions
- score/result display
- timer where applicable
- admin-fed runtime config for board size and timer

### User Features
- Profile management
- User search
- Friend requests and friend list
- Messaging with pagination
- Achievements
- Rankings with `global`, `friends`, and `me`
- Ratings and comments

### Admin Features
- Dashboard
- User management
- Game management
- Statistics page
- Protected API docs page

### Data and Demo Readiness
- Deterministic seeds for users, profiles, friendships, requests, messages, achievements, sessions, ratings, saved games, and stats
- 6 users and 7 active games
- Meaningful admin data for dashboard/stats
- Meaningful social data for friends/messages/search/rankings

## Verified on the Integrated Branch

The branch has been checked locally with the following:

- `npx knex migrate:latest`
- `npx knex seed:run`
- `npm run build` in `frontend/`
- user login
- admin login
- rankings for `global`, `friends`, and `me`
- review submission
- admin user updates
- admin game config updates
- protected `/api-docs` with admin JWT + `x-api-key`

## Deploy-Ready Assets

The branch now includes provider config for the chosen HTTPS stack:

- [render.yaml](../render.yaml) for Render backend provisioning
- [frontend/vercel.json](../frontend/vercel.json) for Vercel SPA rewrites

Env contract for deploy:

- backend:
  - `APP_ORIGIN` = frontend public URL
  - `BACKEND_PUBLIC_URL` = backend public URL
  - `API_KEY` = protected admin docs key
- frontend:
  - `VITE_API_BASE_URL` = backend public URL
  - `VITE_ADMIN_API_KEY` = same value as backend `API_KEY`

## Remaining Submission Gap

### Still Required Before Calling the Project Fully Complete
- Actual provider-side deployment on Vercel and Render if the final grading expects a live hosted system

This is the only mandatory rubric item still marked open in [RUBRIC_CHECKLIST.md](./RUBRIC_CHECKLIST.md).

## Recommended Final Steps

1. Deploy frontend and backend to HTTPS hosts.
2. Set production env values:
   - backend: `DATABASE_URL`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS`, `APP_ORIGIN`, `BACKEND_PUBLIC_URL`, `API_KEY`
   - frontend: `VITE_API_BASE_URL`, `VITE_ADMIN_API_KEY`
3. Smoke test the hosted build:
   - login as user
   - open hub and launch multiple games
   - save/load a game
   - submit a review
   - open rankings
   - log in as admin
   - update a user and a game config
   - open protected API docs
4. Only after the hosted smoke pass, merge into `main` for final submission.

## Suggested Hosting

- Frontend: Vercel or Netlify
- Backend: Render, Railway, or Fly.io
- Database: Supabase

## Merge Guidance

Do not merge `integration/merge-member-branches` into `main` until:

- local smoke remains green
- docs stay aligned with current code
- deployment/HTTPS requirement is either completed or explicitly waived by the instructor
