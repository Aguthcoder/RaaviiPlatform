"""
⚙️ تنظیمات ربات راوی
"""

import os
from dataclasses import dataclass, field
from typing import List
from dotenv import load_dotenv

load_dotenv()


@dataclass
class Settings:
    # ─── تلگرام ───────────────────────────────────────────────
    BOT_TOKEN: str = field(default_factory=lambda: os.getenv("BOT_TOKEN", ""))
    BOT_USERNAME: str = field(default_factory=lambda: os.getenv("BOT_USERNAME", "RaviMatchBot"))

    # ─── بک‌اند ────────────────────────────────────────────────
    API_BASE_URL: str = field(default_factory=lambda: os.getenv("API_BASE_URL", "http://localhost:4000"))
    BOT_SECRET: str = field(default_factory=lambda: os.getenv("BOT_WEBHOOK_SHARED_SECRET", "ravi-bot-secret-2024"))

    # ─── ادمین‌ها ──────────────────────────────────────────────
    ADMIN_IDS: List[int] = field(default_factory=lambda: [
        int(x) for x in os.getenv("ADMIN_TELEGRAM_IDS", "").split(",") if x.strip()
    ])

    # ─── کانال اطلاع‌رسانی ────────────────────────────────────
    CHANNEL_ID: str = field(default_factory=lambda: os.getenv("RAVI_CHANNEL_ID", "@RaviChannel"))

    # ─── AI (GapGPT) ─────────────────────────────────────────────
    AI_API_KEY: str = field(default_factory=lambda: os.getenv("AI_API_KEY", ""))
    AI_BASE_URL: str = field(default_factory=lambda: os.getenv("AI_BASE_URL", "https://api.gapgpt.app/v1"))
    AI_MODEL: str = field(default_factory=lambda: os.getenv("AI_MODEL", "gpt-4o-mini"))

    # ─── تنظیمات رویداد ───────────────────────────────────────
    GROUP_BOT_LIFETIME_HOURS: int = 48       # ربات چند ساعت بعد از رویداد در گروه بماند
    INACTIVITY_DAYS: int = 14               # روزهای بی‌فعالی برای ارسال پیشنهاد ویژه
    MAX_AGE_DIFFERENCE: int = 5             # حداکثر تفاوت سنی مجاز در گروه

    # ─── قوانین اخلاقی گروه ───────────────────────────────────
    GROUP_RULES: str = """
📋 قوانین گروه همنشینی راوی:

۱. احترام متقابل و ادب در گفتگو
۲. عدم اشتراک‌گذاری اطلاعات شخصی دیگران
۳. محتوای مشترک‌شده در این گروه محرمانه است
۴. ممنوعیت هرگونه تبلیغ یا معرفی کانال و گروه
۵. حفظ حریم خصوصی یکدیگر

🔒 ربات راوی هیچ محتوایی از مکالمات ذخیره نمی‌کند.
   فقط متادیتای ناشناس (تعداد پیام، زمان تعامل) جمع‌آوری می‌شود.

با حضور در این گروه این قوانین را پذیرفته‌اید.
🌟 راوی - همنشینی آگاهانه
"""


settings = Settings()