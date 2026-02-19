from typing import Any, Awaitable, Callable, Dict

from aiogram import BaseMiddleware
from aiogram.types import TelegramObject


class AuthMiddleware(BaseMiddleware):
    def __init__(self, allowed_ids: set[int] | None = None):
        self.allowed_ids = allowed_ids or set()

    async def __call__(
        self,
        handler: Callable[[TelegramObject, Dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: Dict[str, Any],
    ) -> Any:
        from_user = getattr(event, 'from_user', None)
        if self.allowed_ids and (not from_user or from_user.id not in self.allowed_ids):
            return None
        return await handler(event, data)
