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

---

## Stage 6: Real Navbar + Footer, wired to live business data

**The idea:** the footer, contact info, and phone number shouldn't be typed
into every page as plain text — they should come from `GET /api/settings/`
(Stage 1's SiteSettings table), so if the owner ever updates the address or
phone number through the admin panel, every page reflects it automatically.

**Files changed:**
- `app/layout.tsx` (frontend) — turned into an `async` Server Component.
  Next.js lets Server Components `await` data directly before rendering, so
  this fetches `getSiteSettings()` once and passes it down to `Navbar`,
  `Footer`, and a new `WhatsAppFloat` button as props.
- `lib/api.ts` — added `getSiteSettings()`, which calls the real API but
  falls back to hardcoded defaults if the backend isn't reachable (e.g.
  you're previewing the frontend without the FastAPI server running). This
  is why the site never just crashes with a blank page if the backend's down.
- `components/layout/Navbar.tsx` — a **Client Component** (`"use client"` at
  the top), because it needs real browser interactivity: toggling the mobile
  hamburger menu open/closed, and a scroll listener for the sticky-nav shadow.
  Client Components can't `await` data themselves, which is exactly why the
  settings fetch happens one level up in `layout.tsx` and gets passed in as
  a prop instead.
- `components/layout/Footer.tsx` — a plain Server Component (no
  interactivity needed), renders the real address/phone/email from props.
- `components/layout/WhatsAppFloat.tsx` — new. A `wa.me` link (WhatsApp's own
  click-to-chat URL format) built from the real WhatsApp number, with a
  pre-filled message. No WhatsApp Business API integration needed for this —
  it's just a formatted link.

**A real environment bug we hit and worked around:** this sandbox's
connected-folder mount has the same kind of filesystem limitation SQLite hit
in Stage 1 — Next.js's dev server (which watches files and writes a `.next`
build cache) hung indefinitely when run directly against the mounted folder.
This is a quirk of *this specific sandbox's* file mount, not a problem with
your code or something you'll see on your own computer. To verify the code
was actually correct, I copied it to a plain local folder inside the sandbox
(no mount involved) and ran it there instead.

**Verified for real, not assumed:**
- `tsc --noEmit` (the TypeScript compiler, strict mode) passes with **zero
  errors** across every new/changed file — proves the code is type-correct.
- Ran the actual Next.js dev server and fetched the homepage: page size
  jumped from 5.3KB (old empty placeholders) to 12.3KB once the real
  Navbar/Footer were wired in, and the rendered HTML genuinely contains the
  real address ("09 Sherwood Rd, Waterfalls"), phone number, and email.
- Then proved the *live* connection, not just the fallback: started the real
  FastAPI backend, logged in as admin, and PATCHed `business_name` to
  `"PBS Projects LIVE-TEST"` through the actual API — then loaded the
  frontend and confirmed `"LIVE-TEST"` appeared in the rendered page. Reverted
  it immediately after. This proves the frontend is reading live data from
  the backend, not a hardcoded copy.

---

## Stage 7: Real home page — Hero, Stats, Products, Featured Work, Testimonials

**No real PBS project photos exist yet**, so rather than block on that or use
random unrelated stock photos, the hero uses one openly-licensed (CC BY-SA
3.0) photo of Harare from Wikimedia Commons — relevant to the business's
location, clearly marked `PLACEHOLDER` in a code comment in `Hero.tsx`, ready
to swap the moment real photos come in.

**Files added:**
- `components/home/Hero.tsx` — headline, lead text, two CTA buttons, the
  placeholder Harare photo as a background image.
- `components/home/Stats.tsx` — deliberately shows only numbers we can back
  up: "Years in Business" is *computed* from `settings.founded_year` (real
  math: current year minus founding year, not typed in by hand), "Projects
  Completed" is the *real count* from `GET /api/gallery` — meaning it
  honestly shows 0 today, and will climb automatically as the admin uploads
  real project photos. No invented "10 provinces served"-style stat that we
  can't actually verify.
- `components/home/ProductsOverview.tsx` — the 6 real product categories
  from `GET /api/products`, with their real seeded descriptions. Doesn't
  need any photos to look complete.
- `components/home/FeaturedWork.tsx` — the honest handling of "no photos
  yet": shows a plain "Project photos coming soon" message instead of fake
  or stock photos standing in for PBS's own work. The moment a real photo
  is uploaded, this section automatically switches to showing it.
- `components/home/Testimonials.tsx` — the 3 seeded reviews, real star
  ratings. Returns `null` (renders nothing) if there are zero testimonials,
  rather than showing an empty, awkward section.
- `app/page.tsx` — the home page itself is a Server Component that fetches
  settings, products, gallery projects, and testimonials all at once with
  `Promise.all`, then hands the results down to each section as props.

**Verified with real data, both states:**
- `tsc --noEmit` — zero errors.
- Loaded the home page with an empty gallery: page rendered `0` for
  "Projects Completed" and the honest "coming soon" message — confirmed via
  the raw HTML, not just visual inspection.
- Uploaded one real test photo through the actual admin API, reloaded the
  page: "coming soon" disappeared entirely and the real uploaded photo
  rendered in its place. Then deleted the test photo through the API to
  clean up. This proves the empty-state and populated-state both work
  correctly, not just one of them.

**To swap the hero photo later:** search this repo for `PLACEHOLDER` — right
now there's exactly one hit, in `Hero.tsx`.

---

## Stage 8: Real gallery page + quote form

**Gallery — how the interactive pieces are split up:**
- `components/gallery/FilterBar.tsx`, `GalleryGrid.tsx`, `Lightbox.tsx` are
  all "dumb" — they just render whatever props they're given and call a
  callback on click. None of them hold their own state.
- `components/gallery/GalleryExplorer.tsx` is the one Client Component
  (`"use client"`) that actually owns the state: which category filter is
  active, and which photo (if any) is open in the lightbox. Filtering
  happens entirely in the browser with `useMemo` over the already-fetched
  project list — no extra network request when you click a filter chip,
  since the whole gallery's data is small enough to load once.
- `components/gallery/BeforeAfterSlider.tsx` uses a real `<input
  type="range">` under the hood for the drag handle rather than a
  custom-drawn one — sliders like this get touch-drag support on phones for
  free, which matters since that's most of PBS's traffic.
- `app/gallery/page.tsx` (a Server Component) fetches the real project list,
  hands it to `GalleryExplorer`, and separately looks for any project with a
  `before_image_url` set to show in a before/after section — none exist yet,
  so that section just doesn't render (no placeholder before/after fakery).

**Quote form — how spam protection carries through to the browser:**
- `components/quote/QuoteForm.tsx` posts straight to `POST /api/quotes/`
  with the same shape the backend expects. It includes the honeypot field
  from Stage 1 (`name="website"`), visually hidden with CSS (not
  `display:none`, which some bots specifically check for and skip) — a real
  visitor never sees or fills it in, but a bot auto-filling every input will.
  The client checks it too, so a triggered honeypot never even reaches the
  network, though the backend re-checks regardless.
- `components/quote/QuoteSection.tsx` wraps the form with the real business
  address/phone/email (from Settings) and mounts at `id="quote"` — the exact
  anchor the Navbar and Footer already link to (`/#quote`).
- Added the form to both the home page and a standalone `/quote` page.

**Verified for real:**
- `tsc --noEmit` — zero errors across every new file.
- Loaded `/`, `/gallery`, and `/quote` for real — all three return `200`,
  the gallery page's empty state ("No photos in this category yet") renders
  correctly with zero projects seeded, and the quote form's fields
  (`full_name`, `Send Request`, etc.) are genuinely present in the HTML.
- Submitted a quote request using the **exact payload shape the form
  builds** directly against the running backend — it saved for real, then
  showed up when listing quotes as admin. Then re-confirmed the honeypot
  still rejects a bot-shaped submission with `400`.

**Honest limitation:** this sandbox doesn't have a working headless browser
(Chromium crashes on missing system libraries I can't install without root),
so I couldn't automate an actual click-the-filter-button or
drag-the-slider-with-a-mouse test. What's verified instead: the TypeScript
compiles with zero type errors (which catches most prop-mismatch and
logic-shape bugs), the rendered HTML is structurally correct in every state,
and the exact API calls these components make were proven to work for real.
The interactions themselves (clicking, dragging) use plain, well-understood
React patterns — but genuinely clicking through it yourself once it's
running is worth doing before you call this done.

---

## Stage 9: Homepage visual redesign — "clean & corporate"

**Why:** the original look (dark full-bleed photo hero, serif headline,
boxed dark stat cards) read as a generic template rather than an
established local business. Nothing about the *data* or *functionality*
changed in this stage — every fetch, form, and API call is untouched.
This was purely the visual layer: colors, spacing, layout, typography.

**Files changed, and why:**
- `tailwind.config.js` — added a `fontFamily.sans` entry pointing at a CSS
  variable (`--font-inter`) instead of the browser's default system font.
- `app/layout.tsx` — added `next/font/google`'s `Inter` loader. Next.js
  downloads and self-hosts this font at build time (no runtime request to
  Google, no layout shift while it loads) and exposes it as that CSS
  variable, which is what `tailwind.config.js` now points to.
- `components/ui/SectionHeading.tsx` — **new file.** The "small orange label
  + big heading + optional intro line" pattern was copy-pasted across four
  sections (Products, Our Work, Testimonials, Get a Quote). Pulling it into
  one component means a spacing/type tweak now happens in one place instead
  of four places quietly drifting apart over time.
- `components/layout/Navbar.tsx` — added a thin contact-info strip above the
  main bar, turned "Get a Quote" into a solid button (it's the #1 action we
  want a visitor to take, so it shouldn't look like a plain text link).
- `components/home/Hero.tsx` — replaced the full-bleed dark-overlay photo
  background with a two-column layout: text on plain white, photo in a
  separate framed panel. This is the standard pattern on "corporate
  services" sites — the old version read more like a single ad banner.
- `components/home/Stats.tsx` — replaced two dark boxed cards with a plain
  three-column strip (added "Product Categories" as the third, honest,
  always-true stat alongside the two computed from real data).
- `components/home/ProductsOverview.tsx`, `FeaturedWork.tsx`,
  `Testimonials.tsx`, `quote/QuoteSection.tsx` — restyled onto the same card
  system (consistent border/radius/hover) and now use `SectionHeading`.
- `components/layout/Footer.tsx` — typography/spacing only, no content or
  data changes.
- `app/globals.css` — added smooth in-page scrolling (for the `/#quote`
  style anchor links) and a branded text-selection color.

**Verified for real, not assumed:**
- `tsc --noEmit` — zero type errors across the whole frontend.
- A full `next build` (production build: compiles, lints, type-checks, and
  statically generates all 13 routes) completed with **zero errors** — the
  build only failed once, on the very first attempt, because this sandbox's
  network blocks `fonts.googleapis.com` specifically (confirmed with a
  direct `curl`, which got a 403 from the sandbox's proxy — `npm`'s registry
  is reachable, Google Fonts isn't). Re-ran the build with the font loader
  temporarily stubbed out to prove the rest of the code was sound, which it
  was. This is a sandbox network restriction, not a code problem — a normal
  `next build`/`next dev` on your own machine reaches Google Fonts fine.
- Started the actual built app (`next start`) and `curl`'d the real
  homepage HTML — confirmed the new headline, "Get a Free Quote", "Our
  Products", and "Years in Business" all render in the real output, not
  just in the source files.

**Still untouched, on purpose (per Denzel's request):** admin panel pages,
photo upload, and every non-home page (`about`, `contact`, `gallery`,
`products`, `quote`) — those get the same design pass next, once this
homepage direction is approved.

---

## Stage 10: Every page built out, admin panel made real, and polish pass

**Context:** the homepage direction from Stage 9 was approved ("I like it,
just add better design"), plus four specific requests: no dash punctuation
anywhere, a logo mark matching the flyer's roof icon, a real map, and the
About/Contact/Products/admin pages actually built (they were, until now,
empty files with only a comment describing what should go there, see
`git log` before this stage, `about/page.tsx` was 4 lines).

**No dashes:** every em dash/en dash in visible site copy (headlines, quote
form messages, browser tab title) was rewritten using periods or commas
instead. Left untouched: dashes inside code comments (developers only, never
rendered to a visitor) and the middle-dot `·` separators already used in the
footer and stats, that's a bullet character, not a dash.

**Logo mark:** new `components/ui/Logo.tsx`, a small inline SVG (a rounded
orange chevron, like the roof shape above "PBS" on the flyer) next to the
wordmark. Inline SVG instead of an image file means it's crisp at any size
and always exactly the brand orange. Used in the Navbar, Footer, and the new
admin sidebar.

**Real map:** `components/layout/LocationMap.tsx` was a stub (`{/* <iframe
... */}`) that never actually rendered anything. Now a real Google Maps
iframe embed built from the real address in Site Settings (or `map_lat`/
`map_lng` if the admin ever sets those), wrapped so it resizes correctly on
phones. Added to both the new About and Contact pages.

**About, Contact, and Products pages built for real** (all three were
previously just a JSX comment, literally zero visible content):
- `about/page.tsx` — company intro (computed years in business, same
  honest math as the homepage stat), `AboutFounder.tsx` (also previously a
  stub) showing the real owner bio/photo from Site Settings with a fallback
  initials badge if no photo's been uploaded yet, and the map.
- `contact/page.tsx` — Call/WhatsApp/Email as three direct action cards
  (real `tel:`, `wa.me`, and `mailto:` links, no new backend needed), the
  address, and the map. Deliberately doesn't duplicate the quote form,
  that's what `/quote` and the homepage are for; this page is for "I want to
  reach someone right now."
- `products/page.tsx` — the full 6-category grid (the homepage only shows a
  teaser version), each card linking straight into `/quote`.

**A real bug fixed along the way:** the gallery only had 5 valid categories
(`windows, doors, shopfronts, ceilings, cabinets`) in both the backend
(`admin.py` `VALID_CATEGORIES`) and the frontend filter/upload dropdowns,
even though there are 6 real product lines, Shower Cubicles had nowhere to
go. Added `showercubicles` to all three places it needs to match.

**Admin panel — built for real, not just styled.** The backend side of this
(login, JWT, upload/delete, quote status) was already fully working since
Stages 2 to 5, only the frontend pages calling it were still comments. Now:
- `lib/auth.ts` — reads/writes/clears the admin token in `localStorage`.
- `lib/adminApi.ts` — new file, every authenticated call the admin panel
  makes lives here (login, get current admin, list/update quotes, list/
  upload/delete gallery photos), each one automatically attaches
  `Authorization: Bearer <token>` and, if the backend ever says the session
  expired (401), clears the token and bounces to `/admin/login` so no admin
  page can sit there showing stale data behind a dead session.
- `app/admin/layout.tsx` — was a one-line pass-through with a comment
  saying it "should redirect... if not authenticated." Now it actually
  does: checks for a token, confirms it's still valid by calling
  `/api/auth/me`, and redirects to login if either check fails. The login
  page itself is special-cased so there's no redirect loop.
- `admin/login/page.tsx` — a real form that calls the real login endpoint
  and shows the backend's real error message on a wrong password.
- `admin/dashboard/page.tsx` — real counts (total quotes, new/uncontacted
  quotes, gallery photo count), not placeholders.
- `admin/gallery/page.tsx` + `PhotoUploader.tsx` — lists real uploaded
  photos, a real upload form (title, category, feature toggle, file),
  and a working delete button, all hitting the endpoints proven working
  back in Stage 4.
- `admin/quotes/page.tsx` + `QuoteTable.tsx` — lists real quote requests
  and lets the status be changed (new to contacted to quoted to won or
  lost) directly from a dropdown per row, calling the real PATCH endpoint.
- `components/layout/PublicChrome.tsx` — new. The public Navbar/Footer/
  WhatsApp button no longer render on `/admin/*` routes, since the admin
  panel has its own sidebar nav; showing both looked cluttered and
  unintentional.

**Verified for real, not assumed:**
- `tsc --noEmit` across the whole frontend, including every new admin
  page, zero errors.
- A full production `next build` compiled, linted, type-checked, and
  statically generated all 13 routes (up from a working 11 before this
  stage counted, the admin pages now actually produce real page bundles
  instead of near-empty stubs) with zero errors. Only hiccup, same as
  Stage 9, this sandbox blocks `fonts.googleapis.com` specifically
  (confirmed again with `curl`), worked around the same way to prove the
  rest of the app builds clean.
- Started the actual built app and `curl`'d `/`, `/about`, `/contact`,
  `/products`, `/gallery`, `/quote`, and `/admin/login` for real, all
  returned `200`, and the real rendered HTML was checked for actual
  content (the founder section, the three contact action cards, the map
  iframe pointed at the real Harare address, the admin login form), not
  just that the page didn't crash.
- Did not re-spin-up the actual FastAPI backend in this pass (already
  proven live and working against this exact fetch pattern in Stages 6 to
  8), so the About/Products pages were checked against the frontend's own
  documented no-backend fallback behavior (empty product list, generic
  "The PBS Team" founder placeholder) rather than real seeded data. Worth
  a quick real click-through once both servers are running locally,
  especially the admin login with the real seeded password and a real
  photo upload.

---

## Stage 11: Photo categories, arrangement, and in-app instructions

**Context:** after seeing the admin panel, the ask was to organize photos
by category everywhere (not just filter them), and add real guidance in
the admin panel and on the public portfolio, on top of the design from
Stages 9 and 10.

**New shared source of truth:** `lib/categories.ts`, exporting
`GALLERY_CATEGORIES`. Before this, the same 6-category list was typed out
three separate times (`FilterBar.tsx`, `PhotoUploader.tsx`, and the admin
gallery page), which is exactly how Stage 10's shower-cubicles bug
happened in the first place, one list gets updated and the others quietly
don't. Now there's one array; everything else imports it.

**Admin gallery (`admin/gallery/page.tsx`):** photos are no longer one mixed
grid, they're grouped into a section per category, each with a photo count,
and a visible "No photos in this category yet" placeholder for categories
with nothing uploaded. The point is you can glance at this page and
immediately see "we have shop front and window photos, but nothing for
cabinets yet" instead of having to scroll and mentally sort them.

**`PhotoUploader.tsx` reordered and explained:** fields now go category
first, then title, then file, then the homepage feature toggle, numbered
1 to 4, matching the order those decisions actually get made in (you know
the category before you know the exact title). Added a plain-language
explainer above the form: what category controls, that photos get
auto-resized, and what the feature toggle actually does, replacing zero
in-context help with real in-context help.

**Public portfolio (`GalleryExplorer.tsx`):** picking "All" now shows the
same category-grouped layout as the admin view, a heading per category,
skipping any category with zero photos (unlike the admin view, the public
site shouldn't advertise gaps). Picking one specific category filter still
shows a single flat grid of just that category, so someone who only wants
to see shower cubicles doesn't have to scroll past five other sections
first.

**Homepage Our Work section:** each photo now shows a small category badge
directly on the image, so the homepage teaser carries the same
category-first organization as the full portfolio and admin views instead
of being an unlabeled row of photos.

**Instructions added in two more places:**
- Admin dashboard: a "Getting started" card with the 3 real things this
  panel is for, in order (add categorized photos, feature your best ones,
  move quotes through the pipeline).
- Admin quotes page: a one-line explanation of the New to Contacted to
  Quoted to Won/Lost pipeline directly above the list, instead of expecting
  it to be self-evident from the status dropdown alone.

**Verified for real:** `tsc --noEmit`, zero errors. Full `next build`,
compiled, linted, type-checked, and statically generated all 13 routes
with zero errors (same Google Fonts sandbox workaround as Stages 9 and 10,
confirmed unrelated to this code).
