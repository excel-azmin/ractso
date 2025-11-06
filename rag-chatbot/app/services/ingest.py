from typing import List, Dict, Any
import logging
from qdrant_client.http import models as qm
from app.services.embeddings import embed_texts, get_dim
from app.services.qdrant_client import ensure_collection, upsert_points
from app.services.db import db

logger = logging.getLogger(__name__)


def _chunk_text(text: str, max_len: int = 400) -> List[str]:
    if not text:
        return []
    words = text.split()
    chunks = []
    cur: List[str] = []
    for w in words:
        cur.append(w)
        if len(" ".join(cur)) >= max_len:
            chunks.append(" ".join(cur))
            cur = []
    if cur:
        chunks.append(" ".join(cur))
    return chunks


async def fetch_posts() -> List[Dict[str, Any]]:
    """Fetch and chunk posts from database"""
    rows = await db.query(
        """
        SELECT p.id as post_id, p.content, p."authorId", u.username,
               u."fullName", p."createdAt"
        FROM "Post" p
        INNER JOIN "User" u ON u.id = p."authorId"
        WHERE p.content IS NOT NULL AND p.content != ''
        ORDER BY p."createdAt" DESC
        """
    )
    docs: List[Dict[str, Any]] = []
    for r in rows:
        content = r.get("content") or ""
        chunks = _chunk_text(content, max_len=400)
        if not chunks:
            continue
        for idx, ch in enumerate(chunks):
            docs.append({
                "text": ch,
                "meta": {
                    "type": "post",
                    "post_id": r["post_id"],
                    "author_id": r["authorId"],
                    "username": r["username"],
                    "full_name": r.get("fullName"),
                    "chunk_index": idx,
                    "created_at": str(r["createdAt"]),
                }
            })
    return docs


async def fetch_comments() -> List[Dict[str, Any]]:
    """Fetch and chunk comments from database"""
    rows = await db.query(
        """
        SELECT c.id as comment_id, c.content, c."postId", c."authorId",
               u.username, u."fullName", c."createdAt"
        FROM "Comment" c
        INNER JOIN "User" u ON u.id = c."authorId"
        WHERE c.content IS NOT NULL AND c.content != ''
        ORDER BY c."createdAt" DESC
        """
    )
    docs: List[Dict[str, Any]] = []
    for r in rows:
        content = r.get("content") or ""
        chunks = _chunk_text(content, max_len=300)
        if not chunks:
            continue
        for idx, ch in enumerate(chunks):
            docs.append({
                "text": ch,
                "meta": {
                    "type": "comment",
                    "comment_id": r["comment_id"],
                    "post_id": r["postId"],
                    "author_id": r["authorId"],
                    "username": r["username"],
                    "full_name": r.get("fullName"),
                    "chunk_index": idx,
                    "created_at": str(r["createdAt"]),
                }
            })
    return docs


async def fetch_user_profiles() -> List[Dict[str, Any]]:
    """Fetch user profile information"""
    rows = await db.query(
        """
        SELECT id, username, "fullName", bio, location, website, "createdAt"
        FROM "User"
        WHERE bio IS NOT NULL AND bio != ''
        ORDER BY "createdAt" DESC
        """
    )
    docs: List[Dict[str, Any]] = []
    for r in rows:
        bio = r.get("bio") or ""
        if not bio:
            continue

        # Create a rich text representation of user profile
        profile_text = f"User profile for {r.get('fullName') or r.get('username')}: {bio}"
        if r.get("location"):
            profile_text += f" Location: {r['location']}."
        if r.get("website"):
            profile_text += f" Website: {r['website']}."

        chunks = _chunk_text(profile_text, max_len=400)
        for idx, ch in enumerate(chunks):
            docs.append({
                "text": ch,
                "meta": {
                    "type": "user_profile",
                    "user_id": r["id"],
                    "username": r["username"],
                    "full_name": r.get("fullName"),
                    "chunk_index": idx,
                    "created_at": str(r["createdAt"]),
                }
            })
    return docs


async def fetch_corpus() -> List[Dict[str, Any]]:
    """Fetch all documents from database"""
    docs: List[Dict[str, Any]] = []

    # Fetch from different sources
    posts = await fetch_posts()
    comments = await fetch_comments()
    profiles = await fetch_user_profiles()

    # Combine all documents
    docs.extend(posts)
    docs.extend(comments)
    docs.extend(profiles)

    return docs


async def ingest_all() -> Dict[str, Any]:
    """Ingest all documents from database into Qdrant"""
    logger.info("Starting ingestion process...")

    # Ensure collection exists
    dim = get_dim()
    logger.info(f"Embedding dimension: {dim}")
    ensure_collection(dim)

    # Fetch all documents
    logger.info("Fetching documents from database...")
    docs = await fetch_corpus()
    logger.info(f"Fetched {len(docs)} documents")

    if not docs:
        logger.warning("No documents found to ingest")
        return {
            "ingested": 0,
            "posts": 0,
            "comments": 0,
            "profiles": 0
        }

    # Generate embeddings
    logger.info("Generating embeddings...")
    texts = [d["text"] for d in docs]
    vectors = embed_texts(texts)

    # Create Qdrant points
    logger.info("Creating Qdrant points...")
    points: List[qm.PointStruct] = []
    for idx, (d, vec) in enumerate(zip(docs, vectors)):
        points.append(
            qm.PointStruct(
                id=idx,  # Use numeric ID for Qdrant
                vector=list(vec),  # Ensure vector is a list
                payload={**d["meta"], "text": d["text"]}
            )
        )

    # Upload to Qdrant
    if points:
        logger.info(f"Uploading {len(points)} points to Qdrant...")
        upsert_points(points)
        logger.info("Ingestion completed successfully")

    # Count by type
    type_counts = {}
    for d in docs:
        doc_type = d["meta"].get("type", "unknown")
        type_counts[doc_type] = type_counts.get(doc_type, 0) + 1

    return {
        "ingested": len(points),
        "posts": type_counts.get("post", 0),
        "comments": type_counts.get("comment", 0),
        "profiles": type_counts.get("user_profile", 0)
    }


