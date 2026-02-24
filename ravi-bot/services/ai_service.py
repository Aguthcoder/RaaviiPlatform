"""
🤖 سرویس هوش مصنوعی — GapGPT
پشتیبانی از سوالات متداول و تولید محتوا
"""

import logging
import httpx
from config.settings import settings

logger = logging.getLogger(__name__)


class AIService:
    def __init__(self):
        self.client = httpx.AsyncClient(
            base_url=settings.AI_BASE_URL,
            headers={
                "Authorization": f"Bearer {settings.AI_API_KEY}",
                "Content-Type": "application/json",
            },
            timeout=30.0,
        )
        self.model = settings.AI_MODEL

    async def chat(self, system_prompt: str, user_message: str) -> str:
        """ارسال درخواست به GapGPT"""
        try:
            res = await self.client.post("/chat/completions", json={
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": user_message},
                ],
                "max_tokens": 500,
                "temperature": 0.7,
            })
            res.raise_for_status()
            return res.json()["choices"][0]["message"]["content"].strip()
        except Exception as e:
            logger.error(f"AIService.chat error: {e}")
            return ""

    async def answer_support(self, question: str) -> str:
        """پاسخ به سوالات پشتیبانی"""
        system = """تو دستیار پشتیبانی پلتفرم راوی هستی.
راوی یک پلتفرم همنشینی اجتماعی است که رویدادهای گروهی برگزار می‌کند.
فقط به سوالات مربوط به: رزرو، قیمت، لغو، قوانین، گروه تلگرام، و روند برگزاری رویداد پاسخ بده.
پاسخ‌ها را کوتاه، واضح و فارسی بنویس. اگر سوال خارج از حوزه‌ات بود بگو «این سوال نیاز به بررسی دارد»."""
        return await self.chat(system, question)

    async def generate_event_caption(self, event: dict) -> str:
        """تولید کپشن جذاب برای پست کانال رویداد"""
        system = """یک نویسنده محتوای جذاب برای پلتفرم همنشینی راوی هستی.
یک کپشن کوتاه و جذاب (حداکثر ۳ خط) برای معرفی رویداد بنویس.
لحن گرم، صمیمی و دعوت‌کننده باشه. از ایموجی مناسب استفاده کن."""
        prompt = f"رویداد: {event.get('title')}\nنوع: {event.get('category')}\nشهر: {event.get('city')}"
        return await self.chat(system, prompt)

    async def close(self):
        await self.client.aclose()


# Singleton
ai_service = AIService()
