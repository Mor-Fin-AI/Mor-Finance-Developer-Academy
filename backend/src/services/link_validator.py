"""
Zero Broken Links — Asynchronous Link Health Validator
Executes non-blocking HTTP HEAD and GET checks across application URLs.
Detects 404 Not Found, 410 Gone, soft-404 SPA error pages ("This page does not exist"),
DNS resolution failures, and server errors to prune expired job postings.
"""
import asyncio
import time
from typing import Dict, Any, List, Optional, Tuple
import httpx

# Browser-mimicking User-Agent to avoid generic bot blocks by career portals
BROWSER_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)

# Known active status codes that confirm link validity
ACTIVE_STATUS_CODES = {
    httpx.codes.OK,                    # 200
    httpx.codes.CREATED,               # 201
    httpx.codes.ACCEPTED,              # 202
    httpx.codes.NO_CONTENT,            # 204
    httpx.codes.MOVED_PERMANENTLY,     # 301
    httpx.codes.FOUND,                 # 302
    httpx.codes.SEE_OTHER,             # 303
    httpx.codes.TEMPORARY_REDIRECT,    # 307
    httpx.codes.PERMANENT_REDIRECT,    # 308
}

# Cloudflare / WAF challenges that confirm the host domain is live
WAF_CHALLENGE_CODES = {
    httpx.codes.FORBIDDEN,             # 403
    httpx.codes.TOO_MANY_REQUESTS,     # 429
}

# Soft-404 strings rendered by React / Vue / Next.js SPAs returning HTTP 200
SOFT_404_SIGNATURES = [
    "this page does not exist",
    "page does not exist",
    "page not found",
    "uh oh. this page",
    "404 - not found",
    "job listing expired",
    "job has expired",
    "position is no longer open",
    "no longer accepting applications"
]


def _has_soft_404_error(body_text: str) -> bool:
    """Checks if the HTML body contains standard soft-404 text signatures."""
    if not body_text:
        return False
    lower_text = body_text.lower()
    return any(sig in lower_text for sig in SOFT_404_SIGNATURES)


async def validate_url_health(
    url: str,
    client: Optional[httpx.AsyncClient] = None,
    timeout_seconds: float = 5.0
) -> Tuple[bool, int, str]:
    """
    Validates a destination application URL using fast async network requests and content checks.
    Returns: (is_active: bool, http_status_code: int, status_reason: str)
    """
    if not url or not isinstance(url, str) or not url.strip().startswith(("http://", "https://")):
        return False, 400, "Invalid URL Schema"

    target_url = url.strip()

    headers = {
        "User-Agent": BROWSER_USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }

    own_client = False
    if client is None:
        client = httpx.AsyncClient(
            headers=headers,
            follow_redirects=True,
            verify=False,
            timeout=httpx.Timeout(timeout_seconds, connect=timeout_seconds)
        )
        own_client = True

    try:
        # 1. Execute GET request to verify both status code and content validity
        resp = await client.get(target_url, headers=headers)
        status = resp.status_code

        # Check for hard HTTP errors
        if status in (404, 410):
            return False, status, f"Expired Link (HTTP {status})"
        elif status >= 500:
            return False, status, f"Server Error (HTTP {status})"

        # Check for SPA Soft-404 error page (e.g. solana.org/careers returning "This page does not exist")
        if status in ACTIVE_STATUS_CODES:
            if _has_soft_404_error(resp.text[:5000]):
                return False, 404, "Expired / Soft-404 (Page does not exist)"
            return True, status, "Active (Verified 200 OK)"

        elif status in WAF_CHALLENGE_CODES:
            return True, status, "Active (WAF/Cloudflare Protected)"

        return status < 400, status, f"HTTP Status {status}"

    except httpx.ConnectTimeout:
        return False, 504, "Connection Timeout"
    except httpx.ConnectError:
        return False, 502, "Connection Refused / Dead Host"
    except Exception as exc:
        return False, 0, f"Network Error: {type(exc).__name__}"
    finally:
        if own_client:
            await client.aclose()


async def validate_jobs_batch(
    jobs: List[Dict[str, Any]],
    concurrency: int = 15,
    timeout_seconds: float = 5.0
) -> List[Dict[str, Any]]:
    """
    Validates a list of job dictionaries in parallel using an async semaphore pool.
    Updates each job with `is_active`, `last_verified_at`, and `validation_status`.
    """
    if not jobs:
        return []

    semaphore = asyncio.Semaphore(concurrency)
    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    async with httpx.AsyncClient(
        headers={"User-Agent": BROWSER_USER_AGENT},
        follow_redirects=True,
        verify=False,
        timeout=httpx.Timeout(timeout_seconds, connect=timeout_seconds)
    ) as client:

        async def _check_one(job: Dict[str, Any]) -> Dict[str, Any]:
            url = job.get("application_url") or job.get("url") or ""
            async with semaphore:
                is_active, status_code, reason = await validate_url_health(
                    url=url, client=client, timeout_seconds=timeout_seconds
                )
            
            updated = dict(job)
            updated["is_active"] = is_active
            updated["last_verified_at"] = now_iso
            updated["http_status"] = status_code
            updated["verification_reason"] = reason
            if not updated.get("application_url"):
                updated["application_url"] = url
            if not updated.get("url"):
                updated["url"] = url
            return updated

        tasks = [_check_one(j) for j in jobs]
        validated_jobs = await asyncio.gather(*tasks, return_exceptions=False)
        return validated_jobs
