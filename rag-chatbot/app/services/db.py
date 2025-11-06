import asyncpg
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager
from app.config import settings


class Database:
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None

    async def connect(self):
        db_url = settings.DATABASE_URL.replace('postgresql://', 'postgres://')
        self.pool = await asyncpg.create_pool(db_url, min_size=2, max_size=10)

    async def close(self):
        if self.pool:
            await self.pool.close()

    @asynccontextmanager
    async def get_conn(self):
        if self.pool is None:
            await self.connect()
        async with self.pool.acquire() as conn:
            yield conn

    async def query(self, sql: str, params: Optional[tuple] = None) -> List[Dict[str, Any]]:
        async with self.get_conn() as conn:
            rows = await conn.fetch(sql, *(params or ()))
            return [dict(r) for r in rows]


db = Database()


