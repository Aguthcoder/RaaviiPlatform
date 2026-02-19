"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import {
  fetchMyBookings, fetchEventLocation, fetchEventById,
  isAdminPhone, Booking, ApiEvent,
} from "@/lib/api";
import {
  MapPin, Clock, Lock, Calendar, ChevronLeft,
  AlertCircle, Sparkles, Home, BarChart2, Gamepad2,
  TrendingUp, Star, CheckCircle2
} from "lucide-react";

interface BookingWithEvent extends Booking {
  eventData?: ApiEvent;
  locationInfo?: { location: string | null; revealed: boolean; minutesRemaining: number };
}

const toPersian = (n: number | string) =>
  String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

const fmtMins = (mins: number) => {
  if (mins <= 0) return "هم‌اکنون";
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${toPersian(h)}h ${toPersian(m)}m` : `${toPersian(m)} دقیقه`;
};

// Navy blue stat card
function StatCard({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #1B2A4A 0%, #132038 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
      }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "rgba(255,107,0,0.4)" }} />
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl font-black text-white">{value}</span>
        <div className="text-orange-400">{icon}</div>
      </div>
      <p className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { state } = useApp();
  const [bookings, setBookings] = useState<BookingWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = isAdminPhone(state.user?.mobileNumber);

  useEffect(() => {
    if (!state.isLoggedIn) { setLoading(false); return; }
    (async () => {
      try {
        const raw = await fetchMyBookings();
        const active = raw.filter((b) => b.status !== "cancelled");
        const enriched = await Promise.all(
          active.map(async (b) => {
            try {
              const eventId = b.eventId || b.event_id || "";
              const [eventData, locationInfo] = await Promise.all([
                fetchEventById(eventId).catch(() => undefined),
                fetchEventLocation(eventId).catch(() => undefined),
              ]);
              return { ...b, eventData, locationInfo } as BookingWithEvent;
            } catch { return b as BookingWithEvent; }
          })
        );
        setBookings(enriched);
      } catch { setBookings([]); }
      finally { setLoading(false); }
    })();
  }, [state.isLoggedIn]);

  if (!state.isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="rounded-3xl p-8 text-center max-w-sm w-full"
          style={{ background: "linear-gradient(145deg, #1B2A4A, #0f172a)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(255,107,0,0.2)", border: "1px solid rgba(255,107,0,0.3)" }}>
            <AlertCircle size={32} className="text-orange-400" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">ورود لازم است</h2>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>برای مشاهده داشبورد وارد شوید.</p>
          <Link href="/login"
            className="inline-block bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-orange-400 transition w-full text-center shadow-lg shadow-orange-500/30">
            ورود به حساب
          </Link>
        </div>
      </div>
    );
  }

  const paidCount = bookings.filter(b => b.payment_status === "paid").length;
  const revealedCount = bookings.filter(b => b.locationInfo?.revealed).length;

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-8">

      {/* ── Welcome Hero — Navy Blue ── */}
      <div className="rounded-3xl p-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1B2A4A 0%, #0f172a 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
        }}>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-5 -left-5 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs mb-1 flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.55)" }}>
              <Star size={11} className="text-orange-400" />
              {isAdmin ? "حساب مدیریتی" : "حساب کاربری"}
            </p>
            <h2 className="text-2xl font-black text-white leading-tight">
              سلام، {state.user?.name?.split(" ")[0] || "کاربر"} 👋
            </h2>
            <p className="text-xs mt-1.5 max-w-[200px]" style={{ color: "rgba(255,255,255,0.5)" }}>
              {isAdmin ? "پنل مدیریت راوی" : "همنشینی‌های رزرو شده شما اینجاست"}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-500/40 flex-shrink-0">
            <span className="text-2xl font-black text-white">{(state.user?.name || "ک").charAt(0)}</span>
          </div>
        </div>

        <div className="relative z-10 mt-5 flex flex-wrap gap-2">
          <Link href="/events"
            className="flex items-center gap-1.5 bg-orange-500 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-orange-400 transition shadow-lg shadow-orange-500/30">
            <Calendar size={13} />
            رزرو همنشینی
          </Link>
          <Link href="/"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition"
            style={{ color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <Home size={13} />
            صفحه اصلی
          </Link>
          {isAdmin && (
            <Link href="/admin/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs text-orange-400 hover:bg-orange-500/10 transition"
              style={{ border: "1px solid rgba(255,107,0,0.3)" }}>
              <BarChart2 size={13} />
              پنل ادمین
            </Link>
          )}
        </div>
      </div>

      {/* ── Stats Grid — Navy Blue Cards ── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard value={toPersian(bookings.length)} label="رزرو فعال" icon={<Calendar size={16} />} />
        <StatCard value={toPersian(paidCount)} label="پرداخت شده" icon={<CheckCircle2 size={16} />} />
        <StatCard value={toPersian(revealedCount)} label="آدرس فعال" icon={<MapPin size={16} />} />
      </div>

      {/* ── Bookings List ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-white text-base flex items-center gap-2">
            <Sparkles size={16} className="text-orange-400" />
            همنشینی‌های من
          </h3>
          <Link href="/events" className="text-xs text-orange-400 font-bold flex items-center gap-1 hover:gap-2 transition-all">
            همه همنشینی‌ها <ChevronLeft size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl p-10 flex items-center justify-center"
            style={{ background: "rgba(27,42,74,0.5)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-3xl p-8 text-center"
            style={{ background: "rgba(27,42,74,0.5)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Calendar size={24} className="text-slate-500" />
            </div>
            <p className="text-white font-bold mb-1 text-sm">هنوز همنشینی‌ای رزرو نکرده‌اید</p>
            <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.45)" }}>اولین همنشینی خود را انتخاب کنید!</p>
            <Link href="/events"
              className="inline-block bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-400 transition shadow-lg shadow-orange-500/30">
              رزرو همنشینی
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => {
              const event = booking.eventData;
              const loc = booking.locationInfo;
              const title = event?.title || "همنشینی رزرو شده";
              const date = event?.startDate || event?.start_date;
              const isPaid = booking.payment_status === "paid";
              const confirmed = booking.status === "confirmed";

              return (
                <div key={booking.id}
                  className="rounded-3xl p-5 hover:border-orange-500/20 transition-all"
                  style={{
                    background: "linear-gradient(145deg, #1B2A4A, #132038)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                  }}>
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(255,107,0,0.15)", border: "1px solid rgba(255,107,0,0.25)" }}>
                      <Sparkles size={18} className="text-orange-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-black text-white text-sm leading-snug line-clamp-2 flex-1">
                          {title}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 border ${
                          confirmed
                            ? "bg-green-500/15 text-green-400 border-green-500/25"
                            : "bg-orange-500/15 text-orange-400 border-orange-500/25"
                        }`}>
                          {confirmed ? "✓ تأیید" : "در انتظار"}
                        </span>
                      </div>

                      {date && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                          <Clock size={11} />
                          {new Date(date).toLocaleDateString("fa-IR", { weekday: "long", month: "long", day: "numeric" })}
                        </div>
                      )}

                      {isPaid && (
                        <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                          <CheckCircle2 size={10} /> پرداخت شده
                        </span>
                      )}

                      <div className="mt-3 p-3 rounded-2xl"
                        style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        {loc?.revealed ? (
                          <div className="flex items-start gap-2">
                            <MapPin size={13} className="text-orange-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-[10px] mb-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>محل برگزاری</p>
                              <p className="text-sm font-bold text-white">{loc.location}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2">
                            <Lock size={13} className="text-slate-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-[10px] mb-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>محل برگزاری</p>
                              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                                🔒 {loc && loc.minutesRemaining > 600
                                  ? <>تا <span className="text-orange-400 font-bold">{fmtMins(loc.minutesRemaining - 600)}</span> دیگر نمایش داده می‌شود</>
                                  : "آدرس ۱۰ ساعت قبل از شروع نمایش داده می‌شود"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Quick Links — Navy Blue ── */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/dashboard/game"
          className="rounded-2xl p-4 hover:border-purple-500/30 transition-all group"
          style={{
            background: "linear-gradient(145deg, #1B2A4A, #132038)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
            style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)" }}>
            <Gamepad2 size={18} className="text-orange-400" />
          </div>
          <p className="font-black text-white text-sm">بازی‌ها</p>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>پرسش و پاسخ همنشینی</p>
        </Link>

        <Link href="/dashboard/explore"
          className="rounded-2xl p-4 hover:border-blue-500/30 transition-all group"
          style={{
            background: "linear-gradient(145deg, #1B2A4A, #132038)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
            style={{ background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.3)" }}>
            <TrendingUp size={18} className="text-orange-400" />
          </div>
          <p className="font-black text-white text-sm">کشف</p>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>همنشینی‌های پیشنهادی</p>
        </Link>
      </div>
    </div>
  );
}
