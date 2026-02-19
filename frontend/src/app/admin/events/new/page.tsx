'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createAdminEvent, uploadEventImage, isAdminPhone } from '@/lib/api';
import { useApp } from '@/context/AppContext';
import {
  Upload, Check, ArrowRight, Image as ImageIcon, X,
  MapPin, Lock, Calendar, Users, Tag, FileText, Info,
  DollarSign, Globe, AlertCircle, Loader2,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'hambazi',   label: 'هم‌بازی',  emoji: '🎮', desc: 'بازی گروهی و سرگرمی' },
  { id: 'hamsohbat', label: 'هم‌صحبت', emoji: '💬', desc: 'گفتگو و تبادل نظر' },
  { id: 'hamneshin', label: 'همنشین',   emoji: '🤝', desc: 'دورهمی و آشنایی' },
  { id: 'hampa',     label: 'هم‌پا',    emoji: '🚶', desc: 'فعالیت و طبیعت‌گردی' },
  { id: 'hamamooz',  label: 'هم‌آموز', emoji: '📚', desc: 'یادگیری و کارگاه' },
  { id: 'hamkar',    label: 'همکار',    emoji: '💼', desc: 'کار مشترک و کوورکینگ' },
  { id: 'hamfekr',   label: 'هم‌فکر',  emoji: '💡', desc: 'ایده‌پردازی و کارآفرینی' },
  { id: 'hamteymi',  label: 'هم‌تیمی', emoji: '⚽', desc: 'ورزش و تیم‌سازی' },
  { id: 'hamghesse', label: 'هم‌قصه',  emoji: '📖', desc: 'داستان و خلاقیت' },
];

const CITIES = [
  'تهران','مشهد','اصفهان','شیراز','تبریز','کرج',
  'قم','اهواز','کرمانشاه','ارومیه','رشت','زاهدان',
  'کرمان','همدان','یزد','بندرعباس','بوشهر','سنندج','ساری','گرگان',
];

const FEATURES_OPTIONS = [
  'بدون محدودیت سنی','ویژه بانوان','مختلط','رایگان',
  'با صرف نوشیدنی','حضوری','مبتدی‌ها歓迎','تجربه لازم است',
  'شاد و انرژیک','جدی و تخصصی','طبیعت‌گردی','خانوادگی',
];

const STEPS = [
  { label: 'اطلاعات اصلی', icon: FileText },
  { label: 'زمان و ظرفیت', icon: Calendar },
  { label: 'مکان و دسته‌بندی', icon: MapPin },
  { label: 'ویژگی‌ها و تصویر', icon: ImageIcon },
];

const CARD: React.CSSProperties = { background: 'linear-gradient(145deg, #1B2A4A, #132038)', border: '1px solid rgba(255,255,255,0.08)' };
const INP = 'w-full rounded-xl border text-white p-3 text-sm outline-none focus:border-orange-500 placeholder-slate-500 transition-colors';
const INP_S: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.12)' };

export default function NewAdminEventPage() {
  const router = useRouter();
  const { state } = useApp();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '', description: '', category: '', city: '', location: '',
    capacity: 20, price: 0, startDate: '', endDate: '', tags: '',
    features: [] as string[], targetPersonalityTraits: '',
    isActive: true, image_url: '', is_online: false,
  });

  useEffect(() => {
    if (!state.isLoading && !isAdminPhone(state.user?.mobileNumber)) {
      router.replace('/dashboard');
    }
  }, [state.isLoading, state.user]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setMsg({ type: 'error', text: 'حجم تصویر نباید از ۵MB بیشتر باشد' }); return; }

    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true); setUploadProgress(0);
    try {
      const interval = setInterval(() => setUploadProgress(p => Math.min(p + 15, 85)), 200);
      const imageUrl = await uploadEventImage(file);
      clearInterval(interval); setUploadProgress(100);
      setForm(f => ({ ...f, image_url: imageUrl }));
      setMsg({ type: 'success', text: '✅ تصویر با موفقیت آپلود و روی سرور ذخیره شد' });
      setTimeout(() => { setMsg(null); setUploadProgress(0); }, 2500);
    } catch (err: any) {
      setImagePreview(null);
      setMsg({ type: 'error', text: err.message || 'خطا در آپلود تصویر' });
      setUploadProgress(0);
    } finally { setUploading(false); }
  };

  const toggleFeature = (f: string) =>
    setForm(prev => ({ ...prev, features: prev.features.includes(f) ? prev.features.filter(x => x !== f) : [...prev.features, f] }));

  const validate = (forStep?: number): string | null => {
    const s = forStep ?? step;
    if (s >= 0) {
      if (!form.title.trim()) return 'عنوان همنشینی الزامی است';
      if (form.description.trim().length < 10) return 'توضیحات حداقل ۱۰ کاراکتر باشد';
    }
    if (s >= 1) {
      if (!form.startDate) return 'تاریخ و ساعت شروع الزامی است';
      if (form.capacity < 2) return 'ظرفیت حداقل ۲ نفر';
    }
    if (s >= 2) {
      if (!form.category) return 'دسته‌بندی را انتخاب کنید';
      if (!form.city) return 'شهر را انتخاب کنید';
      if (!form.is_online && !form.location.trim()) return 'مکان دقیق الزامی است';
    }
    return null;
  };

  const nextStep = () => {
    const err = validate(step);
    if (err) { setMsg({ type: 'error', text: err }); return; }
    setMsg(null); setStep(s => s + 1);
  };

  const submit = async () => {
    const err = validate(3);
    if (err) { setMsg({ type: 'error', text: err }); return; }
    if (uploading) { setMsg({ type: 'error', text: 'صبر کنید تا آپلود تصویر کامل شود' }); return; }
    setLoading(true); setMsg(null);
    try {
      await createAdminEvent({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        event_type: form.category,
        city: form.city,
        location: form.location.trim(),
        capacity: form.capacity,
        price: form.price,
        startDate: new Date(form.startDate).toISOString() as any,
        endDate: form.endDate ? new Date(form.endDate).toISOString() as any : undefined,
        tags: form.tags.split(',').map(x => x.trim()).filter(Boolean) as any,
        features: form.features as any,
        targetPersonalityTraits: form.targetPersonalityTraits as any,
        isActive: form.isActive,
        is_active: form.isActive,
        is_online: form.is_online,
        image_url: form.image_url || undefined,
      });
      setMsg({ type: 'success', text: '✅ همنشینی با موفقیت در دیتابیس ذخیره شد! کاربران ' + form.city + ' می‌توانند آن را ببینند.' });
      setTimeout(() => router.push('/admin/events'), 2500);
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || '❌ خطا در ایجاد. دسترسی ادمین را بررسی کنید.' });
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto pb-24 space-y-5 relative z-10" dir="rtl">

      {/* هدر */}
      <div className="rounded-3xl p-6" style={CARD}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin/events')}
            className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <ArrowRight size={18} className="text-white" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white">ایجاد همنشینی جدید</h1>
            <p className="text-sm text-slate-400">مرحله {step + 1} از {STEPS.length} — {STEPS[step].label}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => i < step && setStep(i)}
              className={`h-2 flex-1 rounded-full transition-all ${i <= step ? 'bg-orange-500' : 'bg-slate-700'}`} />
          ))}
        </div>
      </div>

      {/* پیام */}
      {msg && (
        <div className={`rounded-2xl p-4 text-sm font-bold flex items-center gap-2 ${msg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}
          style={{ background: msg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${msg.type === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
          {msg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {msg.text}
        </div>
      )}

      {/* مرحله ۰ */}
      {step === 0 && (
        <div className="rounded-3xl p-5 space-y-4" style={CARD}>
          <h2 className="font-black text-white flex items-center gap-2 text-sm"><FileText size={16} className="text-orange-400" /> اطلاعات اصلی</h2>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">عنوان همنشینی *</label>
            <input className={INP} style={INP_S} placeholder="مثال: دورهمی قهوه صبحگاهی" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">توضیحات کامل *</label>
            <textarea className={`${INP} resize-none`} style={INP_S} rows={5}
              placeholder="فضا چگونه است؟ چه کسانی شرکت کنند؟ چه اتفاقی می‌افتد؟"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <p className="text-[11px] text-slate-500 mt-1">{form.description.length} کاراکتر {form.description.length < 10 && form.description.length > 0 ? '— حداقل ۱۰' : ''}</p>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">قیمت (تومان) — صفر = رایگان</label>
            <input className={INP} style={INP_S} type="number" min={0} step={10000} placeholder="۰" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
            {form.price > 0 && <p className="text-[11px] text-orange-300 mt-1">{Number(form.price).toLocaleString('fa-IR')} تومان</p>}
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">تگ‌ها (با ویرگول)</label>
            <input className={INP} style={INP_S} placeholder="صبحانه، کافه، آشنایی" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
          </div>
        </div>
      )}

      {/* مرحله ۱ */}
      {step === 1 && (
        <div className="rounded-3xl p-5 space-y-4" style={CARD}>
          <h2 className="font-black text-white flex items-center gap-2 text-sm"><Calendar size={16} className="text-orange-400" /> زمان و ظرفیت</h2>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">تاریخ و ساعت شروع *</label>
            <input className={INP} style={INP_S} type="datetime-local" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">تاریخ و ساعت پایان (اختیاری)</label>
            <input className={INP} style={INP_S} type="datetime-local" value={form.endDate} min={form.startDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">ظرفیت * <span className="text-orange-400">({form.capacity} نفر)</span></label>
            <input className={INP} style={INP_S} type="number" min={2} max={500} value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} />
            <input type="range" min={2} max={100} value={Math.min(form.capacity, 100)} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} className="w-full mt-2 accent-orange-500" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">ویژگی‌های شخصیتی مناسب (اختیاری)</label>
            <input className={INP} style={INP_S} placeholder="برونگرا، خلاق، کنجکاو" value={form.targetPersonalityTraits} onChange={e => setForm({ ...form, targetPersonalityTraits: e.target.value })} />
          </div>
        </div>
      )}

      {/* مرحله ۲ */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="rounded-3xl p-5 space-y-4" style={CARD}>
            <h2 className="font-black text-white flex items-center gap-2 text-sm"><MapPin size={16} className="text-orange-400" /> مکان</h2>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">شهر * — <span className="text-blue-400">نمایش عمومی و فیلتر کاربران</span></label>
              <select className={INP} style={INP_S} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}>
                <option value="">-- انتخاب شهر --</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {form.city && <p className="text-[11px] text-blue-300 mt-1">✓ فقط کاربران {form.city} این همنشینی را می‌بینند</p>}
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <p className="text-sm font-bold text-white">رویداد آنلاین</p>
                <p className="text-xs text-slate-500">بدون نیاز به مکان فیزیکی</p>
              </div>
              <button onClick={() => setForm(f => ({ ...f, is_online: !f.is_online }))}
                className={`w-11 h-6 rounded-full transition-all relative ${form.is_online ? 'bg-blue-500' : 'bg-slate-600'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_online ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            {!form.is_online && (
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">مکان دقیق * — <span className="text-orange-400">محرمانه، فقط ۱۰ ساعت قبل</span></label>
                <input className={INP} style={INP_S} placeholder="آدرس کامل: کوچه، خیابان، ساختمان" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                <div className="mt-2 flex items-start gap-1.5 p-2.5 rounded-xl" style={{ background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.15)' }}>
                  <Info size={12} className="text-orange-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-orange-300">آدرس دقیق فقط برای رزروکنندگان و در ۱۰ ساعت آخر قبل از رویداد نمایش داده می‌شود.</p>
                </div>
              </div>
            )}
          </div>
          <div className="rounded-3xl p-5" style={CARD}>
            <h2 className="font-black text-white flex items-center gap-2 text-sm mb-4"><Tag size={16} className="text-orange-400" /> دسته‌بندی *</h2>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setForm({ ...form, category: cat.id })}
                  className="p-3 rounded-xl text-center transition-all border"
                  style={form.category === cat.id
                    ? { background: 'rgba(255,107,0,0.15)', borderColor: '#FF6B00' }
                    : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div className="text-xl mb-0.5">{cat.emoji}</div>
                  <p className={`text-xs font-bold ${form.category === cat.id ? 'text-orange-400' : 'text-slate-400'}`}>{cat.label}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">{cat.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* مرحله ۳ */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-3xl p-5" style={CARD}>
            <h2 className="font-black text-white flex items-center gap-2 text-sm mb-4"><Tag size={16} className="text-orange-400" /> ویژگی‌ها</h2>
            <div className="flex flex-wrap gap-2">
              {FEATURES_OPTIONS.map(f => (
                <button key={f} onClick={() => toggleFeature(f)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold transition-all border"
                  style={form.features.includes(f)
                    ? { background: 'rgba(255,107,0,0.15)', borderColor: '#FF6B00', color: '#FB923C' }
                    : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.12)', color: '#94A3B8' }}>
                  {form.features.includes(f) && '✓ '}{f}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl p-5" style={CARD}>
            <h2 className="font-black text-white flex items-center gap-2 text-sm mb-4"><ImageIcon size={16} className="text-orange-400" /> تصویر همنشینی</h2>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="پیش‌نمایش" className="w-full h-48 object-cover rounded-2xl" />
                {uploading ? (
                  <div className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center gap-2">
                    <Loader2 size={24} className="text-orange-400 animate-spin" />
                    <p className="text-sm text-white font-bold">آپلود روی سرور... {uploadProgress}%</p>
                    <div className="w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 transition-all rounded-full" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                ) : (
                  <>
                    {form.image_url && (
                      <div className="absolute top-2 right-2 px-2 py-1 rounded-lg text-[10px] font-bold text-green-400 flex items-center gap-1" style={{ background: 'rgba(16,185,129,0.2)' }}>
                        <Check size={10} /> ذخیره در سرور
                      </div>
                    )}
                    <button onClick={() => { setImagePreview(null); setForm(f => ({ ...f, image_url: '' })); }}
                      className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center"><X size={14} className="text-white" /></button>
                    <button onClick={() => fileRef.current?.click()}
                      className="absolute bottom-2 left-2 px-3 py-1.5 rounded-xl text-white text-xs font-bold" style={{ background: 'rgba(255,107,0,0.8)' }}>تغییر</button>
                  </>
                )}
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()}
                className="w-full h-36 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 hover:border-orange-500 transition-colors"
                style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)' }}>
                <Upload size={22} className="text-slate-400" />
                <div className="text-center">
                  <p className="text-sm text-slate-300 font-bold">کلیک کنید تا تصویر انتخاب کنید</p>
                  <p className="text-xs text-slate-500 mt-0.5">JPG, PNG, WebP — حداکثر ۵MB — آپلود روی سرور</p>
                </div>
              </button>
            )}
          </div>

          <div className="rounded-2xl p-4 flex items-center justify-between" style={CARD}>
            <div>
              <p className="text-sm font-bold text-white">انتشار فوری</p>
              <p className="text-xs text-slate-500">بلافاصله برای کاربران {form.city || 'شهر انتخابی'} نمایش داده شود</p>
            </div>
            <button onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
              className={`w-12 h-6 rounded-full transition-all relative ${form.isActive ? 'bg-orange-500' : 'bg-slate-600'}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isActive ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {/* خلاصه */}
          <div className="rounded-2xl p-4 space-y-1.5" style={{ background: 'rgba(255,107,0,0.06)', border: '1px solid rgba(255,107,0,0.15)' }}>
            <p className="text-xs font-black text-orange-400 mb-2">📋 خلاصه قبل از ذخیره:</p>
            {[
              ['📌', 'عنوان', form.title || '—'],
              ['🏙️', 'شهر', form.city || '—'],
              ['🗂️', 'دسته', CATEGORIES.find(c => c.id === form.category)?.label || '—'],
              ['💰', 'قیمت', form.price > 0 ? `${Number(form.price).toLocaleString('fa-IR')} تومان` : 'رایگان'],
              ['👥', 'ظرفیت', `${form.capacity} نفر`],
              ['🖼️', 'تصویر', form.image_url ? '✅ آپلود شد روی سرور' : '⬜ بدون تصویر'],
            ].map(([emoji, key, val]) => (
              <p key={key} className="text-xs text-slate-300">{emoji} {key}: <span className="text-white font-bold">{val}</span></p>
            ))}
          </div>
        </div>
      )}

      {/* دکمه‌های ناوبری */}
      <div className="flex gap-3">
        {step > 0 && (
          <button onClick={() => { setMsg(null); setStep(s => s - 1); }}
            className="flex-1 py-3.5 rounded-2xl font-black text-sm text-slate-300 flex items-center justify-center gap-2"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <ArrowRight size={16} /> قبلی
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button onClick={nextStep}
            className="flex-1 py-3.5 rounded-2xl font-black text-sm text-white"
            style={{ background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)', boxShadow: '0 4px 20px rgba(255,107,0,0.35)' }}>
            بعدی ←
          </button>
        ) : (
          <button onClick={submit} disabled={loading || uploading}
            className="flex-1 py-3.5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)', boxShadow: '0 4px 20px rgba(255,107,0,0.35)' }}>
            {loading ? <><Loader2 size={16} className="animate-spin" /> ذخیره در دیتابیس...</> : <><Check size={16} /> ایجاد همنشینی</>}
          </button>
        )}
      </div>
    </div>
  );
}
