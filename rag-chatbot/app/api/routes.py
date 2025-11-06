"""RAG API routes"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from app.services.embeddings import embed_texts, get_dim
from app.services.qdrant_client import ensure_collection, search_vector
from app.services.ingest import ingest_all
from app.services.ollama_client import get_ollama_client


router = APIRouter(prefix="/api/v1/rag", tags=["rag"])


class IngestResponse(BaseModel):
    ingested: int
    posts: int = 0
    comments: int = 0
    profiles: int = 0


@router.post("/ingest", response_model=IngestResponse)
async def rag_ingest():
    try:
        res = await ingest_all()
        return res
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1)
    top_k: int = Field(default=5, ge=1, le=20)


class SourceDoc(BaseModel):
    id: str
    score: float
    text: str
    meta: Dict[str, Any]


class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceDoc]


@router.post("/chat", response_model=ChatResponse)
async def rag_chat(req: ChatRequest):
    try:
        ensure_collection(get_dim())

        # Embed the question
        vec = embed_texts([req.question])[0]

        # Search for relevant context
        results = search_vector(vec, top_k=req.top_k)

        # Build context documents and sources
        context_docs = []
        sources: List[SourceDoc] = []
        for r in results:
            payload = r.get("payload") or {}
            text = payload.get("text", "")
            meta = {k: v for k, v in payload.items() if k != "text"}

            context_docs.append({
                "text": text,
                "meta": meta
            })

            sources.append(SourceDoc(
                id=str(r.get("id")),
                score=float(r.get("score", 0)),
                text=text,
                meta=meta
            ))

        # Generate answer using Ollama
        if context_docs:
            ollama = get_ollama_client()
            answer = await ollama.generate_rag_answer(
                question=req.question,
                context_docs=context_docs,
                max_context_docs=3
            )
        else:
            answer = "I don't have any relevant information in the database to answer your question."

        return ChatResponse(answer=answer, sources=sources)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


