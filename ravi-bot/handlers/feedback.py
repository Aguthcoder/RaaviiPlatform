"""
⭐ هندلر فیدبک — بازخورد بعد از رویداد
- امتیاز ۱ تا ۵
- نظر متنی اختیاری
- ارسال به بک‌اند برای به‌روزرسانی پروفایل هوشمند
"""

import logging
from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import ContextTypes, ConversationHandler

from services.api_client import api_client

logger = logging.getLogger(__name__)

STEP_FEEDBACK_RATING, STEP_FEEDBACK_TEXT = range(200, 202)


async def feedback_start_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    """شروع جمع‌آوری فیدبک"""
    query = update.callback_query
    await query.answer()

    event_id = query.data.replace("feedback_start_", "")
    ctx.user_data["feedback_event_id"] = event_id

    stars_row = [
        InlineKeyboardButton(f"{'⭐' * i}", callback_data=f"rating_{i}")
        for i in range(1, 6)
    ]

    await query.edit_message_text(
        "🌟 *همنشینی تموم شد!*\n\n"
        "از ۱ تا ۵ چقدر از این رویداد رضایت داشتی؟\n"
        "(۱ = خیلی بد / ۵ = عالی)",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup([stars_row]),
    )
    return STEP_FEEDBACK_RATING


async def feedback_rating_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    """دریافت امتیاز"""
    query = update.callback_query
    await query.answer()

    score = int(query.data.replace("rating_", ""))
    ctx.user_data["feedback_score"] = score

    emoji = ["😞", "😐", "🙂", "😊", "🤩"][score - 1]

    await query.edit_message_text(
        f"امتیاز ثبت شد: {emoji} {'⭐' * score}\n\n"
        "اگه دوست داری یه نظر کوتاه بنویس (یا «رد کردن» رو بزن):",
        reply_markup=InlineKeyboardMarkup([[
            InlineKeyboardButton("رد کردن ←", callback_data="rating_skip"),
        ]]),
    )

    if query.data == "rating_skip":
        return await _save_feedback(update, ctx, text="")

    return STEP_FEEDBACK_TEXT


async def feedback_text_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    """دریافت متن فیدبک"""
    return await _save_feedback(update, ctx, text=update.message.text)


async def _save_feedback(update: Update, ctx: ContextTypes.DEFAULT_TYPE, text: str) -> int:
    """ذخیره فیدبک در بک‌اند"""
    user = update.effective_user
    event_id = ctx.user_data.get("feedback_event_id", "")
    score = ctx.user_data.get("feedback_score", 3)

    ok = await api_client.submit_feedback(
        telegram_id=str(user.id),
        event_id=event_id,
        score=score,
        text=text,
    )

    msg = (
        "✅ *ممنون از نظرت!*\n\n"
        "بازخوردت برای بهتر شدن راوی خیلی مهمه 🙏\n"
        "منتظر همنشینی بعدیت باش! 🌟"
        if ok else
        "⚠️ مشکلی در ثبت فیدبک پیش اومد."
    )

    if update.callback_query:
        await update.callback_query.edit_message_text(msg, parse_mode="Markdown")
    else:
        await update.message.reply_text(msg, parse_mode="Markdown")

    return ConversationHandler.END
