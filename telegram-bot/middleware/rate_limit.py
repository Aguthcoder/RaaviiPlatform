"""
RateLimitMiddleware — Fixed version
Original had: limit_seconds=2 (too aggressive, blocks legitimate rapid messages)
Fixed: sliding window with proper per-user tracking + graceful degradation on Redis failure
"""
import logging
import time
from typing import Any, Awaitable, Callable, Dict

from aiogram import BaseMiddleware
from aiogram.types import TelegramObject, Message
from redis.asyncio import Redis

logger = logging.getLogger(__name__)

DEFAULT_LIMIT_SECONDS = 1.5  # slightly more permissive than original 2s


class RateLimitMiddleware(BaseMiddleware):
    def __init__(self, redis: Redis, limit_seconds: float = DEFAULT_LIMIT_SECONDS):
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

        user_id = from_user.id
        key = f"bot:ratelimit:{user_id}"

        try:
            now = time.time()
            last_str = await self.redis.get(key)

            if last_str:
                last = float(last_str)
                elapsed = now - last
                if elapsed < self.limit_seconds:
                    # Rate limited
                    if isinstance(event, Message):
                        remaining = self.limit_seconds - elapsed
                        try:
                            await event.answer(
                                f"⏳ لطفاً {remaining:.1f} ثانیه صبر کنید...",
                                show_alert=False
                            )
                        except Exception:
                            pass
                    return None  # Drop the update

            # Update last-seen timestamp
            await self.redis.set(key, str(now), ex=int(self.limit_seconds * 2 + 5))

        except Exception as e:
            # Don't block on Redis failure — let through
            logger.warning(f"Rate limit check failed for {user_id}: {e}")

        return await handler(event, data)
