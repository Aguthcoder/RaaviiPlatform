from aiogram.fsm.state import State, StatesGroup


class OnboardingStates(StatesGroup):
    waiting_name = State()
    waiting_city = State()
    waiting_personality = State()
    waiting_interests = State()
    adaptive_followup = State()
    complete = State()
