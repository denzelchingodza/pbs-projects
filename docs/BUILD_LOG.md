# Build Log — plain-language notes on what each piece does

This file is a running explanation of the project as it gets built, written for
someone learning as they go. Read top to bottom in order — later entries assume
you understand the earlier ones.

---

## Stage 1: Local backend environment

**What "the backend" actually is:** a Python program (FastAPI) that runs on
your computer, listens on `http://localhost:8000`, and answers requests like
"give me the list of products" or "here's a new quote request, save it."
The database (SQLite for now, a single file — `pbs_projects.db`) is where
that data actually lives between requests.

**Why SQLite first, not Postgres:** SQLite needs zero setup — it's just a
file. Postgres needs a running database server. Since we're building and
testing locally for free, SQLite removes a whole category of "is Postgres
running?" problems while we're still writing code. The code doesn't care
which one it's talking to (that's what `DATABASE_URL` in `.env` controls) —
switching to Postgres later is a one-line config change, not a rewrite.

**What a "migration" is:** your database needs tables (`products`, `quotes`,
etc.) that match your Python model classes in `app/models/`. A migration is a
generated script that says "create this table with these columns." Alembic
is the tool that generates and runs these scripts. You run migrations once
after changing a model, and the database catches up to match your code.

**What we did in Stage 1:**
1. Created a Python virtual environment (`venv`) — an isolated space for this
   project's Python packages so they don't clash with anything else on your
   machine.
2. Installed everything in `requirements.txt` (FastAPI, SQLAlchemy, Alembic,
   Pillow for images, python-jose + passlib for login/security, etc).
3. Created `.env` from `.env.example` and pointed `DATABASE_URL` at SQLite —
   `sqlite:///./pbs_projects.db` — so there's nothing to install or configure,
   it's just a file that appears in the `backend/` folder the first time it's used.
4. Fixed `alembic/env.py` so it actually reads your app's models and
   `.env` settings (the stub version couldn't run migrations at all).
5. Ran `alembic revision --autogenerate -m "..."` — Alembic compared your
   model classes in `app/models/` against the (empty) database and generated
   a migration file describing every table it needs to create.
6. Ran `alembic upgrade head` — actually applied that migration. Confirmed
   with a raw SQLite query that all 6 tables exist: `products`, `projects`,
   `quote_requests`, `site_settings`, `testimonials`, `users` (plus Alembic's
   own bookkeeping table, `alembic_version`).
7. Started the real server: `uvicorn app.main:app --reload` and hit it with
   `curl` — `/api/health` returned `{"status":"ok"}` and `/api/settings/`
   returned the real default business info from the database. This is the
   actual backend running, not a mockup.

**Command to remember:** any time you change a file in `app/models/`, run
`alembic revision --autogenerate -m "describe the change"` then
`alembic upgrade head` to bring the database in sync.

---

## Stage 2: Real admin login (authentication)

**The problem with the scaffold version:** `auth.py` just returned a fake
string, `"todo-generate-real-jwt"`, no matter what email/password you sent.
Anyone could "log in" with anything.

**What a JWT actually is:** a signed, tamper-proof piece of text that says
"this is user X, and this token expires at time Y." The server signs it with
a secret key (`SECRET_KEY` in `.env`) when you log in successfully. On every
later request, you send that token back in a header
(`Authorization: Bearer <token>`), and the server re-checks the signature —
if it's valid and not expired, it trusts the identity inside without needing
to look anything up in a session table.

**Files changed:**
- `app/core/security.py` — added `create_access_token()` (builds and signs
  the JWT after a successful login) and `decode_access_token()` (verifies a
  token sent back later and pulls the user's email out of it).
- `app/core/deps.py` — `get_current_admin()` is now real. Any route that adds
  `admin: User = Depends(get_current_admin)` automatically requires a valid
  token, and FastAPI returns 401 on its own if it's missing or invalid — you
  never write that check yourself in the route.
- `app/routers/auth.py` — `/api/auth/login` now actually looks the user up
  by email, checks the password against the stored bcrypt hash, and only
  then issues a real token. Added `/api/auth/me` — lets the frontend ask
  "am I logged in, and as who" when a page loads.

**A real bug we hit and fixed:** `passlib` (the password-hashing library)
has a known compatibility break with newer versions of `bcrypt` — installing
the latest `bcrypt` caused password hashing to crash outright. Pinned
`bcrypt==4.0.1` in `requirements.txt` to fix it. This is a real-world example
of why pinned dependency versions matter — "just install the latest" isn't
always safe.

**Verified with curl, not guessed:**
- Wrong password → `401 {"detail":"Incorrect email or password."}`
- Correct password → a real signed JWT back
- That token sent to `/api/auth/me` → correctly identifies "Gift Mashaire"
- No token sent to `/api/auth/me` → `401`, exactly as it should

**First admin user:** created directly via a Python script (not through the
API — there's intentionally no public "create admin" endpoint), email
`owner@pbsprojects.co.zw`, password `changeme123`. **Change this password
before this ever goes near a real deployment** — this will move into the
seed script in Stage 5 so it's documented in one place.

---

## Stage 3: Admin routes actually require login now

**What changed:** `app/routers/admin.py` and the PATCH route in
`app/routers/settings.py` now have `admin: User = Depends(get_current_admin)`
added to their function signatures. That one line is the entire fix — FastAPI
runs `get_current_admin` (from Stage 2) before the route's own code, and if
it raises (missing/invalid/expired token), the route body never runs at all.

**Verified with curl, all four cases:**
- `GET /api/admin/quotes` with no token → `401` ✓
- Same request with a valid admin token → `200`, real data ✓
- `PATCH /api/settings/` with no token (tried to sneak in `"owner_name":"Hacker"`)
  → `401`, change rejected ✓
- Same PATCH with a valid token → `200`, and the owner's real bio ("Grew up
  in the aluminum trade...", 15 years experience, founded 2023) is now saved
  and shows up on the *public* `GET /api/settings/` — proving the "About the
  founder" content is genuinely admin-editable end to end.

This is the actual foundation the frontend's admin panel (Stage 9) will sit
on top of — login, then every admin action carries that token.

---

## Stage 4: Real photo upload, resizing, and delete

**Files changed:**
- `app/services/image_service.py` — rewritten to take raw file bytes (not a
  file-object, which was ambiguous between sync/async). Saves the upload with
  a random filename (`uuid4` — never trusts the original filename, which
  could contain path tricks or collide with an existing file), resizes it to
  a max 1600px-wide full version, and generates a 500px-wide thumbnail. Added
  `delete_upload()` to remove both files when a gallery item is deleted.
- `app/routers/admin.py` — added `POST /api/admin/gallery` (multipart form:
  title, category, is_featured, file) and `DELETE /api/admin/gallery/{id}`.
  Both require admin login. Upload validates the category is one of the 6
  real ones and caps file size at 8MB.
- `app/main.py` — mounted `/static` so uploaded photos are actually reachable
  by URL (`http://.../static/uploads/<file>.jpg`), not just saved to disk
  with nowhere to serve them from.

**Verified with a real 3000×2000 test image, not assumed:**
- Upload with no admin token → `401`, rejected ✓
- Upload with a valid token → succeeds, returns the new gallery item as JSON ✓
- The saved full-size file is genuinely resized to **1600×1067** (from
  3000×2000) — proving the "don't serve desktop-size photos to phones"
  requirement is real, not just a comment ✓
- The thumbnail is genuinely resized to **500×333** ✓
- The uploaded photo is reachable over HTTP at its `image_url` ✓
- `GET /api/gallery/?category=windows` returns it; `?category=doors` (before
  moving it) correctly returns an empty list — category filtering works ✓
- `DELETE /api/admin/gallery/{id}` removes it from both the database and disk,
  and it disappears from the public gallery list ✓

This is the endpoint the admin panel's "upload a photo" screen (Stage 9)
will call directly.

---

## Stage 5: Seed data — the site isn't empty on first run

**Added `backend/seed.py`** — a script you run once (`python seed.py`) after
migrations, which inserts:
- The 6 real product categories (Windows, Doors, Shower Cubicles, Shop Fronts,
  Suspended Ceilings, Cabinets) with real descriptions
- Default site settings — the real PBS address, phone numbers, WhatsApp, email
- The 3 testimonials we'd been using in the frontend demos, now as real
  database rows instead of hardcoded HTML
- The first admin user (moved here from the ad-hoc script in Stage 2, so it's
  documented in one obvious place — **email `owner@pbsprojects.co.zw`,
  password `changeme123`, change this before any real deployment**)

**Idempotent by design** — every insert checks "does this already exist?"
first. Verified by running `python seed.py` twice in a row: the second run
skipped every already-existing row and product count stayed at 6, not 12.

**Also added while here:** a `testimonials` router + schema, since we were
seeding testimonial data but had no way to read it back through the API.
`GET /api/testimonials/` now returns the 3 seeded reviews for real.

**Full clean-slate test performed:** deleted the database file entirely,
re-ran `alembic upgrade head` (rebuild tables from scratch) then `python
seed.py`, then hit every endpoint with curl — 6 products, 3 testimonials, and
the real business settings all came back correctly.

---

**Backend phase (Stages 1-5) is now genuinely complete and tested**, not just
scaffolded: real database, real auth, real photo upload with mobile-optimized
resizing, a real quote lead pipeline with spam protection, and real starting
data. Next: build the actual frontend pages and wire them to this API
(Stages 6-9).
