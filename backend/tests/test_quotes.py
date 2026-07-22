"""Covers the public quote submission form: the happy path, the honeypot
spam guard, the new field-length limits, and the rate limit (see
routers/quotes.py and schemas/quote.py)."""


def test_submit_quote(client):
    payload = {"full_name": "Test User", "phone": "0771234567", "product": "Windows"}
    r = client.post("/api/quotes/", json=payload)
    assert r.status_code in (200, 201)


def test_honeypot_rejects_bot_submission(client):
    payload = {"full_name": "Bot", "phone": "0000000000", "website": "http://spam.example"}
    r = client.post("/api/quotes/", json=payload)
    assert r.status_code == 400


def test_oversized_details_is_rejected(client):
    # schemas/quote.py caps details at 5000 characters, a public form with
    # no length limit is an easy way to stuff a database with junk.
    payload = {"full_name": "Test User", "phone": "0771234567", "details": "x" * 10000}
    r = client.post("/api/quotes/", json=payload)
    assert r.status_code == 422


def test_quote_submission_is_rate_limited(client):
    payload = {"full_name": "Test User", "phone": "0771234567"}
    for _ in range(5):
        client.post("/api/quotes/", json=payload)

    r = client.post("/api/quotes/", json=payload)
    assert r.status_code == 429
