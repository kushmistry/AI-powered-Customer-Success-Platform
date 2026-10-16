import json
import logging
from typing import Any, Optional
import redis.asyncio as aioredis
from app.core.config import settings

logger = logging.getLogger(__name__)


class CacheService:
    def __init__(self, redis_url: str):
        self.redis_url = redis_url
        self.client: Optional[aioredis.Redis] = None

    async def connect(self):
        """Initialize Redis connection."""
        try:
            self.client = aioredis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True,
                max_connections=settings.REDIS_POOL_MAX_CONNECTIONS,
            )
            await self.client.ping()
            logger.info("Connected to Redis successfully.")
        except Exception as e:
            logger.warning(f"Failed to connect to Redis at {self.redis_url}: {e}. Proceeding without cache.")
            self.client = None

    async def close(self):
        """Close Redis connection."""
        if self.client:
            await self.client.aclose()
            self.client = None

    async def get(self, key: str) -> Optional[Any]:
        """Fetch and parse JSON from Redis cache."""
        if not self.client:
            return None
        try:
            val = await self.client.get(key)
            if val is not None:
                return json.loads(val)
            return None
        except Exception as e:
            logger.warning(f"Redis get error for key '{key}': {e}")
            return None

    async def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        """Store JSON-serializable value in Redis with TTL in seconds."""
        if not self.client:
            return False
        try:
            serialized = json.dumps(value, default=str)
            await self.client.set(key, serialized, ex=ttl)
            return True
        except Exception as e:
            logger.warning(f"Redis set error for key '{key}': {e}")
            return False

    async def delete(self, key: str) -> bool:
        """Delete a single key from Redis."""
        if not self.client:
            return False
        try:
            await self.client.delete(key)
            return True
        except Exception as e:
            logger.warning(f"Redis delete error for key '{key}': {e}")
            return False

    async def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching a wildcard pattern using SCAN."""
        if not self.client:
            return 0
        deleted_count = 0
        try:
            cursor = 0
            while True:
                cursor, keys = await self.client.scan(cursor=cursor, match=pattern, count=100)
                if keys:
                    await self.client.delete(*keys)
                    deleted_count += len(keys)
                if cursor == 0:
                    break
            return deleted_count
        except Exception as e:
            logger.warning(f"Redis delete_pattern error for pattern '{pattern}': {e}")
            return 0


cache_service = CacheService(settings.REDIS_URL)


async def get_cache() -> CacheService:
    """Dependency that returns the active CacheService instance."""
    return cache_service
