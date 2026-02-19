"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { fetchMyBookings, fetchEventById, Booking, ApiEvent } from "@/lib/api";
import { ArrowRight, CheckCircle2, XCircle, Trophy, RefreshCw } from "lucide-react";

interface Question {
  q: string;
  options: string[];
  correct: number;
}

function generateQuestions(eventTitle: string): Question[] {
  const baseQuestions: Question[] = [
    {
      q: `در همنشینی "${eventTitle}" اولین قدم برای شکستن سکوت چیست؟`,
      options: ["معرفی کوتاه خود", "بررسی گوشی", "انتظار برای دیگران", "موضوع جدی"],
      correct: 0,
    },
    {
      q: "بهترین راه برای ایجاد ارتباط عمیق در یک جمع جدید؟",
      options: ["صحبت از خود", "پرسیدن سوالات کنجکاوانه", "نظر دادن درباره همه", "بیشتر شنیدن تا صحبت"],
      correct: 3,
    },
    {
      q: "اگر در جمع احساس ناراحتی کردید، بهترین واکنش چیست؟",
      options: ["بلند اعتراض کردن", "آرام با مسئول صحبت کردن", "فوری خروج", "سکوت کامل"],
      correct: 1,
    },
    {
      q: "کدام رفتار بیشترین تأثیر مثبت در یک همنشینی دارد؟",
      options: ["تعریف از خود", "گوش‌دادن فعال", "رقابت با دیگران", "قضاوت افراد"],
      correct: 1,
    },
    {
      q: "مهم‌ترین ارزش در یک همنشینی راوی چیست؟",
      options: ["سرگرمی صرف", "احترام و همدلی", "نتیجه‌گیری سریع", "رقابت"],
      correct: 1,
    },
  ];
  return baseQuestions;
}

export default function GamePage() {
  const { state } = useApp();
  const [bookings, setBookings] = useState<(Booking & { eventData?: ApiEvent })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (!state.isLoggedIn) { setLoading(false); return; }
    fetchMyBookings()
      .then(async (raw) => {
        const active = raw.filter(b => b.status !== 'cancelled');
        const enriched = await Promise.all(active.map(async (b) => {
          try {
            const eventId = b.eventId || b.event_id || '';
            const eventData = await fetchEventById(eventId).catch(() => undefined);
            return { ...b, eventData };
          } catch { return b; }
        }));
        setBookings(enriched);
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [state.isLoggedIn]);

  const startGame = (eventId: string, eventTitle: string) => {
    setSelectedEvent(eventId);
    setQuestions(generateQuestions(eventTitle));
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setDone(false);
    setGameStarted(true);
  };

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === questions[current].correct) setScore(s => s + 1);
    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setDone(true);
      } else {
        setCurrent(c => c + 1);
        setSelected(null);
      }
    }, 1000);
  };

  if (!state.isLoggedIn) {
    return (
      <div className="p-4 text-center">
        <p className="text-slate-400">ابتدا وارد شوید</p>
        <Link href="/login" className="text-orange-400 font-bold mt-2 inline-block">ورود</Link>
      </div>
    );
  }

  return (
    <div className="pb-28 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition">
          <ArrowRight size={20} />
        </Link>
        <h1 className="text-xl font-black text-white">بازی پرسش و پاسخ</h1>
      </div>

      {loading ? (
        <div className="app-card rounded-3xl p-8 flex justify-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !gameStarted ? (
        <>
          {bookings.length === 0 ? (
            <div className="app-card rounded-3xl p-8 text-center">
              <div className="text-4xl mb-3">🎮</div>
              <h3 className="text-white font-black mb-1">هنوز همنشینی رزرو نکرده‌اید</h3>
              <p className="text-slate-400 text-sm mb-4">بعد از رزرو، بازی برای شما فعال می‌شود</p>
              <Link href="/events" className="inline-block bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm">
                رزرو همنشینی
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-slate-400 text-sm px-1">یک همنشینی را برای شروع بازی انتخاب کنید:</p>
              {bookings.map((b) => {
                const title = b.eventData?.title || "همنشینی";
                return (
                  <button
                    key={b.id}
                    onClick={() => startGame(b.eventId || b.event_id || b.id, title)}
                    className="w-full app-card rounded-3xl p-5 text-right flex items-center gap-4 hover:border-orange-500/40 transition-all border border-transparent"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center flex-shrink-0 text-2xl">
                      🎮
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-white text-sm line-clamp-2">{title}</p>
                      <p className="text-slate-400 text-xs mt-1">۵ سوال | بر اساس این همنشینی</p>
                    </div>
                    <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex-shrink-0">
                      شروع
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </>
      ) : done ? (
        <div className="app-card rounded-3xl p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
            <Trophy size={32} className="text-yellow-400" />
          </div>
          <h3 className="text-2xl font-black text-white mb-1">پایان بازی!</h3>
          <p className="text-slate-400 mb-4">نتیجه شما:</p>
          <div className="text-4xl font-black text-orange-400 mb-1">{score}/{questions.length}</div>
          <p className="text-slate-400 text-sm mb-6">
            {score >= 4 ? "عالی! شما آماده همنشینی هستید 🌟" : score >= 2 ? "خوب! کمی تمرین بیشتر 💪" : "ادامه بدید! بهتر می‌شید 🔥"}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setGameStarted(false); setSelectedEvent(null); }}
              className="flex items-center gap-2 bg-slate-800 text-slate-300 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-700 transition"
            >
              <RefreshCw size={14} />
              بازی دیگر
            </button>
            <Link href="/dashboard" className="bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm">
              داشبورد
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* پیشرفت */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all"
                style={{ width: `${((current) / questions.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-400 font-bold">{current + 1}/{questions.length}</span>
          </div>

          {/* سوال */}
          <div className="app-card rounded-3xl p-6">
            <p className="text-xs text-orange-400 font-bold mb-3">سوال {current + 1}</p>
            <h3 className="text-white font-black text-base leading-relaxed">
              {questions[current].q}
            </h3>
          </div>

          {/* گزینه‌ها */}
          <div className="space-y-2.5">
            {questions[current].options.map((opt, i) => {
              let btnClass = "app-card border border-slate-700 text-slate-200";
              if (selected !== null) {
                if (i === questions[current].correct) btnClass = "bg-green-500/20 border border-green-500 text-green-300";
                else if (i === selected) btnClass = "bg-red-500/20 border border-red-500 text-red-300";
                else btnClass = "bg-slate-800/40 border border-slate-700 text-slate-500";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={selected !== null}
                  className={`w-full ${btnClass} rounded-2xl p-4 text-right flex items-center gap-3 transition-all`}
                >
                  {selected !== null && i === questions[current].correct && <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />}
                  {selected !== null && i === selected && i !== questions[current].correct && <XCircle size={16} className="text-red-400 flex-shrink-0" />}
                  <span className="text-sm font-bold">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* امتیاز فعلی */}
          <div className="text-center text-xs text-slate-500">
            امتیاز فعلی: <span className="text-orange-400 font-black">{score}</span>
          </div>
        </div>
      )}
    </div>
  );
}
