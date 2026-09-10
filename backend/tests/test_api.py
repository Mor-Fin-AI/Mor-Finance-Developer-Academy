import pytest
from fastapi.testclient import TestClient
from src.main import app

def test_health_check():
    with TestClient(app) as client:
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"

def test_multi_chain_compile_solidity():
    with TestClient(app) as client:
        payload = {
            "chain": "arbitrum",
            "language": "solidity",
            "code": "pragma solidity ^0.8.20; contract Test { uint256 public x; }"
        }
        response = client.post("/api/exercise/compile", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "solc" in data["compiler"].lower()

def test_multi_chain_compile_base():
    with TestClient(app) as client:
        payload = {
            "chain": "base",
            "language": "solidity",
            "code": "pragma solidity ^0.8.20; contract BaseDemo { address public owner; }"
        }
        response = client.post("/api/exercise/compile", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "base" in data["compiler"].lower()

def test_multi_chain_compile_optimism():
    with TestClient(app) as client:
        payload = {
            "chain": "optimism",
            "language": "solidity",
            "code": "pragma solidity ^0.8.20; contract OPDemo { string public title; }"
        }
        response = client.post("/api/exercise/compile", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

def test_multi_chain_compile_stylus():
    with TestClient(app) as client:
        payload = {
            "chain": "stylus",
            "language": "rust",
            "code": """
            #![cfg_attr(not(feature = "export-abi"), no_main)]
            extern crate alloc;
            use stylus_sdk::prelude::*;
            sol_storage! {
                #[entrypoint]
                pub struct Counter { uint256 number; }
            }
            """
        }
        response = client.post("/api/exercise/compile", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "stylus" in data["compiler"].lower()

def test_fullstack_track_courses():
    with TestClient(app) as client:
        response = client.get("/api/courses?track=fullstack")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5
        assert "Full-Stack" in data[0]["title"] or "Architecture" in data[0]["title"]
        assert len(data[0]["lessons"]) > 0

def test_evm_testnet_deployment_logging():
    with TestClient(app) as client:
        payload = {
            "developer_github_id": "test-dev-01",
            "cohort_id": "KU_COHORT_2026_01",
            "network": "base_sepolia",
            "execution_environment": "evm_op_stack",
            "contract_address": "0x4b78c93b6e8200b3d68122bf05973b18540b0171",
            "programming_language": "solidity",
            "gas_used_computation": 248000
        }
        response = client.post("/api/v1/analytics/deployment", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "basescan.org" in data["explorer_url"]

def test_jobs_api_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/jobs")
        assert response.status_code == 200
        data = response.json()
        assert data["total_jobs"] > 0
        assert len(data["jobs"]) > 0
        assert "title" in data["jobs"][0]
        assert "company" in data["jobs"][0]

def test_jobs_filter_tag_and_internships():
    with TestClient(app) as client:
        # Test rust tag filter
        res_rust = client.get("/api/jobs?tag=rust")
        assert res_rust.status_code == 200
        data_rust = res_rust.json()
        assert data_rust["total_jobs"] > 0
        assert any("rust" in str(s).lower() for j in data_rust["jobs"] for s in j.get("skills", []))

        # Test internships filter
        res_intern = client.get("/api/jobs?type=internships")
        assert res_intern.status_code == 200
        data_intern = res_intern.json()
        assert data_intern["total_jobs"] > 0

@pytest.mark.anyio
async def test_certificate_only_issued_on_full_track_completion():
    from src.services.db import complete_lesson_for_user, get_or_create_user, get_collection
    test_uid = "test-learner-starknet-cert-check"
    coll = get_collection()
    await coll.delete_one({"_id": test_uid})
    
    # 1. User starts Starknet track
    await get_or_create_user(test_uid)
    await coll.update_one({"_id": test_uid}, {"$set": {"active_track": "starknet"}})
    
    # Complete only module 1
    user_after_mod1 = await complete_lesson_for_user(test_uid, 1, "starknet-1")
    # Verify NO certificate issued for partial completion
    starknet_certs = [c for c in user_after_mod1.get("certificates", []) if "starknet" in c.get("track_id", "").lower()]
    assert len(starknet_certs) == 0, "Certificate must NOT be issued on module 1 completion!"
    
    # Complete modules 2, 3, 4
    await complete_lesson_for_user(test_uid, 2, "starknet-2")
    await complete_lesson_for_user(test_uid, 3, "starknet-3")
    user_after_mod4 = await complete_lesson_for_user(test_uid, 4, "starknet-4")
    starknet_certs = [c for c in user_after_mod4.get("certificates", []) if "starknet" in c.get("track_id", "").lower()]
    assert len(starknet_certs) == 0, "Certificate must NOT be issued on 4/5 modules completion!"
    
    # Complete module 5 (final module / testnet challenge)
    user_after_mod5 = await complete_lesson_for_user(test_uid, 5, "starknet-5")
    starknet_certs = [c for c in user_after_mod5.get("certificates", []) if "starknet" in c.get("track_id", "").lower()]
    assert len(starknet_certs) == 1, "Certificate MUST be issued once all 5 track modules are completed!"
    assert starknet_certs[0]["track_id"] == "starknet"
    assert "Starknet" in starknet_certs[0]["level_title"]
    
    # Clean up test user
    await coll.delete_one({"_id": test_uid})