"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { isAdminPhone } from "@/lib/api";
import { Calendar, Users, Sparkles, ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";

export default function DashboardHomePage() {
  const { state } = useApp();
  const router = useRouter();
  const userName = state.user?.name || "کاربر راوی";
  const isAdmin = isAdminPhone(state.user?.mobileNumber);

  // اگه ادمین بود بره پنل ادمین
  useEffect(() => {
    if (state.isLoading) return;
    if (!state.isLoggedIn) return;
    if (isAdmin) {
      router.replace("/admin/dashboard");
    }
  }, [state.isLoading, state.isLoggedIn, isAdmin]);

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6" dir="rtl">
      {/* خوش‌آمدگویی */}
      <div
        className="rounded-3xl p-6 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.05) 100%)",
          border: "1px solid rgba(249,115,22,0.2)",
        }}
      >
        <div className="relative z-10">
          <p className="text-orange-400 text-sm font-bold mb-1">خوش اومدی 👋</p>
          <h1 className="text-white font-black text-2xl mb-2">{userName}</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            آماده‌ی یه همنشینی جدیدی؟ رویدادهای هفته رو ببین.
          </p>
          {state.city && (
            <div className="flex items-center gap-1.5 mt-3">
              <MapPin size={13} className="text-orange-400" />
              <span className="text-orange-300 text-xs font-bold">
                {state.city}
              </span>
            </div>
          )}
        </div>
        <div
          className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: "rgba(249,115,22,0.08)" }}
        />
      </div>

      {/* دسترسی سریع */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/events"
          className="rounded-2xl p-5 flex items-center gap-4 group transition-all hover:scale-[1.02]"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(249,115,22,0.15)",
              border: "1px solid rgba(249,115,22,0.25)",
            }}
          >
            <Calendar size={22} className="text-orange-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-black text-base">رویدادها</p>
            <p className="text-slate-500 text-xs mt-0.5">رزرو همنشینی</p>
          </div>
          <ArrowLeft
            size={16}
            className="text-slate-600 group-hover:text-orange-400 transition-colors"
          />
        </Link>

        <Link
          href="/dashboard/explore"
          className="rounded-2xl p-5 flex items-center gap-4 group transition-all hover:scale-[1.02]"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.25)",
            }}
          >
            <Users size={22} className="text-indigo-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-black text-base">کشف همنشینی</p>
            <p className="text-slate-500 text-xs mt-0.5">
              پیدا کردن افراد هم‌ذوق
            </p>
          </div>
          <ArrowLeft
            size={16}
            className="text-slate-600 group-hover:text-indigo-400 transition-colors"
          />
        </Link>

        <Link
          href="/dashboard/profile"
          className="rounded-2xl p-5 flex items-center gap-4 group transition-all hover:scale-[1.02]"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(34,197,94,0.15)",
              border: "1px solid rgba(34,197,94,0.25)",
            }}
          >
            <Sparkles size={22} className="text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-black text-base">پروفایل من</p>
            <p className="text-slate-500 text-xs mt-0.5">
              ویرایش اطلاعات و بیو
            </p>
          </div>
          <ArrowLeft
            size={16}
            className="text-slate-600 group-hover:text-green-400 transition-colors"
          />
        </Link>

        <Link
          href="/dashboard/wallet"
          className="rounded-2xl p-5 flex items-center gap-4 group transition-all hover:scale-[1.02]"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(234,179,8,0.15)",
              border: "1px solid rgba(234,179,8,0.25)",
            }}
          >
            <span className="text-yellow-400 text-xl">💰</span>
          </div>
          <div className="flex-1">
            <p className="text-white font-black text-base">کیف پول</p>
            <p className="text-slate-500 text-xs mt-0.5">موجودی و تراکنش‌ها</p>
          </div>
          <ArrowLeft
            size={16}
            className="text-slate-600 group-hover:text-yellow-400 transition-colors"
          />
        </Link>
      </div>
    </div>
  );
}
