"""
Regression test for a real bug found while auditing the backend: every
call to rate_limit() used to share one dict keyed only by IP address, with
no separation between endpoints. That meant submitting the quote form a
few times quietly ate into the login endpoint's separate budget too (and
the reverse), since both were, invisibly, the same counter. Fixed in
app/core/rate_limit.py by keying on "scope:ip" instead of just "ip", each
call site now passes its own scope name. This test submits quotes up to
that form's own limit and confirms login is completely unaffected, the
two budgets are provably independent.
"""


def test_quote_submissions_do_not_affect_login_rate_limit(client):
    quote_payload = {"full_name": "Test User", "phone": "0771234567"}
    for _ in range(5):
        r = client.post("/api/quotes/", json=quote_payload)
        assert r.status_code in (200, 201)

    # The quote form's own limit (5 per 5 minutes) is now maxed out, a 6th
    # quote should be refused, but logins from the same IP should be
    # completely untouched by that.
    maxed_out = client.post("/api/quotes/", json=quote_payload)
    assert maxed_out.status_code == 429

    login_attempt = client.post(
        "/api/auth/login", json={"email": "nobody@test.com", "password": "wrong"}
    )
    assert login_attempt.status_code == 401  # rejected for a wrong password, not a 429
