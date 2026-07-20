# PBS Projects Website

Real Business website for PBS Projects (Pindoni Investment) glass & aluminum
specialists based in Harare, Zimbabwe.

## Stack
- **Frontend:** Next.js (React) + Tailwind CSS, built as a PWA
- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL (SQLite for local dev is also fine early on)

## Repo layout
- `frontend/` — the public website + admin panel (Next.js)
- `backend/`  — the API, database models, and admin auth (FastAPI)
- `docs/`     — project brief, client questionnaire answers, notes

## Local setup

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

Only run `pip install -r requirements-postgres.txt` too if you're switching
`DATABASE_URL` to Postgres for production — it's not needed for local dev.

### Frontend
```
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend runs at http://localhost:3000, backend API at http://localhost:8000
(interactive docs at http://localhost:8000/docs).
