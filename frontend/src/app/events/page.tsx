"use client";

import { useEffect, useState } from "react";
import { fetchEvents, reserveEvent, ApiEvent } from "@/lib/api";

export default function EventsPage() {
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents({ limit: 20 })
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

  const reserve = async (eventId: string) => {
    try {
      await reserveEvent(eventId, 1);
      setMessage("رزرو با موفقیت انجام شد");
      const fresh = await fetchEvents({ limit: 20 });
      setEvents(fresh);
    } catch {
      setMessage("رزرو انجام نشد (احراز هویت یا ظرفیت را بررسی کنید)");
    }
  };

  return (
    <div className="min-h-screen p-4 pb-24 text-slate-900">
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-3xl font-black">رویدادها</h1>
        <p className="text-sm text-slate-600">ایونت گروهی، ظرفیت، رزرو و پرداخت</p>
        {message ? <div className="rounded-xl bg-orange-100 p-3 text-sm">{message}</div> : null}
        {loading ? <p>در حال بارگذاری...</p> : null}
        {events.map((event) => {
          const remaining = event.capacity - event.reservedCount;
          return (
            <div key={event.id} className="rounded-2xl border bg-white p-4 shadow-sm">
              <h2 className="text-xl font-bold">{event.title}</h2>
              <p className="text-sm text-slate-500">{new Date(event.startDate).toLocaleString("fa-IR")}</p>
              <p className="mt-2 text-sm">{event.description || "توضیحی ثبت نشده است."}</p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span>ظرفیت باقی‌مانده: {remaining}</span>
                <span>هزینه: {event.price.toLocaleString("fa-IR")} تومان</span>
              </div>
              <button disabled={remaining <= 0} onClick={() => reserve(event.id)} className="mt-3 rounded-xl bg-orange-500 px-4 py-2 text-white disabled:bg-slate-400">
                {remaining > 0 ? "رزرو" : "تکمیل ظرفیت"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
