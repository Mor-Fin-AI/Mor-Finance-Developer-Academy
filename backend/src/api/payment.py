"""
Payment callback API — SANDBOX / TEST MODE ONLY.

The Subscription Plans checkout POSTs here after Paystack/Flutterwave reports success in the browser, and the
student's profile (keyed by Telegram handle) is marked "subscribed". Nothing is verified with the payment
provider, so a caller can claim any payment: the endpoint is disabled unless ALLOW_MOCK_PAYMENT_CALLBACK=true,
and must stay disabled in production until it is replaced by server-side verification / provider webhooks.
"""
import math
import re
from datetime import datetime, timezone
from typing import Any, Dict

from fastapi import APIRouter, Body, HTTPException
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

from src.config import settings
from src.services.db import db_instance, get_subscriptions_collection

router = APIRouter()

# Telegram usernames: 5-32 characters, letters/digits/underscore, must start with a letter.
HANDLE_RE = re.compile(r"^[a-z][a-z0-9_]{4,31}$")
REFERENCE_RE = re.compile(r"^[A-Za-z0-9._-]{4,100}$")
PLAN_RE = re.compile(r"^[A-Za-z][A-Za-z0-9 ]{0,39}$")

_indexed_client: Any = None


def _guard_sandbox() -> None:
    if not settings.allow_mock_payment_callback:
        raise HTTPException(status_code=403, detail={
            "error": "mock_endpoint_disabled",
            "detail": "the sandbox payment callback is disabled (set ALLOW_MOCK_PAYMENT_CALLBACK=true to enable it outside production)",
        })


def _parse_amount(raw: Any) -> float:
    """A finite float, or NaN for anything that is not a plain number / numeric string."""
    if isinstance(raw, bool) or raw is None:
        return math.nan
    try:
        value = float(raw.strip() if isinstance(raw, str) else raw)
    except (TypeError, ValueError):
        return math.nan
    return value if math.isfinite(value) else math.nan


def validate_callback(body: Dict[str, Any]) -> Dict[str, Any]:
    """Returns the cleaned payload, or raises 400 with per-field errors."""
    details: Dict[str, str] = {}
    handle = str(body.get("telegramHandle") or "").strip().lstrip("@").lower()
    country = str(body.get("chosenCountryNode") or "").strip().upper()
    reference = str(body.get("transactionReference") or "").strip()
    amount = _parse_amount(body.get("paymentAmount"))
    plan = str(body.get("plan") or "").strip()

    if not HANDLE_RE.match(handle):
        details["telegramHandle"] = "expected a Telegram username: 5-32 letters, digits or underscores, starting with a letter"
    if country not in settings.payment_countries:
        details["chosenCountryNode"] = f"expected one of: {', '.join(settings.payment_countries)}"
    if not amount > 0:  # also false for NaN
        details["paymentAmount"] = "expected a number greater than zero"
    if not REFERENCE_RE.match(reference):
        details["transactionReference"] = "expected 4-100 characters: letters, digits, dot, dash or underscore"
    if plan and not PLAN_RE.match(plan):
        details["plan"] = "expected a plan name of up to 40 letters, digits or spaces"

    if details:
        raise HTTPException(status_code=400, detail={"error": "validation_failed", "details": details})
    return {
        "telegramHandle": handle,
        "chosenCountryNode": country,
        "paymentAmount": amount,
        "transactionReference": reference,
        "plan": plan or None,
    }


async def _collection():
    """The subscriptions collection; a transaction reference may only ever belong to one profile."""
    global _indexed_client
    coll = get_subscriptions_collection()
    if _indexed_client is not db_instance.client:
        await coll.create_index("transactionReferences", unique=True)
        _indexed_client = db_instance.client
    return coll


def _public(profile: Dict[str, Any]) -> Dict[str, Any]:
    out = {k: v for k, v in profile.items() if k != "_id"}
    for key in ("createdAt", "updatedAt"):
        if isinstance(out.get(key), datetime):
            out[key] = out[key].replace(tzinfo=timezone.utc).isoformat()
    return out


@router.post("")
async def payment_callback(
    body: Dict[str, Any] = Body(..., examples=[{
        "telegramHandle": "@satoshi_dev", "chosenCountryNode": "KE", "paymentAmount": 3750,
        "transactionReference": "mor-KE-1767225600000-9f8e7d6c", "plan": "Career Boost",
    }]),
):
    """Marks the Telegram handle's profile "subscribed". Replaying the same reference for the same handle is a no-op."""
    _guard_sandbox()
    values = validate_callback(body)
    coll = await _collection()

    owner = await coll.find_one({"transactionReferences": values["transactionReference"]}, {"_id": 1})
    if owner and owner["_id"] != values["telegramHandle"]:
        raise HTTPException(status_code=409, detail={"error": "duplicate_reference", "detail": "this transaction reference was already used"})
    if owner:
        return {"status": "subscribed", "profile": _public(await coll.find_one({"_id": owner["_id"]}))}

    now = datetime.now(timezone.utc)
    try:
        profile = await coll.find_one_and_update(
            {"_id": values["telegramHandle"]},
            {
                "$set": {**values, "status": "subscribed", "updatedAt": now},
                "$addToSet": {"transactionReferences": values["transactionReference"]},
                "$setOnInsert": {"createdAt": now},
            },
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail={"error": "duplicate_reference", "detail": "this transaction reference was already used"})
    return {"status": "subscribed", "profile": _public(profile)}


@router.get("")
async def payment_callback_list():
    """Sandbox inspection: every subscribed profile, most recently updated first."""
    _guard_sandbox()
    coll = await _collection()
    return [_public(p) async for p in coll.find().sort("updatedAt", -1).limit(500)]
