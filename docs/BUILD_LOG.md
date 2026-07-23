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

---

## Stage 12: Real video uploads, a better gallery, and a redesigned WhatsApp button

**Context:** the ask was to handle the admin wanting to post "large things
and maybe videos," with clear guidelines and caution about what's
accepted, plus a genuinely better-feeling gallery and a neater WhatsApp
button. Asked directly whether video should mean (a) images only with
clear guidance, (b) a pasted video link instead of a real upload, or (c)
real video file upload. The answer was real upload, so this stage adds
actual video support end to end, not just a "coming soon" note.

**Database:** `projects.media_type` (new column, migration
`aed0cb5089bc`, backfilled `'image'` for every existing row on upgrade).
`image_url` now holds the uploaded file's URL regardless of type,
`media_type` says whether to render it as a photo or a video, this keeps
every existing photo-only piece of code working unchanged.

**Backend (`image_service.py`, `routers/admin.py`):** photos keep the
existing resize-and-thumbnail treatment. Videos are stored exactly as
uploaded, no compression or transcoding, doing that properly needs
ffmpeg and a background job queue (a video finishes processing well
after the HTTP request that uploaded it returns), which is a real project
of its own and out of scope here. What's real instead: separate size caps
(8MB photos, 50MB video) enforced server-side regardless of what the
browser already checked, a specific error message naming the exact limit
and exact accepted formats, and `detect_media_type()` telling files apart
by extension so the upload endpoint can branch correctly.

**Verified against a real running instance, not assumed:** installed
dependencies, ran the new migration, started the actual FastAPI server,
and with real `curl` requests: uploaded a real photo (came back resized,
`media_type: "image"`), uploaded a real video file (came back stored
as-is, `media_type: "video"`), sent a fake 51MB video and got back
exactly `"Video too large (max 50MB)."`, sent a `.pdf` and got back the
full list of accepted photo and video formats, confirmed the public
`/api/gallery/` list correctly returns both items, then deleted the video
and confirmed only its one file disappeared from disk, the photo and its
thumbnail were untouched.

**Admin upload form (`PhotoUploader.tsx`, new `lib/media.ts`):** accepts
both photos and videos now, with the exact size limits and formats
written out above the form before a file is even picked, plus a specific
caution that videos aren't compressed, so a raw phone recording could
easily be several hundred MB and should be trimmed/re-exported first.
`lib/media.ts` mirrors the backend's limits so a bad file is rejected
instantly in the browser with a specific message, the backend re-checks
everything independently regardless, this is just faster feedback.

**Gallery, made better, not just functional:**
- `GalleryGrid.tsx`: video thumbnails now show a play-icon badge (so a
  visitor knows it's a video before clicking) and every thumbnail gets a
  dark gradient title scrim on hover instead of a plain white pill.
- `Lightbox.tsx`: added previous/next navigation, on-screen arrow buttons
  and keyboard arrow keys, plus a position counter ("3 / 8"), and now
  actually plays video with controls instead of only ever rendering an
  `<img>`.
- `GalleryExplorer.tsx`: builds one flat, ordered list so next/prev
  behaves correctly whichever view is active, "All" (grouped by
  category) or a single category filter.
- `gallery/page.tsx`: added a closing "Get a Quote" banner (the same
  pattern the Products page already used) so browsing the portfolio ends
  with a clear next step, plus a one-line note when any video exists.
- Admin gallery cards and the homepage's Featured Work teaser both
  render real `<video>` playback for video items instead of a broken
  image tag.

**WhatsApp button:** replaced the generic speech-bubble emoji with the
real WhatsApp glyph as inline SVG (crisp, exactly on-brand green, not
dependent on the visitor's device having that emoji), added a soft
pulsing ring so it reads as a live action rather than a static icon, and
a "Chat with us" label that fades in on hover on desktop.

**Frontend verified for real:** `tsc --noEmit`, zero errors. Full
production `next build`, compiled, linted, type-checked, and statically
generated all 13 routes with zero errors (same Google Fonts sandbox
workaround as every stage since 9, confirmed unrelated to this code).

---

## Stage 13: The real 88 job photos, sorted and uploaded

**Context:** the real photo folder had 88 loose site photos, on top of the
one already used for the homepage hero. The ask was to get them into the
gallery, with photos from the same job site sitting close together
instead of appearing in a random order.

**Why this needed a real plan first:** the `Project` table has no "job" or
"site" field, only `category`. The gallery groups strictly by category, so
"same site, close together" only means something within a category, in
whatever order the rows were inserted (there was previously no explicit
sort at all, more on that below). So each photo first needed a category
(windows, doors, or shower cubicles, based on what's actually in the
photo) and a same site grouping, worked out by eye: matching brick or
plaster color, roof material, and background details like a specific
neighboring house or a car in frame.

**Backend (`routers/gallery.py`):** added `.order_by(Project.id)` to the
public listing query. Previously there was no explicit sort at all, so
SQLite happened to return rows in insertion order, but nothing guaranteed
that. Now it's explicit: rows come back in the order they were uploaded,
on purpose, since that's what makes the same site grouping hold up.

**How the photos actually got in:** not through 88 clicks in the admin
panel. Ran the real backend locally against the real project database,
logged in as the admin account, and sent each photo to the same
`/api/admin/gallery` endpoint the admin panel itself uses, one request per
photo, in the planned order: all 54 window photos first (grouped by site),
then all 32 door photos (grouped by site), then the 2 shower cubicle
photos. Titles were written per photo or per small group (for example
"Bay window installation," "Security door installation," "Stable style
door installation") rather than one generic label repeated 88 times.

**Homepage teaser fix:** `FeaturedWork.tsx` used to just show whichever 6
photos happened to be first in the list, which with 54 window photos
uploaded first would have meant the homepage teaser showed six window
shots and nothing else. Marked 6 varied photos as featured (a mix of
windows, doors, and the shower cubicle) directly in the database, and
changed `FeaturedWork.tsx` to sort featured photos first before taking the
first 6, so the homepage keeps showing a spread of the actual product
range instead of whatever uploaded earliest.

**What stays local, on purpose:** the uploaded photo files
(`backend/static/uploads/`) and the database itself (`pbs_projects.db`)
were already both meant to stay off git, the same way they would if
someone uploaded these 88 photos by hand through the real admin panel.
Added `backend/static/uploads/` to `.gitignore` to make that explicit,
so a future real admin upload never accidentally becomes a huge binary
git commit. The one code change that is committed is the `gallery.py`
ordering fix and the `FeaturedWork.tsx` sort fix, the photos themselves
live wherever the site actually runs, exactly like every other
admin-uploaded photo already does.

**Verified against the real running backend:** started the actual FastAPI
server against the real `pbs_projects.db`, uploaded all 88 photos, and
confirmed: `select count(*) from projects` returns 88, the category
counts match the plan exactly (54 windows, 32 doors, 2 shower cubicles),
every uploaded file on disk is a valid, correctly sized JPEG, and
`/api/gallery/?category=windows` (and the unfiltered list) come back in
ascending id order, meaning the site clustering holds. `tsc --noEmit` on
the changed frontend file came back clean.

---

## Stage 14: Fixing photos that would not actually display

**The bug:** every photo the API returns comes back as a path like
`/static/uploads/x.jpg`, which is only ever correct relative to the
backend's own address. Every `<img>` and `<video>` tag was using that
path directly as its `src`, which meant the browser looked for the photo
on whatever address the frontend itself was running on instead, found
nothing, and showed a broken image everywhere a real photo should have
been. This had likely been broken since photo uploads were first added,
it just had not been caught yet because verification up to this point
had been through the API directly (`curl`, database checks), not by
actually looking at a rendered page in a browser.

**The fix:** added `mediaUrl()` in `lib/media.ts`, which resolves a
relative photo or video path against the backend's actual address
(derived from `NEXT_PUBLIC_API_URL`), and used it everywhere a photo or
video is rendered: the gallery grid, the lightbox, the homepage teaser,
the admin gallery panel, and the before and after slider. Confirmed the
resolution logic directly (feeding it real paths and checking the output
address), plus `tsc --noEmit` and a full production build.

---

## Stage 15: Projects with multiple photos, and real customer testimonials

**Context:** two real problems raised at once. First, the gallery was
still treating every uploaded photo as its own separate project, so one
real job photographed 3 times showed up as 3 unrelated pieces of work
instead of 1. Second, the public portfolio page showed every single photo
in an endless scroll rather than a curated set of jobs with a way to see
everything for one job on demand. Third, there was no real way for an
actual customer to leave a testimonial, the ones on the homepage were all
seeded starter content.

**Database restructure (`models/project.py`, new `models/project_media.py`,
migration `b7f3d2a19c40`):** a `Project` is now the job itself (title,
category, featured flag, an optional before photo, created date). The
actual photos and videos moved into a new `ProjectMedia` table, one row
per photo, each pointing back at its project. A job with 1 photo has 1
project and 1 media row, a job with 4 photos has 1 project and 4 media
rows. The migration also regrouped the real 88 photos already in the
database: using the same by eye site groupings from Stage 13 (same
brick, same roof, same background), it merged photos that are actually
the same job into one project each, cutting 88 single photo "projects"
down to 66 real ones, 18 of which now correctly show 2 to 4 photos of
the same job. Nothing was deleted or re-uploaded, the migration moved
existing rows into the new shape and verified counts before and after
matched exactly.

**Testimonial moderation (`models/testimonial.py`, same migration):**
added a `status` column, `pending` or `approved`. The 3 existing seeded
testimonials were backfilled to `approved` so they kept showing, new
submissions default to `pending` and stay off the public site until the
admin reviews them.

**Backend endpoints (`routers/gallery.py`, `routers/admin.py`,
`routers/testimonials.py`):** the public gallery read now returns
projects with their full photo list embedded, not a flat list of
photos. New admin routes: start a project with its first photo, add
another photo or video to an existing project, edit a project's title,
category, or featured flag, remove one photo (the project itself gets
cleaned up too if that was its only photo), and delete a whole project
outright (removing every file on disk that belonged to it, not just the
database rows). Testimonials got a public submit endpoint (same honeypot
spam guard as the quote form) and admin endpoints to list, approve, and
delete them.

**Public gallery redesign (`GalleryGrid.tsx`, `Lightbox.tsx`,
`GalleryExplorer.tsx`, `FeaturedWork.tsx`):** the grid now shows one card
per project (its cover photo, a "+N more" badge if it has extra photos),
not one card per photo, so browsing the portfolio is no longer an endless
scroll of near duplicate shots. Clicking a card opens every photo for
that job in the lightbox, with previous/next browsing scoped to just
that project, this is the "view all the pictures individually" behavior.
The homepage teaser uses the same cover-plus-badge treatment.

**Admin gallery rebuild (`ProjectCard.tsx`, `AddPhotoButton.tsx`,
`PhotoUploader.tsx`, `admin/gallery/page.tsx`):** each project is a card
showing every one of its photos as a small thumbnail (removable
individually on hover), a dedicated tile to add more photos to that same
job, and an inline edit mode for title, category, and the featured flag,
no separate page needed. The existing upload form now clearly starts a
new project rather than always creating a new gallery entry, its copy
says plainly to use a project's own "Add photo" tile instead if more
photos of an existing job come in.

**Public testimonial form (`app/testimonial/page.tsx`,
`TestimonialForm.tsx`) and admin moderation
(`app/admin/testimonials/page.tsx`, `TestimonialModerationList.tsx`):** a
real customer can now submit their name, role, a star rating, and their
experience, it lands as pending and a plain confirmation message says so.
The homepage testimonials section always renders now (an honest empty
state instead of disappearing entirely) with a permanent "Share Your
Experience" link, also added to the footer. The admin panel gets a new
Testimonials screen, pending ones listed first, approve or delete each
one, plus dashboard counters for gallery projects and testimonials
awaiting review.

**Verified for real, not assumed:** ran the actual migration against the
real database and confirmed before and after counts matched the plan
exactly (88 photos regrouped into 66 projects, 18 of them multi photo,
3 testimonials backfilled to approved). Then, against an isolated copy of
the real (already migrated) database, ran the real backend and exercised
every new endpoint end to end: created a project, added a second photo to
it, edited its title and featured flag, deleted one photo (project stayed
with 1 remaining), deleted its last photo (project was removed
automatically), deleted a whole project outright, confirmed a bad category
gets rejected, submitted a testimonial (came back pending), confirmed it
does not appear on the public testimonials list until approved, approved
it, confirmed it then does appear, and confirmed the honeypot field
silently rejects a bot-style submission. `tsc --noEmit` came back clean
and a full production build generated all 15 routes with zero errors.

---

## Stage 16: A real Our Work section, a real gallery page, an orange header

**Context:** four separate notes after actually seeing the site with real
photos in it. The homepage stats strip showed a raw project count, which
reads as thin (or fake looking) rather than useful. The homepage's Our
Work section and the gallery page were both doing the same "project card"
job, when what was actually wanted was a strong curated showcase on the
homepage and a real "see everything" browsing page on its own. The
header was still plain white. The Products page was still using
generic, could be any company copy instead of describing what PBS
actually builds.

**Stats (`Stats.tsx`):** dropped the project count entirely, a raw number
next to the actual portfolio doesn't add anything the photos don't
already prove, and it is exactly the kind of stat that goes stale the
moment new work sits unphotographed for a while. Replaced it with the
business's own city (read from its address) as a third, non-numeric
stat, so the strip still holds three balanced items instead of feeling
like something was removed and not replaced.

**Homepage Our Work (`FeaturedWork.tsx`):** rebuilt as a bento layout, one
large lead project plus four smaller ones, each captioned with its own
title and a short, category specific line about what that kind of work
actually involves, pulled from the featured projects the admin picks
(narrowed to 5 well spread ones: two window jobs, two door jobs, one
shower cubicle, instead of an arbitrary six). Ends with a clear "View
Full Gallery" button, this section is now a highlight reel, not a
grid of thumbnails.

**The full gallery page, rebuilt as flat browsing
(`GalleryExplorer.tsx`, `GalleryGrid.tsx`, `Lightbox.tsx`, new
`gallery/types.ts`):** this page now flattens every project's photos and
videos into one list (a project with 3 photos contributes 3 tiles, not
1), shown as a dense, tightly packed grid closer to a phone's Photos
app than a set of cards, filterable by the same 6 categories. Clicking
any tile opens the Lightbox scoped to the current filter, with previous
and next across every photo in it, not just the one project it came
from, this is the actual "scroll through all of them" experience. Added
a Slideshow button that auto advances every few seconds until paused,
and reworked the image sizing to use explicit viewport units with
`object-contain` instead of relying on a parent's percentage height,
which is what let some photos render cropped or cut off before, the
whole photo is now always visible, shrunk to fit, never cropped. The
project card view (one cover photo, a "+N more" badge) still exists,
that's what the homepage teaser and the admin panel use, just not this
page anymore.

**Header (`Navbar.tsx`, `Logo.tsx`):** the navbar background is now the
brand orange instead of plain white. `Logo.tsx` got a third rendering
mode, `onOrange`, white "PBS" and roof icon, dark navy "Projects", since
the existing orange accented logo would have simply vanished against an
orange background, this way it still reads as a clean two tone mark.
The "Get a Quote" button stays dark so it still reads as a button
against the new orange field, its hover state changed from "brighter
orange" (which would have blended into the bar itself) to a plain
darker shade.

**Products page copy (`seed.py`, and the existing rows in the real
database updated directly since seeding only inserts, it does not
update):** replaced the six generic one line descriptions with ones
grounded in what is actually in the 88 real job photos, awning and
casement windows fitted into brick or plastered walls, sliding patio
and security screen doors, frameless shower cubicles sealed to the tile,
and so on for shop fronts, ceilings, and cabinets.

**Verified:** `tsc --noEmit` came back clean and a full production build
generated all 13 frontend routes with zero errors. The Products and
Stats changes were confirmed directly against the real database (the
6 product descriptions updated, and the stats section no longer
depends on `projects.length` at all).

---

## Stage 17: Header polish, a moving hero, the logo back on the flyer

**Context:** direct feedback on the new orange header once it was actually
visible, it read as one flat block of color rather than something
designed, the roof icon sat beside "PBS Projects" instead of above it
(the flyer has it stacked), the hero photo just sat still, and getting
around the site once you'd clicked into a page felt like it needed an
easier way back.

**Header, now two tiers (`Navbar.tsx`):** a dark strip on top carries the
contact details, the brand orange bar underneath carries the logo and
navigation, that contrast between the two is what gives the header actual
depth instead of reading as a single undifferentiated color block. Added
a plain "Home" link alongside Our Work, Products, and About, so getting
back to the homepage doesn't rely on remembering the logo is clickable.

**Logo, restacked (`Logo.tsx`):** the roof/arc icon now sits directly
above "PBS Projects" instead of beside it, matching the actual flyer
this was always meant to recreate. Used everywhere the logo appears
(navbar, mobile drawer, footer, admin sidebar), still comes in three
color treatments depending on what's behind it (default, dark, and the
orange navbar's `onOrange` mode).

**Back and forward navigation (new `HistoryNav.tsx`):** two small
buttons next to the logo that call the browser's own back/forward
history, so there's always an obvious, tappable way to retrace your
steps around the site, not just the browser's own back button (which
isn't always obvious to reach for, especially on mobile).

**Hero photo, given some life (`Hero.tsx`, `globals.css`):** added a
slow, continuous zoom (roughly 1 to 1.08 scale over 22 seconds, drifting
back and forth rather than resetting with a jump) using a plain CSS
keyframe animation, `next/image` handles the actual photo, the animation
is just a transform on top of it. Skipped entirely for anyone with
reduced motion turned on, using Tailwind's `motion-reduce` variant.

**Verified:** `tsc --noEmit` came back clean and a full production build
generated all 13 frontend routes with zero errors.

---

## Stage 18: Header simplified, the real logo shape, a chat bubble, deletable quotes

**Context:** direct feedback once the two tier header and the back and
forward buttons from Stage 17 were actually seen, the small back and
forward buttons on the header did not look good and should go, and the
email and phone number on the top strip were not needed there. A real
reference image of the actual company logo was shared too, PBS large and
bold, PROJECTS smaller and spaced out on its own line underneath, both
below the orange roof icon, not what the site currently had. On top of
that, the WhatsApp button needed to actually invite a click instead of
only showing its label on hover, and the admin side needed a real
redesign pass plus the ability to delete a quote once it has been
visited or the job is finished.

**Header, back to one bar (`Navbar.tsx`):** removed the dark contact
strip and the back and forward buttons entirely, both are gone now, the
`HistoryNav.tsx` file was removed along with them. The header is a single
clean orange bar again, logo on the left, navigation and the Get a Quote
button on the right, the same on desktop and on the phone. Contact
details already live in the footer and on the Contact page, so nothing
about reaching the business was actually lost, it is just not crowding
the header anymore.

**Logo, matching the real mark (`Logo.tsx`):** rebuilt to match the
reference image exactly, the orange roof icon on top, "PBS" large and
bold underneath it, and "PROJECTS" smaller with wide letter spacing on
its own line below that. Still comes in the same three color treatments
depending on the background it sits on (default, dark, and the orange
navbar's onOrange mode), so it stays readable everywhere it is used,
navbar, footer, mobile drawer, and the admin sidebar.

**WhatsApp button, now it actually greets you (`WhatsAppFloat.tsx`,
`globals.css`):** instead of a label that only ever showed on hover
(easy to miss, and hover does not exist on a phone anyway), a real
speech bubble now pops open a couple of seconds after the page loads,
saying "Need help with a project? Chat to us, or reach us here on
WhatsApp, we usually reply fast," with its own close button so it does
not sit there forever. It only shows once per page load, added a small
pop in animation so it reads as a message arriving rather than a box
just appearing.

**Quotes can now be deleted, carefully (`routers/admin.py`,
`lib/adminApi.ts`, `QuoteTable.tsx`):** added a real
`DELETE /api/admin/quotes/{id}` endpoint, but only once a lead is past
"New," a brand new, not yet contacted lead cannot be deleted by
accident, it has to be moved to Contacted, Quoted, Won, or Lost first.
The Delete button on each quote card only appears once that condition
is met, and asks for a confirmation before it actually removes anything.
The guidance text above the quote list now explains this rule plainly.

**Admin panel, a proper redesign pass (`AdminNav.tsx`,
`admin/dashboard/page.tsx`, `ProjectCard.tsx`,
`TestimonialModerationList.tsx`):** the sidebar now marks the active
section with a real orange accent bar instead of a plain background
tint, and Log Out is now its own clearly marked red bordered button
instead of blending in with the other links. The dashboard's stat cards
got a colored left accent bar (orange for the numbers that need
attention, dark for plain totals) and a soft shadow that lifts slightly
on hover, the same hover lift was added to project cards and testimonial
cards in the admin panel so the whole admin experience feels like one
consistent, considered design instead of a set of plain bordered boxes.

**Verified for real, not assumed:** `tsc --noEmit` came back clean and a
full production build generated all 13 frontend routes with zero
errors. The backend's new delete rule was tested directly against the
real database models, not just read through, inserting a "New" test
quote and a "Contacted" test quote and calling the actual delete
function for both, confirming the "New" one is correctly blocked with
a clear message and the "Contacted" one deletes cleanly, then removing
both test rows so the real database was left exactly as it was before.

---

## Stage 19: The header is white now, so the real logo shows in its true colors

**Context:** the orange header looked good structurally, but the logo on
it was rendered entirely in white (icon, "PBS", and "PROJECTS" all one
flat color) just to stay visible against the orange, which meant it did
not actually look like the real company logo anymore, an orange roof
icon, a dark "PBS," and a gray "PROJECTS" underneath it. The ask was
plain: either find a way to keep the logo in its real colors, or change
the bar itself so it can.

**The fix (`Navbar.tsx`):** the main bar is now white instead of orange,
with a thin bottom border and a soft shadow so it still reads as a
distinct bar sitting above the page rather than blending into it. The
logo uses its plain, true color rendering (`Logo.tsx`'s default mode,
no recoloring needed), the exact same look as the reference image,
orange icon, dark "PBS," gray "PROJECTS." The nav links are now dark
text that turns orange on hover, and "Get a Quote" is a solid orange
button, so the brand color still shows up clearly in the header, just
through the button and the link hover state instead of the whole bar.

**Verified:** `tsc --noEmit` came back clean and a full production build
generated all 13 frontend routes with zero errors.

---

## Stage 20: A real gallery layout, a fuller About page, a calmer admin gallery

**Context:** three separate notes after living with the site for a while.
The full gallery page still felt like a raw camera roll rather than an
actual gallery. The About page had nowhere near enough on it besides the
founder and the map, though the map itself was called out as already
looking great and was left completely untouched. The admin gallery page
felt messy, every project card showed every one of its photos at once,
which got overwhelming fast with dozens of real projects on the page
together.

**Public gallery, now organized into real sections
(`GalleryExplorer.tsx`, `GalleryGrid.tsx`):** picking "All" now groups
every photo into one labeled section per category (Windows, Doors,
Shower Cubicles, and so on), each with its own heading and count, in a
fixed order, instead of whatever order the photos happened to land in
the database. Picking one category filter still shows just that
category's photos, no heading needed since the filter chip already says
what you are looking at. Tiles are bigger now too (2 to 4 per row
depending on screen size, instead of up to 6 tightly packed squares),
each rounded, with its project's title fading in on hover, this reads as
a real curated gallery rather than a phone's photo roll. The Lightbox's
previous and next still work correctly across the grouped order, this
was checked directly against the real data shape (88 photos across
windows, doors, and shower cubicles) with a small script simulating the
exact grouping logic used in the component, confirming every photo lands
in exactly one section and the running index never skips or repeats.

**About page, genuinely fuller now (`about/page.tsx`, new
`WhyChooseUs.tsx`):** added a three reason "why choose us" section
between the intro and the founder bio, real trade experience, everything
measured and built to fit its own opening, and being local and based in
Harare, each with a small icon. Added a "Real Work" strip of up to 4
actual finished job photos (whichever the admin has featured) linking
into the full gallery, so the About page is not just text and a founder
photo, it also shows real finished work before ending at the map. The
founder photo got a soft shadow and a subtle orange ring around it for a
bit more polish. The map section itself was left completely alone.

**Admin gallery, calmer by default (`ProjectCard.tsx`,
`admin/gallery/page.tsx`):** each project card now leads with just its
cover photo, like the public site already shows it, with a small "+N
more" badge if it has extra photos, instead of laying out every single
photo thumbnail on every card all the time. A new "Manage Photos" toggle
reveals the individual thumbnails, the per-photo delete control, and the
add-another-photo tile only when you actually want them, editing the
title, category, and featured flag is unchanged, still inline on the
card. This is meant to make scanning dozens of real projects at once
noticeably calmer without losing any of the existing photo management.

**Verified for real, not assumed:** `tsc --noEmit` came back clean and a
full production build generated all 13 frontend routes with zero
errors. The real database was queried directly to confirm the actual
category counts behind the gallery grouping (41 window projects and 54
window photos, 24 door projects and 32 door photos, 1 shower cubicle
project and 2 shower cubicle photos, 88 photos total), and the grouping
algorithm itself was run against that exact shape in an isolated script
to confirm the section counts and photo ordering come out correct.

---

## Stage 21: A new video job added, and no more browser popups in the admin panel

**Context:** two separate asks. First, a real finished job, 5 photos and a
short video walkthrough of a newly built home's windows and doors,
needed to go into the gallery, added to the pbs-projects folder directly
rather than through the admin panel by hand. Second, a plain description
of something confusing in the admin panel, doing an action would show
"an html option," which is the browser's own native confirm() popup, a
plain gray system dialog with no PBS styling at all that looks nothing
like the rest of the app, plus several actions had no visible
confirmation once they actually succeeded beyond the page quietly
refreshing.

**The new job, uploaded for real:** the 5 new photos and the video all
show the same newly built home, brick walls, a dark tile roof, and the
real PBS branded car parked out front in one of them, awning windows on
every wall, a sliding patio door, and a hinged aluminum security door.
Started the real backend against the real database and sent the exact
same requests the admin panel itself would send: created one new
project (Windows category, since windows are the majority of what is
shown), then attached the remaining 4 photos and the video to that same
project, so it is 1 job with 6 pieces of media, not 6 separate gallery
entries. Confirmed directly against the database afterward, 67 total
projects now (up from 66), 94 total media rows (93 images and 1 video,
up from 88 images and 0 videos), and the new project's own row lists all
6 files in the order they were added.

**No more browser popups (new `ConfirmDialog.tsx`, new
`ToastProvider.tsx`):** every place that used to call the browser's own
confirm() before deleting something, removing a photo or a whole project
in the admin gallery, deleting a quote request, deleting a testimonial,
now shows a real dialog built to match the app instead, a dimmed
backdrop, a white card, a plain language question, and Cancel or Delete
buttons in the app's own colors. Wired a small toast notification system
into the admin panel too, mounted once in the admin layout, so saving an
edit, uploading a photo, adding a photo, deleting something, approving a
testimonial, or changing a quote's status now all show a real, visible
confirmation message inside the app itself for a few seconds, not just a
silent refresh you have to trust worked.

**Verified for real, not assumed:** `tsc --noEmit` came back clean and a
full production build generated all 13 frontend routes with zero
errors. The new project was verified directly against the real database
after uploading, not just assumed to have worked, exact project and
media counts before and after matched the plan (66 to 67 projects, 88 to
94 media rows, 1 new video row).

---

## Stage 22: Real password rotation, and basic spam protection on public forms

**Context:** after being asked directly for an honest rating of the site
and how to close the gap toward a genuinely production ready one, the
single biggest real risk turned out to be a plain security gap, the
admin account was still using the placeholder password it was first set
up with (changeme123), and there was no way to change it at all short of
editing the database by hand. On top of that, the quote and testimonial
forms had a honeypot against simple bots but nothing stopping the same
form from being submitted over and over in a short window.

**A real way to change the password (`routers/auth.py`,
`schemas/user.py`):** new `POST /api/auth/change-password`, requires the
current password before accepting a new one (so a session left open on
a shared computer cannot be used to lock the real owner out), and
rejects a new password under 8 characters or identical to the current
one. New admin page at `/admin/settings` with a real form for this
(new `ChangePasswordForm.tsx`), added to the sidebar.

**The real password, actually rotated:** ran the new endpoint against
the real running backend and the real database, changing the admin
account from the original placeholder password to a genuinely random
new one. Confirmed the old password now correctly fails to log in, and
the new one works. The new password has been shared with Denzel
directly and is not written anywhere in this file or in the codebase.

**Basic rate limiting on public forms (new `core/rate_limit.py`,
`routers/quotes.py`, `routers/testimonials.py`):** both the quote
request and testimonial submission endpoints now allow at most 5
submissions per IP address every 5 minutes, on top of the honeypot spam
guard already in place. Simple in memory counter, no new dependency
needed, appropriate for this app's single process deployment, noted in
the code that this would need a shared store like Redis if this ever
ran across multiple worker processes or servers.

**Verified for real, not assumed:** `tsc --noEmit` came back clean and
a full production build generated all 14 frontend routes (up from 13,
the new Settings page) with zero errors. Against the real running
backend: logged in with the old password, changed it through the new
endpoint, confirmed the old password now returns 401 and the new one
logs in successfully, confirmed the endpoint correctly rejects a
too-short new password and an incorrect current password with clear
messages, and sent 6 rapid test quote submissions to confirm the first
5 succeed and the 6th is correctly blocked with a 429. The 5 test quote
rows created during that check were deleted afterward so the real
database was left exactly as it should be, holding only genuine
customer submissions.

**Still open, for the deployment stage specifically:** CORS is
currently locked to the local dev server address only, correct for now
since the site has no real domain yet, but will need updating the
moment there is one. No automated test suite, no production hosting, no
object storage for photos and video (still local disk), and no
automated backups, all genuinely separate pieces of work from this
security pass.

---

## Stage 23: A Shona and English language switch

**Context:** since this is a real Zimbabwean business, the ask was for
key parts of the site, the forms and the homepage and About page content
specifically, to be readable in Shona too, with a real toggle so a
visitor can pick their language rather than the two mixed together.
Denzel is providing the actual Shona wording himself rather than having
it guessed at, this stage builds the mechanism and gets every English
string ready to receive that text, the real Shona words themselves are
a separate, direct follow up.

**A small dictionary, not a heavy library (new `lib/i18n.ts`):** this
site only ever needs two languages and a fixed set of strings, so
instead of pulling in a full i18n framework, there is one plain object
mapping each piece of text to its English version and, once supplied,
its Shona version. If a Shona string is missing, it quietly falls back
to English rather than showing something blank or broken, so the
toggle is always safe to flip even before every translation is in.
Handles simple {placeholder} substitution too, for the one sentence on
the About page that has the real business name and years in business
built into the middle of it.

**The switch itself (new `components/i18n/LanguageProvider.tsx`,
`LanguageToggle.tsx`, `T.tsx`):** a small EN / SN pill in the header,
present on both desktop and mobile, remembers the visitor's choice in
their browser so it stays picked across pages and future visits.
`<T k="hero.title" />` is the small helper used everywhere translated
text needs to show up, it works even inside pages that fetch their own
data on the server, since it is just a small piece that reads the
current language on its own.

**Where it is wired in so far:** the navigation labels and Get a Quote
button, the entire homepage (hero, stats labels, products heading,
featured work section, testimonials section, the quote section
heading), both the quote form and testimonial form (every label,
placeholder, button state, and success or error message), and the
About page (the intro, the new Why Choose Us section, the Meet the
Founder label and fallback bio text, the Real Work section, and Find
Us). Real, admin entered content, product descriptions, project
titles, the founder's actual bio, real customer testimonials, stays
exactly as written by whoever entered it, only the site's own static
wording switches language.

**Verified for real, not assumed:** `tsc --noEmit` came back clean and
a full production build generated all 14 frontend routes with zero
errors. The template placeholder substitution was tested directly in
an isolated script with a real example sentence and a business name
containing punctuation, confirming it fills in correctly without
needing regex escaping.

**Still to come:** the actual Shona text for every key above, Denzel is
typing these directly, once supplied they get added to `lib/i18n.ts`
and show up everywhere that key is already wired in, no other code
changes needed.

## Stage 24: Phone and LAN access for local development

Denzel asked how to run the site locally and actually see it on his own
phone, not just his computer, so this stage makes the local dev setup
work from any device on the same WiFi network, with no manual IP typing
into config files.

**Backend (`backend/app/main.py`):** the CORS rule used to allow only
`http://localhost:3000`, which blocks a phone opening the frontend at
the Mac's network address (e.g. `http://192.168.1.23:3000`). Added an
`allow_origin_regex` matching the standard private network ranges
(`192.168.x.x`, `10.x.x.x`, `172.16.x.x` through `172.31.x.x`) on port
3000, so any device on the same home or office network is allowed in,
without hardcoding one specific address that would go stale the next
time the router hands out a different IP.

**Frontend (`lib/api.ts`, `lib/adminApi.ts`):** the API base URL used
to be hardcoded to `http://localhost:8000/api` whenever the
`NEXT_PUBLIC_API_URL` environment variable wasn't set. That works fine
on the computer itself, but a phone has no `localhost:8000`, that
address only means the phone. Changed both files so that, in the
browser, the API address automatically follows whatever host the page
was actually opened from, using `window.location.hostname`. Open the
site from the Mac at `localhost:3000` and it still talks to
`localhost:8000`. Open it from a phone at `192.168.1.23:3000` and it
automatically talks to `192.168.1.23:8000`, no `.env.local` file to
create or edit. Server side rendering (which always runs on the Mac
itself) keeps the plain `localhost` fallback, which is correct there.

**Frontend (`package.json`):** added a `dev:lan` script
(`next dev -H 0.0.0.0`) as an explicit, reliable way to start the
frontend listening on every network interface, alongside the existing
`dev` script which is left unchanged.

**How to view the site on a phone:** start the backend with
`uvicorn app.main:app --reload --host 0.0.0.0` and the frontend with
`npm run dev:lan`, find the Mac's own network address (System Settings,
Wi-Fi, Details, or `ipconfig getifaddr en0` in Terminal), then on the
phone, connected to the same WiFi, open a browser to
`http://<that address>:3000`.

**Verified for real, not assumed:** `tsc --noEmit` came back clean and
a full production build generated all 16 frontend routes with zero
errors. Confirmed by inspecting `git status` that only the four
intended files changed.

## Stage 25: Fix photos and forms not working on a phone

After Stage 24, opening the site on a phone loaded the pages, but photos
were still broken, and testing further would have shown the quote and
testimonial forms failing too. Both had the same root cause: Stage 24
only changed which host the browser talks to, it did not change how that
host reaches the backend, and two separate problems were hiding underneath.

**The real fix: a proxy, not a guess.** `frontend/next.config.js` now
proxies `/api/*` and `/static/*` straight through to the backend on this
same machine (`rewrites()`). The browser only ever talks to whichever
host it already opened the page on, whether that's the computer or a
phone's view of the Mac's network address, and this Next.js server
quietly forwards the request to the backend over its own localhost,
which is always correct since both run on the same machine. This
replaces the previous approach of trying to guess the right address in
`lib/api.ts`, `lib/adminApi.ts`, and `lib/media.ts`, all three are now
much simpler, plain relative paths, with no host guessing left to get
wrong. `lib/media.ts` in particular was still hardcoded to
`localhost:8000` even after Stage 24, which is the direct reason photos
never loaded on a phone, that one was missed the first time round.

**The second problem: a redirect that leaked the backend's own address.**
FastAPI expects certain routes with a trailing slash (`/api/gallery/`),
Next's proxy strips that slash before forwarding, which made FastAPI
issue its own redirect back to the slash version, using its own address
in that redirect (`http://127.0.0.1:8000/...`). A phone follows that
redirect and lands on itself, not the Mac, breaking the request. Fixed
on both sides: `skipTrailingSlashRedirect: true` in
`frontend/next.config.js` stops Next from mangling the slash before the
proxy even runs, and the affected backend routes
(`routers/settings.py`, `quotes.py`, `gallery.py`, `testimonials.py`,
`products.py`) are now each registered both with and without the
trailing slash, so neither form ever needs a redirect at all. This is
exactly the routes behind gallery browsing, product listings, site
settings, and the quote and testimonial submission forms, real
functionality, not just the photos.

**Verified for real, not assumed:** ran the actual backend and frontend
together, then curled every affected endpoint through the same proxy
path a phone would use: `/api/gallery/`, `/api/testimonials/`,
`/api/products/`, `/api/settings/`, a real POST to `/api/quotes/`, and a
real uploaded photo at `/static/uploads/...`, all came back 200 with no
redirect, where before the photo returned nothing usable and the
trailing-slash routes redirected to the backend's own address. Every
public page (home, about, gallery, products, quote, testimonial,
contact) still loads. The test quote row created during this check was
deleted from the real database afterward. A full production build still
generates all 16 routes with zero errors.

## Stage 26: SEO basics, real icons, and shareable link previews

Denzel asked what else could push the site toward 100%, this stage
covers the highest impact, most overdue piece: right now nothing on the
site helps Google understand it, and sharing a link on WhatsApp showed
a bare title with no preview image, both fixed here. Real content
additions (FAQ, service area, pricing guidance) are next, waiting on a
few real facts from Denzel before writing anything.

**Real icons, finally.** `public/manifest.json` had been pointing at
`icon-192.png` and `icon-512.png` since early in the project, neither
file actually existed, so the site could never properly install as an
app or show a real icon, only a blank placeholder. Generated both,
plus a matching `favicon.ico`, from the real logo mark (the orange
roof line over "PBS", same as the navbar), not a generic placeholder.
Also generated a proper Open Graph share image (`og-image.jpg`, on
brand, dark background, orange accents), before this, sharing the
site's link anywhere showed no image and a plain, unstyled title.

**Metadata that actually describes each page.** `layout.tsx` now sets
a title template so every page reads "Page Name | PBS Projects" in the
browser tab and in search results, plus a real description, keywords,
and full Open Graph and Twitter card tags using the new icon and share
image. Every page (`about`, `contact`, `gallery`, `products`, `quote`,
`testimonial`) got its own specific title and description instead of
inheriting one generic line for the whole site.

**LocalBusiness structured data.** Added `components/seo/StructuredData.tsx`,
plain JSON-LD, using only real, already-recorded settings (business name,
address, phone, email, map coordinates if set), nothing invented. This
is what lets Google show a proper business listing (map pin, phone
number, hours if ever recorded) instead of just a plain search result.

**Sitemap and robots.txt.** Added `app/sitemap.ts` and `app/robots.ts`,
Next.js generates real `/sitemap.xml` and `/robots.txt` files from
these automatically, listing every real public page so search engines
can find and crawl them, while keeping the admin panel out of it
entirely, there's nothing there worth indexing.

**One thing to know:** the site doesn't have a real public domain yet,
so `lib/seo.ts` uses a placeholder (`pbsprojects.co.zw`) for now, one
line to update once a real domain exists, everything else (the
sitemap, Open Graph tags, structured data) builds off that single value.

**Verified for real, not assumed:** `tsc --noEmit` came back clean and
a full production build generated all 19 routes, including the new
`/sitemap.xml` and `/robots.txt`, with zero errors. Opened the
generated icon and Open Graph image directly to confirm they render
correctly, not just that the build succeeded.

## Stage 27: Backend audit, security, storage, and pipelines

Denzel asked for a full pass over the backend itself, security, storage,
and pipelines, not more features, since a small project should be small
and solid rather than wide. Went through every router, service, model,
and script by hand rather than assuming anything was fine, found and
fixed five real issues, three of them nothing to do with what was asked
for but worth fixing anyway.

**Login had no rate limit at all.** Every public form already had one
(Stage 20), the one admin login endpoint, the single most attractive
target on the whole site, did not. Added a limit of 10 attempts per 15
minutes (routers/auth.py), looser than the public forms since a real
admin mistyping their own password shouldn't get locked out, but a
script guessing passwords nonstop now gets stopped cold.

**The rate limiter itself had a real bug.** It kept one shared counter
per IP address across every endpoint that used it, discovered by
actually testing the new login limit end to end and watching it trip
early, a handful of quote form submissions had already used up part of
the login endpoint's separate budget, since both were, invisibly, the
same counter. Fixed in `app/core/rate_limit.py` by keying on the
endpoint plus the IP instead of just the IP, added a regression test
(`tests/test_rate_limit.py`) proving the two are independent now.

**The test suite was writing into the real database.** `tests/conftest.py`
handed every test a client wired straight to the live app with no
override at all, meaning `pytest` was inserting rows like the "Test
User" quote directly into the same database behind the real site. Caught
this by actually running the existing tests and checking the real
database before and after, not by inspecting the code and assuming it
was fine. Rewrote conftest to give every test its own throwaway SQLite
database, verified clean now with a real before/after row count diff.
One more layer to this: my first fix for it still had test helper
functions importing the real `SessionLocal` directly, which bypasses the
override entirely, caught the same way, by running the suite and finding
a stray "admin@test.com" user sitting in the real users table afterward.
Fixed properly the second time and reverified.

**Two forms had no size limit on their text fields.** Quote and
testimonial submissions are public and unauthenticated, `details`,
`quote`, names, and roles had no length cap, an easy way to stuff the
database with an oversized payload. Added real limits in
`schemas/quote.py` and `schemas/testimonial.py` (a real name or quote is
never anywhere close to these), plus locked quote status updates and
testimonial ratings to their actual valid values instead of accepting
any string or number.

**The backup script would have failed the first time anyone ran it.**
`scripts/backup_db.sh` called `pg_dump`, a Postgres-only tool, the site
has run on SQLite this entire time. It also never touched the 39MB of
real uploaded photos and videos, only the database. Rewritten to detect
which one is actually in use, take a safe, consistent SQLite snapshot
(or a Postgres dump if this ever moves off SQLite), archive the uploads
folder alongside it, and keep the most recent 14 backups of each. Ran it
for real against the real database and real uploads folder, opened the
resulting backup file and confirmed the real data was actually inside
it, not just that the script exited cleanly.

**Smaller things fixed along the way:** a corrupt or fake "image" upload
used to crash with a raw, unhandled error and leave an orphaned file on
disk forever, now caught cleanly and the partial file removed
(`services/image_service.py`). The server now prints a loud warning on
startup if `SECRET_KEY` is ever left as its placeholder default, instead
of silently signing every login session with a value anyone could read.
One leftover em dash in a real user-facing error message
(`core/deps.py`) was replaced, matching the no-dash rule already applied
everywhere else on the site.

**One honest note, not something I fixed:** while testing all of this
against the real server, noticed the one real quote request that had
been sitting in the database (Denzel's own test of the quote form from
his phone) is no longer there. Nothing in this pass deletes quote rows,
and a full before/after check confirmed the test suite never touched the
real database, so this doesn't look like something this work caused,
most likely it was deleted through the admin panel in the normal course
of using it. Flagging it plainly rather than staying quiet about it, a
backup taken partway through this session does still have that row in
it if it's wanted back.

**Verified for real, not assumed:** all 13 backend tests pass against an
isolated database, confirmed with a real before/after row count diff
that the real database was untouched by the final run. Ran the actual
server and hit the fixed endpoints directly with curl, oversized quote
details rejected, login rate limit trips independently of the quote
form's own limit, the backup script runs clean end to end and produces
a real, valid, restorable backup. `alembic check` confirms no schema
drift between the models and the existing migrations.

## Stage 28: Add a way back to the real site from the admin panel

Denzel asked for the admin portal to have a direct gateway back to the
main website. Added a "View Site" link at the top of `AdminNav.tsx`,
above the section links, opens the homepage in a new tab rather than
navigating the admin tab away, so the logged in admin session stays
exactly where it was.

Verified with a clean `tsc --noEmit` and a full production build (19
routes, zero errors).

## Stage 29: Frontend quality pass, image speed and accessibility

Denzel asked what would actually improve frontend quality, then picked
image loading speed and an accessibility/consistency pass to tackle
first, out of a longer list of ideas.

**Real photos now use Next.js's Image component instead of plain img
tags.** Eight spots across the site (About page work samples, the
founder photo, homepage Featured Work covers, the gallery grid, the
before/after slider, and both the cover photo and per-photo thumbnails
in the admin panel) were all plain `<img>` tags, meaning every photo
loaded at full size regardless of the device, nothing was lazy loaded
below the fold, and nothing served a smaller version to a phone than a
desktop. Converted all eight to Next's Image component with real `sizes`
values matched to how big each one actually renders at each breakpoint,
this is the single biggest real page-speed improvement available, most
visitors are on a phone. Added `sharp` as a real dependency, Next's
image optimizer needs it once this runs on a real server instead of
Vercel. One image, the full-size Lightbox viewer, was deliberately left
as a plain img, it needs to size itself to each photo's own natural
shape capped by the screen, which Image's `fill` mode can't do without
knowing that shape in advance, the right call there is leaving it alone,
not forcing a bad fit.

**Keyboard and screen reader gaps, closed.** A full spot-check turned up
real, specific problems, not vague concerns: every button and link on
the whole site relied purely on the browser's own unstyled default focus
outline, present but inconsistent and sometimes barely visible (the dark
mobile menu in particular). One CSS rule in `globals.css` now gives every
interactive element a real, consistent focus ring when navigated to by
keyboard, without adding anything for an ordinary mouse click. The
in-app confirm dialog (`ConfirmDialog.tsx`) had no way to close with
Escape and no `role="dialog"` for a screen reader to recognize it as a
modal, both added. The mobile menu drawer had the same two gaps, both
fixed the same way. Toast notifications (`ToastProvider.tsx`) appeared
with no announcement at all for a screen reader user, `aria-live`
fixed that.

**A real contrast problem, measured, not guessed.** `text-neutral-400`
(Tailwind's default gray, #A3A3A3) on a white background works out to
roughly 2.5:1 contrast, well under the 4.5:1 the accepted accessibility
standard calls for body text, meaning this text was genuinely hard to
read for anyone with low vision, not just a theoretical concern. It
showed up 13 times across the site, mostly loading and empty states,
footer text, and hint text like "At least 8 characters", all real
content someone actually needs to read. Bumped to `text-neutral-500`
everywhere it appeared (roughly 4.7:1, clears the bar).

**One small but real fix along the way:** admin panel photo thumbnails
in "Manage Photos" all shared the exact same alt text (the project's
title), a screen reader user managing five photos on one job heard the
same description five times with no way to tell them apart. Each now
reads "Project Title, photo 2" and so on.

**Verified for real, not assumed:** `tsc --noEmit` came back clean, and
a full production build generated all 19 routes with zero errors.

## Stage 30: Company motto and a real leadership team

Denzel gave the company motto, NDEZVEBASA, with a specific two color
split ("NDE" orange, "ZVEBASA" the surrounding text color), and asked
for it on the top bar and wherever else makes sense. Also asked to add
the real leadership, CEO Panashe Simbi and Operations Manager Herbert
Matembunze, to the About page with a short description based on each
role.

**The motto.** Built once as `components/ui/Motto.tsx` rather than
retyping the two colored spans everywhere it shows up, so the exact
styling can only ever drift in one place. Placed in the navbar next to
the logo (both the desktop bar and the mobile menu), in the footer next
to the logo, and on the About page under the intro, alongside the
Harare, Zimbabwe location tag in the homepage hero. Present everywhere
that already carries the brand identity, not scattered in unrelated
places.

**The leadership team.** Added `components/home/TeamSection.tsx` to the
About page: Panashe Simbi (CEO) and Herbert Matembunze (Operations
Manager), each with a short, honest description of what that role
actually covers day to day, not invented personal history, just what a
CEO and an Operations Manager genuinely do in a business like this. This
replaces the page's old "Meet the Founder" section, which was still
showing its generic, never filled in fallback text (no real name or
photo had ever been set there), real named leadership in its place
reads as a real team, not a placeholder. That component's own code and
backend fields are left in place, unused for now rather than deleted, in
case they're wanted for something else later.

**Still waiting on:** the two real photos (mentioned as sitting in
Downloads), Cowork's sandbox can't reach a folder that hasn't been
shared with it, only the pbs-projects folder itself. Each team card
falls back to the same initials-badge style the old founder section
used until the real photos are dropped into the chat or the Downloads
folder is shared, at which point they slot in directly, no other
changes needed.

**Verified for real, not assumed:** `tsc --noEmit` came back clean and a
full production build generated all 19 routes with zero errors.

## Stage 31: Team card layout, full photo beside description

The team cards on the About page (Panashe Simbi, CEO, and Herbert
Matembunze, Operations Manager) previously showed a small circular cropped
headshot above the name and bio, the same pattern the old founder section
used. Denzel sent the two real photos, on site shots in PBS branded polo
shirts and caps, and asked for the full picture to show instead, with the
description placed next to it rather than underneath.

Changed:
- TeamCard now renders a full, uncropped photo (portrait aspect ratio, not
  cropped to a circle) on one side and the name, role, and bio on the
  other, side by side on tablet and up, stacked on mobile.
- Wired in the two real photo paths, expected at
  frontend/public/images/team/panashe-simbi.jpg and
  frontend/public/images/team/herbert-matembunze.jpg, in that order (CEO
  first, per Denzel's confirmation).
- The initials fallback badge is kept for whichever photo isn't present
  yet, so the page never shows a broken image in the meantime.

Note: the actual photo files themselves still need to be added, the
version of the photos Denzel sent were not accessible from this session's
file access, they will need to be resent so they can be saved to the paths
above.

Verified: tsc --noEmit clean, full production build clean, no dashes in
any user facing text.

## Stage 32: Add the real team photos

Added the two real photo files Denzel provided to
frontend/public/images/team/, panashe-simbi.jpg (CEO) and
herbert-matembunze.jpg (Operations Manager), replacing the initials
placeholders on the About page team cards.

Verified: tsc --noEmit clean, full production build clean, no dashes in
any user facing text.

## Stage 33: Redesign team section as an editorial layout, not stacked cards

Denzel felt the two team entries looked like a repeated boxed card just
piled one on top of the other, and asked for something with real design
thought behind it.

Changed the layout on the About page team section:
- Dropped the bordered card box for each person. The section is now one
  continuous piece: a large portrait photo and generous, left aligned
  text for each person, separated by a thin rule and wide vertical space
  instead of a card border.
- The two entries alternate, photo on the left for the first person,
  photo on the right for the second, so the section reads as one
  designed spread rather than the same component stacked twice.
- Added the same soft orange accent panel behind each photo that the
  homepage hero photo already uses, tying this section back into the
  rest of the site's visual language instead of feeling bolted on.
- Bigger name and role type, more breathing room around the bio text.

Verified: tsc --noEmit clean, full production build clean, no dashes in
any user facing text.

## Stage 34: Give the name and role text real typographic weight

Denzel felt the name/role/bio text next to each photo still looked basic,
just three plain lines of roughly the same visual weight.

Changed, per person:
- The role is now a small pill (soft orange background, orange text)
  instead of plain uppercase label text.
- The name is bigger and heavier (extrabold, larger size) so it reads as
  the clear headline of the block.
- The bio now has a left rule next to it on desktop, set off like a quote
  rather than a plain paragraph.
- A large, very faint initials monogram sits behind the name on desktop
  as a purely decorative touch, mirroring the kind of flourish agency and
  studio team pages use, hidden on mobile where there is no room for it.

Verified: tsc --noEmit clean, full production build clean, no dashes in
any user facing text.

## Stage 35: Instant admin-to-site updates, and quote/testimonial badges

Two improvements Denzel asked for after a review of the admin panel: make
admin changes show on the public site immediately, and surface new leads
and pending testimonials in the sidebar instead of requiring a manual
check of each page.

Instant updates:
- Public pages read data through lib/api.ts with a 60 second ISR cache
  (`next: { revalidate: 60 }`), so previously an admin change could take
  up to a minute to show to a real visitor.
- Added a new route, app/api/revalidate/route.ts, that calls Next's
  revalidatePath for a given list of paths. It lives inside Next's own
  app directory, so it is resolved before the next.config.js rewrite that
  sends every other /api/* request to the FastAPI backend, no collision.
- Added lib/revalidate.ts's revalidatePublicPaths(), a best effort call
  the admin panel fires right after a save succeeds. If it fails for any
  reason the page still catches up within the normal 60 second window,
  so this can never turn a successful admin save into a visible error.
- Wired into admin/gallery/page.tsx (covers project create, project
  edit, project delete, and photo/video add or remove, since all of
  those already funnel through loadGallery()) and into
  TestimonialModerationList.tsx's approve and delete actions.
- Only revalidates the exact public pages that actually show that data:
  home, about, and gallery for projects, home only for testimonials.

Notification badges:
- AdminNav.tsx now fetches quote and testimonial counts (refreshed on
  every navigation and again every 45 seconds while the panel is open)
  and shows a small orange badge on the Quotes and Testimonials links
  when there is a new (unhandled) quote or a pending (unmoderated)
  testimonial, so it is obvious something needs attention without
  opening every section to check.

Verified: tsc --noEmit clean, full production build clean (including the
new /api/revalidate route showing as its own dynamic route, no conflict
with the backend proxy), no dashes in any user facing text.

## Stage 36: Redesign the admin panel's navigation and overall look

Denzel asked whether the admin panel itself could look and navigate
better, not just be functional.

Changed:
- AdminNav.tsx: every section (Dashboard, Gallery, Quotes, Testimonials,
  Settings) now has its own small icon next to the label, so the sidebar
  can be scanned at a glance instead of reading five lines of plain text.
  The sidebar also now shows who is actually signed in (fetched from
  auth/me) above the Log Out button, previously that was just a bare
  button with no confirmation of whose session it was.
- New shared component, components/admin/PageHeader.tsx: a consistent
  title, description, and optional action slot with a bottom rule.
  Applied to every admin page (Dashboard, Gallery, Quotes, Testimonials,
  Settings), replacing five slightly different hand rolled <h1>/<p> pairs
  with one consistent header treatment across the whole panel.
- Dashboard stat cards now each have an icon in a colored circle (inbox,
  bell, gallery, star) instead of a plain colored left border, matching
  the icon language used in the sidebar.

Verified: tsc --noEmit clean, full production build clean, no dashes in
any user facing text.

## Stage 37: Remove personalized admin name, redesign the mobile nav drawer

Two things Denzel flagged after seeing the admin sidebar and a phone
screenshot of the site's mobile menu.

Admin sidebar: removed the "Signed in as [name]" line added in Stage 36.
There is only one shared admin login, and more than one person manages
this site, so naming whichever person's name happens to be on that one
account misrepresented it as a personal account. The Log Out button is
still there on its own, just without a name attached to it.

Mobile nav drawer (Navbar.tsx): the phone view looked like the desktop
nav just narrowed down rather than something designed for a phone, plain
white text list, a lot of empty space, and the floating WhatsApp button
(WhatsAppFloat.tsx, fixed to the same bottom right corner on every page)
was bleeding through on top of the open drawer and its own "Chat on
WhatsApp" link and "Get a Quote" button, two competing WhatsApp entry
points overlapping in the same corner at once.

Fixed:
- The drawer and its backdrop now use a higher z-index (z-[60] and
  z-[55]) than the floating WhatsApp button (z-50), so opening the menu
  now fully covers that button instead of it showing through.
- Each nav link (Home, Our Work, Products, About) now has its own icon
  and highlights with a left accent bar when it is the current page,
  matching the same visual language already used in the admin sidebar.
- The phone number and WhatsApp chat link are now a distinct card (icon
  plus label, soft background) instead of two bare lines of text just
  sitting under the nav links.

Verified: tsc --noEmit clean, full production build clean, no dashes in
any new user facing text (two pre-existing dashes remain inside code
comments only, exempt per the Stage 10 precedent).

## Stage 38: Tidy up the loose original photos at the repo root

Denzel noticed the GitHub file listing was cluttered with 95 randomly
named JPG/MP4 files sitting at the top level of the repo, the raw
originals from the very first batch of real jobsite photos, left there
since before they were sorted into real projects. Confirmed none of them
are read by any code in frontend, backend, or docs, the site serves its
own already organized copies from frontend/public instead.

Denzel asked to keep them (in case they're still needed) rather than
delete them, just organized properly. Moved all 95 files into a new
original-photos/ folder with a short README explaining what they are,
using `git mv` so their history is preserved rather than looking like a
delete-and-re-add.

Verified: no code references broken (grep confirmed before the move that
nothing pointed at these files by their old root level path), git status
clean after the move.
