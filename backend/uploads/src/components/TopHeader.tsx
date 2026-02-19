"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function TopHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useApp();

  // در صفحات لاگین نمایش نده
  const hiddenPaths = ["/login", "/verify-mobile", "/(auth)"];
  if (hiddenPaths.some((p) => pathname?.startsWith(p))) return null;

  const city = state.city || (state.user as any)?.city || (state.user as any)?.profile?.city;

  const handleCityClick = () => {
    // کلیک روی شهر → صفحه ویرایش پروفایل
    router.push("/dashboard/profile");
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-16"
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1.5px solid rgba(255,107,0,0.1)",
        boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
      }}
    >
      {/* لوگو بزرگ */}
      <Link href="/events" className="flex items-center gap-2.5 select-none">
        <div
          className="flex items-center justify-center rounded-full text-white font-black text-xl"
          style={{
            width: 46,
            height: 46,
            background: "linear-gradient(135deg, #FF6B00 0%, #FF9A3C 100%)",
            boxShadow: "0 4px 16px rgba(255,107,0,0.4)",
          }}
        >
          <img
            src="/logo.JPG"
            alt="راوی"
            className="w-full h-full rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).parentElement!.innerHTML = "ر";
            }}
          />
        </div>
        <span
          className="text-2xl font-black tracking-wide"
          style={{ color: "#1a3a5c" }}
        >
          راوی
        </span>
      </Link>

      {/* دکمه شهر - کلیک → ویرایش پروفایل */}
      <button
        onClick={handleCityClick}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition-all active:scale-95"
        style={{
          background: city ? "rgba(255,107,0,0.1)" : "rgba(26,58,92,0.07)",
          color: city ? "#FF6B00" : "#6b7280",
          border: `1.5px solid ${city ? "rgba(255,107,0,0.2)" : "rgba(26,58,92,0.1)"}`,
        }}
      >
        <MapPin size={14} className={city ? "text-orange-500" : "text-slate-400"} />
        <span>{city || "انتخاب شهر"}</span>
      </button>
    </header>
  );
}
