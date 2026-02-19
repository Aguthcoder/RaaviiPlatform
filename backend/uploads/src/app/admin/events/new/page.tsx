'use client';

import { useMemo, useState } from 'react';
import { ApiEvent, createAdminEvent } from '@/lib/api';

const steps = ['اطلاعات پایه', 'زمان و ظرفیت', 'قیمت‌گذاری', 'ویژگی‌های شخصیتی'];

export default function NewAdminEventPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', category: '', eventType: 'hamneshini', city: '',
    capacity: 20, price: 0, startDate: '', endDate: '', tags: '', targetPersonalityTraits: '', isActive: true,
  });

  const preview = useMemo(() => ({
    ...form,
    tags: form.tags.split(',').map((x) => x.trim()).filter(Boolean),
  }), [form]);

  const submit = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const payload: Omit<ApiEvent, 'id' | 'reservedCount'> = {
        ...preview,
        endDate: form.endDate || undefined,
        targetPersonalityTraits: form.targetPersonalityTraits.split(',').map((x) => x.trim()).filter(Boolean),
        startDate: new Date(form.startDate).toISOString(),
      };
      await createAdminEvent(payload);
      setMessage('رویداد با موفقیت ایجاد شد و در اکسپلور نمایش داده می‌شود.');
    } catch {
      setMessage('خطا در ایجاد رویداد. دسترسی ادمین را بررسی کنید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl grid lg:grid-cols-[1fr_360px] gap-6">
        <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <h1 className="text-2xl font-black">ایجاد همنشینی جدید</h1>
          <p className="text-slate-500 mt-1">مرحله {step + 1} از {steps.length}: {steps[step]}</p>
          <div className="mt-6 grid gap-3">
            {step === 0 && <>
              <input className="w-full rounded-xl border border-slate-200 p-3" placeholder="عنوان" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} />
              <textarea className="w-full rounded-xl border border-slate-200 p-3 min-h-28" placeholder="توضیحات" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} />
              <input className="w-full rounded-xl border border-slate-200 p-3" placeholder="دسته‌بندی" value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} />
              <input className="w-full rounded-xl border border-slate-200 p-3" placeholder="شهر" value={form.city} onChange={(e)=>setForm({...form,city:e.target.value})} />
            </>}
            {step === 1 && <>
              <input className="w-full rounded-xl border border-slate-200 p-3" type="datetime-local" value={form.startDate} onChange={(e)=>setForm({...form,startDate:e.target.value})} />
              <input className="w-full rounded-xl border border-slate-200 p-3" type="datetime-local" value={form.endDate} onChange={(e)=>setForm({...form,endDate:e.target.value})} />
              <input className="w-full rounded-xl border border-slate-200 p-3" type="number" value={form.capacity} onChange={(e)=>setForm({...form,capacity:Number(e.target.value)})} />
            </>}
            {step === 2 && <input className="w-full rounded-xl border border-slate-200 p-3" type="number" value={form.price} onChange={(e)=>setForm({...form,price:Number(e.target.value)})} />}
            {step === 3 && <>
              <input className="w-full rounded-xl border border-slate-200 p-3" placeholder="تگ‌ها (با کاما)" value={form.tags} onChange={(e)=>setForm({...form,tags:e.target.value})} />
              <input className="w-full rounded-xl border border-slate-200 p-3" placeholder="ویژگی شخصیتی (با کاما)" value={form.targetPersonalityTraits} onChange={(e)=>setForm({...form,targetPersonalityTraits:e.target.value})} />
            </>}
          </div>
          <div className="mt-6 flex gap-3">
            <button disabled={step===0} onClick={()=>setStep(step-1)} className="rounded-xl border px-4 py-2">قبلی</button>
            {step < steps.length-1 ? (
              <button onClick={()=>setStep(step+1)} className="rounded-xl bg-slate-900 text-white px-4 py-2">بعدی</button>
            ) : (
              <button onClick={submit} disabled={loading} className="rounded-xl bg-orange-500 text-white px-4 py-2">{loading ? 'در حال ثبت...' : 'ثبت نهایی'}</button>
            )}
          </div>
          {message && <p className="text-sm mt-4">{message}</p>}
        </section>

        <aside className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
          <h2 className="font-black mb-4">پیش‌نمایش زنده</h2>
          <div className="rounded-2xl border border-slate-200 p-4 space-y-2">
            <p className="text-xs text-orange-600">{preview.category || 'دسته‌بندی'}</p>
            <h3 className="font-bold text-lg">{preview.title || 'عنوان همنشینی'}</h3>
            <p className="text-sm text-slate-500">{preview.description || 'توضیح رویداد در اینجا نمایش داده می‌شود.'}</p>
            <p className="text-sm">{preview.city || 'شهر نامشخص'} • ظرفیت {preview.capacity}</p>
            <p className="font-black">{Number(preview.price).toLocaleString('fa-IR')} تومان</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
