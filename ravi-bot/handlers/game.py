"""
🎮 هندلر بازی هوشمند — سوال‌های شخصی‌سازی‌شده حین رویداد
- چرخش نقش شروع‌کننده
- سوالات متناسب با شخصیت اعضا
- سیستم راوی می‌گوید
"""

import logging
import random
from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import ContextTypes, ConversationHandler

logger = logging.getLogger(__name__)

STEP_GAME_ANSWER = 100

# ─── بانک سوال‌های شخصی‌سازی‌شده ──────────────────────────────────
QUESTIONS_BANK = {
    "light": [
        "اگه یه روز فرصت داشتی هر کاری دوست داشتی بکنی، چیکار می‌کردی؟",
        "آخرین باری که واقعاً خندیدی کِی بود و چرا؟",
        "یه مهارت که آرزو داشتی بلد بودی چیه؟",
        "بهترین وعده غذایی که تو زندگیت خوردی چی بود؟",
        "اگه یه ماه تعطیلی داشتی، کجا می‌رفتی؟",
    ],
    "deep": [
        "کدوم تجربه‌ات بیشترین تأثیر رو روی ارزش‌هات گذاشته؟",
        "تعریف موفقیت برای تو چیه؟",
        "با چه چیزی آدم می‌تونه ارتباط واقعی بسازه؟",
        "چه چیزی باعث می‌شه احساس کنی زندگیت معنا داره؟",
    ],
    "fun": [
        "اگه یه قانون دنیا رو عوض می‌کردی، کدوم بود؟",
        "بین سفر زمانی به گذشته یا آینده — کدومو انتخاب می‌کردی؟",
        "یه راز بی‌خطر که می‌تونی لو بدی؟",
        "بامزه‌ترین اتفاقی که تو بچگیت برات افتاده چیه؟",
    ],
    "connection": [
        "چه چیزی در آدم‌ها سریع جلب اعتمادت رو می‌کنه؟",
        "آیا فکر می‌کنی دوستی واقعی بین آدم‌هایی با خیلی تفاوت ممکنه؟",
        "بهترین ویژگی یه دوست خوب از نظر تو چیه؟",
    ],
}


def _get_question_for_context(round_num: int) -> tuple[str, str]:
    """انتخاب سوال متناسب با مرحله بازی"""
    if round_num <= 2:
        category = "light"
    elif round_num <= 4:
        category = "fun"
    elif round_num <= 6:
        category = "connection"
    else:
        category = "deep"

    questions = QUESTIONS_BANK[category]
    asked = set()
    q = random.choice([q for q in questions if q not in asked] or questions)
    return q, category


async def start_game_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    """شروع بازی در گروه"""
    query = update.callback_query
    await query.answer()

    members = ctx.chat_data.get("members", [])
    if not members:
        await query.edit_message_text("❌ اطلاعات اعضا یافت نشد.")
        return ConversationHandler.END

    ctx.chat_data["game_round"] = 1
    ctx.chat_data["current_player_idx"] = 0
    ctx.chat_data["asked_questions"] = []

    first_player = members[0]
    question, _ = _get_question_for_context(1)
    ctx.chat_data["current_question"] = question

    await query.edit_message_text(
        f"🎮 *بازی همنشینی شروع شد!*\n\n"
        f"👤 *{first_player['name']}* تو باید این سوالو جواب بدی:\n\n"
        f"💬 _{question}_\n\n"
        "وقتی جوابت رو نوشتی، دکمه «بعدی» رو بزن تا نوبت بقیه بشه.",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup([[
            InlineKeyboardButton("➡️ بعدی", callback_data="game_next"),
        ]]),
    )
    return STEP_GAME_ANSWER


async def answer_game_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    """دریافت پاسخ بازیکن"""
    # فقط اعلام می‌کنیم پاسخ رسید — محتوا ذخیره نمی‌شود
    await update.message.reply_text(
        "✅ ممنون! وقتی آماده‌ای «بعدی» رو بزن.",
        reply_markup=InlineKeyboardMarkup([[
            InlineKeyboardButton("➡️ بعدی", callback_data="game_next"),
        ]]),
    )
    return STEP_GAME_ANSWER


async def next_question_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    """نقل مکان به سوال بعدی و بازیکن بعدی"""
    query = update.callback_query
    await query.answer()

    members = ctx.chat_data.get("members", [])
    if not members:
        return ConversationHandler.END

    current_round = ctx.chat_data.get("game_round", 1)
    current_idx = ctx.chat_data.get("current_player_idx", 0)

    # انتقال به بازیکن بعدی
    next_idx = (current_idx + 1) % len(members)
    ctx.chat_data["current_player_idx"] = next_idx

    # اگر یک دور کامل شد، دور بعدی
    if next_idx == 0:
        current_round += 1
        ctx.chat_data["game_round"] = current_round

    # پایان بازی بعد از ۱۰ دور
    if current_round > 10:
        await query.edit_message_text(
            "🎉 *بازی تموم شد!*\n\n"
            "امیدواریم لحظات خوبی داشته باشین.\n"
            "بعد از رویداد می‌تونین از تجربه‌تون بازخورد بدین 🌟",
            parse_mode="Markdown",
        )
        return ConversationHandler.END

    next_player = members[next_idx]
    question, category = _get_question_for_context(current_round)
    ctx.chat_data["current_question"] = question

    category_emoji = {
        "light": "☀️", "deep": "🧠", "fun": "😄", "connection": "🤝"
    }.get(category, "💬")

    await query.edit_message_text(
        f"{category_emoji} *دور {current_round}*\n\n"
        f"👤 *{next_player['name']}* حالا نوبت توئه!\n\n"
        f"💬 _{question}_\n\n"
        "جوابتو بنویس، بعد «بعدی» رو بزن.",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup([[
            InlineKeyboardButton("➡️ بعدی", callback_data="game_next"),
        ]]),
    )
    return STEP_GAME_ANSWER
