"""API v1 routes"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
import logging

from app.api.dependencies import get_recommendation_service
from app.services.recommendation_service import RecommendationService
from app.api.v1.schemas import (
    TrackViewRequest,
    TrackViewResponse,
    RecommendationRequest,
    RecommendationResponse,
    HealthResponse,
    ModelStatusResponse,
    PostDetail
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["recommendations"])


@router.get("/health", response_model=HealthResponse, status_code=status.HTTP_200_OK)
async def health_check(
    recommendation_service: RecommendationService = Depends(get_recommendation_service)
):
    """Health check endpoint"""
    stats = recommendation_service.get_statistics()
    return HealthResponse(
        status="healthy",
        service="post-recommendation-api",
        model_loaded=stats['model_loaded']
    )


@router.post(
    "/track-view",
    response_model=TrackViewResponse,
    status_code=status.HTTP_200_OK
)
async def track_view(
    request: TrackViewRequest,
    recommendation_service: RecommendationService = Depends(get_recommendation_service)
):
    """Track when a user views a post - updates the recommendation model in real-time"""
    try:
        await recommendation_service.track_view(
            user_id=request.user_id,
            post_id=request.post_id,
            post_content=request.post_content,
            post_author_id=request.post_author_id
        )
        
        return TrackViewResponse(
            status="success",
            message="View tracked and model updated",
            user_id=request.user_id,
            post_id=request.post_id
        )
        
    except Exception as e:
        logger.error(f"Error tracking view: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get(
    "/recommendations/{user_id}",
    response_model=RecommendationResponse,
    status_code=status.HTTP_200_OK
)
async def get_recommendations(
    user_id: str,
    page: int = Query(default=1, ge=1, description="Page number (1-based)"),
    limit: int = Query(default=10, ge=1, le=100, description="Items per page"),
    recommendation_service: RecommendationService = Depends(get_recommendation_service)
):
    """Get post recommendations for a user based on their viewing history"""
    try:
        recommendations, total = await recommendation_service.get_recommendations(
            user_id=user_id,
            page=page,
            limit=limit
        )
        
        total_pages = max(1, (total + limit - 1) // limit)
        has_next = page < total_pages
        has_previous = page > 1

        return RecommendationResponse(
            status="success",
            user_id=user_id,
            recommendations=[PostDetail(**post) for post in recommendations],
            count=len(recommendations),
            meta={
                "page": page,
                "limit": limit,
                "total": total,
                "totalPages": total_pages,
                "hasNext": has_next,
                "hasPrevious": has_previous,
            }
        )
        
    except Exception as e:
        logger.error(f"Error getting recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get(
    "/model/status",
    response_model=ModelStatusResponse,
    status_code=status.HTTP_200_OK
)
async def model_status(
    recommendation_service: RecommendationService = Depends(get_recommendation_service)
):
    """Get model status and statistics"""
    stats = recommendation_service.get_statistics()
    
    return ModelStatusResponse(
        status="success",
        model_loaded=stats['model_loaded'],
        total_users=stats['total_users'],
        total_posts=stats['total_posts'],
        total_interactions=stats['total_interactions']
    )
