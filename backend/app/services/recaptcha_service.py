"""Verifies a Google reCAPTCHA v2 token server-side, the only place it can
actually be trusted, a token the browser claims is valid could just as
easily be forged by a bot that skips the widget entirely and calls the API
directly. Google's own siteverify endpoint is the real check.

If RECAPTCHA_SECRET_KEY isn't set (local dev, or before the real site has
been registered at google.com/recaptcha/admin), verification is skipped
entirely rather than rejecting every quote request with no way to pass it.
"""
import requests

from app.config import settings

VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify"


def recaptcha_configured() -> bool:
    return bool(settings.recaptcha_secret_key)


def verify_recaptcha(token: str) -> bool:
    if not recaptcha_configured():
        return True

    if not token:
        return False

    try:
        response = requests.post(
            VERIFY_URL,
            data={"secret": settings.recaptcha_secret_key, "response": token},
            timeout=5,
        )
        response.raise_for_status()
        return bool(response.json().get("success"))
    except requests.RequestException:
        # Google's own service being briefly unreachable shouldn't be the
        # reason a real customer's quote request gets rejected outright,
        # the honeypot field and the existing rate limit (5 per 5 minutes,
        # see routers/quotes.py) still guard this endpoint either way.
        return True
