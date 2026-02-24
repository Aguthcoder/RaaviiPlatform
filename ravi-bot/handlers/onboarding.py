"""
👋 هندلر آنبوردینگ + لینک حساب سایت
"""

import logging
from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import ContextTypes, ConversationHandler

from services.api_client import api_client
from keyboards.onboarding_kb import (
    cities_keyboard,
    gender_keyboard,
    personality_keyboard,
    interests_keyboard,
)

logger = logging.getLogger(__name__)

SITE_URL = "https://raaviiplatform.com"

# ─── مراحل مکالمه ────────────────────────────────────────────────
STEP_NAME, STEP_CITY, STEP_NEIGHBORHOOD, STEP_GENDER, STEP_AGE, \
STEP_PERSONALITY, STEP_INTERESTS = range(7)

INTERESTS_LIST = [
    "کتاب", "موسیقی", "سینما", "کوهنوردی", "ورزش",
    "بازی", "هنر", "فلسفه", "تکنولوژی", "سفر",
    "آشپزی", "نقاشی", "تئاتر", "عکاسی", "رقص",
]


async def start_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    """
    شروع ربات — دو حالت دارد:
      /start           → آنبوردینگ معمولی
      /start <token>   → لینک کردن حساب سایت به تلگرام
    """
    user = update.effective_user
    args = ctx.args  # لیست پارامترهای بعد از /start

    # ── حالت Deep Link: /start <token> ───────────────────────────
    if args and args[0]:
        token = args[0].strip()
        await _handle_deep_link(update, ctx, token)
        return ConversationHandler.END

    # ── حالت معمولی: آنبوردینگ ────────────────────────────────────
    ctx.user_data.clear()
    ctx.user_data["telegram_id"] = str(user.id)

    await update.message.reply_text(
        f"سلام {user.first_name} عزیز! 👋\n\n"
        "خوش اومدی به *راوی* — فضایی برای همنشینی آگاهانه 🌟\n\n"
        "قراره چند سوال کوتاه ازت بپرسم تا بهترین همنشینی‌ها رو برات پیدا کنیم.\n\n"
        "اسمی که دوست داری دوستات صدات کنن چیه؟",
        parse_mode="Markdown",
    )
    return STEP_NAME


async def _handle_deep_link(update: Update, ctx: ContextTypes.DEFAULT_TYPE, token: str):
    """
    توکن deep link رو تأیید کن، حساب سایت رو به تلگرام وصل کن،
    و رویدادهای شخصی‌سازی‌شده نشون بده.
    """
    user = update.effective_user
    telegram_id = str(user.id)
    telegram_username = user.username or ""

    # نشون دادن loading
    loading_msg = await update.message.reply_text("⏳ در حال اتصال به حساب کاربری‌ات...")

    # تأیید توکن و لینک کردن
    result = await api_client.verify_link_token(
        token=token,
        telegram_id=telegram_id,
        telegram_username=telegram_username,
    )

    if not result.get("success"):
        await loading_msg.edit_text(
            f"❌ {result.get('message', 'لینک نامعتبر یا منقضی شده.')}\n\n"
            "لطفاً از داشبورد سایت دوباره لینک بگیر:",
            reply_markup=InlineKeyboardMarkup([[
                InlineKeyboardButton("🌐 داشبورد سایت", url=f"{SITE_URL}/dashboard"),
            ]]),
        )
        return

    user_info = result.get("user", {})
    name = user_info.get("name", user.first_name)
    city = user_info.get("city", "")
    neighborhood = user_info.get("neighborhood", "")
    already_linked = user_info.get("alreadyLinked", False)

    # پیام خوش‌آمد متفاوت برای linked جدید vs قبلاً linked
    if already_linked:
        welcome_text = (
            f"✅ *حساب {name} قبلاً به این ربات وصل شده!*\n\n"
            f"📍 شهر: {city}" + (f" — {neighborhood}" if neighborhood else "") + "\n\n"
            "می‌تونی رویدادهای مناسبت رو ببینی 👇"
        )
    else:
        welcome_text = (
            f"🎉 *{name} عزیز، حسابت با موفقیت وصل شد!*\n\n"
            f"📍 شهر: {city}" + (f" — {neighborhood}" if neighborhood else "") + "\n\n"
            "الان رویدادهای مناسب برات پیدا می‌کنم... 🔍"
        )

    await loading_msg.edit_text(welcome_text, parse_mode="Markdown")

    # نمایش رویدادهای هوشمند
    await _show_smart_events(update, ctx, telegram_id, name, city)


async def _show_smart_events(
    update: Update,
    ctx: ContextTypes.DEFAULT_TYPE,
    telegram_id: str,
    name: str,
    city: str,
):
    """رویدادهای شخصی‌سازی‌شده بر اساس پروفایل کاربر."""
    data = await api_client.get_smart_events(telegram_id)
    events = data.get("events", [])

    if not events:
        await update.message.reply_text(
            f"📭 {name} عزیز، فعلاً رویداد فعالی در {city or 'شهرت'} نیست.\n\n"
            "به محض اضافه شدن رویداد جدید بهت اطلاع می‌دیم! 🔔\n\n"
            "همه رویدادها رو از سایت ببین:",
            reply_markup=InlineKeyboardMarkup([[
                InlineKeyboardButton("🌐 رویدادها در سایت", url=f"{SITE_URL}/events"),
            ]]),
        )
        return

    # ساخت متن پیام
    city_label = city or "شهر شما"
    text = f"🎯 *بهترین همنشینی‌ها برای {name} در {city_label}:*\n\n"

    buttons = []
    for ev in events[:5]:
        title = ev.get("title", "رویداد")
        ev_city = ev.get("city", "")
        location = ev.get("location", "")
        price = ev.get("price", 0)
        spots = ev.get("spotsLeft", 0)
        match_score = ev.get("matchScore", 0)
        event_id = ev.get("id", "")

        # فرمت تاریخ
        date_str = ev.get("start_date", "")
        try:
            from datetime import datetime
            dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
            date_formatted = dt.strftime("%-d %B").replace(
                "January", "فروردین"
            )  # تاریخ تقریبی — در production از jdatetime استفاده کن
        except Exception:
            date_formatted = date_str[:10] if date_str else "—"

        # نشانگر تطابق
        match_bar = "🟢" if match_score >= 80 else "🟡" if match_score >= 60 else "🔵"
        price_str = "رایگان" if price == 0 else f"{price:,} تومان"
        spots_str = f"({spots} جای خالی)" if spots > 0 else "(تکمیل)"

        text += (
            f"{match_bar} *{title}*\n"
            f"📍 {ev_city}{(' — ' + location) if location else ''}\n"
            f"💰 {price_str}  •  👥 {spots_str}\n"
            f"🎯 تطابق: {match_score}%\n\n"
        )

        if spots > 0:
            buttons.append([
                InlineKeyboardButton(
                    f"🎫 رزرو: {title[:20]}...",
                    url=f"{SITE_URL}/events/{event_id}",
                )
            ])

    # دکمه‌های اضافی
    buttons.append([
        InlineKeyboardButton("📋 همه رویدادها", url=f"{SITE_URL}/events"),
        InlineKeyboardButton("👤 پروفایل من", url=f"{SITE_URL}/dashboard"),
    ])
    buttons.append([
        InlineKeyboardButton("🔄 به‌روزرسانی", callback_data="refresh_smart_events"),
    ])

    await update.message.reply_text(
        text,
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup(buttons),
    )


async def refresh_smart_events_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    """هندلر دکمه 'به‌روزرسانی' رویدادهای هوشمند."""
    query = update.callback_query
    await query.answer("در حال به‌روزرسانی...")
    user = update.effective_user
    telegram_id = str(user.id)

    data = await api_client.get_smart_events(telegram_id)
    name = data.get("userName", user.first_name)
    city = data.get("userCity", "")
    events = data.get("events", [])

    if not events:
        await query.edit_message_text(
            "📭 فعلاً رویداد جدیدی وجود نداره. بعداً دوباره چک کن!",
            reply_markup=InlineKeyboardMarkup([[
                InlineKeyboardButton("🌐 سایت راوی", url=f"{SITE_URL}/events"),
            ]]),
        )
        return

    city_label = city or "شهر شما"
    text = f"🎯 *بهترین همنشینی‌ها برای {name} در {city_label}:*\n\n"
    buttons = []

    for ev in events[:5]:
        title = ev.get("title", "رویداد")
        ev_city = ev.get("city", "")
        price = ev.get("price", 0)
        spots = ev.get("spotsLeft", 0)
        match_score = ev.get("matchScore", 0)
        event_id = ev.get("id", "")

        match_bar = "🟢" if match_score >= 80 else "🟡" if match_score >= 60 else "🔵"
        price_str = "رایگان" if price == 0 else f"{price:,} تومان"
        spots_str = f"({spots} جای خالی)" if spots > 0 else "(تکمیل)"

        text += (
            f"{match_bar} *{title}*\n"
            f"📍 {ev_city}  •  💰 {price_str}  •  👥 {spots_str}\n"
            f"🎯 تطابق: {match_score}%\n\n"
        )
        if spots > 0:
            buttons.append([
                InlineKeyboardButton(f"🎫 {title[:22]}...", url=f"{SITE_URL}/events/{event_id}")
            ])

    buttons.append([
        InlineKeyboardButton("📋 همه رویدادها", url=f"{SITE_URL}/events"),
        InlineKeyboardButton("🔄 رفرش", callback_data="refresh_smart_events"),
    ])

    await query.edit_message_text(
        text,
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup(buttons),
    )


# ─── مراحل آنبوردینگ (بدون تغییر) ──────────────────────────────

async def receive_name(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    name = update.message.text.strip()
    if len(name) < 2 or len(name) > 30:
        await update.message.reply_text("اسم باید بین ۲ تا ۳۰ حرف باشه. دوباره بنویس:")
        return STEP_NAME
    ctx.user_data["name"] = name
    await update.message.reply_text(
        f"عالیه {name}! 😊\n\nتو کدوم شهر هستی؟",
        reply_markup=cities_keyboard(),
    )
    return STEP_CITY


async def receive_city(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    query = update.callback_query
    await query.answer()
    city = query.data.replace("city_", "")
    ctx.user_data["city"] = city
    await query.edit_message_text(
        f"📍 شهر انتخاب شد: *{city}*\n\n"
        "محله‌ات رو بنویس (مثلاً: ونک، سعادت‌آباد، نارمک...)\n"
        "این اطلاعات فقط برای اولویت‌بندی رویدادهای نزدیکت استفاده می‌شه:",
        parse_mode="Markdown",
    )
    return STEP_NEIGHBORHOOD


async def receive_neighborhood(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    neighborhood = update.message.text.strip()
    ctx.user_data["neighborhood"] = neighborhood
    await update.message.reply_text("جنسیت:", reply_markup=gender_keyboard())
    return STEP_GENDER


async def receive_gender(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    query = update.callback_query
    await query.answer()
    gender_map = {
        "gender_male": "male", "gender_female": "female",
        "gender_other": "non-binary", "gender_no_say": "prefer-not-to-say",
    }
    ctx.user_data["gender"] = gender_map.get(query.data, "prefer-not-to-say")
    await query.edit_message_text("چند سالته؟ (عدد بنویس، مثلاً ۲۸):")
    return STEP_AGE


async def receive_age(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    text = update.message.text.strip()
    text = text.translate(str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789"))
    try:
        age = int(text)
    except ValueError:
        await update.message.reply_text("لطفاً یک عدد بنویس:")
        return STEP_AGE
    if not (18 <= age <= 70):
        await update.message.reply_text("سن باید بین ۱۸ تا ۷۰ سال باشه:")
        return STEP_AGE
    ctx.user_data["age"] = age
    ctx.user_data["selected_personalities"] = []
    await update.message.reply_text(
        "شخصیتت رو توصیف کن (می‌تونی چند تا انتخاب کنی):",
        reply_markup=personality_keyboard([]),
    )
    return STEP_PERSONALITY


async def receive_personality(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    query = update.callback_query
    await query.answer()
    if query.data == "personality_done":
        if not ctx.user_data.get("selected_personalities"):
            await query.answer("حداقل یه گزینه انتخاب کن!", show_alert=True)
            return STEP_PERSONALITY
        ctx.user_data["selected_interests"] = []
        await query.edit_message_text(
            "🎯 علایقت رو انتخاب کن (چند تا می‌تونی انتخاب کنی):",
            reply_markup=interests_keyboard([], INTERESTS_LIST),
        )
        return STEP_INTERESTS
    trait = query.data.replace("personality_", "")
    selected = ctx.user_data.get("selected_personalities", [])
    if trait in selected:
        selected.remove(trait)
    else:
        selected.append(trait)
    ctx.user_data["selected_personalities"] = selected
    await query.edit_message_reply_markup(reply_markup=personality_keyboard(selected))
    return STEP_PERSONALITY


async def receive_interests(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    query = update.callback_query
    await query.answer()
    if query.data == "interests_done":
        if not ctx.user_data.get("selected_interests"):
            await query.answer("حداقل یه علاقه انتخاب کن!", show_alert=True)
            return STEP_INTERESTS
        return await finish_onboarding(update, ctx)
    interest = query.data.replace("interest_", "")
    selected = ctx.user_data.get("selected_interests", [])
    if interest in selected:
        selected.remove(interest)
    else:
        selected.append(interest)
    ctx.user_data["selected_interests"] = selected
    await query.edit_message_reply_markup(
        reply_markup=interests_keyboard(selected, INTERESTS_LIST)
    )
    return STEP_INTERESTS


async def finish_onboarding(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    query = update.callback_query
    data = ctx.user_data
    result = await api_client.register_user(
        telegram_id=data["telegram_id"],
        name=data["name"],
        city=data["city"],
        neighborhood=data.get("neighborhood", ""),
        gender=data["gender"],
        age=data["age"],
        personality_traits=data.get("selected_personalities", []),
        interests=data.get("selected_interests", []),
    )
    if result.get("success"):
        await query.edit_message_text(
            f"✅ *پروفایلت ثبت شد!*\n\n"
            f"👤 نام: {data['name']}\n"
            f"📍 شهر: {data['city']} — {data.get('neighborhood', '')}\n"
            f"🎯 علایق: {', '.join(data.get('selected_interests', []))}\n\n"
            "حالا می‌تونی رویدادهای مناسبت رو رزرو کنی! 🌟",
            parse_mode="Markdown",
            reply_markup=InlineKeyboardMarkup([[
                InlineKeyboardButton("🌐 مشاهده رویدادها", url=f"{SITE_URL}/events"),
            ]]),
        )
    else:
        await query.edit_message_text(
            "⚠️ مشکلی پیش اومد. لطفاً دوباره با /start تلاش کن.",
        )
    return ConversationHandler.END
