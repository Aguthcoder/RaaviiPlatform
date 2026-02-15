"use client";

import { useState } from "react";
import { ArrowRight, Gamepad2, Trophy, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import BackgroundBlobs from "@/components/BackgroundBlobs";
import BottomNavbar from "@/components/BottomNavbar";

interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  available: boolean;
  points: number;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

const games: Game[] = [
  {
    id: "quiz",
    title: "پرسش و پاسخ همنشینی",
    description: "بازی سوال و جواب براساس همنشینی‌های رزرو شده",
    icon: "❓",
    available: true,
    points: 100,
  },
  {
    id: "trivia",
    title: "دانستنی‌های راوی",
    description: "سوالات عمومی و جالب",
    icon: "🧠",
    available: false,
    points: 50,
  },
  {
    id: "challenge",
    title: "چالش روزانه",
    description: "هر روز یک چالش جدید",
    icon: "🎯",
    available: false,
    points: 200,
  },
];

// سوالات نمونه براساس همنشینی قدم زدن در پارک
const quizQuestions: QuizQuestion[] = [
  {
    question: "همنشینی «قدم زدن در پارک لاله» کِی برگزار می‌شه؟",
    options: ["۱۴۰۴/۰۲/۲۰", "۱۴۰۴/۰۲/۲۲", "۱۴۰۴/۰۲/۲۵", "۱۴۰۴/۰۲/۲۸"],
    correct: 0,
  },
  {
    question: "ظرفیت این همنشینی چند نفره؟",
    options: ["۱۰ نفر", "۱۵ نفر", "۲۰ نفر", "۲۵ نفر"],
    correct: 2,
  },
  {
    question: "این همنشینی در کدوم پارک برگزار میشه؟",
    options: ["پارک ملت", "پارک لاله", "پارک جنگلی", "پارک آب و آتش"],
    correct: 1,
  },
];

export default function GamesPage() {
  const router = useRouter();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const handleGameSelect = (gameId: string) => {
    const game = games.find((g) => g.id === gameId);
    if (game?.available) {
      setSelectedGame(gameId);
      setCurrentQuestion(0);
      setScore(0);
      setShowResult(false);
      setSelectedAnswer(null);
    }
  };

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    
    if (answerIndex === quizQuestions[currentQuestion].correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  const handleBackToGames = () => {
    setSelectedGame(null);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
  };

  // صفحه لیست بازی‌ها
  if (!selectedGame) {
    return (
      <div className="min-h-screen pb-24 pt-8 px-4 relative">
        <BackgroundBlobs />

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-600 hover:text-navy-900 mb-4 transition"
            >
              <ArrowRight size={20} />
              <span className="font-medium">بازگشت</span>
            </button>

            <h1 className="text-4xl font-black text-navy-900 mb-2 font-estedad">
              بازی‌ها
            </h1>
            <p className="text-slate-600">
              با بازی کردن امتیاز بگیر و جوایز ببر!
            </p>
          </div>

          {/* Points Card */}
          <div className="bg-gradient-to-br from-raavi-orange to-raavi-600 rounded-3xl p-6 mb-8 shadow-2xl flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">امتیاز شما</p>
              <p className="text-4xl font-black text-white font-estedad">
                ۱,۲۵۰
              </p>
            </div>
            <Trophy className="text-white" size={48} />
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {games.map((game) => (
              <button
                key={game.id}
                onClick={() => handleGameSelect(game.id)}
                disabled={!game.available}
                className={`bg-white rounded-3xl p-6 text-right transition-all ${
                  game.available
                    ? "hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{game.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-black text-navy-900 font-estedad">
                        {game.title}
                      </h3>
                      {!game.available && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-bold">
                          به زودی
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-sm mb-3">
                      {game.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Star className="text-raavi-orange" size={16} />
                      <span className="text-raavi-orange font-bold">
                        {game.points} امتیاز
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <BottomNavbar />
      </div>
    );
  }

  // صفحه بازی Quiz
  if (showResult) {
    const percentage = (score / quizQuestions.length) * 100;
    
    return (
      <div className="min-h-screen pb-24 pt-8 px-4 relative">
        <BackgroundBlobs />

        <div className="max-w-2xl mx-auto relative z-10 text-center">
          <div className="bg-white rounded-3xl p-12 shadow-2xl">
            <div className="text-6xl mb-6">
              {percentage >= 70 ? "🎉" : percentage >= 50 ? "😊" : "😔"}
            </div>
            
            <h2 className="text-3xl font-black text-navy-900 mb-4 font-estedad">
              {percentage >= 70
                ? "عالی بود!"
                : percentage >= 50
                  ? "خوب بود!"
                  : "بیشتر تلاش کن!"}
            </h2>

            <p className="text-slate-600 mb-8">
              شما به {score} سوال از {quizQuestions.length} سوال پاسخ صحیح دادید
            </p>

            <div className="bg-raavi-50 rounded-2xl p-6 mb-8">
              <p className="text-raavi-orange font-bold mb-2">امتیاز کسب شده</p>
              <p className="text-5xl font-black text-raavi-orange font-estedad">
                +{score * 50}
              </p>
            </div>

            <button
              onClick={handleBackToGames}
              className="w-full bg-raavi-orange hover:bg-raavi-600 text-white font-bold py-4 rounded-2xl transition-all hover:-translate-y-1"
            >
              بازگشت به بازی‌ها
            </button>
          </div>
        </div>

        <BottomNavbar />
      </div>
    );
  }

  // صفحه سوالات
  return (
    <div className="min-h-screen pb-24 pt-8 px-4 relative">
      <BackgroundBlobs />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackToGames}
            className="flex items-center gap-2 text-slate-600 hover:text-navy-900 mb-4 transition"
          >
            <ArrowRight size={20} />
            <span className="font-medium">بازگشت</span>
          </button>

          {/* Progress */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-600 font-bold">
              سوال {currentQuestion + 1} از {quizQuestions.length}
            </span>
            <span className="text-raavi-orange font-bold">امتیاز: {score * 50}</span>
          </div>
          
          <div className="w-full bg-navy-200 rounded-full h-3">
            <div
              className="bg-raavi-orange h-3 rounded-full transition-all duration-500"
              style={{
                width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-navy-800 rounded-3xl p-8 mb-6">
          <h2 className="text-2xl font-black text-white mb-8 font-estedad text-center">
            {quizQuestions[currentQuestion].question}
          </h2>

          <div className="space-y-4">
            {quizQuestions[currentQuestion].options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === quizQuestions[currentQuestion].correct;
              const showResult = selectedAnswer !== null;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`w-full p-4 rounded-2xl font-bold transition-all text-right ${
                    showResult
                      ? isCorrect
                        ? "bg-green-500 text-white"
                        : isSelected
                          ? "bg-red-500 text-white"
                          : "bg-navy-700 text-slate-400"
                      : "bg-navy-700 text-white hover:bg-navy-600"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
}
