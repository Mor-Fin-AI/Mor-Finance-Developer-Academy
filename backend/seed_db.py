"""
Dedicated Seeding Script for MOR Finance Developer Academy.
Connects to MongoDB and seeds all forum threads, hackathons, and cohort activities.
"""
import asyncio
import sys

# Ensure UTF-8 output encoding for Windows terminals
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from src.services.db import connect_to_mongo, seed_forum_threads, seed_hackathons

async def run_all_seeds():
    print("🚀 Connecting to MongoDB...")
    await connect_to_mongo()
    print("🌱 Populating May–August 2026 Developer Cohort Forum Threads...")
    await seed_forum_threads()
    print("🏆 Populating Web3 Ecosystem Hackathons...")
    await seed_hackathons()
    print("✅ All database seeding functions executed successfully!")

if __name__ == "__main__":
    asyncio.run(run_all_seeds())
