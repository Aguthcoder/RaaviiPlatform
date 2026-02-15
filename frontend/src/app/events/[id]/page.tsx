'use client';

import { fetchEventById, reserveEvent } from '@/lib/api';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EventReservationPage() {
  const params = useParams<{ id: string }>();
  const [event, setEvent] = useState<import('@/lib/api').ApiEvent | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchEventById(params.id).then(setEvent);
  }, [params.id]);

  if (!event) return <div className="p-8">در حال بارگذاری...</div>;

  const remaining = event.capacity - event.reservedCount;
  const progress = Math.min(100, Math.round((event.reservedCount / event.capacity) * 100));

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl grid lg:grid-cols-[1fr_320px] gap-6">
        <section className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm">
          <p className="text-xs text-orange-600">{event.category || 'Hamneshini'}</p>
          <h1 className="text-3xl font-black mt-2">{event.title}</h1>
          <p className="text-slate-600 mt-4 leading-8">{event.description}</p>
          <div className="mt-6 text-sm text-slate-500">{event.city || 'آنلاین'} • {new Date(event.startDate).toLocaleString('fa-IR')}</div>

          <div className="mt-8">
            <div className="flex justify-between text-sm mb-2"><span>پیشرفت ظرفیت</span><span>{progress}%</span></div>
            <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-orange-500" style={{ width: `${progress}%` }} /></div>
            <p className="mt-2 text-xs text-slate-500">{remaining} جای خالی باقی مانده</p>
          </div>
        </section>

        <aside className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm h-fit">
          <p className="text-sm text-slate-500">قیمت ثبت‌نام</p>
          <p className="text-3xl font-black mt-1">{Number(event.price).toLocaleString('fa-IR')} تومان</p>
          <button
            onClick={async () => {
              try {
                await reserveEvent(event.id, 1);
                setMessage('رزرو شما ثبت شد.');
              } catch {
                setMessage('خطا در رزرو (احراز هویت/ظرفیت).');
              }
            }}
            disabled={remaining <= 0}
            className="mt-6 w-full rounded-2xl bg-orange-500 py-3 text-white font-bold disabled:bg-slate-300"
          >
            {remaining <= 0 ? 'تکمیل ظرفیت' : 'رزرو همنشینی'}
          </button>
          {message && <p className="text-sm mt-3">{message}</p>}
        </aside>
      </div>
    </main>
  );
}
