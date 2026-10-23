import json
import logging
from typing import Optional, Any
import redis.asyncio as redis
from src.core.config import settings

logger = logging.getLogger(__name__)

redis_client: Optional[redis.Redis] = None


async def get_redis_client() -> Optional[redis.Redis]:
    global redis_client
    if redis_client is None:
        try:
            redis_client = redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=2.0
            )
        except Exception as e:
            logger.warning(f"Could not connect to Redis server: {e}. Running without Redis cache.")
            return None
    return redis_client


async def set_cache(key: str, value: Any, ttl_seconds: int = 300) -> bool:
    try:
        client = await get_redis_client()
        if not client:
            return False
        serialized = json.dumps(value)
        await client.setex(key, ttl_seconds, serialized)
        return True
    except Exception as e:
        logger.warning(f"Redis cache set warning for key {key}: {e}")
        return False


async def get_cache(key: str) -> Optional[Any]:
    try:
        client = await get_redis_client()
        if not client:
            return None
        data = await client.get(key)
        if data:
            return json.loads(data)
        return None
    except Exception as e:
        logger.warning(f"Redis cache get warning for key {key}: {e}")
        return None


async def invalidate_cache(key: str) -> bool:
    try:
        client = await get_redis_client()
        if not client:
            return False
        await client.delete(key)
        return True
    except Exception as e:
        logger.warning(f"Redis cache delete warning for key {key}: {e}")
        return False


async def close_redis_client():
    global redis_client
    if redis_client:
        try:
            await redis_client.close()
        except Exception:
            pass
        redis_client = None

