"""
Leaderboard tests. The API tests run against the MongoDB in MONGODB_URI; they only create and delete
submissions whose handle starts with "lbtest_", so they never touch real leaderboard entries.
"""
from datetime import datetime, timedelta, timezone

import httpx
import pymongo
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from src.api import leaderboard
from src.config import settings
from src.main import app
from src.services.db import get_leaderboard_collection

PREFIX = "lbtest_"


def tx(n: int) -> str:
    return "0x" + f"{n:064x}"


@pytest.fixture
def client():
    def cleanup():
        coll = get_leaderboard_collection()
        with pymongo.MongoClient(settings.mongodb_uri) as sync:
            sync[coll.database.name][coll.name].delete_many({"telegram": {"$regex": f"^{PREFIX}"}})

    cleanup()
    yield TestClient(app)
    cleanup()


def ours(board):
    return [r for r in board if r["telegram"].startswith(PREFIX)]


# ─── Pure logic ───────────────────────────────────────────────────────────────

def test_rank_rows_orders_by_tx_then_chains_then_first_submission():
    t0 = datetime(2026, 1, 1, tzinfo=timezone.utc)
    rows = [
        {"telegram": "late_two_chains", "txCount": 3, "chainCount": 2, "firstSubmittedAt": t0 + timedelta(hours=2)},
        {"telegram": "early_two_chains", "txCount": 3, "chainCount": 2, "firstSubmittedAt": t0 + timedelta(hours=1)},
        {"telegram": "one_chain", "txCount": 3, "chainCount": 1, "firstSubmittedAt": t0},
        {"telegram": "most_txs", "txCount": 5, "chainCount": 1, "firstSubmittedAt": t0 + timedelta(hours=9)},
    ]
    ranked = leaderboard.rank_rows(rows)
    assert [r["telegram"] for r in ranked] == ["most_txs", "early_two_chains", "late_two_chains", "one_chain"]
    assert [r["rank"] for r in ranked] == [1, 2, 3, 4]
    assert set(ranked[0]) == {"rank", "telegram", "txCount", "chainCount"}


def test_validate_entry_normalises_input():
    value = leaderboard.validate_entry({"telegram": "  @Satoshi_Dev ", "chain": "SEPOLIA", "txHash": tx(1).upper().replace("0X", "0x")})
    assert value == {"telegram": "satoshi_dev", "chain": "sepolia", "txHash": tx(1)}


@pytest.mark.parametrize("field,body", [
    ("telegram", {"telegram": "abc", "chain": "sepolia", "txHash": tx(1)}),           # too short
    ("telegram", {"telegram": "1abcdef", "chain": "sepolia", "txHash": tx(1)}),       # starts with a digit
    ("chain", {"telegram": "satoshi_dev", "chain": "mainnet", "txHash": tx(1)}),
    ("txHash", {"telegram": "satoshi_dev", "chain": "sepolia", "txHash": "0x1234"}),
])
def test_validate_entry_rejects_bad_fields(field, body):
    with pytest.raises(HTTPException) as exc:
        leaderboard.validate_entry(body)
    assert exc.value.status_code == 400
    assert field in exc.value.detail["details"]


# ─── On-chain verification (RPC mocked at the HTTP layer) ─────────────────────

def _mock_rpc(monkeypatch, handler):
    real = httpx.AsyncClient
    monkeypatch.setattr(leaderboard.httpx, "AsyncClient", lambda **kw: real(transport=httpx.MockTransport(handler), **kw))
    monkeypatch.setattr(settings, "rpc_url_sepolia", "https://rpc.example/sepolia")


@pytest.mark.anyio
@pytest.mark.parametrize("rpc_result,expected_status,expected_error", [
    ({"status": "0x1"}, None, None),
    ({"status": "0x0"}, 422, "tx_failed"),
    (None, 422, "tx_not_found"),
])
async def test_verify_onchain(monkeypatch, rpc_result, expected_status, expected_error):
    seen = {}

    def handler(request):
        seen["body"] = request.read()
        return httpx.Response(200, json={"jsonrpc": "2.0", "id": 1, "result": rpc_result})

    _mock_rpc(monkeypatch, handler)
    if expected_status is None:
        await leaderboard.verify_onchain("sepolia", tx(7))
    else:
        with pytest.raises(HTTPException) as exc:
            await leaderboard.verify_onchain("sepolia", tx(7))
        assert exc.value.status_code == expected_status
        assert exc.value.detail["error"] == expected_error
    assert b"eth_getTransactionReceipt" in seen["body"] and tx(7).encode() in seen["body"]


@pytest.mark.anyio
async def test_verify_onchain_without_rpc_is_unavailable(monkeypatch):
    monkeypatch.setattr(settings, "rpc_url_base_sepolia", "")
    with pytest.raises(HTTPException) as exc:
        await leaderboard.verify_onchain("base-sepolia", tx(7))
    assert exc.value.status_code == 503


# ─── API against MongoDB ──────────────────────────────────────────────────────

def test_post_then_get_ranks_submissions(client):
    subs = [
        (f"{PREFIX}alice", "sepolia", 1),
        (f"{PREFIX}bob", "sepolia", 2),
        (f"{PREFIX}bob", "base-sepolia", 3),
        (f"{PREFIX}carol", "sepolia", 4),
        (f"{PREFIX}carol", "sepolia", 5),
        (f"@{PREFIX}Alice", "arbitrum-sepolia", 6),  # same user as alice once normalised
    ]
    for handle, chain, n in subs:
        res = client.post("/api/leaderboard", json={"telegram": handle, "chain": chain, "txHash": tx(0xB0A2D000 + n)})
        assert res.status_code == 200, res.text

    board = ours(client.get("/api/leaderboard").json())
    # alice and bob: 2 txs on 2 chains, alice submitted first; carol: 2 txs on 1 chain.
    assert [(r["telegram"], r["txCount"], r["chainCount"]) for r in board] == [
        (f"{PREFIX}alice", 2, 2), (f"{PREFIX}bob", 2, 2), (f"{PREFIX}carol", 2, 1),
    ]
    ranks = [r["rank"] for r in board]
    assert ranks == sorted(ranks)


def test_post_returns_rank_and_rejects_duplicate_tx(client):
    body = {"telegram": f"{PREFIX}dupe", "chain": "sepolia", "txHash": tx(0xD00D)}
    first = client.post("/api/leaderboard", json=body)
    assert first.status_code == 200
    assert first.json()["telegram"] == f"{PREFIX}dupe"
    assert isinstance(first.json()["rank"], int) and first.json()["txCount"] == 1

    again = client.post("/api/leaderboard", json={**body, "telegram": f"{PREFIX}someone_else", "txHash": body["txHash"].upper().replace("0X", "0x")})
    assert again.status_code == 409
    assert again.json()["detail"]["error"] == "duplicate_tx"
    assert [r["telegram"] for r in ours(client.get("/api/leaderboard").json())] == [f"{PREFIX}dupe"]


def test_post_validation_error_shape(client):
    res = client.post("/api/leaderboard", json={"telegram": "x", "chain": "nope", "txHash": "0x"})
    assert res.status_code == 400
    assert set(res.json()["detail"]["details"]) == {"telegram", "chain", "txHash"}


def test_post_with_verification_on_rejects_unknown_tx_and_stores_nothing(client, monkeypatch):
    monkeypatch.setattr(settings, "verify_onchain", True)
    _mock_rpc(monkeypatch, lambda request: httpx.Response(200, json={"jsonrpc": "2.0", "id": 1, "result": None}))
    res = client.post("/api/leaderboard", json={"telegram": f"{PREFIX}ghost", "chain": "sepolia", "txHash": tx(0x6405)})
    assert res.status_code == 422
    assert ours(client.get("/api/leaderboard").json()) == []


def test_chains_endpoint(client):
    res = client.get("/api/leaderboard/chains")
    assert res.status_code == 200
    assert res.json() == {"chains": settings.chains, "verifyOnchain": settings.verify_onchain}
