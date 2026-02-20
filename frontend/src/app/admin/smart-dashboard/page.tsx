"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { isAdminPhone } from "@/lib/api";
import {
  Brain, Users, TrendingUp, AlertTriangle, CheckCircle2,
  Sparkles, BarChart2, Star, RefreshCw, XCircle,
  UserX, FileText, Activity, Zap,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const CARD = {
  background: "linear-gradient(145deg, #1B2A4A 0%, #132038 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
};

function StatCard({
  icon,
  value,
  label,
  color = "orange",
  sub,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color?: string;
  sub?: string;
}) {
  const colors: Record<string, string> = {
    orange: "#FF6B00",
    green: "#22c55e",
    blue: "#3b82f6",
    red: "#ef4444",
    purple: "#a855f7",
  };

  return (
    <div className="rounded-2xl p-5 relative overflow-hidden" style={CARD}>
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `rgba(${color === "orange" ? "255,107,0" : color === "green" ? "34,197,94" : "59,130,246"},0.5)` }}
      />
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${colors[color]}20` }}
      >
        <div style={{ color: colors[color] }}>{icon}</div>
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
      {sub && <div className="text-[11px] mt-1" style={{ color: colors[color] }}>{sub}</div>}
    </div>
  );
}

export default function SmartDashboardPage() {
  const { state } = useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [suspended, setSuspended] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [patterns, setPatterns] = useState<any>({});
  const [inactive, setInactive] = useState<any>({ count: 0 });

  useEffect(() => {
    if (!state.isLoggedIn) { router.push("/login"); return; }
    if (!isAdminPhone(state.user?.mobileNumber)) { router.push("/dashboard"); return; }
    loadAll();
  }, [state.isLoggedIn]);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  async function loadAll() {
    setLoading(true);
    try {
      const [statsRes, suspendedRes, draftsRes, patternsRes, inactiveRes] = await Promise.allSettled([
        fetch(`${API_URL}/api/admin/stats`, { headers }).then((r) => r.json()),
        fetch(`${API_URL}/api/matching/suspended-users`, { headers }).then((r) => r.json()),
        fetch(`${API_URL}/api/content/admin/drafts`, { headers }).then((r) => r.json()),
        fetch(`${API_URL}/api/matching/behavior-patterns`, { headers }).then((r) => r.json()),
        fetch(`${API_URL}/api/matching/inactive-users?days=14`, { headers }).then((r) => r.json()),
      ]);

      if (statsRes.status === "fulfilled") setStats(statsRes.value);
      if (suspendedRes.status === "fulfilled") setSuspended(Array.isArray(suspendedRes.value) ? suspendedRes.value : []);
      if (draftsRes.status === "fulfilled") setDrafts(Array.isArray(draftsRes.value) ? draftsRes.value : []);
      if (patternsRes.status === "fulfilled") setPatterns(patternsRes.value || {});
      if (inactiveRes.status === "fulfilled") setInactive(inactiveRes.value || { count: 0 });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function unsuspendUser(userId: string) {
    await fetch(`${API_URL}/api/matching/unsuspend/${userId}`, { method: "POST", headers });
    setSuspended((prev) => prev.filter((u) => u.userId !== userId));
  }

  async function approveContent(id: string) {
    await fetch(`${API_URL}/api/content/admin/approve/${id}`, { method: "POST", headers });
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  }

  async function rejectContent(id: string) {
    await fetch(`${API_URL}/api/content/admin/reject/${id}`, { method: "POST", headers });
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  }

  async function generateContent() {
    await fetch(`${API_URL}/api/content/admin/generate`, { method: "POST", headers, body: JSON.stringify({}) });
    setTimeout(loadAll, 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0D1B2A" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">در حال بارگذاری داشبورد هوشمند...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-20"
      style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #0A1628 100%)" }}
      dir="rtl"
    >
      {/* هدر */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Brain size={20} className="text-orange-400" />
              <h1 className="text-lg font-black text-white">داشبورد هوشمند CEO</h1>
            </div>
            <p className="text-xs text-slate-400">لایه هوشمندسازی راوی</p>
          </div>
          <button
            onClick={loadAll}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* آمار کلی */}
        <div>
          <h2 className="text-sm font-bold text-slate-400 mb-3">آمار سیستم</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={<Users size={20} />} value={stats.totalUsers || 0} label="کل کاربران" color="blue" />
            <StatCard icon={<Activity size={20} />} value={stats.totalEvents || 0} label="رویدادهای فعال" color="green" />
            <StatCard icon={<TrendingUp size={20} />} value={`${stats.avgSuccessRate || 0}٪`} label="نرخ موفقیت" color="orange" />
            <StatCard icon={<UserX size={20} />} value={suspended.length} label="ساسپندشده" color="red" />
          </div>
        </div>

        {/* هوشمندسازی - الگوهای رفتاری */}
        {patterns.avgReturnRate !== undefined && (
          <div>
            <h2 className="text-sm font-bold text-slate-400 mb-3">الگوهای رفتاری هوشمند</h2>
            <div className="rounded-2xl p-5" style={CARD}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-black text-orange-400">{patterns.avgReturnRate}٪</div>
                  <div className="text-xs text-slate-400 mt-1">میانگین نرخ بازگشت</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-white mb-2">رویدادهای پرطرفدار</div>
                  <div className="flex flex-wrap gap-1">
                    {(patterns.popularEventTypes || []).slice(0, 4).map((t: string) => (
                      <span key={t} className="text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="text-xs text-slate-400 mb-2">کاربران غیرفعال (۱۴ روز)</div>
                <div className="flex items-center gap-2">
                  <div className="text-xl font-black text-yellow-400">{inactive.count || 0}</div>
                  <span className="text-xs text-slate-500">نفر نیاز به پیامک یادآوری دارند</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* کاربران ساسپندشده */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-400">کاربران ساسپندشده</h2>
            <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-full">
              {suspended.length} نفر
            </span>
          </div>

          {suspended.length === 0 ? (
            <div className="rounded-2xl p-4 text-center" style={CARD}>
              <CheckCircle2 size={32} className="text-green-400 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">هیچ کاربر ساسپندشده‌ای وجود ندارد</p>
            </div>
          ) : (
            <div className="space-y-2">
              {suspended.map((user: any) => (
                <div key={user.userId} className="rounded-2xl p-4 flex items-center justify-between" style={CARD}>
                  <div>
                    <div className="text-white text-sm font-bold">{user.userId.slice(0, 8)}...</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {user.noShowCount} بار عدم حضور
                    </div>
                    <div className="text-xs text-red-400">{user.reason}</div>
                  </div>
                  <button
                    onClick={() => unsuspendUser(user.userId)}
                    className="text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 px-3 py-1.5 rounded-xl transition"
                  >
                    رفع ساسپند
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* مدیریت محتوای AI */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-400">محتوای AI در انتظار تایید</h2>
            <button
              onClick={generateContent}
              className="flex items-center gap-1 text-xs bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 px-3 py-1.5 rounded-xl transition"
            >
              <Sparkles size={12} />
              تولید جدید
            </button>
          </div>

          {drafts.length === 0 ? (
            <div className="rounded-2xl p-4 text-center" style={CARD}>
              <FileText size={32} className="text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">پیش‌نویسی برای تایید وجود ندارد</p>
            </div>
          ) : (
            <div className="space-y-3">
              {drafts.slice(0, 5).map((draft: any) => (
                <div key={draft.id} className="rounded-2xl p-4" style={CARD}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="text-white text-sm font-bold line-clamp-1">{draft.title}</div>
                      <div className="text-xs text-slate-400 mt-1 line-clamp-2">{draft.summary}</div>
                    </div>
                    <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full shrink-0">
                      {draft.topic}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => approveContent(draft.id)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 py-2 rounded-xl transition"
                    >
                      <CheckCircle2 size={12} />
                      تایید و انتشار
                    </button>
                    <button
                      onClick={() => rejectContent(draft.id)}
                      className="flex items-center justify-center gap-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-2 rounded-xl transition"
                    >
                      <XCircle size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* لینک‌های سریع */}
        <div>
          <h2 className="text-sm font-bold text-slate-400 mb-3">عملیات هوشمند</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "گروه‌بندی هوشمند", href: "/admin/matching", icon: <Zap size={16} /> },
              { label: "مدیریت محتوا", href: "/admin/content", icon: <FileText size={16} /> },
              { label: "داشبورد اصلی", href: "/admin/dashboard", icon: <BarChart2 size={16} /> },
              { label: "کاربران", href: "/admin/users", icon: <Users size={16} /> },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 p-4 rounded-2xl text-sm text-white hover:border-orange-500/30 transition"
                style={CARD}
              >
                <div className="text-orange-400">{item.icon}</div>
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
