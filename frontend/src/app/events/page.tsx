"use client";

import { getEventImage } from "@/lib/dynamic-images";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import AnimatedBackground from "@/components/AnimatedBackground";
import {
  MapPin, Search, ChevronLeft, Home, Sparkles,
  Tag, CalendarCheck, Clock, Users, Lock,
} from "lucide-react";

const CATEGORIES = [
  { id: "hambazi",    title: "هم‌بازی",  img: "/categories/3.PNG", banner: "یک شب هیجانی با بردگیم و بازی‌های گروهی" },
  { id: "hamsohbat",  title: "هم‌صحبت", img: "/categories/2.PNG", banner: "گفتگوهای عمیق و صمیمی با افراد هم‌فکر" },
  { id: "hamneshin",  title: "همنشین",   img: "/categories/1.PNG", banner: "دورهمی امن و گرم با آدم‌های هم‌فرکانس" },
  { id: "hampa",      title: "هم‌پا",    img: "/categories/6.PNG", banner: "پیاده‌روی، گردش و تجربه در طبیعت" },
  { id: "hamamooz",   title: "هم‌آموز", img: "/categories/5.PNG", banner: "یادگیری مهارت‌های جدید در کنار دیگران" },
  { id: "hamkar",     title: "همکار",    img: "/categories/4.PNG", banner: "همکاری در پروژه‌ها و کارهای مشترک" },
  { id: "hamfekr",    title: "هم‌فکر",  img: "/categories/7.PNG", banner: "تبادل ایده و رویا با ذهن‌های خلاق" },
  { id: "hamteymi",   title: "هم‌تیمی", img: "/categories/8.PNG", banner: "فعالیت‌های ورزشی و تیمی مشترک" },
  { id: "hamghesse",  title: "هم‌قصه",  img: "/categories/1.PNG", banner: "خواندن و نوشتن و تجربه‌ی داستان" },
];

const ALL_MOCK_EVENTS = [
  { id: "ev-1", category: "hambazi", title: "دورهمی همبازی (بردگیم‌های گروهی)، پنجشنبه ۲۳ بهمن", subtitle: "بردگیم‌های استراتژیک برای ۴ تا ۱۲ نفر", date: "۱۴۰۳/۱۱/۲۳", time: "۱۵:۰۰", weekday: "پنج‌شنبه", location: "کافه بازی جام جم، تهران", city: "تهران", capacity: 12, reserved: 12, price: 150000, img: "/categories/3.PNG", tags: ["بردگیم", "گروهی"] },
  { id: "ev-2", category: "hambazi", title: "هم‌بازی ۲۴ بهمن (مافیا)", subtitle: "یک شب هیجانی با بازی مافیا", date: "۱۴۰۳/۱۱/۲۴", time: "۱۷:۰۰", weekday: "جمعه", location: "کافه لیلا، ونک، تهران", city: "تهران", capacity: 14, reserved: 10, price: 80000, img: "/categories/3.PNG", tags: ["مافیا", "کارآگاهی"] },
  { id: "ev-4", category: "hamneshin", title: "قرار صبحانه (میز منتخب)", subtitle: "صبحانه‌ی دنج با افراد هم‌فرکانس", date: "۱۴۰۳/۱۱/۲۴", time: "۱۰:۰۰", weekday: "جمعه", location: "کافه آهنگ صبح، سعادت‌آباد، تهران", city: "تهران", capacity: 6, reserved: 6, price: 120000, img: "/categories/1.PNG", tags: ["صبحانه", "کافه"] },
  { id: "ev-5", category: "hamneshin", title: "قرار صبحانه، جمعه ۲۴ بهمن", subtitle: "میز مشترک صبحانه با آدم‌های جدید", date: "۱۴۰۳/۱۱/۲۴", time: "۱۰:۰۰", weekday: "جمعه", location: "کافه بامداد، نیاوران، تهران", city: "تهران", capacity: 8, reserved: 8, price: 120000, img: "/categories/1.PNG", tags: ["صبحانه", "آشنایی"] },
  { id: "ev-6", category: "hamneshin", title: "دورهمی همنشین آخر هفته", subtitle: "شب‌نشینی صمیمی در فضایی دنج", date: "۱۴۰۳/۱۱/۲۵", time: "۱۸:۳۰", weekday: "شنبه", location: "خانه فرهنگ نیاوران، تهران", city: "تهران", capacity: 10, reserved: 5, price: 90000, img: "/categories/1.PNG", tags: ["شب‌نشینی", "دوستی"] },
  { id: "ev-7", category: "hamsohbat", title: "قهوه و گفتگو – موضوع: آرامش در دنیای شلوغ", subtitle: "گفتگویی صمیمی پیرامون سبک زندگی آرام", date: "۱۴۰۳/۱۱/۲۵", time: "۱۶:۰۰", weekday: "شنبه", location: "کافه فلسفه، انقلاب، تهران", city: "تهران", capacity: 8, reserved: 3, price: 60000, img: "/categories/2.PNG", tags: ["گفتگو", "فلسفه"] },
  { id: "ev-9", category: "hampa", title: "پیاده‌روی بامدادی توچال، جمعه ۲۴ بهمن", subtitle: "صعود گروهی به توچال در هوای تازه", date: "۱۴۰۳/۱۱/۲۴", time: "۰۷:۰۰", weekday: "جمعه", location: "ایستگاه تله‌کابین توچال، تهران", city: "تهران", capacity: 15, reserved: 11, price: 40000, img: "/categories/6.PNG", tags: ["طبیعت", "کوهنوردی"] },
  { id: "ev-11", category: "hamamooz", title: "کارگاه عکاسی موبایل، پنج‌شنبه ۲۳ بهمن", subtitle: "یاد بگیر با موبایل مثل حرفه‌ای‌ها عکس بگیری", date: "۱۴۰۳/۱۱/۲۳", time: "۱۴:۰۰", weekday: "پنج‌شنبه", location: "استودیو عکس آفتاب، میرداماد، تهران", city: "تهران", capacity: 8, reserved: 5, price: 180000, img: "/categories/5.PNG", tags: ["عکاسی", "کارگاه"] },
  { id: "ev-13", category: "hamkar", title: "روز کار اشتراکی (Co-working Day)", subtitle: "کار در کنار هم در فضایی انرژی‌بخش", date: "۱۴۰۳/۱۱/۲۵", time: "۱۰:۰۰", weekday: "شنبه", location: "فضای کار مشترک هاب، کارگر شمالی", city: "تهران", capacity: 20, reserved: 12, price: 80000, img: "/categories/4.PNG", tags: ["کار", "فریلنسر"] },
  { id: "ev-14", category: "hamfekr", title: "نشست ایده‌پردازی – استارتاپ و کارآفرینی", subtitle: "تبادل ایده با کارآفرینان جوان تهران", date: "۱۴۰۳/۱۱/۲۵", time: "۱۸:۰۰", weekday: "شنبه", location: "خانه نوآوری، ولیعصر، تهران", city: "تهران", capacity: 16, reserved: 9, price: 50000, img: "/categories/7.PNG", tags: ["استارتاپ", "ایده"] },
  { id: "ev-15", category: "hamteymi", title: "فوتبال دوستانه، جمعه ۲۴ بهمن", subtitle: "بازی فوتبال در هوای آزاد", date: "۱۴۰۳/۱۱/۲۴", time: "۰۹:۰۰", weekday: "جمعه", location: "زمین چمن پارک لاله، تهران", city: "تهران", capacity: 14, reserved: 8, price: 30000, img: "/categories/8.PNG", tags: ["فوتبال", "ورزش"] },
  { id: "ev-16", category: "hamghesse", title: "حلقه داستان‌سرایی، پنج‌شنبه ۲۳ بهمن", subtitle: "خلق و شنیدن داستان‌های کوتاه در یک شب خاص", date: "۱۴۰۳/۱۱/۲۳", time: "۱۸:۰۰", weekday: "پنج‌شنبه", location: "خانه هنرمندان، لاله‌زار، تهران", city: "تهران", capacity: 12, reserved: 8, price: 60000, img: "/categories/1.PNG", tags: ["داستان", "هنر"] },
  { id: "ev-20", category: "hamneshin", title: "همنشین اصفهانی، کافه سی‌وسه‌پل", subtitle: "دورهمی در کنار زاینده‌رود", date: "۱۴۰۳/۱۱/۲۵", time: "۱۷:۰۰", weekday: "شنبه", location: "کافه پل، اصفهان", city: "اصفهان", capacity: 8, reserved: 3, price: 90000, img: "/categories/1.PNG", tags: ["اصفهان", "کافه"] },
  { id: "ev-21", category: "hamsohbat", title: "گفتگو در بازار اصفهان", subtitle: "نشست هم‌صحبت در دل تاریخ", date: "۱۴۰۳/۱۱/۲۶", time: "۱۶:۰۰", weekday: "یکشنبه", location: "بازار بزرگ اصفهان", city: "اصفهان", capacity: 10, reserved: 4, price: 50000, img: "/categories/2.PNG", tags: ["اصفهان", "تاریخ"] },
];

type Tab = "category" | "newest" | "discount" | "myreserves";

const NAVY = "#1B2A4A";
const NAVY_DARK = "#0d1e35";

export default function EventsPage() {
  const { state } = useApp();
  const router = useRouter();
  const [events, setEvents] = useState(ALL_MOCK_EVENTS);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("category");
  const [search, setSearch] = useState("");
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [activeCategoriesInCity, setActiveCategoriesInCity] = useState<string[]>(CATEGORIES.map((c) => c.id));

  const userCity = state.city || (state.user as any)?.city || (state.user as any)?.profile?.city || "";

  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const params = new URLSearchParams({ limit: "50" });
    if (userCity) params.set("city", userCity);

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/events?${params}`, { signal: ctrl.signal, headers: { ...headers, "Cache-Control": "no-cache" } })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => {
        if (data?.events?.length > 0) {
          const mapped = data.events.map((e: any) => ({
            id: e.id, category: e.category || "hamneshin", title: e.title, subtitle: e.description || "",
            date: new Date(e.start_date || e.startDate).toLocaleDateString("fa-IR"),
            time: new Date(e.start_date || e.startDate).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
            weekday: new Date(e.start_date || e.startDate).toLocaleDateString("fa-IR", { weekday: "long" }),
            location: e.location || e.city || "تهران", city: e.city || "",
            capacity: e.capacity, reserved: e.reservedCount ?? e.current_bookings ?? 0,
            price: e.price, img: e.image_url || "/categories/1.PNG", tags: e.tags || [],
          }));
          setEvents(mapped);
          const activeCats = [...new Set(mapped.map((e: any) => e.category))];
          if (activeCats.length > 0) setActiveCategoriesInCity(activeCats as string[]);
        } else if (userCity) {
          const cityEvents = ALL_MOCK_EVENTS.filter((e) => e.city === userCity);
          const activeCats = [...new Set(cityEvents.map((e) => e.category))];
          setActiveCategoriesInCity(activeCats.length > 0 ? activeCats : []);
        }
      })
      .catch(() => {
        if (userCity) {
          const cityEvents = ALL_MOCK_EVENTS.filter((e) => e.city === userCity);
          const activeCats = [...new Set(cityEvents.map((e) => e.category))];
          setActiveCategoriesInCity(activeCats.length > 0 ? activeCats : []);
          setEvents(userCity === "تهران" || !userCity ? ALL_MOCK_EVENTS : cityEvents);
        }
      })
      .finally(() => { clearTimeout(t); setLoading(false); });

    return () => { clearTimeout(t); ctrl.abort(); };
  }, [userCity]);

  useEffect(() => {
    if (!state.isLoggedIn) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/bookings`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then((raw) => {
        const bookings: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.bookings) ? raw.bookings : [];
        setMyBookings(bookings);
      }).catch(() => {});
  }, [state.isLoggedIn]);

  const filtered = (() => {
    let list = events;
    if (userCity) list = list.filter((e) => !e.city || e.city === userCity || e.city === "");
    if (activeCategory) list = list.filter((e) => e.category === activeCategory);
    if (search.trim()) {
      const q = search.trim();
      list = list.filter((e) => e.title.includes(q) || e.subtitle?.includes(q) || e.location?.includes(q));
    }
    if (activeTab === "newest") list = [...list].sort((a, b) => b.id.localeCompare(a.id));
    if (activeTab === "discount") list = list.filter((e) => e.price < 80000);
    return list;
  })();

  const TABS: { id: Tab; label: string; Icon: any }[] = [
    { id: "category", label: "دسته‌بندی", Icon: Home },
    { id: "newest", label: "جدیدترین", Icon: Sparkles },
    { id: "discount", label: "تخفیف‌ها", Icon: Tag },
    { id: "myreserves", label: "رزرو من", Icon: CalendarCheck },
  ];

  const activeCat = CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div className="min-h-screen pb-28 relative" dir="rtl">
      {/* 3D animated background */}
      <AnimatedBackground />

      <div className="relative z-10">
        {/* ── Page Header — Navy Blue ── */}
        <div className="sticky top-0 z-30" style={{ background: NAVY }}>
          <div className="max-w-lg mx-auto px-4 pt-4 pb-3">
            <h1 className="text-center text-lg font-black text-white mb-3">
              رزرو همنشینی
            </h1>

            {/* Search bar — navy blue */}
            <div className="relative mb-2">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50" size={16} />
              <input
                type="text"
                placeholder="جست‌وجو همنشینی..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setActiveCategory(null); }}
                className="w-full rounded-xl pr-9 pl-4 py-2.5 text-sm text-white outline-none placeholder-white/40 focus:ring-2 focus:ring-orange-400"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}
              />
            </div>

            {userCity && (
              <div className="flex items-center gap-1 text-xs text-white/60 pb-1">
                <MapPin size={12} className="text-orange-400" />
                <span>رویدادهای {userCity}</span>
              </div>
            )}
          </div>

          {/* Category banner area — navy */}
          <div className="max-w-lg mx-auto px-4 pb-3">
            <div className="relative rounded-2xl overflow-hidden h-32 shadow-lg select-none"
              style={{ background: NAVY_DARK }}>
              <img src={activeCat?.img || "/categories/3.PNG"} alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-30 transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-l from-[#0d1e35]/95 via-[#1B2A4A]/70 to-[#1B2A4A]/40" />
              <div className="absolute inset-0 flex items-center justify-between px-5">
                <div className="text-white z-10 max-w-[55%]">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}>
                    {activeCat ? activeCat.title : "همنشینی‌های"}
                  </span>
                  <h2 className="text-xl font-black leading-tight mt-1">{activeCat ? activeCat.title : "راوی"}</h2>
                  <p className="text-[11px] opacity-75 mt-0.5 line-clamp-1">
                    {activeCat ? activeCat.banner : "رویدادهایی برای آدم‌های کنجکاو"}
                  </p>
                  <button
                    onClick={() => { setActiveTab("category"); if (!activeCategory) setActiveCategory("hambazi"); }}
                    className="mt-2 inline-flex items-center bg-orange-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md hover:bg-orange-600 active:scale-95 transition-all">
                    ثبت‌نام
                  </button>
                </div>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full overflow-hidden"
                  style={{ border: "3px solid rgba(255,255,255,0.2)" }}>
                  <img src={activeCat?.img || "/categories/3.PNG"} alt=""
                    className="w-full h-full object-cover opacity-70 transition-all duration-500"
                    style={{ background: NAVY }} />
                </div>
              </div>
            </div>
          </div>

          {/* Tab bar — Navy Blue, orange active */}
          <div className="max-w-lg mx-auto px-0 border-b" style={{ background: NAVY, borderColor: "rgba(255,255,255,0.12)" }}>
            <div className="flex">
              {[...TABS].reverse().map(({ id, label, Icon }) => {
                const isA = activeTab === id;
                return (
                  <button key={id}
                    onClick={() => { setActiveTab(id); if (id !== "category") setActiveCategory(null); }}
                    className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold transition-all border-b-2 ${
                      isA ? "border-orange-500 text-orange-400" : "border-transparent text-white/50 hover:text-white/80"
                    }`}>
                    <Icon size={15} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-lg mx-auto px-4">

          {/* Category tab */}
          {activeTab === "category" && (
            <>
              {!userCity && (
                <div className="mt-4 mb-4 rounded-2xl p-3 flex items-center gap-3 cursor-pointer"
                  style={{ background: "rgba(255,107,0,0.08)", border: "1.5px dashed rgba(255,107,0,0.3)" }}
                  onClick={() => router.push("/dashboard/profile")}>
                  <MapPin size={18} className="text-orange-500 flex-shrink-0" />
                  <p className="text-sm text-orange-700 font-bold">برای دیدن رویدادهای شهرت، ابتدا شهر رو انتخاب کن</p>
                  <ChevronLeft size={16} className="text-orange-400 mr-auto flex-shrink-0" />
                </div>
              )}

              {/* Category Grid — navy blue cards, orange icon on navy */}
              <div className="grid grid-cols-3 gap-2.5 mt-4 mb-6">
                {CATEGORIES.map((cat) => {
                  const isA = activeCategory === cat.id;
                  const catEvents = events.filter((e) => e.category === cat.id);
                  const isActive = !userCity || activeCategoriesInCity.includes(cat.id);

                  return (
                    <button key={cat.id}
                      onClick={() => { if (!isActive) return; setActiveCategory(isA ? null : cat.id); }}
                      disabled={!isActive}
                      className={`relative rounded-2xl overflow-hidden aspect-square flex flex-col items-end justify-end transition-all duration-200 ${
                        isActive ? "hover:shadow-md hover:-translate-y-0.5 cursor-pointer" : "cursor-not-allowed"
                      } ${isA ? "ring-4 ring-orange-500 ring-offset-1 scale-[1.03]" : ""}`}
                      style={{ background: NAVY }}>

                      {/* Image overlay on navy */}
                      <img src={cat.img} alt={cat.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-30"
                        style={{ mixBlendMode: "luminosity" }} />

                      {isActive && <div className="absolute inset-0 bg-gradient-to-t from-[#0d1e35]/85 via-[#1B2A4A]/30 to-transparent" />}

                      {!isActive && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10"
                          style={{ background: "rgba(60,60,80,0.7)", backdropFilter: "blur(3px)" }}>
                          <Lock size={18} className="text-white mb-1" />
                          <span className="text-white text-[9px] font-bold text-center px-1">در {userCity} فعال نیست</span>
                        </div>
                      )}

                      {isActive && catEvents.length > 0 && (
                        <span className="absolute top-1.5 right-1.5 bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full z-10 shadow">
                          {catEvents.length}
                        </span>
                      )}

                      {/* Orange icon area on navy — no white bg */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: "rgba(255,107,0,0.3)" }}>
                          <Sparkles size={15} className="text-orange-400" />
                        </div>
                      </div>

                      <p className={`relative z-10 text-white text-[11px] font-black p-2 drop-shadow-md w-full text-right ${!isActive ? "opacity-50" : ""}`}>
                        {cat.title}
                      </p>

                      {isA && (
                        <span className="absolute top-1.5 left-1.5 bg-orange-500 rounded-full w-5 h-5 flex items-center justify-center z-20 shadow-md">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Section header — Navy Blue */}
              <div className="rounded-xl px-4 py-3 mb-4 flex items-center justify-between"
                style={{ background: NAVY }}>
                <h2 className="text-sm font-black text-white">
                  {activeCategory ? `همنشینی‌های ${activeCat?.title}` : "همنشینی‌های پرطرفدار"}
                </h2>
                {activeCategory && (
                  <button onClick={() => setActiveCategory(null)} className="text-orange-400 text-xs font-bold">همه رویدادها</button>
                )}
              </div>

              <EventCards events={filtered} loading={loading} onClear={() => setActiveCategory(null)} hasFilter={!!activeCategory} />
            </>
          )}

          {activeTab === "newest" && (
            <>
              <div className="mt-4 rounded-xl px-4 py-3 mb-4" style={{ background: NAVY }}>
                <h2 className="text-sm font-black text-white">جدیدترین همنشینی‌ها</h2>
              </div>
              <EventCards events={filtered} loading={loading} onClear={() => {}} hasFilter={false} />
            </>
          )}

          {activeTab === "discount" && (
            <>
              <div className="mt-4 rounded-xl px-4 py-3 mb-4" style={{ background: NAVY }}>
                <h2 className="text-sm font-black text-white">
                  همنشینی‌های تخفیف‌دار
                  <span className="text-xs font-medium mr-2" style={{ color: "rgba(255,255,255,0.55)" }}>زیر ۸۰ هزار تومان</span>
                </h2>
              </div>
              <EventCards events={filtered} loading={loading} onClear={() => {}} hasFilter={false} />
            </>
          )}

          {activeTab === "myreserves" && (
            <>
              <div className="mt-4 rounded-xl px-4 py-3 mb-4" style={{ background: NAVY }}>
                <h2 className="text-sm font-black text-white">رزروهای من</h2>
              </div>
              {myBookings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-white font-black text-base mb-1">هنوز رزروی ندارید</p>
                  <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>اولین همنشینی خود را رزرو کنید</p>
                  <button onClick={() => setActiveTab("category")}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-black px-6 py-2.5 rounded-xl transition-colors shadow-md">
                    رزرو همنشینی
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {myBookings.map((b: any) => (
                    <div key={b.id}
                      className="rounded-2xl border p-4 flex items-center gap-3"
                      style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.1)" }}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(255,107,0,0.15)" }}>
                        <CalendarCheck size={20} className="text-orange-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-white text-sm truncate">{b.service || b.event_id || "رزرو"}</p>
                        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{b.status === "confirmed" ? "تأیید شده" : "در انتظار"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EventCards({ events, loading, onClear, hasFilter }: { events: any[]; loading: boolean; onClear: () => void; hasFilter: boolean }) {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="flex gap-2">
          {[300, 150, 0].map((d, i) => (
            <div key={i} className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: `-${d}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-3">📅</div>
        <p style={{ color: "rgba(255,255,255,0.6)" }} className="font-medium">در این دسته‌بندی همنشینی‌ای یافت نشد</p>
        {hasFilter && (
          <button onClick={onClear} className="mt-4 text-orange-400 font-bold text-sm hover:underline">مشاهده همه رویدادها</button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col -mx-4">
      {events.map((ev) => {
        const full = ev.capacity <= (ev.reserved ?? 0);
        const remaining = ev.capacity - (ev.reserved ?? 0);

        return (
          <div key={ev.id} className="relative group">
            <div className="relative h-44 overflow-hidden" style={{ background: "#0d1e35" }}>
              <img src={getEventImage(ev.category, ev.id, ev.img)} alt={ev.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-l from-[#0d1e35]/95 via-[#1B2A4A]/70 to-[#1B2A4A]/30" />

              {full && (
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-700 text-[11px] font-black px-3 py-1 rounded-full shadow">
                  ( تکمیل ظرفیت )
                </div>
              )}

              {ev.tags?.length > 0 && (
                <div className="absolute top-3 left-3 flex gap-1">
                  {ev.tags.slice(0, 2).map((tag: string) => (
                    <span key={tag} className="bg-orange-500/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              )}

              <div className="absolute right-3 bottom-3 left-28 text-white">
                <h3 className="font-black text-sm leading-snug drop-shadow-lg line-clamp-2 mb-1.5">{ev.title}</h3>
                <div className="flex items-center gap-1 text-white/75 mb-1">
                  <Clock size={11} className="flex-shrink-0" />
                  <span className="text-[10px] line-clamp-1">{ev.weekday}، {ev.date} ساعت {ev.time}</span>
                </div>
                {ev.location && (
                  <div className="flex items-center gap-1 text-white/65">
                    <MapPin size={10} className="flex-shrink-0" />
                    <span className="text-[10px] line-clamp-1">{ev.city || ev.location?.split("،").pop()?.trim()}</span>
                  </div>
                )}
              </div>

              <div className="absolute left-3 bottom-3 flex flex-col gap-1.5 items-end">
                <Link href={`/events/${ev.id}`}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-xl border border-white/30 transition-all">
                  جزئیات
                </Link>
                {!full ? (
                  <Link href={`/events/${ev.id}/booking`}
                    className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-black px-4 py-2 rounded-xl shadow-lg transition-all">
                    رزرو
                  </Link>
                ) : (
                  <div className="bg-slate-800/60 backdrop-blur-sm text-white/60 text-[10px] font-bold px-3 py-2 rounded-xl">تکمیل ظرفیت</div>
                )}
              </div>
            </div>

            {!full && remaining <= 4 && (
              <div className="px-4 py-1.5 flex items-center gap-2" style={{ background: "rgba(255,107,0,0.08)" }}>
                <Users size={12} className="text-orange-500 flex-shrink-0" />
                <span className="text-[11px] text-orange-400 font-bold">فقط {remaining} جای خالی باقی مانده!</span>
                <div className="flex-1 h-1 bg-orange-900/40 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full transition-all"
                    style={{ width: `${Math.round((ev.reserved / ev.capacity) * 100)}%` }} />
                </div>
              </div>
            )}
            <div className="h-px mx-4" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>
        );
      })}
    </div>
  );
}
