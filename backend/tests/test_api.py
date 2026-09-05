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