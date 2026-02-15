import time
from typing import Any, Awaitable, Callable, Dict

from aiogram import BaseMiddleware
from aiogram.types import TelegramObject
from redis.asyncio import Redis


class RateLimitMiddleware(BaseMiddleware):
    def __init__(self, redis: Redis, limit_seconds: int = 2):
        self.redis = redis
        self.limit_seconds = limit_seconds

    async def __call__(
        self,
        handler: Callable[[TelegramObject, Dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: Dict[str, Any],
    ) -> Any:
        from_user = getattr(event, 'from_user', None)
        if not from_user:
            return await handler(event, data)

        key = f"bot:rl:{from_user.id}"
        now = int(time.time())
        last = await self.redis.get(key)
        if last and now - int(last) < self.limit_seconds:
            return None

        await self.redis.set(key, now, ex=self.limit_seconds)
        return await handler(event, data)
