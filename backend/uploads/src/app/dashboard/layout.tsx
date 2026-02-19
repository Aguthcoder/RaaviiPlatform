"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  LayoutDashboard, User, Calendar, Wallet, Bell,
  LogOut, ChevronLeft, Compass, Zap, Home
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "داشبورد", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "پروفایل", icon: User },
  { href: "/dashboard/explore", label: "کشف همنشینی", icon: Compass },
  { href: "/dashboard/wallet", label: "کیف پول", icon: Wallet },
  { href: "/dashboard/notifications", label: "اعلان‌ها", icon: Bell },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, dispatch } = useApp();
  const userName = state.user?.name || "کاربر راوی";
  const initial = userName.charAt(0);

  function handleLogout() {
    if (typeof window !== "undefined") localStorage.removeItem("token");
    dispatch?.({ type: "LOGOUT" } as any);
    router.push("/");
  }

  return (
    <div className="flex min-h-screen bg-slate-950 pb-20 lg:pb-0" dir="rtl">
      {/* ── سایدبار دسکتاپ ── */}
      <aside
        className="hidden lg:flex flex-col w-64 border-l border-slate-800/60 sticky top-0 h-screen"
        style={{ background: "linear-gradient(180deg, #0f172a 0%, #0a0f1e 100%)" }}
      >
        {/* کاربر */}
        <div className="px-4 py-4 border-b border-slate-800/60">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/40">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-sm font-black text-white">{initial}</span>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white text-sm truncate">{userName}</p>
              <p className="text-xs text-slate-500 truncate">{state.user?.mobileNumber}</p>
            </div>
          </div>
        </div>

        {/* منو - لوگو مستقیم بالای آیتم‌ها */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {/* ── لوگوی راوی بالای منو ── */}
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 mb-3 rounded-2xl bg-slate-800/60 border border-slate-700/40 hover:bg-orange-500/10 hover:border-orange-500/30 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 flex-shrink-0">
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <p className="font-black text-white text-base leading-none">راوی</p>
              <p className="text-xs text-slate-500 mt-0.5 group-hover:text-orange-400/70 transition-colors">بازگشت به خانه</p>
            </div>
          </Link>

          <div className="border-t border-slate-800/40 mb-2" />

          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all group ${
                  active
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                }`}
              >
                <Icon
                  size={17}
                  className={
                    active
                      ? "text-white"
                      : "text-slate-500 group-hover:text-slate-300"
                  }
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* خروج */}
        <div className="px-3 pb-4 border-t border-slate-800/60 pt-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={17} />
            خروج از حساب
          </button>
        </div>
      </aside>

      {/* ── محتوای اصلی ── */}
      <main className="flex-1 min-w-0">
        {/* هدر */}
        <header
          className="sticky top-0 z-40 border-b border-slate-800/60 px-5 py-3.5 flex items-center justify-between"
          style={{ background: "rgba(15, 23, 42, 0.95)", backdropFilter: "blur(12px)" }}
        >
          <div className="flex items-center gap-3">
            {/* لوگو موبایل - کلیک برای صفحه اصلی */}
            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Zap size={15} className="text-white" />
              </div>
              <span className="font-black text-white text-sm">راوی</span>
            </Link>
            {/* بردکرامب دسکتاپ */}
            <div className="hidden lg:flex items-center gap-2 text-sm">
              <Link href="/" className="text-slate-500 hover:text-orange-400 transition-colors flex items-center gap-1">
                <Home size={13} />
                خانه
              </Link>
              <ChevronLeft size={14} className="text-slate-600" />
              <span className="text-slate-500">داشبورد</span>
              {pathname !== "/dashboard" && (
                <>
                  <ChevronLeft size={14} className="text-slate-600" />
                  <span className="text-orange-400 font-bold">
                    {NAV_ITEMS.find(
                      (n) =>
                        pathname.startsWith(n.href) &&
                        n.href !== "/dashboard"
                    )?.label || "صفحه"}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/notifications"
              className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-orange-400 hover:border-orange-500/50 transition-all"
            >
              <Bell size={16} />
            </Link>
            <Link href="/dashboard/profile">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 cursor-pointer">
                <span className="text-sm font-black text-white">{initial}</span>
              </div>
            </Link>
          </div>
        </header>

        <div className="p-4 lg:p-6">{children}</div>
      </main>

      {/* ── نوار پایین موبایل ── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800/80"
        style={{ background: "rgba(10, 15, 30, 0.97)", backdropFilter: "blur(16px)" }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                  active ? "text-orange-400" : "text-slate-600 hover:text-slate-400"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${active ? "bg-orange-500/20" : ""}`}>
                  <Icon size={18} />
                </div>
                <span className="text-[10px] font-bold">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
