"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { testimonialsData } from "@/lib/testimonials";
import { useAppContext } from "@/context/AppContext";
import { login } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { dispatch } = useAppContext();
  const router = useRouter();

  const randomComment = useMemo(() => testimonialsData[Math.floor(Math.random() * testimonialsData.length)], []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      dispatch({ type: "LOGIN" });
      router.push("/dashboard");
    } catch {
      setError("ورود ناموفق بود. ایمیل/رمز عبور را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-10 flex items-center justify-center">
      <div className="w-full max-w-6xl rounded-[32px] overflow-hidden bg-white shadow-2xl grid md:grid-cols-2">
        <div className="p-6 md:p-14">
          <Link href="/" className="text-slate-500 text-sm">بازگشت به خانه</Link>
          <h1 className="text-4xl font-black mt-8 text-slate-900">خوش آمدید 👋</h1>
          <p className="text-slate-500 mt-2">ورود امن با JWT + Refresh Cookie</p>

          <form className="space-y-4 mt-6" onSubmit={submit}>
            <input className="w-full bg-slate-100 rounded-xl p-4" placeholder="ایمیل" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="w-full bg-slate-100 rounded-xl p-4" placeholder="رمز عبور" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            <button disabled={loading} className="w-full bg-orange-500 text-white rounded-xl py-3 font-bold disabled:opacity-60">{loading ? "در حال ورود..." : "ورود"}</button>
          </form>
        </div>

        <div className="bg-slate-900 text-white p-8 md:p-12 flex flex-col justify-between">
          <h2 className="text-4xl font-black">راوی</h2>
          <div>
            <h3 className="text-5xl leading-tight font-black mb-5">هوشمندانه انتخاب کن</h3>
            <p className="text-slate-300">همنشینی‌های امن و هم‌فکر با ترکیب رنگ نارنجی/سورمه‌ای.</p>
          </div>
          <div className="border border-slate-700 rounded-2xl p-5">
            <p className="text-orange-400 mb-2">★★★★★</p>
            <p className="text-slate-100">"{randomComment.message}"</p>
            <p className="text-sm text-slate-400 mt-3">{randomComment.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
