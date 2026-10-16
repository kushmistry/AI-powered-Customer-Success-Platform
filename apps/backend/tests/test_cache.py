import pytest
from app.core.cache import CacheService


@pytest.mark.asyncio
async def test_cache_graceful_degradation_without_server():
    # Points to non-existent server to verify no exceptions are raised
    cache = CacheService("redis://invalid-host:9999/0")
    await cache.connect()

    assert cache.client is None
    # All methods should return safe fallback values without throwing exceptions
    assert await cache.get("test_key") is None
    assert await cache.set("test_key", {"data": 123}) is False
    assert await cache.delete("test_key") is False
    assert await cache.delete_pattern("test:*") == 0

    await cache.close()

