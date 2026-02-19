"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Bell, LayoutGrid, Calendar, BarChart2, Plus, Wallet } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ADMIN_PHONES, isAdminPhone } from "@/lib/api";

const USER_NAV = [
  { name: "پروفایل", href: "/dashboard/profile", icon: User },
  { name: "رویدادها", href: "/events", icon: LayoutGrid },
  { name: "کیف پول", href: "/dashboard/wallet", icon: Wallet },
  { name: "اعلان‌ها", href: "/dashboard/notifications", icon: Bell },
];

const ADMIN_NAV = [
  { name: "داشبورد", href: "/admin/dashboard", icon: BarChart2 },
  { name: "رویداد جدید", href: "/admin/events/new", icon: Plus },
  { name: "رویدادهای من", href: "/admin/events", icon: Calendar },
  { name: "اعلان‌ها", href: "/dashboard/notifications", icon: Bell },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { state } = useApp();

  // صفحاتی که نباید نوبار نمایش بدن
  const hiddenPaths = ["/login", "/test", "/(auth)", "/verify-mobile"];
  if (hiddenPaths.some((p) => pathname.startsWith(p))) return null;

  const isAdmin = isAdminPhone(state.user?.mobileNumber);
  const nav = isAdmin ? ADMIN_NAV : USER_NAV;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-700/60 shadow-[0_-4px_24px_rgba(0,0,0,0.25)]"
      style={{ backgroundColor: "#0f172a" }}
    >
      <div className="flex justify-around items-center h-[68px] w-full px-2 max-w-lg mx-auto">
        {nav.map((item) => {
          const isActive =
            item.href === "/admin/dashboard"
              ? pathname === item.href || pathname === "/admin"
              : item.href === "/dashboard/profile"
              ? pathname === item.href || pathname === "/dashboard"
              : pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full relative transition-all duration-300 ${
                isActive
                  ? "text-orange-500"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-10 h-[3px] bg-orange-500 rounded-b-full shadow-[0_2px_10px_rgba(249,115,22,0.7)]" />
              )}
              <item.icon
                size={isActive ? 26 : 22}
                strokeWidth={isActive ? 2.5 : 2}
                className="transition-all"
              />
              <span className={`text-[10px] transition-all ${isActive ? "font-black" : "font-medium"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
