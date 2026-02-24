"""
🤖 ربات تلگرام راوی - نقطه ورودی اصلی
"""

import logging
import asyncio
import os

os.makedirs("logs", exist_ok=True)
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    ConversationHandler,
    filters,
)

from config.settings import settings
from handlers.onboarding import (
    start_handler,
    receive_name, receive_city, receive_neighborhood,
    receive_gender, receive_age, receive_personality, receive_interests,
    finish_onboarding,
    refresh_smart_events_handler,   # 🆕
    STEP_NAME, STEP_CITY, STEP_NEIGHBORHOOD,
    STEP_GENDER, STEP_AGE, STEP_PERSONALITY, STEP_INTERESTS,
)
from handlers.events import (
    my_events_handler,
    confirm_attendance_handler,
    cancel_booking_handler,
)
from handlers.game import (
    start_game_handler,
    answer_game_handler,
    next_question_handler,
    STEP_GAME_ANSWER,
)
from handlers.feedback import (
    feedback_start_handler,
    feedback_rating_handler,
    feedback_text_handler,
    STEP_FEEDBACK_RATING, STEP_FEEDBACK_TEXT,
)
from handlers.support import support_handler, support_message_handler
from handlers.group import (
    group_member_join_handler,
    group_message_tracker,
    group_member_left_handler,
)
from handlers.admin import (
    send_event_notification_handler,
    broadcast_handler,
    weekly_report_handler,
)
from handlers.cafe_admin import (
    cafe_panel_handler,
    cafe_select_event_handler,
    cafe_toggle_attendance_handler,
    cafe_finalize_handler,
    get_cafe_login_conversation,
)

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
    handlers=[
        logging.FileHandler("logs/bot.log", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


def build_application() -> Application:
    app = Application.builder().token(settings.BOT_TOKEN).build()

    # ─── Conversation: آنبوردینگ ─────────────────────────────────
    # /start بدون آرگومان → آنبوردینگ
    # /start <token>      → deep link (داخل start_handler handle میشه)
    onboarding_conv = ConversationHandler(
        entry_points=[CommandHandler("start", start_handler)],
        states={
            STEP_NAME:         [MessageHandler(filters.TEXT & ~filters.COMMAND, receive_name)],
            STEP_CITY:         [CallbackQueryHandler(receive_city, pattern="^city_")],
            STEP_NEIGHBORHOOD: [MessageHandler(filters.TEXT & ~filters.COMMAND, receive_neighborhood)],
            STEP_GENDER:       [CallbackQueryHandler(receive_gender, pattern="^gender_")],
            STEP_AGE:          [MessageHandler(filters.TEXT & ~filters.COMMAND, receive_age)],
            STEP_PERSONALITY:  [CallbackQueryHandler(receive_personality, pattern="^personality_")],
            STEP_INTERESTS:    [CallbackQueryHandler(receive_interests, pattern="^interest_|^interests_done$")],
        },
        fallbacks=[CommandHandler("start", start_handler)],
        allow_reentry=True,
    )
    app.add_handler(onboarding_conv)

    # ─── 🆕 رفرش رویدادهای هوشمند ───────────────────────────────
    app.add_handler(CallbackQueryHandler(
        refresh_smart_events_handler,
        pattern="^refresh_smart_events$",
    ))

    # ─── Conversation: بازی هوشمند ──────────────────────────────
    game_conv = ConversationHandler(
        entry_points=[CallbackQueryHandler(start_game_handler, pattern="^game_start$")],
        states={
            STEP_GAME_ANSWER: [
                CallbackQueryHandler(next_question_handler, pattern="^game_next$"),
                MessageHandler(filters.TEXT & ~filters.COMMAND, answer_game_handler),
            ],
        },
        fallbacks=[],
        per_chat=True,
    )
    app.add_handler(game_conv)

    # ─── Conversation: فیدبک ────────────────────────────────────
    feedback_conv = ConversationHandler(
        entry_points=[CallbackQueryHandler(feedback_start_handler, pattern="^feedback_start_")],
        states={
            STEP_FEEDBACK_RATING: [CallbackQueryHandler(feedback_rating_handler, pattern="^rating_")],
            STEP_FEEDBACK_TEXT:   [MessageHandler(filters.TEXT & ~filters.COMMAND, feedback_text_handler)],
        },
        fallbacks=[],
        per_message=False,
    )
    app.add_handler(feedback_conv)

    # ─── دستورات ────────────────────────────────────────────────
    app.add_handler(CommandHandler("myevents", my_events_handler))
    app.add_handler(CommandHandler("support",  support_handler))
    app.add_handler(CommandHandler("report",   weekly_report_handler))

    # ─── کافه ادمین ─────────────────────────────────────────────
    app.add_handler(get_cafe_login_conversation())
    app.add_handler(CommandHandler("cafe", cafe_panel_handler))
    app.add_handler(CallbackQueryHandler(cafe_select_event_handler,      pattern="^cafe_event_"))
    app.add_handler(CallbackQueryHandler(cafe_toggle_attendance_handler, pattern="^cafe_toggle_"))
    app.add_handler(CallbackQueryHandler(cafe_finalize_handler,          pattern="^cafe_finalize$"))

    # ─── Callbacks ──────────────────────────────────────────────
    app.add_handler(CallbackQueryHandler(confirm_attendance_handler,         pattern="^confirm_"))
    app.add_handler(CallbackQueryHandler(cancel_booking_handler,             pattern="^cancel_booking_"))
    app.add_handler(CallbackQueryHandler(broadcast_handler,                  pattern="^admin_broadcast$"))
    app.add_handler(CallbackQueryHandler(send_event_notification_handler,    pattern="^notify_event_"))

    # ─── هندلرهای گروه ──────────────────────────────────────────
    app.add_handler(MessageHandler(filters.StatusUpdate.NEW_CHAT_MEMBERS, group_member_join_handler))
    app.add_handler(MessageHandler(filters.StatusUpdate.LEFT_CHAT_MEMBER, group_member_left_handler))
    app.add_handler(MessageHandler(filters.TEXT & filters.ChatType.GROUPS, group_message_tracker))

    # ─── پشتیبانی در پیوی ───────────────────────────────────────
    app.add_handler(MessageHandler(
        filters.TEXT & filters.ChatType.PRIVATE & ~filters.COMMAND,
        support_message_handler,
    ))

    return app


async def main():
    app = build_application()
    logger.info("🚀 ربات راوی در حال اجرا...")
    from jobs.scheduler import register_jobs
    register_jobs(app.job_queue)
    await app.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
    import sys
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    app = build_application()
    logger.info("🚀 ربات راوی در حال اجرا...")
    from jobs.scheduler import register_jobs
    register_jobs(app.job_queue)
    app.run_polling(drop_pending_updates=True)
