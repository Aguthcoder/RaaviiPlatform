"""
🏪 هندلر کافه ادمین — حضور و غیاب از طریق ربات تلگرام

جریان کار:
1. کافه ادمین /cafe_login می‌زند
2. username و password سایت را وارد می‌کند (یک بار)
3. اکانت کافه به تلگرامش لینک می‌شود
4. هر بار /cafe می‌زند، رویدادهای امروز را می‌بیند
5. روی رویداد کلیک → لیست افراد با دکمه ✅/❌
6. در پایان دکمه «ثبت نهایی» را می‌زند
"""

import logging
from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import (
    ContextTypes, ConversationHandler,
    CommandHandler, MessageHandler, CallbackQueryHandler, filters,
)
from services.api_client import api_client

logger = logging.getLogger(__name__)

# ─── مراحل مکالمه لاگین ──────────────────────────────────────────
CAFE_STEP_USERNAME, CAFE_STEP_PASSWORD = range(300, 302)


# ══════════════════════════════════════════════════════════════════
# لاگین کافه ادمین
# ══════════════════════════════════════════════════════════════════

async def cafe_login_start(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    """/cafe_login — شروع لاگین"""
    telegram_id = str(update.effective_user.id)

    # بررسی اینکه آیا قبلاً لینک شده
    info = await api_client.cafe_me(telegram_id)
    if info.get("linked"):
        await update.message.reply_text(
            f"✅ شما قبلاً با کافه *{info['cafeName']}* لینک شدید.\n\n"
            "برای مدیریت حضور و غیاب دستور /cafe را بزنید.",
            parse_mode="Markdown",
        )
        return ConversationHandler.END

    await update.message.reply_text(
        "🏪 *پنل کافه ادمین راوی*\n\n"
        "لطفاً نام کاربری حساب کافه‌ات در سایت راوی را بنویس:",
        parse_mode="Markdown",
    )
    return CAFE_STEP_USERNAME


async def cafe_receive_username(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    ctx.user_data["cafe_username"] = update.message.text.strip()
    await update.message.reply_text("🔒 رمز عبور:")
    return CAFE_STEP_PASSWORD


async def cafe_receive_password(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    username = ctx.user_data.get("cafe_username", "")
    password = update.message.text.strip()
    telegram_id = str(update.effective_user.id)

    # حذف پیام رمز (امنیت)
    try:
        await update.message.delete()
    except Exception:
        pass

    result = await api_client.cafe_login(telegram_id, username, password)

    if result.get("success"):
        await update.message.reply_text(
            f"✅ *لاگین موفق!*\n\n"
            f"🏪 کافه: *{result['cafeName']}*\n\n"
            "از این به بعد دستور /cafe را بزن تا رویدادهای امروز را ببینی.",
            parse_mode="Markdown",
        )
    else:
        await update.message.reply_text(
            "❌ نام کاربری یا رمز اشتباه است.\n"
            "دوباره /cafe_login بزن و تلاش کن.",
        )

    ctx.user_data.pop("cafe_username", None)
    return ConversationHandler.END


# ══════════════════════════════════════════════════════════════════
# پنل اصلی کافه ادمین
# ══════════════════════════════════════════════════════════════════

async def cafe_panel_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    """/cafe — نمایش رویدادهای امروز"""
    telegram_id = str(update.effective_user.id)

    # بررسی لینک بودن
    info = await api_client.cafe_me(telegram_id)
    if not info.get("linked"):
        await update.message.reply_text(
            "⚠️ هنوز لاگین نکردی.\n"
            "با /cafe_login حساب کافه‌ات را لینک کن."
        )
        return

    # دریافت رویدادهای امروز
    data = await api_client.cafe_today_events(telegram_id)
    events = data.get("events", [])
    cafe_name = data.get("cafeName", "کافه")

    if not events:
        await update.message.reply_text(
            f"🏪 *{cafe_name}*\n\n"
            "📅 امروز هیچ رویداد فعالی در شهر شما برگزار نمی‌شود.",
            parse_mode="Markdown",
        )
        return

    buttons = []
    for ev in events:
        title = ev.get("title", "رویداد")[:35]
        start = ev.get("start_date", "")
        time_str = start[11:16] if len(start) > 16 else ""
        buttons.append([InlineKeyboardButton(
            f"📋 {title} — {time_str}",
            callback_data=f"cafe_event_{ev['id']}",
        )])

    await update.message.reply_text(
        f"🏪 *{cafe_name}*\n"
        f"📅 رویدادهای امروز ({len(events)} رویداد):\n\n"
        "یک رویداد را انتخاب کن:",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup(buttons),
    )


async def cafe_select_event_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    """انتخاب رویداد → نمایش لیست حاضران"""
    query = update.callback_query
    await query.answer()

    event_id = query.data.replace("cafe_event_", "")
    telegram_id = str(query.from_user.id)

    ctx.user_data["cafe_event_id"] = event_id

    data = await api_client.cafe_attendance_list(telegram_id, event_id)

    if "error" in data:
        await query.edit_message_text(f"❌ {data['error']}")
        return

    event = data.get("event", {})
    attendees = data.get("attendees", [])
    cafe_name = data.get("cafe", {}).get("name", "")

    if not attendees:
        await query.edit_message_text(
            f"🏪 {cafe_name}\n"
            f"📋 *{event.get('title', '')}*\n\n"
            "هنوز هیچ رزروی ثبت نشده.",
            parse_mode="Markdown",
        )
        return

    # ذخیره لیست در user_data برای toggle
    ctx.user_data["cafe_attendees"] = {
        a["userId"]: {"name": a["name"], "attended": a.get("attended", False)}
        for a in attendees
    }

    await _show_attendance_list(query, ctx, event, cafe_name)


async def cafe_toggle_attendance_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    """toggle حضور یک نفر با دکمه inline"""
    query = update.callback_query
    await query.answer()

    # فرمت: cafe_toggle_{userId}
    user_id = query.data.replace("cafe_toggle_", "")
    telegram_id = str(query.from_user.id)
    event_id = ctx.user_data.get("cafe_event_id", "")
    attendees = ctx.user_data.get("cafe_attendees", {})

    if user_id not in attendees:
        return

    # toggle وضعیت
    new_status = not attendees[user_id]["attended"]
    attendees[user_id]["attended"] = new_status

    # ارسال به بک‌اند
    await api_client.cafe_toggle_attendance(telegram_id, event_id, user_id, new_status)

    # به‌روزرسانی نمایش
    event_id_stored = ctx.user_data.get("cafe_event_id", "")
    data = await api_client.cafe_attendance_list(telegram_id, event_id_stored)
    event = data.get("event", {})
    cafe_name = data.get("cafe", {}).get("name", "")

    # sync وضعیت‌ها از بک‌اند
    for a in data.get("attendees", []):
        if a["userId"] in attendees:
            attendees[a["userId"]]["attended"] = a.get("attended", False)

    await _show_attendance_list(query, ctx, event, cafe_name)


async def cafe_finalize_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    """ثبت نهایی حضور و غیاب"""
    query = update.callback_query
    await query.answer()

    telegram_id = str(query.from_user.id)
    event_id = ctx.user_data.get("cafe_event_id", "")
    attendees = ctx.user_data.get("cafe_attendees", {})

    attendances = [
        {"userId": uid, "attended": info["attended"]}
        for uid, info in attendees.items()
    ]

    result = await api_client.cafe_finalize_attendance(telegram_id, event_id, attendances)

    present = sum(1 for a in attendances if a["attended"])
    absent  = len(attendances) - present

    if result.get("success"):
        await query.edit_message_text(
            f"✅ *حضور و غیاب ثبت شد!*\n\n"
            f"🏪 کافه: {result.get('cafeName', '')}\n"
            f"✅ حاضر: *{present}* نفر\n"
            f"❌ غایب: *{absent}* نفر\n\n"
            "اطلاعات در سیستم راوی ذخیره شد.",
            parse_mode="Markdown",
        )
    else:
        await query.edit_message_text("❌ خطا در ثبت. دوباره /cafe را بزن.")

    ctx.user_data.pop("cafe_event_id", None)
    ctx.user_data.pop("cafe_attendees", None)


# ── helper: نمایش لیست با دکمه‌های toggle ──────────────────────
async def _show_attendance_list(query, ctx, event: dict, cafe_name: str):
    attendees = ctx.user_data.get("cafe_attendees", {})

    present = sum(1 for a in attendees.values() if a["attended"])
    total   = len(attendees)

    text = (
        f"🏪 *{cafe_name}*\n"
        f"📋 *{event.get('title', '')}*\n"
        f"✅ حاضر: {present}/{total}\n\n"
        "برای تغییر وضعیت روی اسم بزن:"
    )

    buttons = []
    for uid, info in attendees.items():
        icon = "✅" if info["attended"] else "❌"
        buttons.append([InlineKeyboardButton(
            f"{icon} {info['name']}",
            callback_data=f"cafe_toggle_{uid}",
        )])

    buttons.append([InlineKeyboardButton(
        f"💾 ثبت نهایی ({present}/{total} حاضر)",
        callback_data="cafe_finalize",
    )])

    try:
        await query.edit_message_text(
            text,
            parse_mode="Markdown",
            reply_markup=InlineKeyboardMarkup(buttons),
        )
    except Exception:
        pass


# ══════════════════════════════════════════════════════════════════
# ConversationHandler لاگین
# ══════════════════════════════════════════════════════════════════

def get_cafe_login_conversation():
    return ConversationHandler(
        entry_points=[CommandHandler("cafe_login", cafe_login_start)],
        states={
            CAFE_STEP_USERNAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, cafe_receive_username)],
            CAFE_STEP_PASSWORD: [MessageHandler(filters.TEXT & ~filters.COMMAND, cafe_receive_password)],
        },
        fallbacks=[CommandHandler("cafe_login", cafe_login_start)],
        allow_reentry=True,
    )
