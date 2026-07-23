# Technical setup

This is the developer/maintainer reference, running the site locally,
admin access, tests, and backups. It used to live in the main README,
moved here on purpose, the front page of a real business's own
repository isn't the right place to spell out admin login steps and
server commands.

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

Log in at `/admin/login`. A fresh database (via `python seed.py`)
creates one starting account with a placeholder password, that script
is the only place it's written down, and it only ever applies to a
brand new, empty database, never to the real one once it's in use.
Change it immediately after first login (Settings page in the admin
panel). Login attempts are rate limited (10 per 15 minutes per
connection) so this can't just be guessed by brute force in the
meantime, but a real password is still the actual fix, not a substitute
for one.

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
