from aiogram.fsm.state import State, StatesGroup


class OnboardingStates(StatesGroup):
    """مراحل آنبوردینگ کاربر جدید"""
    waiting_name = State()          # انتظار برای نام
    waiting_city = State()          # انتظار برای شهر
    waiting_gender = State()        # انتظار برای جنسیت
    waiting_age = State()           # انتظار برای سن
    waiting_personality = State()   # انتظار برای نوع شخصیت
    waiting_interests = State()     # انتظار برای علایق
    adaptive_followup = State()     # سوال تطبیقی
    complete = State()              # تکمیل پروفایل


class GroupStates(StatesGroup):
    """مدیریت حضور کاربر در گروه"""
    waiting_for_test = State()      # انتظار برای انجام تست شخصیت (BIG5_WAITING)
    in_group_chat = State()         # کاربر داخل گروه است (IN_GROUP_CHAT)
    waiting_feedback = State()      # انتظار برای فیدبک پس از رویداد


class PaymentStates(StatesGroup):
    """مدیریت فرآیند پرداخت"""
    awaiting_confirmation = State()
    payment_pending = State()
