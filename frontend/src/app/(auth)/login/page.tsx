'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { testimonialsData } from '@/lib/testimonials';
import { useAppContext } from '@/context/AppContext';
import { login } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      const data = await login(email, password);
      dispatch({ type: 'LOGIN' });
      router.push(data.user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch {
      setError('ورود ناموفق بود. ایمیل/رمز عبور را بررسی کنید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] p-4 md:p-10 flex items-center justify-center">
      <div className="w-full max-w-6xl rounded-[32px] overflow-hidden bg-white shadow-[0_20px_80px_rgba(15,23,42,0.1)] grid md:grid-cols-2 border border-slate-100">
        <div className="p-6 md:p-14">
          <Link href="/" className="text-slate-500 text-sm">بازگشت به خانه</Link>
          <h1 className="text-4xl font-black mt-8 text-slate-900">ورود به راوی</h1>
          <p className="text-slate-500 mt-2">ایمیل یا شماره موبایل خود را وارد کنید.</p>

          <form className="space-y-4 mt-6" onSubmit={submit}>
            <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4" placeholder="ایمیل" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4" placeholder="رمز عبور" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            <button disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 transition text-white rounded-2xl py-3 font-bold disabled:opacity-60">{loading ? 'در حال ورود...' : 'ادامه'}</button>
          </form>
        </div>

        <div className="bg-slate-900 text-white p-8 md:p-12 flex flex-col justify-between">
          <h2 className="text-4xl font-black">Hamneshini</h2>
          <div>
            <h3 className="text-5xl leading-tight font-black mb-5">هم‌صحبت خوبت رو پیدا کن</h3>
            <p className="text-slate-300">رزرو همنشینی با طراحی ساده، مینیمال و امن.</p>
          </div>
          <div className="border border-slate-700 rounded-2xl p-5 bg-slate-800/40">
            <p className="text-orange-400 mb-2">★★★★★</p>
            <p className="text-slate-100">&quot;{randomComment.message}&quot;</p>
            <p className="text-sm text-slate-400 mt-3">{randomComment.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
