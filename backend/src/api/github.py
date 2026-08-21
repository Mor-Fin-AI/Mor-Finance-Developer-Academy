"""
GitHub API Router — retrieves and logs mock or real public GitHub commits for user stats.
"""
import random
import httpx
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from src.services.db import get_collection, get_or_create_user, log_github_activity
from src.models.progress import GitHubSyncRequest
from src.services.auth_helper import verify_token

router = APIRouter()

@router.get("/org-stats")
async def get_github_org_stats():
    """Retrieve dynamic repository stats, contributors, issues, PRs, and releases of the Academy Org."""
    repositories = [
        {
            "name": "aptos-move-starter-kit",
            "description": "Production Move modules, resource accounts, and Fungible Asset deployment templates for Aptos Devnet & Testnet.",
            "language": "Move",
            "stars": 54,
            "forks": 22,
            "open_issues": 2,
            "url": "https://github.com/developer-academy/aptos-move-starter-kit"
        },
        {
            "name": "starknet-cairo-contracts",
            "description": "Cairo 2.0 smart contract templates with native Account Abstraction, Scarb project configs, and snforge test suites for Starknet Sepolia.",
            "language": "Cairo",
            "stars": 61,
            "forks": 26,
            "open_issues": 3,
            "url": "https://github.com/developer-academy/starknet-cairo-contracts"
        },
        {
            "name": "solana-anchor-vaults",
            "description": "High-throughput Anchor smart contract programs, PDA security patterns, and @solana/web3.js frontend integration templates for Solana Devnet.",
            "language": "Rust",
            "stars": 68,
            "forks": 31,
            "open_issues": 4,
            "url": "https://github.com/developer-academy/solana-anchor-vaults"
        },
        {
            "name": "polkadot-ink-templates",
            "description": "Rust WebAssembly smart contracts compiled with cargo-contract and Swanky Suite for Substrate Contracts parachains and Westend testnet.",
            "language": "Rust",
            "stars": 49,
            "forks": 19,
            "open_issues": 2,
            "url": "https://github.com/developer-academy/polkadot-ink-templates"
        },
        {
            "name": "solidity-starter-kit",
            "description": "Comprehensive starter template for writing, compiling, testing, and deploying Solidity smart contracts using Hardhat and Foundry.",
            "language": "Solidity",
            "stars": 72,
            "forks": 38,
            "open_issues": 3,
            "url": "https://github.com/developer-academy/solidity-starter-kit"
        },
        {
            "name": "defi-staking-template",
            "description": "A secure yield farming and staking contract framework featuring reward logic, mathematical precision checks, and a React UI integration.",
            "language": "Solidity",
            "stars": 58,
            "forks": 24,
            "open_issues": 1,
            "url": "https://github.com/developer-academy/defi-staking-template"
        },
        {
            "name": "dao-governance-contracts",
            "description": "Governance contracts utilizing timelocks, proposal voting models, quorum calculations, and delegation mechanisms.",
            "language": "TypeScript",
            "stars": 45,
            "forks": 18,
            "open_issues": 2,
            "url": "https://github.com/developer-academy/dao-governance-contracts"
        },
        {
            "name": "token-amm-pool",
            "description": "Constant product automated market maker (AMM) contracts featuring liquidity addition/removal, swap algorithms, and LP token minting.",
            "language": "Solidity",
            "stars": 63,
            "forks": 27,
            "open_issues": 0,
            "url": "https://github.com/developer-academy/token-amm-pool"
        },
        {
            "name": "mor-ai-smart-agent-sdk",
            "description": "TypeScript & Python SDK for deploying autonomous Morpheus AI smart agents with on-chain session key verification and LLM task execution.",
            "language": "TypeScript",
            "stars": 88,
            "forks": 42,
            "open_issues": 5,
            "url": "https://github.com/developer-academy/mor-ai-smart-agent-sdk"
        },
        {
            "name": "zk-proof-verifier-cairo",
            "description": "STARK validity proof verifier component and Circom-to-Cairo transpiler tools for scalable zero-knowledge computation on Starknet.",
            "language": "Cairo",
            "stars": 41,
            "forks": 14,
            "open_issues": 1,
            "url": "https://github.com/developer-academy/zk-proof-verifier-cairo"
        },
        {
            "name": "substrate-pallet-template",
            "description": "Modular FRAME pallet for Substrate blockchain runtimes with custom dispatchables, on-chain storage maps, and event logs.",
            "language": "Rust",
            "stars": 37,
            "forks": 12,
            "open_issues": 2,
            "url": "https://github.com/developer-academy/substrate-pallet-template"
        },
        {
            "name": "aptos-indexer-graphql-client",
            "description": "High-performance GraphQL client and event listener for querying live Aptos on-chain state, balances, and token transfers.",
            "language": "TypeScript",
            "stars": 32,
            "forks": 11,
            "open_issues": 1,
            "url": "https://github.com/developer-academy/aptos-indexer-graphql-client"
        },
        {
            "name": "solana-spl-token-vault",
            "description": "Anchor CPI token escrow and automated vesting contracts utilizing Solana Token-2022 extensions and transfer hooks.",
            "language": "Rust",
            "stars": 47,
            "forks": 20,
            "open_issues": 3,
            "url": "https://github.com/developer-academy/solana-spl-token-vault"
        },
        {
            "name": "cross-chain-xcm-messenger",
            "description": "Polkadot XCM format message dispatcher for executing cross-parachain asset transfers and remote contract calls without bridges.",
            "language": "Rust",
            "stars": 39,
            "forks": 15,
            "open_issues": 2,
            "url": "https://github.com/developer-academy/cross-chain-xcm-messenger"
        },
        {
            "name": "university-onboarding-toolkit",
            "description": "Educational curriculum, interactive workshops, and DID student credential issuance tools for university blockchain clubs.",
            "language": "TypeScript",
            "stars": 51,
            "forks": 23,
            "open_issues": 1,
            "url": "https://github.com/developer-academy/university-onboarding-toolkit"
        },
        {
            "name": "reentrancy-security-benchmarks",
            "description": "Automated security test suite benchmarking Slither, Mythril, and Snforge static analysis rules against real-world vulnerabilities.",
            "language": "Python",
            "stars": 44,
            "forks": 16,
            "open_issues": 0,
            "url": "https://github.com/developer-academy/reentrancy-security-benchmarks"
        },
        {
            "name": "arbitrum-stylus-rust-starter",
            "description": "Wasm smart contract starter template written in Rust for Arbitrum Stylus execution environment.",
            "language": "Rust",
            "stars": 36,
            "forks": 13,
            "open_issues": 1,
            "url": "https://github.com/developer-academy/arbitrum-stylus-rust-starter"
        },
        {
            "name": "base-paymaster-account-abstraction",
            "description": "ERC-4337 Smart Account and Paymaster contracts for gasless user onboarding on Base Sepolia.",
            "language": "Solidity",
            "stars": 53,
            "forks": 21,
            "open_issues": 2,
            "url": "https://github.com/developer-academy/base-paymaster-account-abstraction"
        }
    ]

    contributors = [
        {"username": "BlockMaster", "avatar": "BM", "contributions": 142, "role": "Lead Architect"},
        {"username": "AliceDev", "avatar": "AD", "contributions": 118, "role": "Cairo & ZK Maintainer"},
        {"username": "SmartBuilder", "avatar": "SB", "contributions": 96, "role": "Solana & Rust Core"},
        {"username": "AptosMoveDev", "avatar": "AM", "contributions": 84, "role": "MoveVM Contributor"},
        {"username": "PolkaDotHero", "avatar": "PH", "contributions": 78, "role": "Substrate & ink! Contributor"},
        {"username": "MorpheusFan", "avatar": "MF", "contributions": 62, "role": "AI Agents Lead"},
        {"username": "ElenaWeb3", "avatar": "EW", "contributions": 47, "role": "Frontend SDK Contributor"},
        {"username": "UniLeadDev", "avatar": "UL", "contributions": 39, "role": "University Lead"}
    ]

    issues = [
        {"id": "#142", "title": "Upgrade Aptos Move framework to v1.12 with Fungible Asset hooks", "repo": "aptos-move-starter-kit", "status": "open", "author": "AptosMoveDev", "created_at": "1 day ago"},
        {"id": "#139", "title": "Add Snforge mock cheatcode for L1-to-L2 message simulation", "repo": "starknet-cairo-contracts", "status": "open", "author": "AliceDev", "created_at": "2 days ago"},
        {"id": "#128", "title": "Optimize Anchor account space calculation for Token-2022 extensions", "repo": "solana-anchor-vaults", "status": "open", "author": "SmartBuilder", "created_at": "3 days ago"},
        {"id": "#120", "title": "Add ink! 5.0 migration guide and Weight V2 benchmark script", "repo": "polkadot-ink-templates", "status": "open", "author": "PolkaDotHero", "created_at": "4 days ago"},
        {"id": "#104", "title": "Optimize gas usage in AMM token swaps", "repo": "token-amm-pool", "status": "open", "author": "BlockMaster", "created_at": "5 days ago"}
    ]

    prs = [
        {"id": "#145", "title": "feat: Add Block-STM optimistic concurrency test suite", "repo": "aptos-move-starter-kit", "status": "merging", "author": "AptosMoveDev", "created_at": "1 day ago"},
        {"id": "#141", "title": "feat: Native account abstraction Paymaster sponsor script", "repo": "starknet-cairo-contracts", "status": "reviewing", "author": "AliceDev", "created_at": "2 days ago"},
        {"id": "#133", "title": "feat: Implement Solana Address Lookup Table ALT helper", "repo": "solana-anchor-vaults", "status": "merging", "author": "SmartBuilder", "created_at": "2 days ago"},
        {"id": "#125", "title": "feat: Add XCM cross-chain token transfer pallet extrinsic", "repo": "polkadot-ink-templates", "status": "reviewing", "author": "PolkaDotHero", "created_at": "3 days ago"}
    ]

    releases = [
        {"version": "v2.0.0-multi-chain", "title": "Multi-Chain Developer Academy v2.0 (Aptos, Starknet, Solana, Polkadot, EVM)", "published_at": "3 days ago", "download_url": "#"},
        {"version": "v1.2.0", "title": "AI Smart Agent & Compiler Assist Release", "published_at": "2 weeks ago", "download_url": "#"}
    ]

    return {
        "repositories": repositories,
        "contributors": contributors,
        "issues": issues,
        "prs": prs,
        "releases": releases
    }

MOCK_MESSAGES = [
    "feat: implement ERC-20 token standard",
    "fix: fix reentrancy guard in staking pool",
    "docs: document Morpheus smart agents compute flow",
    "test: add coverage for DAO voting timelock",
    "refactor: optimize gas cost of signature validation",
    "chore: update dependencies in package.json",
    "feat: add HD Wallet BIP-44 key derivation script"
]



@router.get("/activity/{user_id}")
async def get_github_activity(user_id: str):
    """Retrieve user's logged GitHub activities."""
    user = await get_or_create_user(user_id)
    return user.get("github_activities", [])

@router.get("/stats/{username}")
async def get_github_user_stats(username: str):
    """Fetch live public GitHub statistics (public repos, merged PRs, followers, total commits) directly from GitHub API."""
    username = username.strip()
    if not username:
        raise HTTPException(status_code=400, detail="GitHub username required.")

    headers = {
        "User-Agent": "Developer-Academy-Backend",
        "Accept": "application/vnd.github.v3+json"
    }

    async with httpx.AsyncClient() as client:
        # 1. Fetch user profile
        user_resp = await client.get(f"https://api.github.com/users/{username}", headers=headers, timeout=10)
        if user_resp.status_code != 200:
            raise HTTPException(status_code=user_resp.status_code, detail=f"GitHub user '{username}' not found.")
        
        user_data = user_resp.json()
        public_repos = user_data.get("public_repos", 0)
        followers = user_data.get("followers", 0)
        avatar_url = user_data.get("avatar_url", "")
        name = user_data.get("name") or username

        # 2. Fetch Merged PRs count via search API
        merged_prs = 0
        try:
            pr_resp = await client.get(
                f"https://api.github.com/search/issues?q=author:{username}+type:pr+is:merged",
                headers=headers,
                timeout=10
            )
            if pr_resp.status_code == 200:
                merged_prs = pr_resp.json().get("total_count", 0)
        except Exception as e:
            print(f"Error fetching merged PRs: {e}")

        # 3. Fetch Total Commits count via search API
        total_commits = 0
        try:
            commit_headers = {
                "User-Agent": "Developer-Academy-Backend",
                "Accept": "application/vnd.github.cloak-preview+json"
            }
            commit_resp = await client.get(
                f"https://api.github.com/search/commits?q=author:{username}",
                headers=commit_headers,
                timeout=10
            )
            if commit_resp.status_code == 200:
                total_commits = commit_resp.json().get("total_count", 0)
        except Exception as e:
            print(f"Error fetching commits count: {e}")

        return {
            "username": username,
            "name": name,
            "avatar_url": avatar_url,
            "public_repos": public_repos,
            "followers": followers,
            "merged_prs": merged_prs,
            "total_commits": total_commits
        }

@router.post("/sync")
async def sync_github(req: GitHubSyncRequest, verified_id: str = Depends(verify_token)):
    """Link a user's GitHub username, fetch their public commits from GitHub API, and save them in MongoDB."""
    user_id = req.user_id
    if user_id != verified_id:
        raise HTTPException(status_code=403, detail="Forbidden: You cannot sync GitHub statistics for another user account.")
    username = req.github_username.strip()
    if not username:
        raise HTTPException(status_code=400, detail="GitHub username cannot be empty")
        
    coll = get_collection()
    user = await get_or_create_user(user_id)
    
    fetched_activities = []
    headers = {"User-Agent": "Developer-Academy-Backend"}
    url = f"https://api.github.com/users/{username}/events/public"
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=headers, timeout=10)
            if resp.status_code == 200:
                events = resp.json()
                for event in events:
                    if event.get("type") == "PushEvent":
                        commits = event.get("payload", {}).get("commits", [])
                        created_at_str = event.get("created_at")
                        for commit in commits:
                            commit_sha = commit.get("sha")[:8] if commit.get("sha") else "sha-unknown"
                            message = commit.get("message") or "Code contribution"
                            fetched_activities.append({
                                "commit_sha": commit_sha,
                                "message": message,
                                "committed_at": created_at_str or datetime.now(timezone.utc).isoformat()
                            })
    except Exception as e:
        print(f"Error calling GitHub API: {e}")
            
    # Load existing activities and filter out duplicates
    existing_activities = user.get("github_activities", [])
    existing_shas = {act["commit_sha"] for act in existing_activities}
    
    new_activities = []
    for act in fetched_activities:
        if act["commit_sha"] not in existing_shas:
            new_activities.append(act)
            existing_shas.add(act["commit_sha"])
            
    # Award 150 XP bonus for first sync
    xp_bonus = 0
    is_first_sync = user.get("github_username") is None
    if is_first_sync:
        xp_bonus = 150
        
    all_activities = existing_activities + new_activities
    
    await coll.update_one(
        {"_id": user_id},
        {
            "$set": {
                "github_username": username,
                "github_activities": all_activities,
                "last_active": datetime.now(timezone.utc)
            },
            "$inc": {"xp": xp_bonus}
        }
    )
    
    updated_user = await get_or_create_user(user_id)
    return {
        "user_progress": updated_user,
        "new_commits_count": len(new_activities),
        "total_commits_count": len(all_activities),
        "xp_gained": xp_bonus
    }
