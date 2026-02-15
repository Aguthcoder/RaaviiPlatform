import logging
import os

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.fsm.storage.redis import RedisStorage
from fastapi import FastAPI, Header, HTTPException, Request
from redis.asyncio import Redis

from app.handlers.onboarding import router as onboarding_router
from app.middleware.auth import AuthMiddleware
from app.middleware.logging import LoggingMiddleware
from app.middleware.rate_limit import RateLimitMiddleware

logging.basicConfig(level=logging.INFO)

BOT_TOKEN = os.getenv('BOT_TOKEN', '')
WEBHOOK_PATH = os.getenv('BOT_WEBHOOK_PATH', '/webhook/telegram')
WEBHOOK_SECRET = os.getenv('BOT_WEBHOOK_SECRET', '')
BACKEND_SHARED_SECRET = os.getenv('BOT_WEBHOOK_SHARED_SECRET', '')
PUBLIC_WEBHOOK_URL = os.getenv('BOT_PUBLIC_WEBHOOK_URL', 'https://example.com/bot/webhook/telegram')
REDIS_URL = os.getenv('REDIS_URL', 'redis://redis:6379')

redis = Redis.from_url(REDIS_URL, decode_responses=True)
storage = RedisStorage(redis=redis)
bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
dp = Dispatcher(storage=storage)
dp.include_router(onboarding_router)

dp.message.middleware(LoggingMiddleware())
dp.message.middleware(RateLimitMiddleware(redis=redis, limit_seconds=2))
dp.message.middleware(AuthMiddleware())

api = FastAPI(title='Ravi Telegram Bot Service', version='1.0.0')


@api.on_event('startup')
async def startup() -> None:
    await bot.set_webhook(url=PUBLIC_WEBHOOK_URL, secret_token=WEBHOOK_SECRET)


@api.on_event('shutdown')
async def shutdown() -> None:
    await bot.delete_webhook(drop_pending_updates=False)
    await bot.session.close()


@api.post(WEBHOOK_PATH)
async def telegram_webhook(request: Request, x_telegram_bot_api_secret_token: str = Header(default='')):
    if x_telegram_bot_api_secret_token != WEBHOOK_SECRET:
        raise HTTPException(status_code=401, detail='Invalid telegram secret')

    update = await request.json()
    await dp.feed_raw_update(bot, update)
    return {'ok': True}


@api.post('/internal/invite')
async def invite(payload: dict, x_ravi_bot_secret: str = Header(default='')):
    if x_ravi_bot_secret != BACKEND_SHARED_SECRET:
        raise HTTPException(status_code=401, detail='Invalid shared secret')

    telegram_id = payload.get('telegramUserId') or payload.get('userId')
    await bot.send_message(
        chat_id=int(telegram_id),
        text=f"You matched with event {payload.get('eventId')}! Join group {payload.get('telegramGroupId')}.",
    )
    return {'status': 'sent'}


@api.post('/internal/reminder')
async def reminder(payload: dict, x_ravi_bot_secret: str = Header(default='')):
    if x_ravi_bot_secret != BACKEND_SHARED_SECRET:
        raise HTTPException(status_code=401, detail='Invalid shared secret')
    await bot.send_message(chat_id=int(payload['userId']), text=payload['message'])
    return {'status': 'queued'}


@api.post('/internal/feedback')
async def feedback(payload: dict, x_ravi_bot_secret: str = Header(default='')):
    if x_ravi_bot_secret != BACKEND_SHARED_SECRET:
        raise HTTPException(status_code=401, detail='Invalid shared secret')
    await bot.send_message(chat_id=int(payload['userId']), text='How was your event experience?')
    return {'status': 'queued'}
