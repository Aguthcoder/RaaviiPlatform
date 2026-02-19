"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  fetchUserProfile,
  updateUserProfile,
  fetchUserStats,
  UserProfile,
  UserStats,
} from "@/lib/api";
import {
  User, Star, Calendar, Edit3, Save, X, Camera, CheckCircle,
  MapPin, BookOpen, Award, TrendingUp, Upload, Image as ImageIcon
} from "lucide-react";

const IRANIAN_CITIES = [
  "تهران", "اصفهان", "شیراز", "تبریز", "مشهد", "اهواز", "کرمانشاه",
  "ارومیه", "رشت", "کرج", "زاهدان", "همدان", "کرمان", "یزد", "اردبیل",
  "بندرعباس", "قم", "سنندج", "خرم‌آباد", "گرگان", "ساری", "بجنورد",
  "بوشهر", "ایلام", "بیرجند", "شهرکرد", "سمنان", "زنجان", "مراغه",
  "قزوین", "سبزوار", "نیشابور", "خوی", "ماهشهر", "قوچان", "دزفول",
  "آمل", "بابل", "شاهرود", "کاشان", "نجف‌آباد", "ملایر", "بروجرد",
];

const INITIAL_PROFILE: UserProfile = {
  avatarUrl: "", bio: "", interests: [], city: "",
  age: null, gender: "", education: "",
};

const INITIAL_STATS: UserStats = {
  successfulMatches: 0, completedEvents: 0,
  upcomingEvents: 0, totalBookings: 0,
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function ProfilePage() {
  const { state } = useApp();
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [interestsInput, setInterestsInput] = useState("");
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const [profileData, statsData] = await Promise.all([
          fetchUserProfile().catch(() => INITIAL_PROFILE),
          fetchUserStats().catch(() => INITIAL_STATS),
        ]);
        setProfile(profileData);
        setInterestsInput(profileData.interests?.join("، ") ?? "");
        setStats(statsData);
        if (profileData.avatarUrl) setAvatarPreview(profileData.avatarUrl);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function updateField<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setStatus("حجم فایل باید کمتر از ۵ مگابایت باشد.");
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/profiles/me/avatar`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        updateField("avatarUrl", data.avatarUrl);
        setStatus("عکس پروفایل با موفقیت آپلود شد.");
      } else {
        setStatus("آپلود عکس ناموفق بود.");
        setAvatarPreview(profile.avatarUrl ?? "");
      }
    } catch {
      setStatus("خطا در آپلود عکس.");
      setAvatarPreview(profile.avatarUrl ?? "");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");
    setIsSaving(true);
    try {
      const payload = {
        ...profile,
        interests: interestsInput.split(/[,،]/).map((i) => i.trim()).filter(Boolean),
      };
      const updated = await updateUserProfile(payload);
      setProfile(updated);
      setInterestsInput(updated.interests?.join("، ") ?? "");
      setStatus("پروفایل با موفقیت ذخیره شد.");
      setIsEditing(false);
    } catch {
      setStatus("ذخیره‌سازی انجام نشد. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsSaving(false);
    }
  }

  const userName = state.user?.name || "کاربر راوی";
  const userPhone = state.user?.mobileNumber || "";
  const displayAvatar = avatarPreview || profile.avatarUrl || state.user?.avatar || "";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { icon: CheckCircle, value: stats.successfulMatches, label: "تطابق موفق", color: "green", bg: "from-green-500/20 to-emerald-500/10" },
    { icon: Calendar, value: stats.completedEvents, label: "رویداد تمام‌شده", color: "orange", bg: "from-orange-500/20 to-amber-500/10" },
    { icon: Star, value: stats.upcomingEvents, label: "رویداد پیش‌رو", color: "blue", bg: "from-blue-500/20 to-sky-500/10" },
    { icon: User, value: stats.totalBookings, label: "کل رزروها", color: "purple", bg: "from-purple-500/20 to-violet-500/10" },
  ];

  return (
    <div className="max-w-2xl mx-auto pb-28 space-y-5">
      {/* ── کارت هدر پروفایل ── */}
      <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50"
        style={{ background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)" }}>
        {/* بنر گرادیانت */}
        <div className="h-32 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 40%, #c2410c 100%)" }}>
          <div className="absolute inset-0"
            style={{ backgroundImage: "radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(255,200,100,0.1) 0%, transparent 50%)" }} />
          <div className="absolute bottom-0 left-0 right-0 h-16"
            style={{ background: "linear-gradient(to top, #0f172a, transparent)" }} />
        </div>

        <div className="px-6 pb-6 -mt-16">
          {/* آواتار */}
          <div className="flex items-end justify-between mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl border-4 border-slate-900 shadow-2xl overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                {displayAvatar ? (
                  <img src={displayAvatar} alt={userName}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = "none"; }} />
                ) : (
                  <span className="text-3xl font-black text-white">{userName.charAt(0)}</span>
                )}
              </div>
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg border-2 border-slate-900 hover:bg-orange-400 transition-colors"
                >
                  <Camera size={14} className="text-white" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-lg ${
                isEditing
                  ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  : "bg-orange-500 text-white hover:bg-orange-400 shadow-orange-500/30"
              }`}
            >
              {isEditing ? <><X size={15} />انصراف</> : <><Edit3 size={15} />ویرایش</>}
            </button>
          </div>

          <h1 className="text-2xl font-black text-white">{userName}</h1>
          {userPhone && <p className="text-sm text-slate-400 mt-0.5 font-mono">{userPhone}</p>}

          <div className="flex flex-wrap items-center gap-3 mt-2">
            {profile.city && (
              <span className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
                <MapPin size={11} className="text-orange-400" />
                {profile.city}
              </span>
            )}
            {profile.education && (
              <span className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
                <BookOpen size={11} className="text-blue-400" />
                {profile.education}
              </span>
            )}
            {profile.age && (
              <span className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
                {profile.age} سال
              </span>
            )}
          </div>

          {profile.bio && !isEditing && (
            <p className="mt-3 text-sm text-slate-300 leading-relaxed bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
              {profile.bio}
            </p>
          )}

          {profile.interests?.length > 0 && !isEditing && (
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.interests.map((tag) => (
                <span key={tag}
                  className="bg-orange-500/15 text-orange-300 text-xs font-bold px-3 py-1 rounded-full border border-orange-500/25 hover:bg-orange-500/25 transition-colors">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── کارت‌های آمار ── */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map(({ icon: Icon, value, label, color, bg }) => (
          <div key={label}
            className={`rounded-2xl p-5 border border-slate-700/40 bg-gradient-to-br ${bg} backdrop-blur-sm flex flex-col items-center gap-2 transition-transform hover:scale-[1.02]`}
            style={{ background: `linear-gradient(145deg, #1e293b, #0f172a)` }}>
            <div className={`w-11 h-11 rounded-xl bg-${color}-500/20 flex items-center justify-center`}>
              <Icon size={22} className={`text-${color}-400`} />
            </div>
            <span className="text-3xl font-black text-white">{value}</span>
            <span className="text-xs text-slate-400 text-center leading-tight">{label}</span>
          </div>
        ))}
      </div>

      {/* ── فرم ویرایش ── */}
      {isEditing && (
        <form onSubmit={onSave}
          className="rounded-3xl p-6 space-y-5 border border-slate-700/40 shadow-2xl"
          style={{ background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)" }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Edit3 size={16} className="text-orange-400" />
            </div>
            <h2 className="text-lg font-black text-white">ویرایش پروفایل</h2>
          </div>

          {/* آپلود عکس */}
          <div className="border-2 border-dashed border-slate-600 rounded-2xl p-5 text-center hover:border-orange-500/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}>
            <div className="flex flex-col items-center gap-2">
              {displayAvatar ? (
                <img src={displayAvatar} alt="" className="w-16 h-16 rounded-xl object-cover mb-1" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-700 flex items-center justify-center mb-1">
                  <ImageIcon size={28} className="text-slate-500" />
                </div>
              )}
              <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                <Upload size={15} />
                <span>{uploadingAvatar ? "در حال آپلود..." : "انتخاب عکس پروفایل"}</span>
              </div>
              <p className="text-xs text-slate-500">JPG، PNG یا WebP - حداکثر ۵ مگابایت</p>
            </div>
          </div>

          {/* بیو */}
          <label className="block space-y-2">
            <span className="text-sm font-bold text-slate-300">درباره من</span>
            <textarea
              value={profile.bio ?? ""}
              onChange={(e) => updateField("bio", e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-4 py-3 text-white text-sm min-h-24 resize-none focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all"
              maxLength={300}
              placeholder="خودت را معرفی کن..."
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            {/* شهر - dropdown */}
            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-300 flex items-center gap-1">
                <MapPin size={13} className="text-orange-400" />شهر
              </span>
              <select
                value={profile.city ?? ""}
                onChange={(e) => updateField("city", e.target.value)}
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all appearance-none cursor-pointer"
              >
                <option value="">انتخاب شهر</option>
                {IRANIAN_CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </label>

            {/* سن */}
            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-300">سن</span>
              <input
                type="number" min={18} max={99}
                value={profile.age ?? ""}
                onChange={(e) => updateField("age", e.target.value ? Number(e.target.value) : null)}
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all"
                placeholder="۲۵"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* جنسیت */}
            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-300">جنسیت</span>
              <select
                value={profile.gender ?? ""}
                onChange={(e) => updateField("gender", e.target.value)}
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all appearance-none cursor-pointer"
              >
                <option value="">انتخاب کنید</option>
                <option value="male">مرد</option>
                <option value="female">زن</option>
                <option value="non-binary">غیر باینری</option>
                <option value="prefer-not-to-say">ترجیح می‌دهم نگویم</option>
              </select>
            </label>

            {/* تحصیلات */}
            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-300 flex items-center gap-1">
                <BookOpen size={13} className="text-blue-400" />تحصیلات
              </span>
              <select
                value={profile.education ?? ""}
                onChange={(e) => updateField("education", e.target.value)}
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all appearance-none cursor-pointer"
              >
                <option value="">انتخاب کنید</option>
                <option value="diploma">دیپلم</option>
                <option value="associate">فوق دیپلم</option>
                <option value="bachelor">کارشناسی</option>
                <option value="master">کارشناسی ارشد</option>
                <option value="phd">دکترا</option>
              </select>
            </label>
          </div>

          {/* علایق */}
          <label className="block space-y-2">
            <span className="text-sm font-bold text-slate-300 flex items-center gap-1">
              <Award size={13} className="text-purple-400" />علایق (با کاما جدا کنید)
            </span>
            <input
              value={interestsInput}
              onChange={(e) => setInterestsInput(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all"
              placeholder="کتاب، موسیقی، کوهنوردی، سینما"
            />
          </label>

          {/* دکمه‌ها */}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white px-5 py-3 font-bold transition-all shadow-lg shadow-orange-500/20 text-sm">
              <Save size={16} />
              {isSaving ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
            <button type="button" onClick={() => setIsEditing(false)}
              className="rounded-xl bg-slate-700 hover:bg-slate-600 text-white px-5 py-3 font-bold transition-all text-sm">
              انصراف
            </button>
          </div>

          {status && (
            <div className={`rounded-xl px-4 py-3 text-sm font-bold flex items-center gap-2 ${
              status.includes("موفق")
                ? "bg-green-500/15 text-green-400 border border-green-500/30"
                : "bg-red-500/15 text-red-400 border border-red-500/30"
            }`}>
              {status.includes("موفق") ? <CheckCircle size={15} /> : <X size={15} />}
              {status}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
