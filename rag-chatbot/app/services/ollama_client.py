"""Ollama LLM client for generating answers"""
import httpx
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class OllamaClient:
    def __init__(self, base_url: str = "http://localhost:11434", model: str = "llama3.2"):
        self.base_url = base_url
        self.model = model
        self.timeout = 120.0

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> str:
        """Generate text using Ollama API"""
        try:
            url = f"{self.base_url}/api/generate"

            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": temperature,
                }
            }

            if max_tokens:
                payload["options"]["num_predict"] = max_tokens

            if system_prompt:
                payload["system"] = system_prompt

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                result = response.json()
                return result.get("response", "")

        except httpx.TimeoutException:
            logger.error("Ollama request timed out")
            raise Exception("LLM request timed out. Please try again.")
        except httpx.HTTPError as e:
            logger.error(f"Ollama HTTP error: {e}")
            raise Exception(f"Failed to communicate with LLM: {str(e)}")
        except Exception as e:
            logger.error(f"Ollama error: {e}")
            raise Exception(f"LLM error: {str(e)}")

    async def generate_rag_answer(
        self,
        question: str,
        context_docs: List[Dict[str, Any]],
        max_context_docs: int = 3
    ) -> str:
        """Generate an answer based on question and retrieved context"""

        # Build context from retrieved documents
        context_parts = []
        for i, doc in enumerate(context_docs[:max_context_docs], 1):
            text = doc.get("text", "")
            meta = doc.get("meta", {})

            # Add metadata for better context
            metadata_info = []
            if meta.get("username"):
                metadata_info.append(f"Author: {meta['username']}")
            if meta.get("type"):
                metadata_info.append(f"Type: {meta['type']}")

            meta_str = f" ({', '.join(metadata_info)})" if metadata_info else ""
            context_parts.append(f"[Context {i}{meta_str}]\n{text}")

        context = "\n\n".join(context_parts)

        system_prompt = """You are a helpful AI assistant for the Ractso application.
Your job is to answer user questions based on the provided context from the database.

Guidelines:
- Answer based ONLY on the provided context
- If the context doesn't contain relevant information, say "I don't have enough information to answer that question"
- Be concise and accurate
- If you reference specific information, you can mention it's from a post or user
- Do not make up information that isn't in the context"""

        prompt = f"""Question: {question}

Context from database:
{context}

Based on the context above, please provide a helpful answer to the question. If the context doesn't contain relevant information, say so."""

        answer = await self.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.7,
            max_tokens=500
        )

        return answer.strip()

    async def check_health(self) -> bool:
        """Check if Ollama is running and accessible"""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                return response.status_code == 200
        except:
            return False


# Global instance
_ollama_client: Optional[OllamaClient] = None


def get_ollama_client() -> OllamaClient:
    """Get or create Ollama client instance"""
    global _ollama_client
    if _ollama_client is None:
        from app.config import settings
        ollama_url = getattr(settings, 'OLLAMA_URL', 'http://localhost:11434')
        ollama_model = getattr(settings, 'OLLAMA_MODEL', 'llama3.2')
        _ollama_client = OllamaClient(base_url=ollama_url, model=ollama_model)
    return _ollama_client
