"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  LayoutDashboard, User, Wallet, Bell,
  LogOut, ChevronLeft, Compass, Gamepad2, Home,
  ChevronRight, Shield, AlertTriangle
} from "lucide-react";
import { isAdminPhone } from "@/lib/api";
import { useState } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";

const NAV_ITEMS = [
  { href: "/dashboard",               label: "داشبورد",      icon: LayoutDashboard },
  { href: "/dashboard/profile",       label: "پروفایل",      icon: User            },
  { href: "/dashboard/explore",       label: "کشف همنشینی",  icon: Compass         },
  { href: "/dashboard/game",          label: "بازی‌ها",      icon: Gamepad2        },
  { href: "/dashboard/wallet",        label: "کیف پول",      icon: Wallet          },
  { href: "/dashboard/notifications", label: "اعلان‌ها",    icon: Bell            },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, dispatch } = useApp();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const userName = state.user?.name || "کاربر راوی";
  const initial = userName.charAt(0);
  const isAdmin = isAdminPhone(state.user?.mobileNumber);

  const currentPage = NAV_ITEMS.find(
    (n) => pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(n.href))
  );

  async function handleLogout() {
    try {
      // Attempt server-side session invalidation
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    } catch {}

    // Clear ALL auth storage
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("city");
      sessionStorage.clear();
      // Clear auth cookies
      document.cookie = "token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      document.cookie = "session=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }

    dispatch?.({ type: "LOGOUT" } as any);

    // Replace history so back-button won't return to dashboard
    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen pb-[68px] lg:pb-0 relative" dir="rtl">
      {/* Animated 3D background on all dashboard pages */}
      <AnimatedBackground />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-3xl p-6 max-w-sm w-full border border-white/10 shadow-2xl"
            style={{ background: "linear-gradient(145deg, #1B2A4A, #0f172a)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
                <AlertTriangle size={22} className="text-red-400" />
              </div>
              <div>
                <h3 className="font-black text-white text-base">خروج از حساب</h3>
                <p className="text-slate-400 text-xs mt-0.5">آیا مطمئن هستید؟</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm mb-6">
              با خروج، تمام اطلاعات جلسه پاک می‌شود و باید مجدداً وارد شوید.
            </p>
            <div className="flex gap-3">
              <button onClick={handleLogout}
                className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black text-sm transition-all">
                بله، خروج
              </button>
              <button onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 rounded-2xl font-black text-sm text-slate-300 transition-all"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden lg:flex flex-col w-72 border-l border-white/10 sticky top-0 h-screen z-30 shadow-2xl"
        style={{ background: "linear-gradient(180deg, #0f172a 0%, #0a0f1e 100%)" }}
      >
        {/* Logo + Brand — single logo */}
        <div className="px-5 py-5 border-b border-white/8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/40 flex-shrink-0 transition-transform group-hover:scale-105"
              style={{ background: "linear-gradient(135deg, #FF6B00, #FF9A3C)" }}>
              <img src="/logo.JPG" alt="راوی" className="w-full h-full rounded-2xl object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
            <div>
              <p className="font-black text-white text-xl leading-none tracking-wide">راوی</p>
              <p className="text-[11px] text-slate-500 mt-0.5 group-hover:text-orange-400/70 transition-colors">بازگشت به خانه</p>
            </div>
          </Link>
        </div>

        {/* User Card */}
        <div className="px-4 py-4 border-b border-white/8">
          <div className="flex items-center gap-3 p-3 rounded-2xl border"
            style={{ background: "rgba(255,107,0,0.07)", borderColor: "rgba(255,107,0,0.15)" }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/30">
              <span className="text-base font-black text-white">{initial}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-black text-white text-sm truncate">{userName}</p>
              <p className="text-[11px] text-slate-500 truncate">{state.user?.mobileNumber}</p>
            </div>
            {isAdmin && (
              <span className="text-[10px] font-black bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30">
                ادمین
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group relative overflow-hidden ${
                  active ? "text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
                style={active ? { background: "linear-gradient(135deg, rgba(255,107,0,0.9), rgba(255,107,0,0.7))", boxShadow: "0 4px 20px rgba(255,107,0,0.3)" } : {}}
              >
                {active && <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-transparent pointer-events-none" />}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                  active ? "bg-white/20" : "bg-white/5 group-hover:bg-white/10"
                }`}>
                  <Icon size={15} />
                </div>
                <span className="relative z-10">{label}</span>
                {active && <ChevronLeft size={14} className="mr-auto relative z-10" />}
              </Link>
            );
          })}

          {/* Admin link */}
          {isAdmin && (
            <>
              <div className="border-t border-white/8 my-2" />
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <Shield size={15} />
                </div>
                پنل ادمین
              </Link>
            </>
          )}
        </nav>

        {/* Footer — Home + Logout */}
        <div className="px-4 pb-5 pt-3 border-t border-white/8 space-y-1">
          <Link href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <Home size={16} />
            صفحه اصلی
          </Link>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} />
            خروج از حساب
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 min-w-0 flex flex-col relative z-10">
        {/* Top Header Bar — no logo duplication on desktop */}
        <header
          className="sticky top-0 z-40 border-b px-4 lg:px-6 py-3.5 flex items-center justify-between"
          style={{
            background: "rgba(9,14,28,0.92)",
            backdropFilter: "blur(16px)",
            borderColor: "rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile-only logo (desktop shows sidebar logo) */}
            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <div className="w-8 h-8 rounded-xl overflow-hidden shadow-lg shadow-orange-500/30"
                style={{ background: "linear-gradient(135deg,#FF6B00,#FF9A3C)" }}>
                <img src="/logo.JPG" alt="راوی" className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display="none"; }} />
              </div>
              <span className="font-black text-white text-sm">راوی</span>
            </Link>

            {/* Desktop breadcrumb — text only, no duplicate logo */}
            <div className="hidden lg:flex items-center gap-2 text-sm">
              <Link href="/" className="text-slate-500 hover:text-orange-400 transition-colors flex items-center gap-1">
                <Home size={13} />
                <span>خانه</span>
              </Link>
              <ChevronLeft size={13} className="text-slate-600" />
              <span className="text-slate-500">داشبورد</span>
              {currentPage && pathname !== "/dashboard" && (
                <>
                  <ChevronLeft size={13} className="text-slate-600" />
                  <span className="text-orange-400 font-bold">{currentPage.label}</span>
                </>
              )}
            </div>

            {/* Mobile page title */}
            <span className="lg:hidden text-white font-black text-sm">
              {currentPage?.label || "داشبورد"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/notifications"
              className="w-9 h-9 rounded-xl border flex items-center justify-center text-slate-400 hover:text-orange-400 transition-all"
              style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}
            >
              <Bell size={16} />
            </Link>
            {/* Mobile logout */}
            <button onClick={() => setShowLogoutConfirm(true)}
              className="lg:hidden w-9 h-9 rounded-xl border flex items-center justify-center text-slate-400 hover:text-red-400 transition-all"
              style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
              <LogOut size={15} />
            </button>
            <Link href="/dashboard/profile">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25 cursor-pointer hover:scale-105 transition-transform">
                <span className="text-sm font-black text-white">{initial}</span>
              </div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 lg:p-6 relative z-10">
          {children}
        </div>
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t"
        style={{ background: "rgba(7,11,22,0.97)", backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center h-[68px] px-1">
          {NAV_ITEMS.slice(0, 5).map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all ${
                  active ? "text-orange-400" : "text-slate-600 hover:text-slate-400"
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${active ? "bg-orange-500/20" : ""}`}>
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-bold leading-none ${active ? "text-orange-400" : ""}`}>
                  {label.length > 5 ? label.slice(0,5)+"…" : label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
