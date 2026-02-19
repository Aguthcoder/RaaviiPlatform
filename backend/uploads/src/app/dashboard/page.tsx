"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import {
  fetchMyBookings,
  fetchEventLocation,
  Booking,
  ApiEvent,
  fetchEventById,
} from "@/lib/api";
import { MapPin, Clock, Lock, Calendar, ChevronLeft, AlertCircle } from "lucide-react";

interface BookingWithEvent extends Booking {
  eventData?: ApiEvent;
  locationInfo?: {
    location: string | null;
    revealed: boolean;
    minutesRemaining: number;
  };
}

function toPersianDigits(n: number | string): string {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
}

function formatMinutes(mins: number): string {
  if (mins <= 0) return "هم‌اکنون";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return `${toPersianDigits(h)} ساعت و ${toPersianDigits(m)} دقیقه`;
  return `${toPersianDigits(m)} دقیقه`;
}

export default function DashboardPage() {
  const { state } = useApp();
  const [bookings, setBookings] = useState<BookingWithEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookings() {
      try {
        const rawBookings = await fetchMyBookings();
        const activeBookings = rawBookings.filter(
          (b) => b.status !== "cancelled"
        );

        const enriched = await Promise.all(
          activeBookings.map(async (b) => {
            try {
              const eventId = b.eventId || b.event_id || "";
              const [eventData, locationInfo] = await Promise.all([
                fetchEventById(eventId).catch(() => undefined),
                fetchEventLocation(eventId).catch(() => undefined),
              ]);
              return { ...b, eventData, locationInfo } as BookingWithEvent;
            } catch {
              return b as BookingWithEvent;
            }
          })
        );

        setBookings(enriched);
      } catch {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    }

    if (state.isLoggedIn) {
      loadBookings();
    } else {
      setLoading(false);
    }
  }, [state.isLoggedIn]);

  if (!state.isLoggedIn) {
    return (
      <div className="app-card rounded-3xl p-8 text-center">
        <AlertCircle size={48} className="text-orange-400 mx-auto mb-4" />
        <h2 className="text-xl font-black text-white mb-2">ورود لازم است</h2>
        <p className="text-slate-400 mb-6">برای مشاهده داشبورد وارد شوید.</p>
        <Link
          href="/login"
          className="inline-block bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-orange-400 transition"
        >
          ورود به حساب
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24">
      {/* خوش‌آمد */}
      <section className="app-card rounded-3xl p-6">
        <h2 className="text-2xl font-black text-white">
          سلام، {state.user?.name || "کاربر راوی"} 👋
        </h2>
        <p className="text-slate-300 mt-1 text-sm">
          اطلاعات خصوصی همنشینی رزروشده فقط در این داشبورد نمایش داده می‌شود.
        </p>
        <Link
          href="/events"
          className="inline-block mt-4 bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-400 transition"
        >
          رفتن به رویدادها
        </Link>
      </section>

      {/* رویدادهای رزرو شده */}
      <section>
        <h3 className="text-lg font-black text-slate-800 mb-3 px-1">
          رویدادهای رزرو شده من
        </h3>

        {loading ? (
          <div className="app-card rounded-3xl p-8 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="app-card rounded-3xl p-8 text-center">
            <Calendar size={40} className="text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">هنوز رویدادی رزرو نکرده‌اید.</p>
            <Link
              href="/events"
              className="inline-block mt-4 bg-orange-500/20 text-orange-400 px-5 py-2 rounded-xl font-bold text-sm border border-orange-500/30"
            >
              رزرو اولین رویداد
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => {
              const event = booking.eventData;
              const loc = booking.locationInfo;
              const title = event?.title || "رویداد رزرو شده";
              const date = event?.startDate || event?.start_date;
              const isPaid = booking.payment_status === "paid";

              return (
                <div key={booking.id} className="app-card rounded-3xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-white text-sm line-clamp-2">
                        {title}
                      </h4>

                      {date && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                          <Clock size={12} />
                          <span>
                            {new Date(date).toLocaleDateString("fa-IR", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      )}

                      {/* لوکیشن با منطق مخفی‌سازی */}
                      <div className="mt-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700">
                        {loc?.revealed ? (
                          <div className="flex items-start gap-2">
                            <MapPin size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-slate-400 mb-0.5">محل برگزاری</p>
                              <p className="text-sm font-bold text-white">{loc.location}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2">
                            <Lock size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-slate-400 mb-0.5">محل برگزاری</p>
                              {loc && loc.minutesRemaining > 0 ? (
                                <p className="text-xs text-slate-500">
                                  🔒 تا{" "}
                                  <span className="text-orange-400 font-bold">
                                    {formatMinutes(loc.minutesRemaining - 600)}
                                  </span>{" "}
                                  دیگر نمایش داده می‌شود
                                </p>
                              ) : (
                                <p className="text-xs text-slate-500">
                                  🔒 آدرس ۱۰ ساعت قبل از شروع نمایش داده می‌شود
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex flex-col items-end gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          booking.status === "confirmed"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : booking.status === "pending"
                            ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                            : "bg-slate-700 text-slate-400"
                        }`}
                      >
                        {booking.status === "confirmed"
                          ? "تأیید شده"
                          : booking.status === "pending"
                          ? "در انتظار"
                          : booking.status}
                      </span>

                      {isPaid && (
                        <span className="text-xs text-green-400 font-bold">✓ پرداخت شده</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
