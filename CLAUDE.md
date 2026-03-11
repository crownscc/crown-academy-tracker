# Crown Academy Tracker

## Deployment Target
- **Domain**: new.crown.direct
- **Platform**: Vercel
- **Repo**: crownscc/crown-academy-tracker

## Tokens & Auth
Tokens are stored in `.env` (git-ignored). Load them before running gh/vercel commands:
```bash
export $(cat .env | xargs)
```
- `GH_TOKEN` — GitHub PAT for crownscc (repo admin). Used with `gh` CLI.
- `VERCEL_TOKEN` — Vercel deploy token. Used with `vercel` CLI via `--token`.

## Project Structure
- `src/server.ts` — Express API server (REST endpoints + static file serving)
- `public/index.html` — Frontend dashboard (single-page app, dark/gold theme)
- `vercel.json` — Vercel deployment configuration
- `src/models/` — Student, Course, Achievement data models
- `src/services/` — Enrollment, Progress, Notification business logic
- `src/utils/` — Validators and formatting helpers

## Commands
- `npm run build` — Compile TypeScript
- `npm start` — Run server locally (port 3000)
- `npm test` — Run Jest tests (36 tests)
- `npm run vercel-build` — Build for Vercel deployment

## Deployment Workflow
1. Make changes on a `claude/*` branch
2. Push, create PR, merge via `gh` CLI (use GH_TOKEN)
3. Deploy via `vercel --prod --token $VERCEL_TOKEN`
4. Domain `new.crown.direct` should be configured in Vercel project settings
