"""
🔌 سرویس ارتباط با بک‌اند راوی (NestJS)
"""

import logging
from typing import Optional, Dict, Any, List
import httpx

from config.settings import settings

logger = logging.getLogger(__name__)

HEADERS = {
    "Content-Type": "application/json",
    "x-ravi-bot-secret": settings.BOT_SECRET,
}

API = settings.API_BASE_URL


class RaviAPIClient:
    """کلاینت HTTP برای ارتباط با بک‌اند NestJS"""

    def __init__(self):
        self.client = httpx.AsyncClient(
            base_url=API,
            headers=HEADERS,
            timeout=15.0,
        )

    # ─────────────────────────────────────────────────────────────
    # آنبوردینگ
    # ─────────────────────────────────────────────────────────────
    async def register_user(
        self,
        telegram_id: str,
        name: str,
        city: str,
        neighborhood: str,
        gender: str,
        age: int,
        personality_traits: List[str],
        interests: List[str],
    ) -> Dict[str, Any]:
        try:
            res = await self.client.post("/api/bot/onboarding", json={
                "telegramId": telegram_id,
                "name": name,
                "city": city,
                "neighborhood": neighborhood,
                "gender": gender,
                "age": age,
                "personalityTraits": personality_traits,
                "interests": interests,
            })
            res.raise_for_status()
            return res.json()
        except Exception as e:
            logger.error(f"register_user error: {e}")
            return {"success": False}

    # ─────────────────────────────────────────────────────────────
    # 🆕 لینک کردن حساب سایت به تلگرام
    # ─────────────────────────────────────────────────────────────
    async def verify_link_token(
        self,
        token: str,
        telegram_id: str,
        telegram_username: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        توکن deep link رو تأیید کن و حساب سایت رو به تلگرام وصل کن.
        برمیگردونه: { success, user: { name, city, neighborhood, interests } }
        """
        try:
            res = await self.client.post("/api/bot/verify-link-token", json={
                "token": token,
                "telegramId": telegram_id,
                "telegramUsername": telegram_username or "",
            })
            res.raise_for_status()
            return res.json()
        except Exception as e:
            logger.error(f"verify_link_token error: {e}")
            return {"success": False, "message": "خطا در اتصال به سرور"}

    # ─────────────────────────────────────────────────────────────
    # 🆕 رویدادهای هوشمند بر اساس پروفایل
    # ─────────────────────────────────────────────────────────────
    async def get_smart_events(self, telegram_id: str) -> Dict[str, Any]:
        """
        رویدادهای شخصی‌سازی‌شده بر اساس شهر، محله و علایق کاربر.
        برمیگردونه: { events: [...], userName, userCity }
        """
        try:
            res = await self.client.get(f"/api/bot/smart-events/{telegram_id}")
            res.raise_for_status()
            return res.json()
        except Exception as e:
            logger.error(f"get_smart_events error: {e}")
            return {"events": [], "userName": "", "userCity": ""}

    # ─────────────────────────────────────────────────────────────
    # رویدادها
    # ─────────────────────────────────────────────────────────────
    async def get_user_events(self, telegram_id: str) -> List[Dict]:
        try:
            res = await self.client.get(f"/api/bot/user-events/{telegram_id}")
            res.raise_for_status()
            return res.json().get("events", [])
        except Exception as e:
            logger.error(f"get_user_events error: {e}")
            return []

    async def confirm_attendance(self, telegram_id: str, event_id: str) -> bool:
        try:
            res = await self.client.post("/api/bot/confirm-attendance", json={
                "telegramId": telegram_id,
                "eventId": event_id,
            })
            return res.status_code == 200
        except Exception as e:
            logger.error(f"confirm_attendance error: {e}")
            return False

    async def cancel_booking(self, telegram_id: str, event_id: str) -> bool:
        try:
            res = await self.client.post("/api/bot/cancel-booking", json={
                "telegramId": telegram_id,
                "eventId": event_id,
            })
            return res.status_code == 200
        except Exception as e:
            logger.error(f"cancel_booking error: {e}")
            return False

    async def get_upcoming_events(self) -> List[Dict]:
        try:
            res = await self.client.get("/api/events?status=upcoming&limit=20")
            res.raise_for_status()
            return res.json().get("events", [])
        except Exception as e:
            logger.error(f"get_upcoming_events error: {e}")
            return []

    async def check_group_join(self, telegram_id: str, event_id: str) -> Dict:
        try:
            res = await self.client.post("/api/bot/group-join", json={
                "telegramId": telegram_id,
                "eventId": event_id,
            })
            res.raise_for_status()
            return res.json()
        except Exception as e:
            logger.error(f"check_group_join error: {e}")
            return {"canJoin": False, "message": "خطا در بررسی دسترسی"}

    async def save_group_metadata(self, group_id: str, event_id: str, members: List[Dict]) -> bool:
        try:
            res = await self.client.post("/api/bot/group-metadata", json={
                "groupId": group_id,
                "eventId": event_id,
                "members": members,
            })
            return res.status_code == 200
        except Exception as e:
            logger.error(f"save_group_metadata error: {e}")
            return False

    async def save_user_interest_from_group(self, telegram_id: str, event_id: str, next_event_interest: str) -> bool:
        try:
            res = await self.client.post("/api/bot/user-interest", json={
                "telegramId": telegram_id,
                "eventId": event_id,
                "nextEventInterest": next_event_interest,
            })
            return res.status_code == 200
        except Exception as e:
            logger.error(f"save_user_interest error: {e}")
            return False

    async def submit_feedback(self, telegram_id: str, event_id: str, score: int, text: str) -> bool:
        try:
            res = await self.client.post("/api/bot/feedback", json={
                "telegramId": telegram_id,
                "eventId": event_id,
                "score": score,
                "text": text,
            })
            return res.status_code == 200
        except Exception as e:
            logger.error(f"submit_feedback error: {e}")
            return False

    async def ask_support(self, question: str, telegram_id: str) -> str:
        try:
            res = await self.client.post("/api/bot/support/ask", json={
                "question": question,
                "telegramId": telegram_id,
            })
            res.raise_for_status()
            return res.json().get("answer", "")
        except Exception as e:
            logger.error(f"ask_support error: {e}")
            return ""

    async def get_weekly_report(self) -> Dict:
        try:
            res = await self.client.get("/api/bot/weekly-report")
            res.raise_for_status()
            return res.json()
        except Exception as e:
            logger.error(f"get_weekly_report error: {e}")
            return {}

    async def get_inactive_users(self, days: int = 14) -> List[Dict]:
        try:
            res = await self.client.get(f"/api/bot/inactive-users?days={days}")
            res.raise_for_status()
            return res.json().get("users", [])
        except Exception as e:
            logger.error(f"get_inactive_users error: {e}")
            return []

    async def cafe_login(self, telegram_id: str, username: str, password: str) -> Dict:
        try:
            res = await self.client.post("/api/bot/cafe/login", json={
                "telegramId": telegram_id,
                "username": username,
                "password": password,
            })
            res.raise_for_status()
            return res.json()
        except Exception as e:
            logger.error(f"cafe_login error: {e}")
            return {"success": False}

    async def cafe_me(self, telegram_id: str) -> Dict:
        try:
            res = await self.client.get(f"/api/bot/cafe/me/{telegram_id}")
            res.raise_for_status()
            return res.json()
        except Exception as e:
            logger.error(f"cafe_me error: {e}")
            return {"linked": False}

    async def cafe_today_events(self, telegram_id: str) -> Dict:
        try:
            res = await self.client.get(f"/api/bot/cafe/today-events/{telegram_id}")
            res.raise_for_status()
            return res.json()
        except Exception as e:
            logger.error(f"cafe_today_events error: {e}")
            return {"events": []}

    async def cafe_attendance_list(self, telegram_id: str, event_id: str) -> Dict:
        try:
            res = await self.client.get(f"/api/bot/cafe/attendance/{telegram_id}/{event_id}")
            res.raise_for_status()
            return res.json()
        except Exception as e:
            logger.error(f"cafe_attendance_list error: {e}")
            return {"error": "خطا در دریافت لیست"}

    async def cafe_toggle_attendance(self, telegram_id: str, event_id: str, user_id: str, attended: bool) -> bool:
        try:
            res = await self.client.post("/api/bot/cafe/attendance/toggle", json={
                "telegramId": telegram_id, "eventId": event_id,
                "userId": user_id, "attended": attended,
            })
            return res.status_code == 200
        except Exception as e:
            logger.error(f"cafe_toggle_attendance error: {e}")
            return False

    async def cafe_finalize_attendance(self, telegram_id: str, event_id: str, attendances: List[Dict]) -> Dict:
        try:
            res = await self.client.post("/api/bot/cafe/attendance/finalize", json={
                "telegramId": telegram_id, "eventId": event_id, "attendances": attendances,
            })
            res.raise_for_status()
            return res.json()
        except Exception as e:
            logger.error(f"cafe_finalize_attendance error: {e}")
            return {"success": False}

    async def close(self):
        await self.client.aclose()


# Singleton
api_client = RaviAPIClient()
