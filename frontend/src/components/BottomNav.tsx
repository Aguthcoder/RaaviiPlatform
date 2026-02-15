"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Gamepad2, Bell, LayoutGrid } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  // فقط در لاگین و تست نشان نده
  if (pathname === "/login" || pathname === "/test") return null;

  const navItems = [
    { name: "پروفایل", href: "/dashboard", icon: User },
    { name: "بازی", href: "/dashboard/game", icon: Gamepad2 },
    { name: "رزرو", href: "/events", icon: LayoutGrid }, // نام رزرو به جای رویداد
    { name: "اعلان‌ها", href: "#", icon: Bell },
  ];

  return (
    // نمایش در موبایل و دسکتاپ (حذف hidden md:hidden)
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f172a] border-t border-slate-800 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.2)]">
      <div className="flex justify-around items-center h-20 w-full px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1.5 w-full h-full transition-all duration-300 relative ${
                isActive ? "text-orange-500" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <item.icon size={isActive ? 28 : 24} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[11px] ${isActive ? "font-bold" : "font-medium"}`}>
                {item.name}
              </span>
              {isActive && (
                <span className="absolute top-0 w-12 h-1 bg-orange-500 rounded-b-lg shadow-[0_2px_8px_rgba(249,115,22,0.6)]"></span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
