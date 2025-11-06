"""Database connection and session management"""
import asyncpg
import logging
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager
from app.config import settings

logger = logging.getLogger(__name__)


class Database:
    """Async PostgreSQL database connection manager"""
    
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None
    
    async def connect(self):
        """Create database connection pool"""
        try:
            from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
            
            # Parse DATABASE_URL to remove schema parameter (asyncpg doesn't support it)
            parsed = urlparse(settings.DATABASE_URL)
            
            # Remove schema from query parameters
            query_params = parse_qs(parsed.query)
            query_params.pop('schema', None)  # Remove schema parameter
            
            # Rebuild query string without schema
            new_query = urlencode(query_params, doseq=True)
            
            # Reconstruct URL
            new_parsed = parsed._replace(query=new_query)
            db_url = urlunparse(new_parsed)
            
            # Convert postgresql:// to postgres:// for asyncpg
            db_url = db_url.replace('postgresql://', 'postgres://')
            
            self.pool = await asyncpg.create_pool(
                db_url,
                min_size=5,
                max_size=20,
                command_timeout=60
            )
            logger.info("Database connection pool created successfully")
        except Exception as e:
            logger.error(f"Error creating database connection pool: {e}")
            raise
    
    async def close(self):
        """Close database connection pool"""
        if self.pool:
            await self.pool.close()
            logger.info("Database connection pool closed")
    
    @asynccontextmanager
    async def get_connection(self):
        """Get a database connection from the pool"""
        if self.pool is None:
            await self.connect()
        
        async with self.pool.acquire() as connection:
            yield connection
    
    async def execute_query(
        self,
        query: str,
        params: Optional[tuple] = None
    ) -> List[Dict[str, Any]]:
        """Execute a SELECT query and return results"""
        try:
            async with self.get_connection() as conn:
                if params:
                    rows = await conn.fetch(query, *params)
                else:
                    rows = await conn.fetch(query)
                
                return [dict(row) for row in rows]
        except Exception as e:
            logger.error(f"Error executing query: {e}")
            raise
    
    async def execute(
        self,
        query: str,
        params: Optional[tuple] = None
    ) -> None:
        """Execute a non-SELECT query (INSERT, UPDATE, DELETE)"""
        try:
            async with self.get_connection() as conn:
                if params:
                    await conn.execute(query, *params)
                else:
                    await conn.execute(query)
        except Exception as e:
            logger.error(f"Error executing query: {e}")
            raise


# Global database instance
db = Database()

