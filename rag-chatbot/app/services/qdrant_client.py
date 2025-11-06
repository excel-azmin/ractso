from typing import List, Dict, Any
from qdrant_client import QdrantClient
from qdrant_client.http import models as qm
from app.config import settings


_client: QdrantClient = None


def get_client() -> QdrantClient:
    global _client
    if _client is None:
        _client = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY or None)
    return _client


def ensure_collection(dim: int) -> None:
    client = get_client()
    if not client.collection_exists(settings.RAG_COLLECTION):
        client.recreate_collection(
            collection_name=settings.RAG_COLLECTION,
            vectors_config=qm.VectorParams(size=dim, distance=qm.Distance.COSINE),
        )


def upsert_points(points: List[qm.PointStruct]) -> None:
    client = get_client()
    client.upsert(collection_name=settings.RAG_COLLECTION, points=points)


def search_vector(query: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
    client = get_client()
    res = client.search(
        collection_name=settings.RAG_COLLECTION,
        query_vector=query,
        limit=top_k,
        with_payload=True
    )
    return [
        {
            "id": r.id,
            "score": float(r.score),
            "payload": r.payload,
        }
        for r in res
    ]


