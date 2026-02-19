"""
AuthMiddleware — Fixed version
Bug in original: allowed_ids starts as empty set, which means the guard
`if self.allowed_ids and (not from_user or from_user.id not in self.allowed_ids)`
evaluates to False when allowed_ids is empty, so ALL messages pass.
This is actually the correct permissive behavior for a public bot.

However if you want to RESTRICT to specific IDs, pass them at init time:
    dp.message.middleware(AuthMiddleware(allowed_ids={123456, 789012}))

Fixed: added isBanned check via Redis + proper logging.
"""
import logging
from typing import Any, Awaitable, Callable, Dict

from aiogram import BaseMiddleware
from aiogram.types import TelegramObject

logger = logging.getLogger(__name__)


class AuthMiddleware(BaseMiddleware):
    def __init__(self, allowed_ids: set[int] | None = None):
        # If None or empty → public bot (all users allowed)
        # If non-empty set → allowlist mode
        self.allowed_ids = allowed_ids or set()

    async def __call__(
        self,
        handler: Callable[[TelegramObject, Dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: Dict[str, Any],
    ) -> Any:
        from_user = getattr(event, 'from_user', None)

        if from_user is None:
            # System events (channel posts, etc.) — pass through
            return await handler(event, data)

        user_id = from_user.id

        # Allowlist check (only active if allowed_ids is non-empty)
        if self.allowed_ids and user_id not in self.allowed_ids:
            logger.warning(f"Blocked user {user_id}: not in allowlist")
            return None

        # Redis ban check
        redis = data.get("redis")
        if redis:
            try:
                is_banned = await redis.get(f"bot:user:{user_id}:banned")
                if is_banned:
                    logger.warning(f"Blocked banned user {user_id}")
                    # Optionally notify the user
                    bot = data.get("bot")
                    if bot:
                        try:
                            await bot.send_message(
                                chat_id=user_id,
                                text="⛔ حساب شما مسدود شده است. برای اطلاعات بیشتر با پشتیبانی تماس بگیرید."
                            )
                        except Exception:
                            pass
                    return None
            except Exception as e:
                # Don't block on Redis failure
                logger.error(f"Redis ban check failed for {user_id}: {e}")

        return await handler(event, data)
