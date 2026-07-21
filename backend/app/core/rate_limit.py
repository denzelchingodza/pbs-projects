"""
Simple in-memory rate limiter for public, unauthenticated POST endpoints
(quote requests, testimonials), on top of the honeypot spam guard already
in place on both forms. The honeypot catches simple bots that fill in
every field, this catches the case where something (bot or a person)
just submits the same form over and over in a short window.

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

_submission_times: dict[str, list[float]] = defaultdict(list)


def rate_limit(max_requests: int = 5, window_seconds: int = 300):
    """Returns a FastAPI dependency allowing at most `max_requests` submissions
    per IP address within `window_seconds`, raising 429 once that's exceeded."""

    def dependency(request: Request) -> None:
        ip = request.client.host if request.client else "unknown"
        now = time.time()
        timestamps = _submission_times[ip]

        while timestamps and now - timestamps[0] > window_seconds:
            timestamps.pop(0)

        if len(timestamps) >= max_requests:
            raise HTTPException(
                status_code=429,
                detail="Too many submissions from this connection. Please wait a few minutes and try again.",
            )

        timestamps.append(now)

    return dependency
