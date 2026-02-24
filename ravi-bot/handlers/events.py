"""
📅 هندلر رویدادها — مدیریت رزروها از تلگرام
"""

import logging
from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import ContextTypes

from services.api_client import api_client

logger = logging.getLogger(__name__)

SITE_URL = "https://raavi.ir"


async def my_events_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    """دستور /myevents — نمایش رویدادهای کاربر"""
    user = update.effective_user
    events = await api_client.get_user_events(str(user.id))

    if not events:
        await update.message.reply_text(
            "📅 هنوز رویدادی رزرو نکردی!\n\n"
            "از سایت راوی یه همنشینی رزرو کن:",
            reply_markup=InlineKeyboardMarkup([[
                InlineKeyboardButton("🌐 رزرو همنشینی", url=f"{SITE_URL}/events"),
            ]]),
        )
        return

    text = "📋 *رویدادهای تو:*\n\n"
    buttons = []

    for ev in events[:5]:  # حداکثر ۵ رویداد
        status_emoji = {"confirmed": "✅", "pending": "⏳", "cancelled": "❌"}.get(
            ev.get("status", ""), "📍"
        )
        text += (
            f"{status_emoji} *{ev.get('title', 'رویداد')}*\n"
            f"📅 {ev.get('date', '')} — {ev.get('time', '')}\n\n"
        )
        if ev.get("status") == "confirmed":
            buttons.append([
                InlineKeyboardButton(
                    f"❌ لغو رزرو: {ev.get('title', '')[:15]}...",
                    callback_data=f"cancel_booking_{ev['id']}",
                ),
            ])

    await update.message.reply_text(
        text,
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup(buttons) if buttons else None,
    )


async def confirm_attendance_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    """تأیید حضور قطعی در رویداد"""
    query = update.callback_query
    await query.answer()

    event_id = query.data.replace("confirm_", "")
    user = update.effective_user

    ok = await api_client.confirm_attendance(str(user.id), event_id)

    if ok:
        await query.edit_message_text(
            "✅ *حضورت تأیید شد!*\n\n"
            "جزئیات مکان و گروه همنشینی به زودی برات ارسال می‌شه.",
            parse_mode="Markdown",
        )
    else:
        await query.edit_message_text("⚠️ مشکلی پیش اومد. دوباره تلاش کن.")


async def cancel_booking_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    """لغو رزرو"""
    query = update.callback_query
    await query.answer()

    event_id = query.data.replace("cancel_booking_", "")
    user = update.effective_user

    ok = await api_client.cancel_booking(str(user.id), event_id)

    if ok:
        await query.edit_message_text(
            "❌ رزروت لغو شد.\n\n"
            "امیدواریم دفعه بعد بتونی شرکت کنی! 🌟",
        )
    else:
        await query.edit_message_text("⚠️ لغو انجام نشد. با پشتیبانی تماس بگیر.")
