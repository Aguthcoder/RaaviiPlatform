import httpx
import os
import logging
from aiogram import F, Router
from aiogram.filters import CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.types import (
    Message,
    ReplyKeyboardMarkup,
    KeyboardButton,
    ReplyKeyboardRemove,
)
from redis.asyncio import Redis

from app.fsm.states import OnboardingStates

logger = logging.getLogger(__name__)
router = Router(name='onboarding')

BACKEND_URL = os.getenv('BACKEND_URL', 'http://backend:4000')
BOT_BACKEND_SECRET = os.getenv('BOT_WEBHOOK_SHARED_SECRET', '')

IRANIAN_CITIES = [
    "تهران", "اصفهان", "شیراز", "تبریز", "مشهد", "اهواز",
    "کرمانشاه", "کرج", "رشت", "یزد", "قم", "سنندج",
]

PERSONALITY_TYPES = ["تحلیلی 🔬", "اجتماعی 🤝", "خلاق 🎨", "منظم 📋"]


def city_keyboard() -> ReplyKeyboardMarkup:
    rows = []
    for i in range(0, len(IRANIAN_CITIES), 3):
        rows.append([KeyboardButton(text=c) for c in IRANIAN_CITIES[i:i+3]])
    rows.append([KeyboardButton(text="شهر دیگر")])
    return ReplyKeyboardMarkup(keyboard=rows, resize_keyboard=True, one_time_keyboard=True)


def gender_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="مرد 👨"), KeyboardButton(text="زن 👩")],
            [KeyboardButton(text="ترجیح می‌دهم نگویم")],
        ],
        resize_keyboard=True,
        one_time_keyboard=True,
    )


def personality_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text=p)] for p in PERSONALITY_TYPES],
        resize_keyboard=True,
        one_time_keyboard=True,
    )


async def send_to_backend(telegram_id: int, data: dict) -> bool:
    """ارسال اطلاعات پروفایل به بکند"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{BACKEND_URL}/api/bot/onboarding",
                json={"telegramId": str(telegram_id), **data},
                headers={"x-ravi-bot-secret": BOT_BACKEND_SECRET},
            )
            return resp.status_code == 200 or resp.status_code == 201
    except Exception as e:
        logger.error(f"Backend call failed for user {telegram_id}: {e}")
        return False


@router.message(CommandStart())
async def start(message: Message, state: FSMContext):
    await state.clear()
    await state.set_state(OnboardingStates.waiting_name)
    await message.answer(
        "🌟 <b>به راوی خوش اومدی!</b>\n\n"
        "راوی یه پلتفرم هوشمنده که بر اساس شخصیتت، بهترین گروه‌ها "
        "و رویدادها رو برات پیدا می‌کنه.\n\n"
        "برای شروع، <b>اسمت</b> رو بگو:",
        reply_markup=ReplyKeyboardRemove(),
    )


@router.message(OnboardingStates.waiting_name)
async def collect_name(message: Message, state: FSMContext):
    name = (message.text or "").strip()
    if len(name) < 2:
        await message.answer("⚠️ لطفاً یه اسم معتبر وارد کن (حداقل ۲ حرف):")
        return
    await state.update_data(name=name)
    await state.set_state(OnboardingStates.waiting_city)
    await message.answer(
        f"خوشحالم که آشنا شدم، <b>{name}</b> 👋\n\nتوی کدوم شهری؟",
        reply_markup=city_keyboard(),
    )


@router.message(OnboardingStates.waiting_city)
async def collect_city(message: Message, state: FSMContext):
    city = (message.text or "").strip()
    await state.update_data(city=city)
    await state.set_state(OnboardingStates.waiting_gender)
    await message.answer(
        f"عالیه! 📍 {city}\n\nجنسیتت چیه؟",
        reply_markup=gender_keyboard(),
    )


@router.message(OnboardingStates.waiting_gender)
async def collect_gender(message: Message, state: FSMContext):
    gender_map = {
        "مرد 👨": "male", "زن 👩": "female",
        "ترجیح می‌دهم نگویم": "prefer-not-to-say"
    }
    gender = gender_map.get(message.text or "", "prefer-not-to-say")
    await state.update_data(gender=gender)
    await state.set_state(OnboardingStates.waiting_age)
    await message.answer(
        "چند سالته؟ (عدد وارد کن):",
        reply_markup=ReplyKeyboardRemove(),
    )


@router.message(OnboardingStates.waiting_age)
async def collect_age(message: Message, state: FSMContext):
    try:
        age = int((message.text or "").strip())
        if not (16 <= age <= 99):
            raise ValueError
    except ValueError:
        await message.answer("⚠️ لطفاً یه عدد معتبر بین ۱۶ تا ۹۹ وارد کن:")
        return
    await state.update_data(age=age)
    await state.set_state(OnboardingStates.waiting_personality)
    await message.answer(
        "🧠 کدوم نوع شخصیت بهتر توصیفت می‌کنه؟",
        reply_markup=personality_keyboard(),
    )


@router.message(OnboardingStates.waiting_personality)
async def collect_personality(message: Message, state: FSMContext):
    personality_map = {
        "تحلیلی 🔬": "analytical",
        "اجتماعی 🤝": "social",
        "خلاق 🎨": "creative",
        "منظم 📋": "structured",
    }
    value = personality_map.get(message.text or "", "social")
    await state.update_data(personalityTraits=[value])
    await state.set_state(OnboardingStates.waiting_interests)
    await message.answer(
        "🎯 علایقت رو بنویس (با کاما جدا کن):\n"
        "مثال: <i>کتاب، موسیقی، کوهنوردی، سینما</i>",
        reply_markup=ReplyKeyboardRemove(),
    )


@router.message(OnboardingStates.waiting_interests)
async def collect_interests(message: Message, state: FSMContext, redis: Redis):
    interests = [
        x.strip() for x in (message.text or "").replace("،", ",").split(",") if x.strip()
    ]
    await state.update_data(interests=interests)

    # بررسی تطبیقی: اگر به تکنولوژی علاقه دارن سوال بیشتر می‌پرسیم
    tech_keywords = ["تکنولوژی", "برنامه‌نویسی", "tech", "کدنویسی", "ai", "هوش مصنوعی"]
    has_tech = any(k in " ".join(interests).lower() for k in tech_keywords)

    if has_tech:
        await state.set_state(OnboardingStates.adaptive_followup)
        await message.answer(
            "💻 باحاله که به تکنولوژی علاقه داری!\n"
            "بیشتر رویدادهای کدوم نوع رو دوست داری؟",
            reply_markup=ReplyKeyboardMarkup(
                keyboard=[
                    [KeyboardButton(text="کارگاه عملی 🛠️"), KeyboardButton(text="ملاقات و گفتگو 🗣️")],
                    [KeyboardButton(text="هر دو 🔥")],
                ],
                resize_keyboard=True,
                one_time_keyboard=True,
            ),
        )
        return

    await _complete_onboarding(message, state, redis)


@router.message(OnboardingStates.adaptive_followup, F.text)
async def adaptive_followup(message: Message, state: FSMContext, redis: Redis):
    pref_map = {
        "کارگاه عملی 🛠️": "workshop",
        "ملاقات و گفتگو 🗣️": "meetup",
        "هر دو 🔥": "both",
    }
    pref = pref_map.get(message.text or "", "both")
    await state.update_data(preferredEventTypes=[pref])
    await _complete_onboarding(message, state, redis)


async def _complete_onboarding(message: Message, state: FSMContext, redis: Redis):
    """تکمیل آنبوردینگ و ذخیره در Redis + Backend"""
    data = await state.get_data()
    user_id = message.from_user.id

    # ذخیره در Redis (کش موقت ۲۴ ساعته)
    import json
    await redis.set(
        f"bot:user:{user_id}:profile",
        json.dumps(data, ensure_ascii=False),
        ex=86400,
    )

    # ارسال به بکند
    success = await send_to_backend(user_id, data)

    await state.set_state(OnboardingStates.complete)
    await message.answer(
        "🎉 <b>پروفایلت تکمیل شد!</b>\n\n"
        f"✅ اسم: {data.get('name', '')}\n"
        f"📍 شهر: {data.get('city', '')}\n"
        f"🧠 شخصیت: {', '.join(data.get('personalityTraits', []))}\n"
        f"🎯 علایق: {', '.join(data.get('interests', []))}\n\n"
        "🔮 الگوریتم راوی داره بهترین گروه رو برات پیدا می‌کنه...\n"
        "به زودی دعوت‌نامه می‌فرستیم! 🚀",
        reply_markup=ReplyKeyboardRemove(),
    )

    if not success:
        logger.warning(f"Failed to sync user {user_id} profile to backend")
