# PBS Projects — Notes

## Reference material
- Client questionnaire answers
- Project brief & draft quote
- Design references used for the v4 frontend direction: capetownccid.org (calm,
  institutional/editorial feel) and rocaindustry.com (minimal, product-led,
  same industry — glass fittings)

## Backend functionality decisions (July 2026)
- **Site Settings (singleton table):** one editable source of truth for
  business name, address, phone numbers, WhatsApp, email, map coordinates,
  and the owner's About/founder bio + photo. Public GET, admin-only PATCH —
  so the owner can update any of this himself without a code change.
- **Map:** free Google Maps iframe embed built from the address string in
  Site Settings — no API key or billing needed. Only upgrade to the Maps
  JavaScript API if live in-page directions/search become a requirement.
- **Quote lead pipeline:** status moves new -> contacted -> quoted -> won/lost,
  with a private admin_notes field, so no enquiry gets forgotten.
- **Spam protection:** honeypot field on the public quote form — cheap, no
  CAPTCHA/user friction, catches most simple bots.
- **Image handling:** uploads are auto-resized (full + thumbnail) with Pillow
  on save, since most customers browse on phones with limited data.
- **Featured projects:** `is_featured` flag on gallery items so the homepage
  can highlight the best work rather than just the most recent.
- **Backups:** `backend/scripts/backup_db.sh` — a simple pg_dump cron job.
  Losing quote/lead data would cost the business real money, so this is cheap
  insurance even pre-launch.

## Still frontend-side, being iterated on continuously
- Visual design of the map and About/founder section
- Overall look and feel (see v1-v4 frontend demos for direction history)
