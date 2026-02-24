"""
🤖 هندلر پشتیبانی هوشمند
- پاسخ به سوالات متداول با AI
- ارجاع سوالات پیچیده به پشتیبانی انسانی
"""

import logging
from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import ContextTypes

from services.api_client import api_client
from services.ai_service import ai_service
from config.settings import settings

logger = logging.getLogger(__name__)

SUPPORT_TELEGRAM_LINK = "https://t.me/RaviSupport"
SUPPORT_WEBSITE_LINK  = "https://raavi.ir/support"

# سوالاتی که AI پاسخ می‌دهد
FAQ_SCOPE = [
    "رزرو", "قیمت", "لغو", "گروه", "قوانین", "همنشینی",
    "ثبت‌نام", "پرداخت", "زمان", "مکان", "کجا", "چطور",
    "بازگشت", "استرداد", "تخفیف", "هزینه",
]


async def support_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    """دستور /support"""
    await update.message.reply_text(
        "💬 *پشتیبانی راوی*\n\n"
        "سوالت رو بنویس، سعی می‌کنم جواب بدم.\n"
        "اگه جوابم کافی نبود، به پشتیبانی انسانی وصلت می‌کنم.",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup([[
            InlineKeyboardButton("💬 پشتیبانی تلگرام", url=SUPPORT_TELEGRAM_LINK),
            InlineKeyboardButton("🌐 سایت", url=SUPPORT_WEBSITE_LINK),
        ]]),
    )


async def support_message_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    """پردازش هر پیام در پیوی — تشخیص سوال پشتیبانی"""
    msg = update.message.text
    user = update.effective_user

    # بررسی اینکه آیا سوال در محدوده AI است
    is_in_scope = any(keyword in msg for keyword in FAQ_SCOPE)

    if is_in_scope:
        await ctx.bot.send_chat_action(update.effective_chat.id, "typing")

        # ابتدا از AI مستقیم جواب بگیر
        answer = await ai_service.answer_support(msg)

        if not answer:
            # fallback به بک‌اند
            answer = await api_client.ask_support(
                question=msg,
                telegram_id=str(user.id),
            )

        if answer:
            await update.message.reply_text(
                f"🤖 {answer}\n\n"
                "---\n"
                "_اگه جوابم کافی نبود، با پشتیبانی انسانی تماس بگیر:_",
                parse_mode="Markdown",
                reply_markup=InlineKeyboardMarkup([[
                    InlineKeyboardButton("💬 پشتیبانی", url=SUPPORT_TELEGRAM_LINK),
                ]]),
            )
            return

    # سوال خارج از محدوده یا AI جواب نداشت
    await update.message.reply_text(
        "این سوال نیاز به بررسی دارد.\n"
        "تیم پشتیبانی راوی بهت کمک می‌کنه:",
        reply_markup=InlineKeyboardMarkup([[
            InlineKeyboardButton("💬 پشتیبانی تلگرام", url=SUPPORT_TELEGRAM_LINK),
            InlineKeyboardButton("🌐 ثبت تیکت", url=SUPPORT_WEBSITE_LINK),
        ]]),
    )