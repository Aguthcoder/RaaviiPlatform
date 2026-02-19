"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

const TESTIMONIALS = [
  {
    name: "سارا م.",
    role: "کاربر راوی",
    text: "تجربه‌ای که زندگیم رو تغییر داد. تحلیل‌های هوش مصنوعی واقعاً شگفت‌انگیز بود.",
    rating: 5,
  },
  {
    name: "علی ر.",
    role: "کاربر راوی",
    text: "فضا خیلی دوستانه بود، گفتگوها کیفیت داشت و با افراد هم‌فکر آشنا شدم.",
    rating: 5,
  },
  {
    name: "مینا ن.",
    role: "کاربر راوی",
    text: "مطمئن بودم فضا ایمنه و همین باعث شد راحت‌تر گفتگو کنم. عالی بود!",
    rating: 5,
  },
];

type Mode = "login" | "signup";

// Generate 15 circles with random positions, sizes, and animation params
const CIRCLES = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  size: 40 + Math.floor(Math.random() * 60), // 40-100px
  x: Math.floor(Math.random() * 100),
  y: Math.floor(Math.random() * 100),
  duration: 8 + Math.floor(Math.random() * 14), // 8-22s
  delay: Math.floor(Math.random() * 6),
  opacity: 0.55 + Math.random() * 0.35, // 0.55-0.9
}));

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();
  const [mode, setMode] = useState<Mode>("login");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [testimonial, setTestimonial] = useState(TESTIMONIALS[0]);
  const [mounted, setMounted] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    setMounted(true);
    setTestimonial(TESTIMONIALS[Math.floor(Math.random() * TESTIMONIALS.length)]);
  }, []);

  const isValidPhone = (v: string) => /^09\d{9}$/.test(v.replace(/\s/g, ""));

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isValidPhone(phone)) {
      setError("شماره موبایل معتبر نیست. مثال: 09123456789");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.replace(/\s/g, "") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "خطا در ارسال کد");
      setOtpSent(true);
      if (data.dev_code) {
        setOtpCode(data.dev_code);
        setError("[DEV] کد خودکار وارد شد: " + data.dev_code);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.replace(/\s/g, ""),
          code: otpCode,
          name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "کد تایید نامعتبر است");
      localStorage.setItem("token", data.access_token);
      document.cookie = `token=${data.access_token}; path=/; max-age=604800`;
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        login(data.user, data.access_token);
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inp =
    "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition placeholder:text-slate-400";
  const btn =
    "w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-orange-200 disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-white" dir="rtl">
      {/* Animated Orange Circles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Blur overlay for depth */}
        <div className="absolute inset-0 backdrop-blur-[1px] z-10" />
        {mounted && CIRCLES.map((circle) => (
          <div
            key={circle.id}
            className="absolute rounded-full bg-orange-500"
            style={{
              width: `${circle.size}px`,
              height: `${circle.size}px`,
              left: `${circle.x}%`,
              top: `${circle.y}%`,
              opacity: circle.opacity,
              animation: `floatCircle${circle.id % 5} ${circle.duration}s ${circle.delay}s ease-in-out infinite alternate`,
            }}
          />
        ))}
      </div>

      <style jsx global>{`
        @keyframes floatCircle0 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, -50px) scale(1.1); }
        }
        @keyframes floatCircle1 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-40px, 40px) scale(0.9); }
        }
        @keyframes floatCircle2 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(50px, 30px) scale(1.15); }
        }
        @keyframes floatCircle3 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-30px, -60px) scale(0.85); }
        }
        @keyframes floatCircle4 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(20px, 50px) scale(1.2); }
        }
      `}</style>

      {/* Card */}
      <div className="relative z-20 w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl shadow-orange-200/40 p-8 border border-slate-100">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-300">
            <span className="text-white text-2xl font-black">ر</span>
          </div>
        </div>

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition"
        >
          <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          بازگشت به خانه
        </Link>

        {/* Header */}
        <div className="mb-7 text-center">
          <div className="text-4xl mb-2">👋</div>
          <h2 className="text-2xl font-black text-slate-900">خوش آمدید</h2>
          <p className="text-slate-500 mt-1 text-sm">
            {!otpSent
              ? "لطفاً برای ادامه شماره موبایل خود را وارد کنید."
              : `کد تایید به ${phone} ارسال شد.`}
          </p>
        </div>

        {/* Mode tabs */}
        {!otpSent && (
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            {(["login", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                  mode === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                {m === "login" ? "ورود" : "ثبت نام"}
              </button>
            ))}
          </div>
        )}

        {/* Error / Info */}
        {error && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${
            error.startsWith("[DEV]")
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}>
            {error}
          </div>
        )}

        {/* OTP Flow */}
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">نام و نام خانوادگی</label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">👤</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} className={`${inp} pr-9`} placeholder="نام کامل" />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">شماره موبایل</label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">📱</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
                  className={`${inp} pr-10 text-left`}
                  placeholder="09123456789"
                  dir="ltr"
                  maxLength={11}
                  required
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className={btn}>
              {loading ? "در حال ارسال..." : "دریافت کد تایید ←"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">کد ۶ رقمی</label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">🔐</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-center text-2xl font-bold tracking-[1em] outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition"
                  placeholder="------"
                  maxLength={6}
                  dir="ltr"
                  autoFocus
                  required
                />
              </div>
            </div>
            <button type="submit" disabled={loading || otpCode.length !== 6} className={btn}>
              {loading ? "در حال تایید..." : "تایید کد ←"}
            </button>
            <button
              type="button"
              onClick={() => { setOtpSent(false); setOtpCode(""); setError(""); }}
              className="w-full text-sm text-slate-500 hover:text-orange-500 py-2 transition"
            >
              اصلاح شماره موبایل
            </button>
          </form>
        )}

        {/* Footer links */}
        <div className="mt-7 flex justify-center gap-4 text-xs text-slate-400">
          <Link href="/terms" className="hover:text-slate-600 transition">قوانین و مقررات</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-slate-600 transition">حریم خصوصی</Link>
          <span>•</span>
          <Link href="/about" className="hover:text-slate-600 transition">پشتیبانی</Link>
        </div>
      </div>
    </div>
  );
}
