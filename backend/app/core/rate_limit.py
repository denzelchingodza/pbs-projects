"""
Simple in-memory rate limiter for public, unauthenticated POST endpoints
(quote requests, testimonials), on top of the honeypot spam guard already
in place on both forms, and for the admin login endpoint, where the limit
is what stands between the one real admin account and someone just
guessing passwords as fast as the server will accept them.

Intentionally simple: an in-memory dict keyed by IP address, which is
good enough for this app's single-process deployment. If this ever runs
behind multiple worker processes or multiple servers, this would need to
move to a shared store (Redis, for example) instead, since each process
would otherwise keep its own separate counts and the limit could be
bypassed just by hitting a different worker.
"""
import time
from collections import defaultdict

from fastapi import HTTPException, Request

# Keyed by "scope:ip", not just "ip". Every call to rate_limit() used to
# share this one dict keyed on IP address alone, which meant a visitor's
# quote form submissions and their login attempts were silently drawing
# from the exact same budget, five quote submissions in a row would leave
# only five of the login endpoint's supposed ten attempts actually
# available, and the reverse: someone hammering login could eat into the
# quote form's spam allowance too. Each endpoint that calls rate_limit()
# now gets its own independent counter per visitor.
_submission_times: dict[str, list[float]] = defaultdict(list)


def rate_limit(max_requests: int = 5, window_seconds: int = 300, scope: str = "default"):
    """Returns a FastAPI dependency allowing at most `max_requests` requests
    per IP address within `window_seconds`, raising 429 once that's exceeded.
    `scope` keeps this endpoint's count separate from every other endpoint
    that also uses rate_limit(), pass a distinct scope per call site."""

    def dependency(request: Request) -> None:
        ip = request.client.host if request.client else "unknown"
        key = f"{scope}:{ip}"
        now = time.time()
        timestamps = _submission_times[key]

        while timestamps and now - timestamps[0] > window_seconds:
            timestamps.pop(0)

        if len(timestamps) >= max_requests:
            raise HTTPException(
                status_code=429,
                detail="Too many submissions from this connection. Please wait a few minutes and try again.",
            )

        timestamps.append(now)

    return dependency
