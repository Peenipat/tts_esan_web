# backend/app/utils/cache.py
import redis.asyncio as aioredis_equiv
from app.core.config import settings

redis_pool = None

async def get_redis_pool():
    global redis_pool
    if redis_pool is None:
        # ใช้ redis.asyncio.from_url แทน aioredis.from_url
        redis_pool = aioredis_equiv.from_url(
            settings.REDIS_URL, encoding="utf-8", decode_responses=True
        )
    return redis_pool

async def get_cached_result(key: str):
    r = await get_redis_pool()
    return await r.get(key)

async def set_cached_result(key: str, value: str, expire: int = 3600):
    r = await get_redis_pool()
    await r.set(key, value, ex=expire)
