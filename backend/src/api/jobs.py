"""
Careers & Jobs API — Multi-Source Ingestion & Zero-Broken-Links Pipeline.
Exposes /api/v1/careers and /api/jobs endpoints serving verified, active developer roles.
100% Dynamic Feed Ingestion (RemoteOK, Jobicy, Himalayas, Web3.Career API).
Supports real-time filtering by language tags (#Rust, #Cairo, #Solidity, #Move, #Go, #AI),
job types (#Internship, #Full-Time), networks, and search queries.
"""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Query, BackgroundTasks
from src.services.careers_aggregator import (
    get_active_careers,
    sync_and_validate_all_careers,
    get_validated_careers_store,
    get_careers_stats_data
)

router = APIRouter()


def format_salary(job: Dict[str, Any]) -> str:
    """Format salary details into a clean human-readable badge."""
    if job.get("salary"):
        return str(job["salary"])
    return "Competitive Web3 Pay"


def get_curated_fallback_jobs(
    tag: Optional[str] = None,
    remote: Optional[bool] = None
) -> List[Dict[str, Any]]:
    """Helper for backwards test compatibility querying dynamic pool."""
    res = get_active_careers(tag=tag, remote=remote, limit=100)
    return res.get("jobs", [])


@router.get("")
@router.get("/")
async def get_careers_feed(
    tag: Optional[str] = Query(None, description="Category / language filter (#Rust, #Cairo, #Solidity, #Move, #Go, #AI)"),
    type: Optional[str] = Query("all", description="Job type filter: 'all', 'internships', or 'full-time'"),
    job_type: Optional[str] = Query(None, description="Alias for type filter"),
    network: Optional[str] = Query(None, description="Network filter: starknet, arbitrum, base, optimism, solana, stellar, aptos, polkadot, ethereum"),
    remote: Optional[bool] = Query(None, description="Filter for remote jobs"),
    search: Optional[str] = Query(None, description="Search query string across title, company, skills, location"),
    page: int = Query(1, ge=1, description="Page number (default 1)"),
    limit: int = Query(12, ge=1, le=100, description="Jobs per page (default 12)"),
    include_inactive: bool = Query(False, description="Include pruned/inactive jobs (default false)")
):
    """
    Retrieve validated Web3 career opportunities and internships from live feeds.
    Strictly filters is_active == True by default to guarantee Zero Broken Links.
    """
    # Trigger live ingestion if store is not yet initialized
    if not get_validated_careers_store():
        await sync_and_validate_all_careers()

    effective_type = job_type or type or "all"
    
    return get_active_careers(
        tag=tag,
        job_type=effective_type,
        network=network,
        remote=remote,
        search=search,
        page=page,
        limit=limit,
        include_inactive=include_inactive
    )


@router.get("/stats")
async def get_careers_stats():
    """
    Returns live ingestion and health telemetry from the Zero-Broken-Links validation pipeline.
    """
    if not get_validated_careers_store():
        await sync_and_validate_all_careers()

    return get_careers_stats_data()


@router.post("/sync")
async def trigger_careers_sync(background_tasks: BackgroundTasks):
    """
    Manually triggers the 24-hour Multi-Source Ingestion & Zero-Broken-Links Validation Sweep in the background.
    """
    background_tasks.add_task(sync_and_validate_all_careers, force=True)
    return {
        "status": "queued",
        "message": "Multi-source ingestion and link validation sweep initiated in background."
    }
