"""Service for generating recommendations with real-time learning"""
import os
import json
import numpy as np
from typing import List, Dict, Any, Optional
import logging
from collections import defaultdict

from app.database import db
from app.config import settings

logger = logging.getLogger(__name__)


class RecommendationService:
    """Service for handling recommendation logic with incremental learning"""
    
    def __init__(self):
        self.user_post_interactions: Dict[str, List[str]] = defaultdict(list)  # user_id -> [post_ids]
        self.post_similarity_matrix: Dict[str, Dict[str, float]] = {}  # post_id -> {post_id: similarity}
        self.model_loaded = False
        self.interactions_file = os.path.join(
            os.path.dirname(settings.MODEL_PATH),
            'interactions.json'
        )
        self.load_interactions()
        # Try to ensure DB table exists and preload interactions from DB (best-effort)
        try:
            import asyncio
            asyncio.create_task(self._ensure_views_table())
            asyncio.create_task(self._load_interactions_from_db())
        except Exception:
            pass
    
    def load_interactions(self) -> None:
        """Load user-post interactions from file"""
        try:
            if os.path.exists(self.interactions_file):
                with open(self.interactions_file, 'r') as f:
                    data = json.load(f)
                    self.user_post_interactions = defaultdict(list, data.get('interactions', {}))
                logger.info(f"Loaded {len(self.user_post_interactions)} user interactions")
                self.model_loaded = True
        except Exception as e:
            logger.warning(f"Could not load interactions: {e}")
    
    def save_interactions(self) -> None:
        """Save user-post interactions to file"""
        try:
            os.makedirs(os.path.dirname(self.interactions_file), exist_ok=True)
            data = {
                'interactions': dict(self.user_post_interactions)
            }
            with open(self.interactions_file, 'w') as f:
                json.dump(data, f)
            logger.info("Interactions saved successfully")
        except Exception as e:
            logger.error(f"Error saving interactions: {e}")
    
    async def _ensure_views_table(self) -> None:
        """Create recommendation views table if not exists"""
        try:
            # Create table
            await db.execute(
                """
                CREATE TABLE IF NOT EXISTS "RecommendationView" (
                  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                  "userId" text NOT NULL,
                  "postId" text NOT NULL,
                  "postContent" text,
                  "postAuthorId" text,
                  "createdAt" timestamptz NOT NULL DEFAULT now()
                );
                """
            )
            # Add columns if table already existed without them
            await db.execute(
                "ALTER TABLE \"RecommendationView\" ADD COLUMN IF NOT EXISTS \"postContent\" text"
            )
            await db.execute(
                "ALTER TABLE \"RecommendationView\" ADD COLUMN IF NOT EXISTS \"postAuthorId\" text"
            )
        except Exception as e:
            logger.warning(f"Could not ensure RecommendationView table: {e}")

    async def _load_interactions_from_db(self) -> None:
        """Warm in-memory interactions from DB history."""
        try:
            await self._ensure_views_table()
            rows = await db.execute_query(
                """
                SELECT "userId", "postId"
                FROM "RecommendationView"
                ORDER BY "createdAt" ASC
                """
            )
            rebuilt: Dict[str, List[str]] = defaultdict(list)
            for r in rows:
                uid = r.get('userId')
                pid = r.get('postId')
                if uid and pid:
                    if pid not in rebuilt[uid]:
                        rebuilt[uid].append(pid)
            if rebuilt:
                self.user_post_interactions = rebuilt
                # Rebuild a lightweight similarity (co-view counts)
                sim: Dict[str, Dict[str, float]] = {}
                for posts in rebuilt.values():
                    for i in range(len(posts)):
                        for j in range(i + 1, len(posts)):
                            a, b = posts[i], posts[j]
                            sim.setdefault(a, {})
                            sim.setdefault(b, {})
                            sim[a][b] = sim[a].get(b, 0.0) + 0.1
                            sim[b][a] = sim[b].get(a, 0.0) + 0.1
                self.post_similarity_matrix = sim
                self.model_loaded = True
                logger.info(
                    f"Warm-loaded {sum(len(v) for v in rebuilt.values())} interactions from DB"
                )
        except Exception as e:
            logger.warning(f"Could not load interactions from DB: {e}")
    
    async def track_view(
        self,
        user_id: str,
        post_id: str,
        post_content: Optional[str] = None,
        post_author_id: Optional[str] = None
    ) -> None:
        """Track a user viewing a post and update the model"""
        try:
            # Add interaction
            if post_id not in self.user_post_interactions[user_id]:
                self.user_post_interactions[user_id].append(post_id)
            
            # Update similarity matrix based on co-viewing patterns
            await self._update_similarity_matrix(user_id, post_id)
            
            # Save interactions
            self.save_interactions()
            self.model_loaded = True
            
            # Persist to DB (best-effort)
            try:
                await self._ensure_views_table()
                await db.execute(
                    """
                    INSERT INTO "RecommendationView" ("userId", "postId", "postContent", "postAuthorId")
                    VALUES ($1, $2, $3, $4)
                    """,
                    (user_id, post_id, post_content, post_author_id)
                )
            except Exception as e:
                logger.warning(f"Failed to persist view to DB: {e}")
            
            logger.info(f"Tracked view: user={user_id}, post={post_id}")
            
        except Exception as e:
            logger.error(f"Error tracking view: {e}")
            raise
    
    async def _update_similarity_matrix(
        self,
        user_id: str,
        viewed_post_id: str
    ) -> None:
        """Update similarity matrix based on co-viewing patterns"""
        try:
            # Get all posts this user has viewed
            user_viewed_posts = self.user_post_interactions[user_id]
            
            # For each post the user has viewed, increase similarity with the new post
            for other_post_id in user_viewed_posts:
                if other_post_id == viewed_post_id:
                    continue
                
                # Initialize similarity dicts if needed
                if viewed_post_id not in self.post_similarity_matrix:
                    self.post_similarity_matrix[viewed_post_id] = {}
                if other_post_id not in self.post_similarity_matrix:
                    self.post_similarity_matrix[other_post_id] = {}
                
                # Increase similarity (co-viewing indicates similarity)
                similarity_increment = 0.1
                
                # Update both directions (symmetric)
                self.post_similarity_matrix[viewed_post_id][other_post_id] = \
                    self.post_similarity_matrix[viewed_post_id].get(other_post_id, 0) + similarity_increment
                self.post_similarity_matrix[other_post_id][viewed_post_id] = \
                    self.post_similarity_matrix[other_post_id].get(viewed_post_id, 0) + similarity_increment
                
        except Exception as e:
            logger.error(f"Error updating similarity matrix: {e}")
    
    async def get_recommendations(
        self,
        user_id: str,
        page: int = 1,
        limit: int = 10
    ) -> (List[Dict[str, Any]], int):
        """Get post recommendations for a user based on their viewing history"""
        try:
            # Get posts user has viewed
            viewed_post_ids = self.user_post_interactions.get(user_id, [])
            
            if not viewed_post_ids:
                # If user has no viewing history, return popular posts with proper pagination/total
                posts, total = await self.get_popular_posts_paged(page=page, limit=limit)
                return posts, total
            
            # Calculate recommendation scores and per-source contributions
            recommendation_scores: Dict[str, float] = {}
            contribution_matrix: Dict[str, Dict[str, float]] = {}
            
            # For each post the user has viewed, find similar posts
            for viewed_post_id in viewed_post_ids:
                similar_posts = self.post_similarity_matrix.get(viewed_post_id, {})
                
                for similar_post_id, similarity in similar_posts.items():
                    # Don't recommend posts user has already viewed
                    if similar_post_id not in viewed_post_ids:
                        recommendation_scores[similar_post_id] = \
                            recommendation_scores.get(similar_post_id, 0) + similarity
                        # Track contribution from this viewed post
                        if similar_post_id not in contribution_matrix:
                            contribution_matrix[similar_post_id] = {}
                        contribution_matrix[similar_post_id][viewed_post_id] = \
                            contribution_matrix[similar_post_id].get(viewed_post_id, 0) + similarity
            
            # Sort by score (high to low accuracy)
            sorted_posts = sorted(
                recommendation_scores.items(),
                key=lambda x: x[1],
                reverse=True
            )
            total = len(sorted_posts)
            
            # Pagination slice
            start = (page - 1) * limit
            end = start + limit
            paged_posts = sorted_posts[start:end]
            
            recommended_post_ids = [post_id for post_id, _ in paged_posts]
            
            # If no recommended ids from similarity here, we'll try author-based next
            
            # Get full post details from database
            if recommended_post_ids:
                recommended_posts = await self.get_post_details(recommended_post_ids)
                
                # Add similarity scores and score_matrix (per-viewed-post contributions)
                score_dict = dict(sorted_posts)
                for post in recommended_posts:
                    post['similarity_score'] = float(score_dict.get(post['id'], 0.0))
                    contrib = contribution_matrix.get(post['id'])
                    if contrib:
                        # Ensure floats, and sort contributions by value desc
                        post['score_matrix'] = {
                            k: float(v) for k, v in sorted(contrib.items(), key=lambda x: x[1], reverse=True)
                        }
                    else:
                        post['score_matrix'] = None
                
                # Mark source
                for p in recommended_posts:
                    p['source'] = 'similarity'
                return recommended_posts, total
            
            # Fallback to popular posts with pagination
            # Try author-based before popular
            author_posts, author_total = await self.get_author_based_posts(
                user_id=user_id,
                page=page,
                limit=limit,
                exclude_ids=viewed_post_ids
            )
            if author_posts:
                for p in author_posts:
                    p['similarity_score'] = p.get('similarity_score') or 0.0
                    p['source'] = 'author'
                return author_posts, author_total

            posts, total = await self.get_popular_posts_paged(page=page, limit=limit, exclude_ids=viewed_post_ids)
            for p in posts:
                p['similarity_score'] = p.get('similarity_score') or 0.0
                p['score_matrix'] = None
                p['source'] = 'popular'
            return posts, total
            
        except Exception as e:
            logger.error(f"Error getting recommendations: {e}")
            posts, total = await self.get_popular_posts_paged(page=page, limit=limit)
            for p in posts:
                p['similarity_score'] = p.get('similarity_score') or 0.0
                p['score_matrix'] = None
                p['source'] = 'popular'
            return posts, total
    
    async def get_post_details(
        self,
        post_ids: List[str]
    ) -> List[Dict[str, Any]]:
        """Get full post details from database"""
        if not post_ids:
            return []
        
        try:
            # Create placeholders for IN clause
            placeholders = ','.join(['$' + str(i+1) for i in range(len(post_ids))])
            query = f"""
                SELECT 
                    p.id,
                    p."authorId",
                    p.content,
                    p.images,
                    p."createdAt",
                    p."updatedAt",
                    u.username,
                    u."firstName",
                    u."lastName",
                    u.image as author_image,
                    COUNT(DISTINCT l.id)::int as like_count,
                    COUNT(DISTINCT c.id)::int as comment_count
                FROM "Post" p
                INNER JOIN "User" u ON p."authorId" = u.id
                LEFT JOIN "Like" l ON p.id = l."postId"
                LEFT JOIN "Comment" c ON p.id = c."postId"
                WHERE p.id IN ({placeholders})
                GROUP BY p.id, u.id
                ORDER BY p."createdAt" DESC
            """
            
            posts = await db.execute_query(query, tuple(post_ids))
            return posts
            
        except Exception as e:
            logger.error(f"Error fetching post details: {e}")
            return []
    
    async def get_popular_posts_paged(
        self,
        page: int = 1,
        limit: int = 10,
        exclude_ids: Optional[List[str]] = None
    ) -> (List[Dict[str, Any]], int):
        """Get popular posts with pagination and optional exclusion list."""
        try:
            where_exclusion = ""
            params: List[Any] = []
            if exclude_ids:
                placeholders = ",".join([f"${i+1}" for i in range(len(exclude_ids))])
                where_exclusion = f" AND p.id NOT IN ({placeholders})"
                params.extend(exclude_ids)

            # Count query for total
            count_query = f"""
                SELECT COUNT(*)::int AS total
                FROM "Post" p
                INNER JOIN "User" u ON p."authorId" = u.id
                WHERE u.status = 'ACTIVE'{where_exclusion}
            """
            count_rows = await db.execute_query(count_query, tuple(params) if params else None)
            total = count_rows[0]['total'] if count_rows else 0

            # Data query with LIMIT/OFFSET
            offset = (page - 1) * limit
            params_with_paging = list(params) + [limit, offset]
            data_query = f"""
                SELECT 
                    p.id,
                    p."authorId",
                    p.content,
                    p.images,
                    p."createdAt",
                    p."updatedAt",
                    u.username,
                    u."firstName",
                    u."lastName",
                    u.image as author_image,
                    COUNT(DISTINCT l.id)::int as like_count,
                    COUNT(DISTINCT c.id)::int as comment_count,
                    (COUNT(DISTINCT l.id) * 2 + COUNT(DISTINCT c.id))::int as popularity_score
                FROM "Post" p
                INNER JOIN "User" u ON p."authorId" = u.id
                LEFT JOIN "Like" l ON p.id = l."postId"
                LEFT JOIN "Comment" c ON p.id = c."postId"
                WHERE u.status = 'ACTIVE'{where_exclusion}
                GROUP BY p.id, u.id
                ORDER BY popularity_score DESC, p."createdAt" DESC
                LIMIT ${len(params)+1} OFFSET ${len(params)+2}
            """
            posts = await db.execute_query(data_query, tuple(params_with_paging))
            # Ensure consistency of optional fields
            for p in posts:
                p['popularity_score'] = float(p.get('popularity_score', 0))
            return posts, total
        except Exception as e:
            logger.error(f"Error fetching popular posts (paged): {e}")
            return [], 0

    async def get_author_based_posts(
        self,
        user_id: str,
        page: int = 1,
        limit: int = 10,
        exclude_ids: Optional[List[str]] = None
    ) -> (List[Dict[str, Any]], int):
        """Recommend posts from authors the user has viewed, excluding already viewed posts."""
        try:
            await self._ensure_views_table()
            # Find authors from user's viewed posts
            author_rows = await db.execute_query(
                """
                SELECT DISTINCT COALESCE(rv."postAuthorId", p."authorId") AS author_id
                FROM "RecommendationView" rv
                LEFT JOIN "Post" p ON p.id = rv."postId"
                WHERE rv."userId" = $1
                """,
                (user_id,)
            )
            author_ids = [r['author_id'] for r in author_rows if r.get('author_id')]
            if not author_ids:
                return [], 0

            # Build params and exclusion
            params: List[Any] = author_ids[:]
            where_exclusion = ""
            if exclude_ids:
                placeholders = ",".join([f"${len(params)+i+1}" for i in range(len(exclude_ids))])
                where_exclusion = f" AND p.id NOT IN ({placeholders})"
                params.extend(exclude_ids)

            author_placeholders = ",".join([f"${i+1}" for i in range(len(author_ids))])
            # Count
            count_query = f"""
                SELECT COUNT(*)::int AS total
                FROM "Post" p
                WHERE p."authorId" IN ({author_placeholders}){where_exclusion}
            """
            count_rows = await db.execute_query(count_query, tuple(params))
            total = count_rows[0]['total'] if count_rows else 0
            if total == 0:
                return [], 0

            # Page
            offset = (page - 1) * limit
            params_with_paging = params + [limit, offset]
            data_query = f"""
                SELECT 
                    p.id,
                    p."authorId",
                    p.content,
                    p.images,
                    p."createdAt",
                    p."updatedAt",
                    u.username,
                    u."firstName",
                    u."lastName",
                    u.image as author_image,
                    0::int as like_count,
                    0::int as comment_count
                FROM "Post" p
                INNER JOIN "User" u ON p."authorId" = u.id
                WHERE p."authorId" IN ({author_placeholders}){where_exclusion}
                ORDER BY p."createdAt" DESC
                LIMIT ${len(params)+1} OFFSET ${len(params)+2}
            """
            posts = await db.execute_query(data_query, tuple(params_with_paging))
            # Provide base author score and score matrix
            for p in posts:
                p['similarity_score'] = p.get('similarity_score') or 0.5
                p['score_matrix'] = {f"author:{p['authorId']}": 0.5}
                p['popularity_score'] = None
            return posts, total
        except Exception as e:
            logger.warning(f"Error fetching author-based posts: {e}")
            return [], 0
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get recommendation system statistics"""
        total_interactions = sum(len(posts) for posts in self.user_post_interactions.values())
        unique_posts = set()
        for posts in self.user_post_interactions.values():
            unique_posts.update(posts)
        # model_loaded true if we have any interactions loaded
        model_loaded = total_interactions > 0
        return {
            'model_loaded': model_loaded,
            'total_users': len(self.user_post_interactions),
            'total_posts': len(unique_posts),
            'total_interactions': total_interactions
        }
