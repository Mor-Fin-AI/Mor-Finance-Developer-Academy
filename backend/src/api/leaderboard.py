"""
Leaderboard API — testnet activity submissions ranked by distinct transaction count.

Each submission is one (telegram, chain, txHash). A tx hash counts once, for whoever submits it first
(unique index on txHash). Ranking: most transactions, then most distinct chains, then earliest first submission.
Set VERIFY_ONCHAIN=true (plus the RPC_URL_* settings) to require each tx to exist and have succeeded on-chain.
"""
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import httpx
from fastapi import APIRouter, Body, HTTPException
from pymongo.errors import DuplicateKeyError

from src.config import settings
from src.services.db import db_instance, get_leaderboard_collection

router = APIRouter()

# Telegram usernames: 5-32 characters, letters/digits/underscore, must start with a letter.
HANDLE_RE = re.compile(r"^[a-z][a-z0-9_]{4,31}$")
TX_HASH_RE = re.compile(r"^0x[0-9a-f]{64}$")

_indexed_client: Any = None


def rpc_url_for(chain: str) -> str:
    return {
        "sepolia": settings.rpc_url_sepolia,
        "base-sepolia": settings.rpc_url_base_sepolia,
        "arbitrum-sepolia": settings.rpc_url_arbitrum_sepolia,
        "optimism-sepolia": settings.rpc_url_optimism_sepolia,
    }.get(chain, "")


def normalise_handle(raw: Any) -> Optional[str]:
    """Lower-case handle without '@', or None when it is not a valid Telegram username."""
    handle = str(raw or "").strip().lstrip("@").lower()
    return handle if HANDLE_RE.match(handle) else None


def validate_entry(body: Dict[str, Any]) -> Dict[str, str]:
    """Returns the cleaned {telegram, chain, txHash}, or raises 400 with per-field errors."""
    errors: Dict[str, str] = {}
    telegram = normalise_handle(body.get("telegram"))
    chain = str(body.get("chain") or "").strip().lower()
    tx_hash = str(body.get("txHash") or "").strip().lower()

    if not telegram:
        errors["telegram"] = "expected a Telegram username: 5-32 letters, digits or underscores, starting with a letter"
    if chain not in settings.chains:
        errors["chain"] = f"expected one of: {', '.join(settings.chains)}"
    if not TX_HASH_RE.match(tx_hash):
        errors["txHash"] = "expected a 0x-prefixed 32-byte transaction hash (66 characters)"

    if errors:
        raise HTTPException(status_code=400, detail={"error": "validation_failed", "details": errors})
    return {"telegram": telegram, "chain": chain, "txHash": tx_hash}


async def verify_onchain(chain: str, tx_hash: str) -> None:
    """Confirms the transaction exists on the chosen testnet and succeeded."""
    rpc = rpc_url_for(chain)
    if not rpc:
        raise HTTPException(status_code=503, detail={"error": "verification_unavailable", "detail": f"no RPC configured for {chain}"})
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            res = await client.post(rpc, json={
                "jsonrpc": "2.0", "id": 1, "method": "eth_getTransactionReceipt", "params": [tx_hash],
            })
            res.raise_for_status()
            body = res.json()
    except (httpx.HTTPError, ValueError):
        raise HTTPException(status_code=503, detail={"error": "verification_unavailable", "detail": f"could not reach the {chain} RPC, try again"})

    if body.get("error"):
        raise HTTPException(status_code=503, detail={"error": "verification_unavailable", "detail": f"the {chain} RPC returned an error"})
    result = body.get("result")
    if not result:
        raise HTTPException(status_code=422, detail={"error": "tx_not_found", "detail": f"no such transaction on {chain} (yet)"})
    if result.get("status") != "0x1":
        raise HTTPException(status_code=422, detail={"error": "tx_failed", "detail": "that transaction reverted"})


def rank_rows(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Most distinct transactions first; ties -> more distinct chains; ties -> whoever submitted first."""
    ranked = sorted(
        rows,
        key=lambda r: (-r["txCount"], -r["chainCount"], r["firstSubmittedAt"], r["telegram"]),
    )
    return [
        {"rank": i + 1, "telegram": r["telegram"], "txCount": r["txCount"], "chainCount": r["chainCount"]}
        for i, r in enumerate(ranked)
    ]


async def _collection():
    """The submissions collection, with its unique txHash index ensured once per client connection."""
    global _indexed_client
    coll = get_leaderboard_collection()
    if _indexed_client is not db_instance.client:
        await coll.create_index("txHash", unique=True)
        _indexed_client = db_instance.client
    return coll


async def get_leaderboard() -> List[Dict[str, Any]]:
    coll = await _collection()
    pipeline = [
        {"$group": {
            "_id": "$telegram",
            "txCount": {"$sum": 1},
            "chains": {"$addToSet": "$chain"},
            "firstSubmittedAt": {"$min": "$submittedAt"},
        }}
    ]
    rows = []
    async for r in coll.aggregate(pipeline):
        rows.append({
            "telegram": r["_id"],
            "txCount": r["txCount"],
            "chainCount": len(r["chains"]),
            "firstSubmittedAt": r["firstSubmittedAt"],
        })
    return rank_rows(rows)


@router.get("")
async def leaderboard_get():
    """Ranked leaderboard: rank, telegram, txCount, chainCount."""
    return await get_leaderboard()


@router.get("/chains")
async def leaderboard_chains():
    """Testnets accepted by POST /api/leaderboard, and whether submissions are verified on-chain."""
    return {"chains": settings.chains, "verifyOnchain": settings.verify_onchain}


@router.post("")
async def leaderboard_post(
    submission: Dict[str, Any] = Body(..., examples=[{"telegram": "@satoshi_dev", "chain": "sepolia", "txHash": "0x" + "ab" * 32}]),
):
    """Submit a testnet transaction; a tx hash counts once, whoever submits it first."""
    value = validate_entry(submission)

    if settings.verify_onchain:
        await verify_onchain(value["chain"], value["txHash"])

    coll = await _collection()
    try:
        await coll.insert_one({**value, "verified": settings.verify_onchain, "submittedAt": datetime.now(timezone.utc)})
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail={"error": "duplicate_tx", "detail": "this transaction was already submitted"})

    board = await get_leaderboard()
    entry = next((r for r in board if r["telegram"] == value["telegram"]), None)
    return {"telegram": value["telegram"], "rank": entry and entry["rank"], "txCount": entry and entry["txCount"]}
