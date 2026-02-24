"""
⏰ زمان‌بندی جاب‌های خودکار راوی
- نوتیفیکیشن ۲۴ ساعت قبل از رویداد
- پیام ری‌انگیجمنت کاربران ۱۴ روز غیرفعال
- انتشار پست کانال (هفته‌ای)
- حذف ربات از گروه‌های منقضی
- گزارش هفتگی CEO
"""

import logging
from datetime import datetime, timedelta, timezone
from telegram.ext import JobQueue, ContextTypes

from config.settings import settings
from services.api_client import api_client
from handlers.admin import post_event_to_channel

logger = logging.getLogger(__name__)

SITE_URL = "https://raavi.ir"


def register_jobs(job_queue: JobQueue):
    """ثبت همه جاب‌های زمان‌بندی‌شده"""

    # ─── هر ۶ ساعت: بررسی رویدادهای نزدیک ──────────────────────
    job_queue.run_repeating(
        job_notify_upcoming_events,
        interval=21600,  # 6 hours
        first=60,
        name="notify_upcoming_events",
    )

    # ─── هر روز ۱۰ صبح: ری‌انگیجمنت کاربران غیرفعال ─────────────
    job_queue.run_daily(
        job_reengage_inactive_users,
        time=datetime.now(timezone.utc).replace(hour=6, minute=30, second=0),
        name="reengage_inactive",
    )

    # ─── شنبه ۹ صبح: گزارش هفتگی به ادمین‌ها ─────────────────────
    job_queue.run_daily(
        job_weekly_report_to_admins,
        time=datetime.now(timezone.utc).replace(hour=5, minute=30, second=0),
        days=(5,),  # شنبه
        name="weekly_report",
    )

    # ─── سه‌شنبه و شنبه: انتشار رویدادها در کانال ──────────────
    job_queue.run_daily(
        job_post_events_to_channel,
        time=datetime.now(timezone.utc).replace(hour=7, minute=0, second=0),
        days=(1, 5),  # دوشنبه و جمعه (UTC)
        name="channel_posts",
    )

    # ─── هر ساعت: پاکسازی گروه‌های منقضی ────────────────────────
    job_queue.run_repeating(
        job_cleanup_expired_groups,
        interval=3600,
        first=300,
        name="cleanup_groups",
    )

    logger.info("✅ همه جاب‌ها ثبت شدند")


# ─────────────────────────────────────────────────────────────────
# جاب ۱: نوتیفیکیشن رویداد — ۲۴ ساعت قبل
# ─────────────────────────────────────────────────────────────────
async def job_notify_upcoming_events(ctx: ContextTypes.DEFAULT_TYPE):
    """
    ارسال نوتیفیکیشن به شرکت‌کنندگان رویداد
    - اگر گروه کامل: ۲۴ ساعت قبل
    - اگر گروه کامل نشده: نهایتاً ۱۲ ساعت قبل ادغام گروه‌ها و پیام
    """
    try:
        events = await api_client.get_upcoming_events()

        for event in events:
            event_time_str = event.get("startDate") or event.get("start_date")
            if not event_time_str:
                continue

            event_time = datetime.fromisoformat(event_time_str.replace("Z", "+00:00"))
            now = datetime.now(timezone.utc)
            hours_left = (event_time - now).total_seconds() / 3600

            participants = event.get("participants", [])

            # پیام ۲۴ ساعت قبل برای گروه کامل
            if 23 <= hours_left <= 25 and event.get("isFull"):
                await _send_24h_notification(ctx, event, participants)

            # پیام ۱۲ ساعت قبل برای گروه‌های ادغام‌شده
            elif 11 <= hours_left <= 13 and not event.get("isFull"):
                await _send_merged_group_notification(ctx, event, participants)

    except Exception as e:
        logger.error(f"job_notify_upcoming_events error: {e}")


async def _send_24h_notification(ctx, event: dict, participants: list):
    """پیام ۲۴ ساعت قبل از رویداد"""
    event_id = event.get("id")

    for p in participants:
        telegram_id = p.get("telegramId")
        if not telegram_id:
            continue
        try:
            await ctx.bot.send_message(
                chat_id=int(telegram_id),
                text=(
                    f"⏰ *یادآوری همنشینی*\n\n"
                    f"فردا وقت *{event.get('title', 'همنشینی')}* هست!\n\n"
                    f"📍 مکان و هم‌صحبت‌هات رو از سایت ببین:\n"
                    f"{SITE_URL}/dashboard\n\n"
                    "لطفاً حضورت رو قطعی کن 👇"
                ),
                parse_mode="Markdown",
                reply_markup=__confirm_keyboard(event_id),
            )
        except Exception as e:
            logger.warning(f"Notify user {telegram_id} failed: {e}")


async def _send_merged_group_notification(ctx, event: dict, participants: list):
    """پیام بعد از ادغام گروه‌ها — ۱۲ ساعت قبل"""
    event_id = event.get("id")

    for p in participants:
        telegram_id = p.get("telegramId")
        if not telegram_id:
            continue
        try:
            await ctx.bot.send_message(
                chat_id=int(telegram_id),
                text=(
                    f"🌟 *زمان همنشینی رسید!*\n\n"
                    f"مکان *{event.get('title', '')}* مشخص شد.\n"
                    "الان می‌تونی توی سایت آدرس و هم‌صحبت‌هات رو ببینی.\n\n"
                    "لطفاً همین الان حضورت رو قطعی کن 👇"
                ),
                parse_mode="Markdown",
                reply_markup=__confirm_keyboard(event_id),
            )
        except Exception as e:
            logger.warning(f"Merged notify user {telegram_id} failed: {e}")


def __confirm_keyboard(event_id: str):
    from telegram import InlineKeyboardMarkup, InlineKeyboardButton
    return InlineKeyboardMarkup([[
        InlineKeyboardButton("✅ تأیید حضور", callback_data=f"confirm_{event_id}"),
        InlineKeyboardButton("🌐 مشاهده جزئیات", url=f"{SITE_URL}/dashboard"),
    ]])


# ─────────────────────────────────────────────────────────────────
# جاب ۲: ری‌انگیجمنت کاربران ۱۴ روز غیرفعال
# ─────────────────────────────────────────────────────────────────
async def job_reengage_inactive_users(ctx: ContextTypes.DEFAULT_TYPE):
    """ارسال پیشنهاد ویژه به کاربران ۱۴ روز غیرفعال"""
    try:
        inactive = await api_client.get_inactive_users(days=settings.INACTIVITY_DAYS)
        logger.info(f"Found {len(inactive)} inactive users")

        for user in inactive:
            telegram_id = user.get("telegramId")
            if not telegram_id:
                continue
            try:
                await ctx.bot.send_message(
                    chat_id=int(telegram_id),
                    text=(
                        "🎁 *یه پیشنهاد ویژه برای تو داریم!*\n\n"
                        "یه مدتیه که ندیدیمت 😊\n"
                        "رویدادهای جدیدی برگزار می‌شه که فکر کنم برات جالب باشه.\n\n"
                        "بیا یه نگاهی بنداز — اولین رزرو بعدیت تخفیف خاصی داره! 🌟"
                    ),
                    parse_mode="Markdown",
                    reply_markup=__events_keyboard(),
                )
            except Exception as e:
                logger.warning(f"Reengage user {telegram_id} failed: {e}")

    except Exception as e:
        logger.error(f"job_reengage_inactive_users error: {e}")


def __events_keyboard():
    from telegram import InlineKeyboardMarkup, InlineKeyboardButton
    return InlineKeyboardMarkup([[
        InlineKeyboardButton("🌐 مشاهده رویدادها", url=f"{SITE_URL}/events"),
    ]])


# ─────────────────────────────────────────────────────────────────
# جاب ۳: انتشار پست کانال
# ─────────────────────────────────────────────────────────────────
async def job_post_events_to_channel(ctx: ContextTypes.DEFAULT_TYPE):
    """انتشار رویدادهای هفتگی در کانال اطلاع‌رسانی"""
    try:
        events = await api_client.get_upcoming_events()
        if not events:
            return

        # هم رویدادهای باز هم رویدادهای تکمیل‌ظرفیت
        for event in events[:8]:
            await post_event_to_channel(ctx.bot, event)

        logger.info(f"Posted {len(events[:8])} events to channel")
    except Exception as e:
        logger.error(f"job_post_events_to_channel error: {e}")


# ─────────────────────────────────────────────────────────────────
# جاب ۴: گزارش هفتگی به ادمین‌ها
# ─────────────────────────────────────────────────────────────────
async def job_weekly_report_to_admins(ctx: ContextTypes.DEFAULT_TYPE):
    """ارسال گزارش هفتگی به ادمین‌ها"""
    try:
        report = await api_client.get_weekly_report()
        if not report:
            return

        text = (
            "📊 *گزارش هفتگی راوی*\n"
            f"📅 هفته منتهی به {datetime.now().strftime('%Y/%m/%d')}\n\n"
            f"👥 ثبت‌نام جدید: *{report.get('newUsers', 0)}*\n"
            f"📋 رزرو جدید: *{report.get('newBookings', 0)}*\n"
            f"❌ ریزش: *{report.get('cancellations', 0)}*\n"
            f"⭐ رضایت میانگین: *{report.get('avgSatisfaction', 0):.1f}/5*\n"
            f"🔄 نرخ بازگشت: *{report.get('returnRate', 0):.0f}%*\n\n"
            f"🏆 محبوب‌ترین: *{report.get('topEvent', '—')}*\n"
            f"📍 شهر فعال: *{report.get('topCity', '—')}*\n"
            f"💰 درآمد: *{report.get('weeklyRevenue', 0):,} تومان*"
        )

        for admin_id in settings.ADMIN_IDS:
            try:
                await ctx.bot.send_message(
                    chat_id=admin_id,
                    text=text,
                    parse_mode="Markdown",
                )
            except Exception:
                pass

    except Exception as e:
        logger.error(f"job_weekly_report error: {e}")


# ─────────────────────────────────────────────────────────────────
# جاب ۵: پاکسازی گروه‌های منقضی
# ─────────────────────────────────────────────────────────────────
# لیست گروه‌های فعال: {chat_id: event_end_time}
_active_groups: dict = {}


def register_active_group(chat_id: int, event_end_time: datetime):
    """ثبت گروه جدید برای پاکسازی خودکار"""
    _active_groups[chat_id] = event_end_time


async def job_cleanup_expired_groups(ctx: ContextTypes.DEFAULT_TYPE):
    """حذف ربات از گروه‌هایی که زمانشان تمام شده"""
    now = datetime.now(timezone.utc)
    to_remove = []

    for chat_id, end_time in _active_groups.items():
        lifetime = timedelta(hours=settings.GROUP_BOT_LIFETIME_HOURS)
        if now > end_time + lifetime:
            try:
                from handlers.group import remove_bot_from_group
                await remove_bot_from_group(ctx.bot, chat_id)
                to_remove.append(chat_id)
            except Exception as e:
                logger.error(f"Cleanup group {chat_id} failed: {e}")

    for cid in to_remove:
        _active_groups.pop(cid, None)

    if to_remove:
        logger.info(f"Cleaned up {len(to_remove)} expired groups")
