"""
👥 هندلر مدیریت گروه‌های تلگرام رویداد
- ردیابی متادیتا (بدون خواندن محتوا)
- قوانین هوشمند
- تحلیل الگوی مشارکت
- تشخیص علایق از پیشنهادات گروه
"""

import logging
import time
import re
from collections import defaultdict
from datetime import datetime, timezone
from typing import Dict, List

from telegram import Update, ChatPermissions
from telegram.ext import ContextTypes

from config.settings import settings
from services.api_client import api_client

logger = logging.getLogger(__name__)

# ─── کلیدواژه‌های تشخیص علایق از پیام‌های گروه ─────────────────
INTEREST_KEYWORDS: Dict[str, List[str]] = {
    "سینما":      ["سینما", "فیلم", "cinema", "movie"],
    "کوهنوردی":  ["کوه", "طبیعت", "هایکینگ", "دربند", "توچال"],
    "کافه":       ["کافه", "قهوه", "cafe", "coffee"],
    "ورزش":       ["ورزش", "فوتبال", "والیبال", "بسکتبال", "gym"],
    "تئاتر":      ["تئاتر", "نمایش", "theatre"],
    "موزه":       ["موزه", "گالری", "نمایشگاه"],
    "بردگیم":     ["بازی", "بردگیم", "board game", "مافیا"],
    "رستوران":    ["غذا", "رستوران", "شام", "ناهار"],
}

# ذخیره متادیتای موقت گروه‌ها در حافظه
# ساختار: {chat_id: {user_id: {msg_count, first_msg_time, last_msg_time, response_times}}}
_group_metadata: Dict[int, Dict[int, Dict]] = defaultdict(lambda: defaultdict(lambda: {
    "msg_count": 0,
    "first_msg_time": None,
    "last_msg_time": None,
    "response_times": [],
}))

# آخرین پیام گروه برای محاسبه زمان پاسخ
_last_group_msg: Dict[int, tuple] = {}  # chat_id → (user_id, timestamp)


async def group_member_join_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    """وقتی کاربر وارد گروه رویداد می‌شود"""
    chat = update.effective_chat
    for member in update.message.new_chat_members:
        if member.is_bot:
            # ربات وارد شد — ارسال قوانین
            if member.id == ctx.bot.id:
                await ctx.bot.send_message(
                    chat_id=chat.id,
                    text=settings.GROUP_RULES,
                )
            continue

        # بررسی مجاز بودن ورود
        event_id = ctx.chat_data.get("event_id", "")
        if event_id:
            result = await api_client.check_group_join(
                telegram_id=str(member.id),
                event_id=event_id,
            )
            if not result.get("canJoin", True):
                try:
                    await ctx.bot.ban_chat_member(chat.id, member.id)
                    await ctx.bot.send_message(
                        chat_id=member.id,
                        text=f"⚠️ {result.get('message', 'دسترسی به این گروه مجاز نیست.')}",
                    )
                except Exception:
                    pass
                return

        logger.info(f"User {member.id} joined group {chat.id}")


async def group_member_left_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    """وقتی کاربر گروه را ترک می‌کند (ناپدید‌شدن — متادیتا)"""
    chat = update.effective_chat
    member = update.message.left_chat_member

    if member and not member.is_bot:
        meta = _group_metadata[chat.id][member.id]
        msg_count = meta.get("msg_count", 0)
        join_time = meta.get("first_msg_time")

        if join_time:
            time_in_group = time.time() - join_time
            logger.info(
                f"[Metadata] User {member.id} left group {chat.id} | "
                f"msgs={msg_count} | time_in_group={int(time_in_group)}s"
            )
            # کسی که خیلی زود رفت → سیگنال منفی
            if time_in_group < 300 and msg_count == 0:
                logger.warning(f"Early leaver detected: {member.id} in {chat.id}")


async def group_message_tracker(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    """
    ردیاب متادیتای پیام‌های گروه
    ⚠️ محتوای پیام خوانده نمی‌شود — فقط الگو
    """
    msg = update.message
    if not msg or not msg.from_user:
        return

    chat_id = update.effective_chat.id
    user_id = msg.from_user.id
    now = time.time()

    meta = _group_metadata[chat_id][user_id]
    meta["msg_count"] += 1

    if meta["first_msg_time"] is None:
        meta["first_msg_time"] = now
    meta["last_msg_time"] = now

    # محاسبه زمان پاسخ
    if chat_id in _last_group_msg:
        last_uid, last_time = _last_group_msg[chat_id]
        if last_uid != user_id:
            response_time_min = (now - last_time) / 60
            if response_time_min < 30:  # فقط پاسخ‌های منطقی
                meta["response_times"].append(response_time_min)

    _last_group_msg[chat_id] = (user_id, now)

    # ── تشخیص علایق از کلیدواژه‌ها (بدون ذخیره متن) ────────────
    if msg.text:
        detected = _detect_interest_keyword(msg.text)
        if detected:
            logger.info(f"[Interest detected] user={user_id} interest={detected}")
            await api_client.save_user_interest_from_group(
                telegram_id=str(user_id),
                event_id=ctx.chat_data.get("event_id", ""),
                next_event_interest=detected,
            )

    # ── هر ۱۰ پیام — ارسال متادیتا به بک‌اند ────────────────────
    total_msgs = sum(m["msg_count"] for m in _group_metadata[chat_id].values())
    if total_msgs % 10 == 0:
        await _flush_metadata(chat_id, ctx)


def _detect_interest_keyword(text: str) -> str | None:
    """تشخیص کلیدواژه علاقه بدون ذخیره متن اصلی"""
    text_lower = text.lower()
    for interest, keywords in INTEREST_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            return interest
    return None


async def _flush_metadata(chat_id: int, ctx: ContextTypes.DEFAULT_TYPE):
    """ارسال خلاصه متادیتا به بک‌اند"""
    event_id = ctx.chat_data.get("event_id", "")
    if not event_id:
        return

    members_meta = []
    for uid, meta in _group_metadata[chat_id].items():
        avg_response = (
            sum(meta["response_times"]) / len(meta["response_times"])
            if meta["response_times"] else 30
        )
        members_meta.append({
            "telegramId": str(uid),
            "messageCount": meta["msg_count"],
            "responseTimeMinutes": round(avg_response, 1),
        })

    if members_meta:
        await api_client.save_group_metadata(
            group_id=str(chat_id),
            event_id=event_id,
            members=members_meta,
        )


async def create_event_group(
    bot,
    event_id: str,
    event_title: str,
    participant_ids: List[int],
) -> str | None:
    """
    ساخت گروه تلگرام برای رویداد و دعوت شرکت‌کنندگان
    برمی‌گرداند: لینک گروه یا None
    """
    try:
        # ساخت گروه
        chat = await bot.create_group(
            title=f"🌟 {event_title}",
            user_ids=participant_ids[:10],  # تلگرام محدودیت دارد
        )
        chat_id = chat.id

        # ذخیره event_id در chat_data (برای هندلرها)
        # این از طریق job یا webhook set می‌شود

        # ارسال قوانین
        await bot.send_message(chat_id=chat_id, text=settings.GROUP_RULES)

        # ساخت لینک دعوت
        invite = await bot.create_chat_invite_link(
            chat_id=chat_id,
            expire_date=None,
            member_limit=50,
        )

        logger.info(f"Group created for event {event_id}: {chat_id}")
        return invite.invite_link

    except Exception as e:
        logger.error(f"create_event_group error: {e}")
        return None


async def remove_bot_from_group(bot, chat_id: int):
    """حذف ربات از گروه بعد از مدت مشخص"""
    try:
        await bot.leave_chat(chat_id)
        logger.info(f"Bot left group {chat_id}")
    except Exception as e:
        logger.error(f"remove_bot_from_group error: {e}")
