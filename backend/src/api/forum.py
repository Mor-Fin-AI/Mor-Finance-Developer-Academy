"""
Forum API Router — coordinates discussion threads, replies, and posts in MongoDB.
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from src.services.db import get_forum_collection
from src.models.forum import CreateThreadRequest, CreateCommentRequest
from src.services.auth_helper import verify_token

router = APIRouter()

@router.get("/threads")
async def get_threads(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(5, ge=1)
):
    """List forum threads, with search, category filters, and skip/limit database pagination."""
    coll = get_forum_collection()
    query = {}
    
    if category and category != "All" and category != "All Topics":
        query["category"] = category
        
    if search:
        # Simple case-insensitive regex search on title or content
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}}
        ]
        
    total_count = await coll.count_documents(query)
    
    cursor = coll.find(query).sort("created_at", -1).skip((page - 1) * limit).limit(limit)
    threads = []
    async for doc in cursor:
        doc["thread_id"] = doc.get("_id")
        threads.append(doc)
        
    return {
        "threads": threads,
        "total_count": total_count,
        "page": page,
        "limit": limit
    }

@router.get("/threads/{thread_id}")
async def get_thread(thread_id: str):
    """Retrieve a single thread detail, and increment its view count."""
    coll = get_forum_collection()
    
    # Increment view count in DB
    await coll.update_one(
        {"_id": thread_id},
        {"$inc": {"views_count": 1}}
    )
    
    thread = await coll.find_one({"_id": thread_id})
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
        
    thread["thread_id"] = thread.get("_id")
    return thread

@router.get("/stats")
async def get_forum_stats():
    """Retrieve trending tags, top contributors, and online user count dynamically from MongoDB."""
    import time
    coll = get_forum_collection()
    
    # 1. Compute trending tags
    pipeline = [
        {"$unwind": "$tags"},
        {"$group": {"_id": "$tags", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    
    trending_tags = []
    try:
        cursor = coll.aggregate(pipeline)
        async for doc in cursor:
            trending_tags.append({
                "tag": doc["_id"],
                "count": doc["count"]
            })
    except Exception as e:
        print(f"Aggregation pipeline failed: {e}")
        
    if not trending_tags:
        trending_tags = [
            {"tag": "solidity", "count": 0},
            {"tag": "gas", "count": 0},
            {"tag": "defi", "count": 0},
            {"tag": "security", "count": 0},
            {"tag": "dao", "count": 0}
        ]
        
    # 2. Get top contributors (real users sorted by XP > 0)
    from src.services.db import get_collection
    user_coll = get_collection()
    top_contributors = []
    
    try:
        # Fetch only registered users with real XP > 0
        cursor = user_coll.find({"xp": {"$gt": 0}, "_id": {"$ne": "demo-user"}}).sort("xp", -1).limit(3)
        async for doc in cursor:
            raw_name = doc.get("github_username") or doc.get("_id") or ""
            if not raw_name or raw_name == "demo-user":
                continue
            if raw_name.startswith("wallet-"):
                display_name = f"{raw_name.replace('wallet-', '')[:6]}...{raw_name[-4:]}"
                avatar = "W3"
            elif raw_name.startswith("gh-") or not raw_name.startswith("@"):
                clean = raw_name.replace("gh-", "")
                display_name = f"@{clean}"
                avatar = clean[:2].upper() if len(clean) >= 2 else clean.upper()
            else:
                display_name = raw_name
                avatar = raw_name.replace("@", "")[:2].upper()
                
            top_contributors.append({
                "username": display_name,
                "avatar": avatar,
                "xp": doc.get("xp", 0)
            })
    except Exception as e:
        print(f"Failed to query top contributors: {e}")
        
    if not top_contributors:
        top_contributors = []
        
    return {
        "trending_tags": trending_tags,
        "top_contributors": top_contributors
    }

@router.post("/threads")
async def create_thread(req: CreateThreadRequest, user_id: str = Depends(verify_token)):
    """Submit a new discussion thread to the forum."""
    if not req.title.strip() or not req.content.strip():
        raise HTTPException(status_code=400, detail="Title and content are required")
        
    coll = get_forum_collection()
    tid = f"thread-{uuid.uuid4().hex[:8]}"
    
    new_thread = {
        "_id": tid,
        "thread_id": tid,
        "title": req.title.strip(),
        "author": user_id,
        "category": req.category,
        "content": req.content.strip(),
        "tags": [t.strip().lower() for t in req.tags if t.strip()],
        "replies_count": 0,
        "views_count": 0,
        "likes_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "comments": []
    }
    
    await coll.insert_one(new_thread)
    return new_thread

@router.post("/threads/{thread_id}/comments")
async def create_comment(thread_id: str, req: CreateCommentRequest, user_id: str = Depends(verify_token)):
    """Post a reply comment inside a discussion thread."""
    if not req.content.strip():
        raise HTTPException(status_code=400, detail="Comment content cannot be empty")
        
    coll = get_forum_collection()
    thread = await coll.find_one({"_id": thread_id})
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
        
    cid = f"comment-{uuid.uuid4().hex[:8]}"
    new_comment = {
        "comment_id": cid,
        "author": user_id,
        "content": req.content.strip(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await coll.update_one(
        {"_id": thread_id},
        {
            "$push": {"comments": new_comment},
            "$inc": {"replies_count": 1}
        }
    )
    
    return new_comment

@router.delete("/threads/{thread_id}")
async def delete_thread(thread_id: str, user_id: str = Depends(verify_token)):
    """Delete a discussion thread. Only the author can delete it."""
    coll = get_forum_collection()
    thread = await coll.find_one({"_id": thread_id})
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    if thread.get("author") != user_id:
        raise HTTPException(status_code=403, detail="Forbidden: Only the author can delete this thread")
        
    await coll.delete_one({"_id": thread_id})
    return {"status": "success", "message": "Thread deleted"}

@router.delete("/threads/{thread_id}/comments/{comment_id}")
async def delete_comment(thread_id: str, comment_id: str, user_id: str = Depends(verify_token)):
    """Delete a comment reply. Only the author of the comment can delete it."""
    coll = get_forum_collection()
    thread = await coll.find_one({"_id": thread_id})
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    comments = thread.get("comments", [])
    target = next((c for c in comments if c.get("comment_id") == comment_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Comment not found")
    if target.get("author") != user_id:
        raise HTTPException(status_code=403, detail="Forbidden: Only the author can delete this comment")
        
    await coll.update_one(
        {"_id": thread_id},
        {
            "$pull": {"comments": {"comment_id": comment_id}},
            "$inc": {"replies_count": -1}
        }
    )
    return {"status": "success", "message": "Comment deleted"}
