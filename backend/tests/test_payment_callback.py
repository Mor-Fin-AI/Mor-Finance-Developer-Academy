"""
Sandbox payment callback tests. API tests run against the MongoDB in MONGODB_URI and only create and delete
profiles whose handle starts with "paytest_".
"""
import math

import pymongo
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from src.api import payment
from src.config import settings
from src.main import app
from src.services.db import get_subscriptions_collection

PREFIX = "paytest_"


def payload(**overrides):
    body = {
        "telegramHandle": f"@{PREFIX}Amara",
        "chosenCountryNode": "ke",
        "paymentAmount": "3750",
        "transactionReference": "mor-KE-1767225600000-aa11",
        "plan": "Career Boost",
    }
    body.update(overrides)
    return body


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(settings, "allow_mock_payment_callback", True)

    def cleanup():
        coll = get_subscriptions_collection()
        with pymongo.MongoClient(settings.mongodb_uri) as sync:
            sync[coll.database.name][coll.name].delete_many({"_id": {"$regex": f"^{PREFIX}"}})

    cleanup()
    yield TestClient(app)
    cleanup()


# ─── Validation ───────────────────────────────────────────────────────────────

def test_validate_callback_normalises_input():
    assert payment.validate_callback(payload()) == {
        "telegramHandle": f"{PREFIX}amara",
        "chosenCountryNode": "KE",
        "paymentAmount": 3750.0,
        "transactionReference": "mor-KE-1767225600000-aa11",
        "plan": "Career Boost",
    }


@pytest.mark.parametrize("field,overrides", [
    ("telegramHandle", {"telegramHandle": "ab"}),
    ("chosenCountryNode", {"chosenCountryNode": "US"}),
    ("paymentAmount", {"paymentAmount": 0}),
    ("paymentAmount", {"paymentAmount": -5}),
    ("paymentAmount", {"paymentAmount": "abc"}),
    ("paymentAmount", {"paymentAmount": True}),
    ("paymentAmount", {"paymentAmount": "nan"}),
    ("paymentAmount", {"paymentAmount": "inf"}),
    ("paymentAmount", {"paymentAmount": None}),
    ("transactionReference", {"transactionReference": "x"}),
    ("transactionReference", {"transactionReference": "has spaces in it"}),
    ("plan", {"plan": "<script>"}),
])
def test_validate_callback_rejects_bad_fields(field, overrides):
    with pytest.raises(HTTPException) as exc:
        payment.validate_callback(payload(**overrides))
    assert exc.value.status_code == 400
    assert field in exc.value.detail["details"]


def test_parse_amount():
    assert payment._parse_amount(" 12.5 ") == 12.5
    assert payment._parse_amount(7) == 7.0
    assert math.isnan(payment._parse_amount(False))


# ─── API against MongoDB ──────────────────────────────────────────────────────

def test_disabled_by_default():
    assert payment.settings.model_fields["allow_mock_payment_callback"].default is False


def test_disabled_endpoint_returns_403(monkeypatch):
    monkeypatch.setattr(settings, "allow_mock_payment_callback", False)
    client = TestClient(app)
    for res in (client.post("/api/payment-callback", json=payload()), client.get("/api/payment-callback")):
        assert res.status_code == 403
        assert res.json()["detail"]["error"] == "mock_endpoint_disabled"


def test_callback_marks_profile_subscribed_and_persists(client):
    res = client.post("/api/payment-callback", json=payload())
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["status"] == "subscribed"
    profile = body["profile"]
    assert profile["telegramHandle"] == f"{PREFIX}amara"
    assert profile["status"] == "subscribed"
    assert profile["plan"] == "Career Boost"
    assert profile["paymentAmount"] == 3750.0
    assert profile["transactionReferences"] == ["mor-KE-1767225600000-aa11"]

    listed = [p for p in client.get("/api/payment-callback").json() if p["telegramHandle"] == f"{PREFIX}amara"]
    assert len(listed) == 1 and listed[0]["status"] == "subscribed"


def test_replay_is_idempotent_and_renewal_appends_reference(client):
    first = client.post("/api/payment-callback", json=payload()).json()["profile"]
    replay = client.post("/api/payment-callback", json=payload())
    assert replay.status_code == 200
    assert replay.json()["profile"]["transactionReferences"] == first["transactionReferences"]

    renewal = client.post("/api/payment-callback", json=payload(transactionReference="mor-KE-1769904000000-bb22", plan="Pro"))
    assert renewal.status_code == 200
    profile = renewal.json()["profile"]
    assert profile["plan"] == "Pro"
    assert profile["transactionReference"] == "mor-KE-1769904000000-bb22"
    assert profile["transactionReferences"] == ["mor-KE-1767225600000-aa11", "mor-KE-1769904000000-bb22"]
    assert profile["createdAt"] == first["createdAt"]


def test_reference_cannot_be_reused_by_another_handle(client):
    assert client.post("/api/payment-callback", json=payload()).status_code == 200
    res = client.post("/api/payment-callback", json=payload(telegramHandle=f"{PREFIX}someone_else"))
    assert res.status_code == 409
    assert res.json()["detail"]["error"] == "duplicate_reference"


def test_validation_error_shape(client):
    res = client.post("/api/payment-callback", json={"telegramHandle": "x", "chosenCountryNode": "ZZ", "paymentAmount": 0, "transactionReference": ""})
    assert res.status_code == 400
    assert set(res.json()["detail"]["details"]) == {"telegramHandle", "chosenCountryNode", "paymentAmount", "transactionReference"}
