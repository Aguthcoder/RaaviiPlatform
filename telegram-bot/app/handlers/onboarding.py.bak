from aiogram import F, Router
from aiogram.filters import CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.types import Message
from redis.asyncio import Redis

from app.fsm.states import OnboardingStates

router = Router(name='onboarding')


@router.message(CommandStart())
async def start(message: Message, state: FSMContext):
    await state.set_state(OnboardingStates.waiting_name)
    await message.answer('Welcome to Ravi! What is your name?')


@router.message(OnboardingStates.waiting_name)
async def collect_name(message: Message, state: FSMContext):
    await state.update_data(name=message.text)
    await state.set_state(OnboardingStates.waiting_city)
    await message.answer('Great. Which city are you in?')


@router.message(OnboardingStates.waiting_city)
async def collect_city(message: Message, state: FSMContext):
    await state.update_data(city=message.text)
    await state.set_state(OnboardingStates.waiting_personality)
    await message.answer('Pick your personality focus: analytical, social, creative, structured.')


@router.message(OnboardingStates.waiting_personality)
async def collect_personality(message: Message, state: FSMContext):
    value = (message.text or '').strip().lower()
    await state.update_data(personalityTraits=[value])
    await state.set_state(OnboardingStates.waiting_interests)
    await message.answer('Share your interests (comma separated).')


@router.message(OnboardingStates.waiting_interests)
async def collect_interests(message: Message, state: FSMContext, redis: Redis):
    interests = [x.strip().lower() for x in (message.text or '').split(',') if x.strip()]
    await state.update_data(interests=interests)
    await redis.set(f"bot:user:{message.from_user.id}:profile", str(interests), ex=86400)

    if 'tech' in interests:
        await state.set_state(OnboardingStates.adaptive_followup)
        await message.answer('You mentioned tech. Do you prefer workshops or meetups?')
        return

    await state.set_state(OnboardingStates.complete)
    await message.answer('Perfect! We will match you with relevant events and groups soon.')


@router.message(OnboardingStates.adaptive_followup, F.text)
async def adaptive_followup(message: Message, state: FSMContext):
    await state.update_data(preferredEventTypes=[(message.text or '').strip().lower()])
    await state.set_state(OnboardingStates.complete)
    await message.answer('Thanks! You are all set. We will send group invites after matching.')
