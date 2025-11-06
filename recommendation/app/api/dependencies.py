"""Dependency injection for FastAPI"""
from app.services.recommendation_service import RecommendationService

# Singleton instance - persists across requests
_recommendation_service: RecommendationService = None


def get_recommendation_service() -> RecommendationService:
    """Get recommendation service instance (singleton)"""
    global _recommendation_service
    if _recommendation_service is None:
        _recommendation_service = RecommendationService()
    return _recommendation_service

