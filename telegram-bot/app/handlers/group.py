"""
مدیریت گروه‌های تلگرام با قفل توزیع‌شده Redis
جلوگیری از Race Condition در هنگام ورود همزمان به گروه
"""
import logging
import os
from contextlib import asynccontextmanager

import httpx
from aiogram import Bot, Router
from aiogram.fsm.context import FSMContext
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from redis.asyncio import Redis

from app.fsm.states import GroupStates

logger = logging.getLogger(__name__)
router = Router(name='group')

BACKEND_URL = os.getenv('BACKEND_URL', 'http://backend:4000')
BOT_BACKEND_SECRET = os.getenv('BOT_WEBHOOK_SHARED_SECRET', '')
LOCK_TIMEOUT_SECONDS = 10


@asynccontextmanager
async def distributed_lock(redis: Redis, key: str, timeout: int = LOCK_TIMEOUT_SECONDS):
    """
    قفل توزیع‌شده Redis برای جلوگیری از Race Condition
    مثال از PDF: async def join_group(user_id, group_id)
    """
    lock_key = f"lock:{key}"
    acquired = await redis.set(lock_key, "1", nx=True, ex=timeout)
    try:
        yield acquired
    finally:
        if acquired:
            await redis.delete(lock_key)


async def join_group_safe(
    bot: Bot,
    redis: Redis,
    user_id: int,
    group_id: str,
    group_link: str,
    event_id: str,
) -> dict:
    """
    ورود ایمن به گروه با قفل توزیع‌شده - جلوگیری از کلیک همزمان
    پیاده‌سازی الگوریتم Race Condition از مستندات راوی
    """
    lock_key = f"user:{user_id}:group_join:{group_id}"

    async with distributed_lock(redis, lock_key) as acquired:
        if not acquired:
            return {"success": False, "reason": "در حال پردازش، لطفاً صبر کن..."}

        # بررسی اعتبار کاربر از بکند
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.post(
                    f"{BACKEND_URL}/api/bot/group-join",
                    json={
                        "telegramId": str(user_id),
                        "groupId": group_id,
                        "eventId": event_id,
                    },
                    headers={"x-ravi-bot-secret": BOT_BACKEND_SECRET},
                )
                result = resp.json()

                if resp.status_code == 200 and result.get("canJoin"):
                    # ذخیره state در Redis
                    await redis.set(
                        f"bot:user:{user_id}:current_group",
                        group_id,
                        ex=7 * 24 * 3600,  # ۷ روز
                    )
                    return {"success": True, "groupLink": group_link, "credits": result.get("credits")}
                else:
                    return {"success": False, "reason": result.get("message", "اعتبار کافی نیست")}
        except Exception as e:
            logger.error(f"Group join error for user {user_id}: {e}")
            return {"success": False, "reason": "خطای سرور"}


async def handle_group_invite(
    bot: Bot,
    redis: Redis,
    telegram_id: int,
    group_id: str,
    group_link: str,
    event_id: str,
    event_title: str,
    state: FSMContext | None = None,
):
    """ارسال پیام دعوت به گروه با دکمه تعاملی"""
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(
                text="✅ پیوستن به گروه",
                callback_data=f"join_group:{group_id}:{event_id}",
            )
        ],
        [
            InlineKeyboardButton(
                text="ℹ️ اطلاعات رویداد",
                callback_data=f"event_info:{event_id}",
            )
        ],
    ])

    try:
        await bot.send_message(
            chat_id=telegram_id,
            text=(
                f"🎉 <b>مچ شدی!</b>\n\n"
                f"رویداد: <b>{event_title}</b>\n\n"
                f"الگوریتم راوی تو رو با یه گروه {4}-{6} نفره مچ کرده که "
                f"بیشترین سازگاری رو باهاشون داری.\n\n"
                f"⏰ دعوت‌نامه‌ات محدوده، سریع پیوند بزن!"
            ),
            reply_markup=keyboard,
            parse_mode="HTML",
        )
    except Exception as e:
        logger.error(f"Failed to send group invite to {telegram_id}: {e}")


@router.callback_query(lambda c: c.data and c.data.startswith("join_group:"))
async def handle_join_group_callback(callback: CallbackQuery, bot: Bot, redis: Redis):
    """هندلر کلیک دکمه پیوستن به گروه"""
    _, group_id, event_id = callback.data.split(":")
    user_id = callback.from_user.id

    await callback.answer("در حال پردازش...", show_alert=False)

    # دریافت لینک گروه از Redis
    group_link = await redis.get(f"bot:group:{group_id}:link")
    if not group_link:
        await callback.message.answer("❌ لینک گروه منقضی شده. با پشتیبانی تماس بگیر.")
        return

    result = await join_group_safe(
        bot=bot,
        redis=redis,
        user_id=user_id,
        group_id=group_id,
        group_link=group_link,
        event_id=event_id,
    )

    if result["success"]:
        await callback.message.edit_text(
            f"✅ <b>ورود موفق!</b>\n\n"
            f"لینک اختصاصی گروهت:\n{result['groupLink']}\n\n"
            f"💡 این لینک فقط یه بار قابل استفاده‌ست!",
            parse_mode="HTML",
        )
    else:
        await callback.message.edit_text(
            f"⚠️ <b>نمی‌تونی الان وارد بشی</b>\n\n{result['reason']}",
            parse_mode="HTML",
        )


async def send_feedback_request(bot: Bot, user_id: int, event_id: str, event_title: str):
    """درخواست فیدبک پس از رویداد"""
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="⭐⭐⭐⭐⭐", callback_data=f"feedback:{event_id}:5"),
            InlineKeyboardButton(text="⭐⭐⭐⭐", callback_data=f"feedback:{event_id}:4"),
        ],
        [
            InlineKeyboardButton(text="⭐⭐⭐", callback_data=f"feedback:{event_id}:3"),
            InlineKeyboardButton(text="⭐⭐", callback_data=f"feedback:{event_id}:2"),
            InlineKeyboardButton(text="⭐", callback_data=f"feedback:{event_id}:1"),
        ],
    ])

    try:
        await bot.send_message(
            chat_id=user_id,
            text=(
                f"🙏 <b>چطور بود؟</b>\n\n"
                f"رویداد <b>{event_title}</b> تموم شد.\n"
                f"تجربه‌ات از همنشینی گروه رو امتیاز بده تا "
                f"الگوریتم راوی برات بهتر بشه:"
            ),
            reply_markup=keyboard,
            parse_mode="HTML",
        )
    except Exception as e:
        logger.error(f"Failed to send feedback request to {user_id}: {e}")


@router.callback_query(lambda c: c.data and c.data.startswith("feedback:"))
async def handle_feedback(callback: CallbackQuery, bot: Bot, redis: Redis):
    """دریافت و ذخیره فیدبک"""
    parts = callback.data.split(":")
    event_id, score = parts[1], int(parts[2])
    user_id = callback.from_user.id

    # ارسال به بکند
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            await client.post(
                f"{BACKEND_URL}/api/bot/feedback",
                json={
                    "telegramId": str(user_id),
                    "eventId": event_id,
                    "score": score,
                },
                headers={"x-ravi-bot-secret": BOT_BACKEND_SECRET},
            )
    except Exception as e:
        logger.error(f"Feedback submission error: {e}")

    stars = "⭐" * score
    await callback.message.edit_text(
        f"{stars}\n\n"
        f"ممنون از فیدبکت! {score} از ۵ ستاره ثبت شد.\n"
        f"الگوریتم راوی از این اطلاعات برای مچ‌های بهتر استفاده می‌کنه 🚀",
        parse_mode="HTML",
    )
    await callback.answer("فیدبک ثبت شد!")
