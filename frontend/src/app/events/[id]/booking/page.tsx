"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import {
  ArrowRight, MapPin, Clock, Users, Lock,
  AlertCircle, CheckCircle2, CreditCard, Sparkles, Shield,
} from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const MOCK_EVENTS: Record<string, any> = {
  "ev-1": { id: "ev-1", title: "دورهمی همبازی (بردگیم‌های گروهی)", price: 150000, capacity: 12, current_bookings: 12, city: "تهران", start_date: "2024-02-23T15:00:00" },
  "ev-2": { id: "ev-2", title: "هم‌بازی ۲۴ بهمن (مافیا)", price: 80000, capacity: 14, current_bookings: 10, city: "تهران", start_date: "2024-02-24T17:00:00" },
  "ev-6": { id: "ev-6", title: "دورهمی همنشین آخر هفته", price: 90000, capacity: 10, current_bookings: 5, city: "تهران", start_date: "2024-02-25T18:30:00" },
  "ev-7": { id: "ev-7", title: "قهوه و گفتگو", price: 60000, capacity: 8, current_bookings: 3, city: "تهران", start_date: "2024-02-25T16:00:00" },
  "ev-9": { id: "ev-9", title: "پیاده‌روی بامدادی توچال", price: 40000, capacity: 15, current_bookings: 11, city: "تهران", start_date: "2024-02-24T07:00:00" },
  "ev-11": { id: "ev-11", title: "کارگاه عکاسی موبایل", price: 180000, capacity: 8, current_bookings: 5, city: "تهران", start_date: "2024-02-23T14:00:00" },
  "ev-14": { id: "ev-14", title: "نشست ایده‌پردازی", price: 50000, capacity: 16, current_bookings: 9, city: "تهران", start_date: "2024-02-25T18:00:00" },
  "ev-15": { id: "ev-15", title: "فوتبال دوستانه", price: 30000, capacity: 14, current_bookings: 8, city: "تهران", start_date: "2024-02-24T09:00:00" },
};

function formatPrice(p: number) {
  return Number(p).toLocaleString("fa-IR") + " تومان";
}
function formatDate(d: string) {
  try { return new Date(d).toLocaleDateString("fa-IR", { weekday: "long", month: "long", day: "numeric" }); } catch { return d; }
}
function formatTime(d: string) {
  try { return new Date(d).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }); } catch { return ""; }
}

export default function BookingPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { state } = useApp();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"details" | "confirm" | "processing">("details");

  useEffect(() => {
    if (MOCK_EVENTS[id]) { setEvent(MOCK_EVENTS[id]); setLoading(false); return; }
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const ctrl = new AbortController();
    fetch(`${API_URL}/api/events/${id}`, {
      signal: ctrl.signal,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data) => { if (data?.id) setEvent(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [id]);

  async function handleReserve() {
    if (!state.isLoggedIn) { router.push("/login"); return; }
    setError("");
    setStep("processing");
    setBooking(true);
    try {
      const token = localStorage.getItem("token");
      const callbackUrl = `${window.location.origin}/payment-success`;
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ eventId: id, callbackUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "خطا در ثبت رزرو");
      if (data?.paymentUrl) { window.location.href = data.paymentUrl; return; }
      throw new Error("آدرس درگاه پرداخت دریافت نشد");
    } catch (e: any) {
      setError(e?.message || "خطا در پردازش");
      setStep("confirm");
    } finally {
      setBooking(false);
    }
  }

  const CARD: any = { background: "linear-gradient(145deg, #1B2A4A 0%, #132038 100%)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
      <div className="rounded-3xl p-8 text-center max-w-sm w-full" style={CARD}>
        <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-black text-white mb-4">همنشینی یافت نشد</h2>
        <Link href="/events" className="inline-block bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-orange-400 transition">بازگشت</Link>
      </div>
    </div>
  );

  const isFull = (event.current_bookings ?? 0) >= event.capacity;
  const remaining = Math.max(0, event.capacity - (event.current_bookings ?? 0));
  const price = Number(event.price || 0);

  return (
    <div className="min-h-screen pb-24 relative" dir="rtl">
      <AnimatedBackground />
      <div className="relative z-10 max-w-lg mx-auto px-4 pt-4">
        <Link href={`/events/${id}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-bold mb-4 transition-colors">
          <ArrowRight size={16} />بازگشت به جزئیات
        </Link>

        {/* Event Summary */}
        <div className="rounded-3xl p-5 mb-4" style={CARD}>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,107,0,0.2)", border: "1px solid rgba(255,107,0,0.3)" }}>
              <Sparkles size={20} className="text-orange-400" />
            </div>
            <div>
              <h1 className="font-black text-white text-base leading-snug mb-1">{event.title}</h1>
              {event.city && <div className="flex items-center gap-1 text-xs text-slate-400"><MapPin size={11} className="text-orange-400" />{event.city}</div>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {event.start_date && (
              <div className="rounded-xl p-3" style={{ background: "rgba(0,0,0,0.2)" }}>
                <p className="text-[10px] text-slate-500 mb-0.5">تاریخ</p>
                <p className="text-xs font-bold text-white">{formatDate(event.start_date)}</p>
                <p className="text-xs text-orange-400 font-bold mt-0.5">⏰ {formatTime(event.start_date)}</p>
              </div>
            )}
            <div className="rounded-xl p-3" style={{ background: "rgba(0,0,0,0.2)" }}>
              <p className="text-[10px] text-slate-500 mb-0.5">ظرفیت باقی‌مانده</p>
              <p className="text-sm font-black text-white">{remaining} نفر</p>
              <p className="text-[10px] text-orange-400 mt-0.5">{isFull ? "تکمیل ظرفیت" : `از ${event.capacity} نفر`}</p>
            </div>
          </div>

          <div className="mt-3 rounded-xl p-3 flex items-center gap-2" style={{ background: "rgba(255,107,0,0.08)", border: "1px dashed rgba(255,107,0,0.2)" }}>
            <Lock size={12} className="text-orange-400 flex-shrink-0" />
            <p className="text-[11px] text-slate-400">آدرس دقیق ۱۰ ساعت قبل از شروع در داشبورد نمایش داده می‌شود</p>
          </div>
        </div>

        {/* Payment Card */}
        <div className="rounded-3xl p-5 mb-4" style={CARD}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs text-slate-500 mb-1">هزینه شرکت</p>
              <p className="text-3xl font-black text-white">{formatPrice(price)}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">این مبلغ در درگاه پرداخت نمایش داده می‌شود</p>
            </div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,107,0,0.2)", border: "1px solid rgba(255,107,0,0.3)" }}>
              <CreditCard size={24} className="text-orange-400" />
            </div>
          </div>

          {[
            { icon: Shield, text: "پرداخت امن از طریق درگاه بانکی معتبر" },
            { icon: CheckCircle2, text: "مبلغ نمایش داده شده دقیقاً همان مبلغ پرداخت است" },
            { icon: Users, text: "در صورت لغو، هزینه به کیف پول برمی‌گردد" },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-400 mb-2">
              <Icon size={12} className="text-green-400 flex-shrink-0" />
              {text}
            </div>
          ))}

          {error && (
            <div className="rounded-xl p-3 my-3 flex items-center gap-2" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
              <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <div className="mt-5">
            {isFull ? (
              <div className="w-full rounded-2xl py-4 text-center font-black text-base text-slate-500" style={{ background: "rgba(255,255,255,0.05)" }}>ظرفیت تکمیل است</div>
            ) : step === "processing" ? (
              <div className="w-full rounded-2xl py-4 bg-orange-500/50 text-white font-black text-base text-center flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                در حال انتقال به درگاه...
              </div>
            ) : step === "details" ? (
              <button onClick={() => { if (!state.isLoggedIn) { router.push("/login"); return; } setStep("confirm"); }}
                className="w-full rounded-2xl py-4 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-black text-base transition-all shadow-xl shadow-orange-500/30">
                ادامه و رزرو ← {formatPrice(price)}
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-center text-sm font-bold text-white">آیا از رزرو این همنشینی مطمئن هستید؟</p>
                <p className="text-center text-xs text-slate-500">پس از کلیک به درگاه پرداخت {formatPrice(price)} منتقل می‌شوید</p>
                <button onClick={handleReserve} disabled={booking}
                  className="w-full rounded-2xl py-4 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-black text-base transition-all shadow-xl shadow-orange-500/30">
                  تأیید و پرداخت {formatPrice(price)}
                </button>
                <button onClick={() => setStep("details")}
                  className="w-full rounded-2xl py-3 font-bold text-sm text-slate-400 hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  انصراف
                </button>
              </div>
            )}
          </div>
        </div>

        {!state.isLoggedIn && (
          <div className="rounded-2xl p-4 flex items-center gap-3 mb-4" style={{ background: "rgba(255,107,0,0.1)", border: "1px dashed rgba(255,107,0,0.3)" }}>
            <AlertCircle size={18} className="text-orange-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">ورود لازم است</p>
              <p className="text-xs mt-0.5 text-slate-400">برای رزرو باید وارد حساب کاربری شوید.</p>
            </div>
            <Link href="/login" className="text-xs font-black text-orange-400 hover:text-orange-300 transition whitespace-nowrap">ورود →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
