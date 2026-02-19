"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Send } from "lucide-react";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const telegramLink = searchParams.get("telegramLink") ?? "https://t.me/";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full bg-white rounded-[40px] shadow-2xl border border-slate-100 p-8 md:p-16 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#102647] to-orange-500"></div>

        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 size={48} />
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
          خرید شما با موفقیت انجام شد
        </h1>
        <p className="text-slate-500 mb-10 text-lg max-w-lg mx-auto leading-relaxed">
          رزرو نهایی همنشینی شما ثبت شد. برای هماهنگی سریع‌تر می‌توانید وارد تلگرام شوید.
        </p>

        <a
          href={telegramLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-[#2AABEE] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#229ED9] transition"
        >
          <Send size={20} className="rotate-[-45deg]" />
          ورود به گروه تلگرام
        </a>

        <div className="mt-8">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-slate-600 text-sm font-bold border-b border-transparent hover:border-slate-400 transition"
          >
            بازگشت به داشبورد
          </Link>
        </div>
      </div>
    </div>
  );
}
