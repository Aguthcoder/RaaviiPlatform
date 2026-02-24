"""
⌨️ کیبوردهای آنبوردینگ
"""

from telegram import InlineKeyboardMarkup, InlineKeyboardButton
from typing import List

CITIES = [
    "تهران", "اصفهان", "شیراز", "مشهد", "تبریز",
    "کرج", "رشت", "اهواز", "قم", "کرمانشاه",
]

PERSONALITY_TRAITS = {
    "social":    "🗣️ برون‌گرا — دوست دارم با آدم‌های جدید آشنا بشم",
    "introverted": "📚 درون‌گرا — ترجیح میدم آروم و کم‌حرف باشم",
    "curious":   "🔍 کنجکاو — دوست دارم درباره هر چیزی بدونم",
    "creative":  "🎨 خلاق — ایده‌های جدید برام جذابه",
    "practical": "🔧 عملگرا — دنبال راه‌حل‌های واقعی هستم",
    "empathetic": "💚 همدل — برام مهمه که احساس بقیه رو بفهمم",
}


def cities_keyboard() -> InlineKeyboardMarkup:
    rows = []
    for i in range(0, len(CITIES), 2):
        row = [InlineKeyboardButton(c, callback_data=f"city_{c}") for c in CITIES[i:i+2]]
        rows.append(row)
    return InlineKeyboardMarkup(rows)


def gender_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("👨 مرد", callback_data="gender_male"),
            InlineKeyboardButton("👩 زن", callback_data="gender_female"),
        ],
        [
            InlineKeyboardButton("⚧ سایر", callback_data="gender_other"),
            InlineKeyboardButton("🔒 ترجیح می‌دهم نگویم", callback_data="gender_no_say"),
        ],
    ])


def personality_keyboard(selected: List[str]) -> InlineKeyboardMarkup:
    rows = []
    for key, label in PERSONALITY_TRAITS.items():
        tick = "✅ " if key in selected else ""
        rows.append([InlineKeyboardButton(
            f"{tick}{label}",
            callback_data=f"personality_{key}",
        )])

    if selected:
        rows.append([InlineKeyboardButton("✔️ تأیید انتخاب‌ها", callback_data="personality_done")])

    return InlineKeyboardMarkup(rows)


def interests_keyboard(selected: List[str], all_interests: List[str]) -> InlineKeyboardMarkup:
    rows = []
    chunk = [all_interests[i:i+3] for i in range(0, len(all_interests), 3)]
    for group in chunk:
        row = []
        for item in group:
            tick = "✅ " if item in selected else ""
            row.append(InlineKeyboardButton(
                f"{tick}{item}",
                callback_data=f"interest_{item}",
            ))
        rows.append(row)

    if selected:
        rows.append([InlineKeyboardButton(
            f"✔️ تأیید ({len(selected)} مورد انتخاب شد)",
            callback_data="interests_done",
        )])

    return InlineKeyboardMarkup(rows)
