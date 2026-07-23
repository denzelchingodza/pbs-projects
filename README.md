# PBS Projects Website

The website and admin panel for PBS Projects, a glass and aluminum
business based in Harare, Zimbabwe. This is a private project built for
one specific business, not a template or an open source library.

## What's in here

- `frontend/`, the public website (home, about, contact, products,
  portfolio, quote form, testimonials) and the admin panel, built with
  Next.js. Supports English and Shona via a language toggle, English is
  complete, Shona is wired in and ready but the real translations
  haven't been supplied yet.
- `backend/`, the API and database (FastAPI, Python), handles admin
  login, quote requests, gallery photo/video uploads, and testimonial
  moderation.
- `docs/BUILD_LOG.md`, a plain language, stage by stage explanation of
  what was built, why, and how it was verified. Read this if you want to
  understand how any part of the site actually works, or how it changed
  over time.

## Running it locally

Two terminals, one for each half.

### Backend
```
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
python seed.py
uvicorn app.main:app --reload
```
Runs at http://localhost:8000 (interactive API docs at
http://localhost:8000/docs).

Only run `pip install -r requirements-postgres.txt` too if switching
`DATABASE_URL` to Postgres for a real deployment, SQLite is fine for
local use.

### Frontend
```
cd frontend
npm install
npm run dev
```
Runs at http://localhost:3000. No `.env.local` needed for normal local
use, the frontend figures out how to reach the backend on its own.

### Viewing it on a phone

Same WiFi network as your computer, then:
```
# backend
uvicorn app.main:app --reload --host 0.0.0.0
# frontend
npm run dev:lan
```
Find your computer's own network address (System Settings > Wi-Fi >
Details on a Mac, or `ipconfig getifaddr en0` in Terminal), then open
`http://<that address>:3000` in the phone's browser.

### Running the backend tests
```
cd backend
pip install -r requirements-dev.txt
pytest
```
Every test runs against its own throwaway database, created fresh and
thrown away per test, the real `pbs_projects.db` is never touched by a
test run.

## Admin access

Log in at http://localhost:3000/admin/login. A fresh database (via
`python seed.py`) creates one starting account:

- Email: `owner@pbsprojects.co.zw`
- Password: `changeme123`

Change that password immediately after logging in for the first time
(Settings page in the admin panel), it's a public, well known starting
point, not something safe to leave in place. Login attempts are rate
limited (10 per 15 minutes per connection) so this can't just be guessed
by brute force in the meantime, but a real password is still the actual
fix.

From the admin panel: manage quote requests (move each one through new,
contacted, quoted, won, or lost, and delete ones that have actually been
handled), upload/remove gallery photos and videos sorted by product
category, and moderate submitted testimonials before they go public. A
"View Site" link at the top of the admin sidebar opens the real website
in a new tab without losing the admin session.

## Backups

```
cd backend
./scripts/backup_db.sh
```
Backs up both the real database and every uploaded photo/video into
`backend/backups/` (gitignored, stays local, never in git history), and
keeps the 14 most recent backups of each. Worth running on a real
schedule (cron) once this is handling real customer data day to day, not
just once in a while by hand.

## Deploying

Not set up yet. When it's time: the backend needs a real Postgres
database and real object storage for uploads (local disk works for
development only, `CLOUDINARY_URL` is stubbed in `.env.example` for
this), the frontend needs a real domain (`lib/seo.ts` has a placeholder
one to update), and CORS in `backend/app/main.py` needs the real
frontend domain added alongside the local development origins already
there.
