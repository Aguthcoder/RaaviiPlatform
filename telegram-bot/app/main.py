import logging
import os

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.fsm.storage.redis import RedisStorage
from fastapi import FastAPI, Header, HTTPException, Request
from redis.asyncio import Redis

from app.handlers.onboarding import router as onboarding_router
from app.handlers.group import router as group_router, handle_group_invite, send_feedback_request
from app.middleware.auth import AuthMiddleware
from app.middleware.logging import LoggingMiddleware
from app.middleware.rate_limit import RateLimitMiddleware

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

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

# ثبت هندلرها
dp.include_router(onboarding_router)
dp.include_router(group_router)

# میدلورها (ترتیب مهم است)
dp.message.middleware(LoggingMiddleware())
dp.message.middleware(RateLimitMiddleware(redis=redis, limit_seconds=2))
dp.message.middleware(AuthMiddleware())

api = FastAPI(title='Ravi Telegram Bot Service', version='2.0.0')


@api.on_event('startup')
async def startup() -> None:
    await bot.set_webhook(url=PUBLIC_WEBHOOK_URL, secret_token=WEBHOOK_SECRET)
    logger.info(f"Webhook set to: {PUBLIC_WEBHOOK_URL}")


@api.on_event('shutdown')
async def shutdown() -> None:
    await bot.delete_webhook(drop_pending_updates=False)
    await bot.session.close()


@api.post(WEBHOOK_PATH)
async def telegram_webhook(
    request: Request,
    x_telegram_bot_api_secret_token: str = Header(default='')
):
    if x_telegram_bot_api_secret_token != WEBHOOK_SECRET:
        raise HTTPException(status_code=401, detail='توکن نامعتبر')
    update = await request.json()
    await dp.feed_raw_update(bot, update)
    return {'ok': True}


def _verify(secret: str):
    if secret != BACKEND_SHARED_SECRET:
        raise HTTPException(status_code=401, detail='دسترسی غیرمجاز')


@api.post('/internal/invite')
async def invite(payload: dict, x_ravi_bot_secret: str = Header(default='')):
    """دعوت کاربر به گروه مچ‌شده"""
    _verify(x_ravi_bot_secret)

    telegram_id = int(payload.get('telegramUserId') or payload.get('userId'))
    group_id = payload.get('groupId', '')
    group_link = payload.get('groupLink', '')
    event_id = payload.get('eventId', '')
    event_title = payload.get('eventTitle', 'رویداد راوی')

    # ذخیره لینک گروه در Redis برای هندلر callback
    if group_link:
        await redis.set(f"bot:group:{group_id}:link", group_link, ex=48 * 3600)

    await handle_group_invite(
        bot=bot,
        redis=redis,
        telegram_id=telegram_id,
        group_id=group_id,
        group_link=group_link,
        event_id=event_id,
        event_title=event_title,
    )
    return {'status': 'sent'}


@api.post('/internal/reminder')
async def reminder(payload: dict, x_ravi_bot_secret: str = Header(default='')):
    """ارسال یادآوری به کاربر"""
    _verify(x_ravi_bot_secret)
    await bot.send_message(
        chat_id=int(payload['userId']),
        text=payload.get('message', '🔔 یادآوری از راوی'),
    )
    return {'status': 'queued'}


@api.post('/internal/feedback')
async def feedback(payload: dict, x_ravi_bot_secret: str = Header(default='')):
    """درخواست فیدبک پس از رویداد"""
    _verify(x_ravi_bot_secret)
    await send_feedback_request(
        bot=bot,
        user_id=int(payload['userId']),
        event_id=payload.get('eventId', ''),
        event_title=payload.get('eventTitle', 'رویداد راوی'),
    )
    return {'status': 'queued'}


@api.post('/internal/broadcast')
async def broadcast(payload: dict, x_ravi_bot_secret: str = Header(default='')):
    """ارسال پیام گروهی (فقط ادمین)"""
    _verify(x_ravi_bot_secret)
    user_ids = payload.get('userIds', [])
    message_text = payload.get('message', '')
    sent, failed = 0, 0
    for uid in user_ids:
        try:
            await bot.send_message(chat_id=int(uid), text=message_text)
            sent += 1
        except Exception as e:
            logger.warning(f"Broadcast failed for {uid}: {e}")
            failed += 1
    return {'sent': sent, 'failed': failed}


@api.get('/health')
async def health():
    return {'status': 'ok', 'bot': 'running'}
