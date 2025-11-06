"""Pydantic schemas for request/response validation"""
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime


class TrackViewRequest(BaseModel):
    """Request schema for tracking post views"""
    user_id: str = Field(..., description="User ID who viewed the post")
    post_id: str = Field(..., description="Post ID that was viewed")
    post_content: Optional[str] = Field(None, description="Post content for content-based learning")
    post_author_id: Optional[str] = Field(None, description="Post author ID")
    duration_ms: Optional[int] = Field(default=None, ge=0, description="Approximate dwell time in milliseconds")
    session_id: Optional[str] = Field(default=None, description="Client session identifier for grouping")


class TrackViewResponse(BaseModel):
    """Response schema for tracking views"""
    status: str
    message: str
    user_id: str
    post_id: str


class RecommendationRequest(BaseModel):
    """Request schema for getting recommendations"""
    user_id: str = Field(..., description="User ID to get recommendations for")
    limit: int = Field(default=10, ge=1, le=100, description="Number of recommendations")


class PostDetail(BaseModel):
    """Post detail schema"""
    id: str
    authorId: str
    content: Optional[str]
    images: List[str]
    createdAt: datetime
    updatedAt: datetime
    username: str
    firstName: str
    lastName: str
    author_image: Optional[str]
    like_count: int
    comment_count: int
    similarity_score: Optional[float] = None
    score_matrix: Optional[Dict[str, float]] = None
    popularity_score: Optional[float] = None
    source: Optional[str] = Field(default=None, description="similarity | author | popular")


class PaginationMeta(BaseModel):
    """Pagination metadata"""
    page: int
    limit: int
    total: int
    totalPages: int
    hasNext: bool
    hasPrevious: bool


class RecommendationResponse(BaseModel):
    """Response schema for recommendation endpoint"""
    status: str
    user_id: str
    recommendations: List[PostDetail]
    count: int
    meta: PaginationMeta


class HealthResponse(BaseModel):
    """Health check response schema"""
    status: str
    service: str
    model_loaded: bool


class ModelStatusResponse(BaseModel):
    """Response schema for model status"""
    status: str
    model_loaded: bool
    total_users: int
    total_posts: int
    total_interactions: int
