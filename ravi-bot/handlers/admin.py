"""
👑 هندلرهای ادمین
- ارسال نوتیفیکیشن رویداد
- گزارش هفتگی
- انتشار پست در کانال
"""

import logging
from datetime import datetime
from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import ContextTypes

from config.settings import settings
from services.api_client import api_client

logger = logging.getLogger(__name__)

SITE_URL = "https://raavi.ir"


def _is_admin(user_id: int) -> bool:
    return user_id in settings.ADMIN_IDS


async def send_event_notification_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    """ارسال نوتیفیکیشن رویداد به کاربران"""
    query = update.callback_query
    if not _is_admin(query.from_user.id):
        await query.answer("دسترسی ندارید.", show_alert=True)
        return
    await query.answer()

    event_id = query.data.replace("notify_event_", "")
    # پیاده‌سازی از طریق job scheduler
    await query.edit_message_text(f"✅ نوتیفیکیشن رویداد {event_id} در صف ارسال قرار گرفت.")


async def broadcast_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    """ارسال پیام به همه کاربران"""
    query = update.callback_query
    if not _is_admin(query.from_user.id):
        await query.answer("دسترسی ندارید.", show_alert=True)
        return
    await query.answer()
    await query.edit_message_text("متن پیام عمومی را بنویسید:")


async def weekly_report_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    """گزارش هفتگی — فقط ادمین‌ها"""
    if not _is_admin(update.effective_user.id):
        await update.message.reply_text("❌ دسترسی ندارید.")
        return

    report = await api_client.get_weekly_report()

    if not report:
        await update.message.reply_text("⚠️ گزارش در دسترس نیست.")
        return

    text = (
        "📊 *گزارش هفتگی راوی*\n"
        f"📅 {datetime.now().strftime('%Y/%m/%d')}\n\n"
        f"👥 ثبت‌نام جدید: *{report.get('newUsers', 0)}* نفر\n"
        f"📋 رزرو جدید: *{report.get('newBookings', 0)}* عدد\n"
        f"❌ ریزش: *{report.get('cancellations', 0)}* عدد\n"
        f"⭐ رضایت میانگین: *{report.get('avgSatisfaction', 0):.1f}/5*\n"
        f"🔄 نرخ بازگشت: *{report.get('returnRate', 0):.0f}%*\n\n"
        f"🏆 محبوب‌ترین برنامه: *{report.get('topEvent', '—')}*\n"
        f"📍 شهر فعال: *{report.get('topCity', '—')}*\n\n"
        f"💰 درآمد هفته: *{report.get('weeklyRevenue', 0):,} تومان*"
    )

    await update.message.reply_text(text, parse_mode="Markdown")


async def post_event_to_channel(bot, event: dict):
    """
    انتشار پست رویداد در کانال اطلاع‌رسانی
    هم رویدادهای در حال تکمیل هم رویدادهای تکمیل‌ظرفیت
    """
    capacity = event.get("capacity", 0)
    reserved = event.get("reservedCount", 0)
    is_full = reserved >= capacity

    status_line = (
        "🔴 *تکمیل ظرفیت* — زودتر برای دورهمی بعدی ثبت‌نام کن!"
        if is_full else
        f"🟢 *{capacity - reserved} جای خالی* باقی مانده!"
    )

    price = event.get("price", 0)
    text = (
        f"🌟 *{event.get('title', 'همنشینی راوی')}*\n\n"
        f"📅 {event.get('date', '')} — ساعت {event.get('time', '')}\n"
        f"📍 {event.get('city', 'تهران')}\n"
        f"💰 {price:,} تومان\n\n"
        f"{status_line}\n\n"
        "👇 برای رزرو روی دکمه بزن"
    )

    buttons = []
    if not is_full:
        buttons.append(InlineKeyboardButton(
            "📋 رزرو همنشینی",
            url=f"{SITE_URL}/events/{event.get('id', '')}",
        ))
    buttons.append(InlineKeyboardButton(
        "🌐 همه رویدادها",
        url=f"{SITE_URL}/events",
    ))

    try:
        await bot.send_message(
            chat_id=settings.CHANNEL_ID,
            text=text,
            parse_mode="Markdown",
            reply_markup=InlineKeyboardMarkup([buttons]),
        )
        logger.info(f"Event {event.get('id')} posted to channel")
    except Exception as e:
        logger.error(f"post_event_to_channel error: {e}")
