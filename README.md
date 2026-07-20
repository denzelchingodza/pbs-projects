# PBS Projects Website

The website and admin panel for PBS Projects, a glass and aluminum
business based in Harare, Zimbabwe. This is a private project built for
one specific business, not a template or an open source library.

## What's in here

- `frontend/`, the public website (home, about, contact, products,
  portfolio, quote form) and the admin panel, built with Next.js.
- `backend/`, the API and database (FastAPI, Python), handles admin
  login, quote requests, and gallery photo/video uploads.
- `docs/BUILD_LOG.md`, a plain language, stage by stage explanation of
  what was built, why, and how it was verified. Read this if you want to
  understand how any part of the site actually works.

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
cp .env.local.example .env.local
npm run dev
```
Runs at http://localhost:3000.

## Admin access

Log in at http://localhost:3000/admin/login. The starting account is
created by `python seed.py`:

- Email: `owner@pbsprojects.co.zw`
- Password: `changeme123`

Change that password before this ever goes anywhere near a real,
public deployment.

From the admin panel: manage quote requests (and move each one through
new, contacted, quoted, won, or lost), and upload/remove gallery photos
and videos, sorted by product category.

## Deploying

Not set up yet. When it's time, the backend needs a real Postgres
database and file storage for uploads (local disk works for development
only), and the frontend needs `NEXT_PUBLIC_API_URL` pointed at wherever
the backend actually ends up running.
