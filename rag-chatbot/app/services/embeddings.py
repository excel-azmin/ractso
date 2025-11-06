from typing import List
from fastembed import TextEmbedding
from app.config import settings


_embedder: TextEmbedding = None


def get_embedder() -> TextEmbedding:
    global _embedder
    if _embedder is None:
        _embedder = TextEmbedding(model_name=settings.EMBEDDING_MODEL)
    return _embedder


def get_dim() -> int:
    """Get the dimension of the embedding model."""
    models = TextEmbedding.list_supported_models()
    model_name = settings.EMBEDDING_MODEL
    for model_info in models:
        if model_info['model'] == model_name:
            return model_info['dim']
    # Fallback: create a sample embedding to determine dimension
    embedder = get_embedder()
    sample_embedding = list(embedder.embed(["test"]))[0]
    return len(sample_embedding)


def embed_texts(texts: List[str]) -> List[List[float]]:
    embedder = get_embedder()
    # fastembed returns an iterator of vectors
    return [vec for vec in embedder.embed(texts)]


