"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { fetchAdminStats, fetchMyAdminEvents, AdminEventStat, ApiEvent, isAdminPhone } from "@/lib/api";
import { BarChart2, Plus, Calendar, Users, TrendingUp, ChevronRight, Eye, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

function SuccessChart({ events }: { events: AdminEventStat[] }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <BarChart2 size={36} className="text-slate-600 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">هنوز رویدادی برگزار نشده است.</p>
      </div>
    );
  }

  const maxRate = Math.max(...events.map((e) => e.successRate), 1);

  return (
    <div className="space-y-3">
      {events.map((ev) => (
        <div key={ev.eventId}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-slate-300 truncate max-w-[60%]">{ev.title}</span>
            <span className="text-xs font-black text-orange-400">
              {Math.round(ev.successRate)}٪
            </span>
          </div>
          <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-700"
              style={{ width: `${(ev.successRate / maxRate) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
            <span>{ev.attended} شرکت‌کننده از {ev.reserved} رزرو</span>
            <span>{ev.date}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { state } = useApp();
  const router = useRouter();
  const [stats, setStats] = useState<{ events: AdminEventStat[]; avgSuccessRate: number; totalEvents: number } | null>(null);
  const [myEvents, setMyEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdminPhone(state.user?.mobileNumber)) {
      router.replace("/dashboard");
      return;
    }

    async function loadData() {
      const [statsData, eventsData] = await Promise.all([
        fetchAdminStats().catch(() => ({ events: [], avgSuccessRate: 0, totalEvents: 0 })),
        fetchMyAdminEvents().catch(() => ({ events: [] as ApiEvent[], total: 0 })),
      ]);
      setStats(statsData);
      setMyEvents(eventsData.events.slice(0, 5));
      setLoading(false);
    }
    loadData();
  }, [state.user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-24 space-y-5">
      {/* هدر */}
      <div className="app-card rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">داشبورد ادمین</h1>
            <p className="text-slate-400 text-sm mt-1">
              سلام، {state.user?.name || "ادمین"} عزیز
            </p>
          </div>
          <Link
            href="/admin/events/new"
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-2xl font-bold text-sm hover:bg-orange-400 transition shadow-lg shadow-orange-500/30"
          >
            <Plus size={18} />
            رویداد جدید
          </Link>
        </div>
      </div>

      {/* آمار کلی */}
      <div className="grid grid-cols-3 gap-3">
        <div className="app-card rounded-3xl p-4 flex flex-col items-center gap-1.5">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/20 flex items-center justify-center">
            <Calendar size={20} className="text-orange-400" />
          </div>
          <span className="text-2xl font-black text-white">{stats?.totalEvents || 0}</span>
          <span className="text-xs text-slate-400 text-center">کل رویدادها</span>
        </div>

        <div className="app-card rounded-3xl p-4 flex flex-col items-center gap-1.5">
          <div className="w-10 h-10 rounded-2xl bg-green-500/20 flex items-center justify-center">
            <TrendingUp size={20} className="text-green-400" />
          </div>
          <span className="text-2xl font-black text-white">
            {Math.round(stats?.avgSuccessRate || 0)}٪
          </span>
          <span className="text-xs text-slate-400 text-center">میانگین موفقیت</span>
        </div>

        <div className="app-card rounded-3xl p-4 flex flex-col items-center gap-1.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center">
            <Users size={20} className="text-blue-400" />
          </div>
          <span className="text-2xl font-black text-white">
            {stats?.events.reduce((sum, e) => sum + e.attended, 0) || 0}
          </span>
          <span className="text-xs text-slate-400 text-center">شرکت‌کننده</span>
        </div>
      </div>

      {/* نمودار درصد موفقیت */}
      <div className="app-card rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-orange-500/20 rounded-xl flex items-center justify-center">
            <BarChart2 size={16} className="text-orange-400" />
          </div>
          <h3 className="font-black text-white">درصد موفقیت رویدادها</h3>
        </div>
        <SuccessChart events={stats?.events || []} />
      </div>

      {/* رویدادهای اخیر */}
      <div className="app-card rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-white">رویدادهای اخیر من</h3>
          <Link
            href="/admin/events"
            className="text-orange-400 text-sm font-bold hover:text-orange-300 flex items-center gap-1"
          >
            همه <ChevronRight size={16} />
          </Link>
        </div>

        {myEvents.length === 0 ? (
          <div className="text-center py-6">
            <Calendar size={32} className="text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">هنوز رویدادی ایجاد نکرده‌اید.</p>
            <Link
              href="/admin/events/new"
              className="inline-block mt-3 text-orange-400 font-bold text-sm"
            >
              اولین رویداد را بسازید
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myEvents.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{ev.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ظرفیت: {ev.capacity} نفر |{" "}
                    {ev.current_bookings || ev.reservedCount || 0} رزرو
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/events/${ev.id}`}
                    className="w-8 h-8 bg-slate-700 rounded-xl flex items-center justify-center hover:bg-slate-600 transition"
                  >
                    <Eye size={14} className="text-slate-300" />
                  </Link>
                  {/* دکمه حضور و غیاب */}
                  <Link
                    href={`/admin/attendance/${ev.id}`}
                    className="w-8 h-8 bg-green-500/20 rounded-xl flex items-center justify-center hover:bg-green-500/30 transition"
                    title="حضور و غیاب"
                  >
                    <Users size={14} className="text-green-400" />
                  </Link>
                  <Link
                    href={`/admin/events/${ev.id}/edit`}
                    className="w-8 h-8 bg-orange-500/20 rounded-xl flex items-center justify-center hover:bg-orange-500/30 transition"
                  >
                    <Edit size={14} className="text-orange-400" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
