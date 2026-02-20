"use client";

import { useEffect, useState } from "react";
import { Brain, Zap, Heart, Eye, TrendingUp, AlertTriangle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface SmartProfileData {
  communication_type: "introvert" | "extrovert" | "ambivert" | null;
  dominant_need: "seen" | "security" | "meaning" | "entertainment" | null;
  interaction_rhythm: "active" | "cautious" | "observer" | null;
  return_rate: number;
  total_events_attended: number;
  smart_score: number;
  is_suspended: boolean;
  suspension_reason?: string;
  avg_match_satisfaction: number;
}

const COMMUNICATION_LABELS: Record<string, { label: string; desc: string; color: string }> = {
  introvert: { label: "درون‌گرا", desc: "در گروه‌های کوچک درخشش بیشتری داری", color: "#3b82f6" },
  extrovert: { label: "برون‌گرا", desc: "انرژی‌ات گروه رو زنده می‌کنه", color: "#f59e0b" },
  ambivert: { label: "ترکیبی", desc: "انعطاف بالا در موقعیت‌های مختلف", color: "#8b5cf6" },
};

const NEED_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  seen: { label: "دیده شدن", icon: <Eye size={14} /> },
  security: { label: "امنیت", icon: <Heart size={14} /> },
  meaning: { label: "معنا", icon: <Brain size={14} /> },
  entertainment: { label: "سرگرمی", icon: <Zap size={14} /> },
};

const RHYTHM_LABELS: Record<string, string> = {
  active: "فعال",
  cautious: "محتاط",
  observer: "ناظر",
};

export default function SmartProfileCard() {
  const [profile, setProfile] = useState<SmartProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }

    fetch(`${API_URL}/api/matching/my-profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl p-5 animate-pulse" style={{
        background: "linear-gradient(145deg, #1B2A4A 0%, #132038 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div className="h-4 bg-white/10 rounded mb-3 w-1/2" />
        <div className="h-3 bg-white/10 rounded mb-2" />
        <div className="h-3 bg-white/10 rounded w-3/4" />
      </div>
    );
  }

  if (!profile) return null;

  const commType = profile.communication_type
    ? COMMUNICATION_LABELS[profile.communication_type]
    : null;

  return (
    <div className="rounded-2xl overflow-hidden" style={{
      background: "linear-gradient(145deg, #1B2A4A 0%, #132038 100%)",
      border: "1px solid rgba(255,255,255,0.08)",
    }}>
      {/* هدر */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="w-8 h-8 bg-orange-500/20 rounded-xl flex items-center justify-center">
          <Brain size={16} className="text-orange-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm">پروفایل هوشمند</h3>
          <p className="text-[11px] text-slate-500">تحلیل‌شده توسط الگوریتم راوی</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* ساسپند */}
        {profile.is_suspended && (
          <div className="rounded-xl p-3 flex items-start gap-2"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-red-300 text-xs font-bold">حساب محدود شده</div>
              <div className="text-red-400/70 text-[11px] mt-0.5">{profile.suspension_reason}</div>
              <div className="text-[11px] text-red-400/50 mt-1">برای رفع محدودیت با پشتیبانی تماس بگیرید</div>
            </div>
          </div>
        )}

        {/* تیپ ارتباطی */}
        {commType && (
          <div>
            <div className="text-[11px] text-slate-500 mb-2">تیپ ارتباطی</div>
            <div className="flex items-center gap-3">
              <div
                className="px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: `${commType.color}20`, color: commType.color, border: `1px solid ${commType.color}30` }}
              >
                {commType.label}
              </div>
              <span className="text-slate-400 text-xs">{commType.desc}</span>
            </div>
          </div>
        )}

        {/* آمار */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-lg font-black text-white">{profile.total_events_attended}</div>
            <div className="text-[10px] text-slate-500">رویداد</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black" style={{ color: "#22c55e" }}>
              {Math.round(profile.return_rate)}٪
            </div>
            <div className="text-[10px] text-slate-500">نرخ بازگشت</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black text-orange-400">
              {Math.round(profile.avg_match_satisfaction)}٪
            </div>
            <div className="text-[10px] text-slate-500">رضایت مچ</div>
          </div>
        </div>

        {/* نیاز غالب و ریتم */}
        <div className="flex items-center justify-between">
          {profile.dominant_need && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-400">
                {NEED_LABELS[profile.dominant_need]?.icon}
              </div>
              <div>
                <div className="text-[10px] text-slate-500">نیاز غالب</div>
                <div className="text-xs text-white font-bold">
                  {NEED_LABELS[profile.dominant_need]?.label}
                </div>
              </div>
            </div>
          )}

          {profile.interaction_rhythm && (
            <div className="text-left">
              <div className="text-[10px] text-slate-500">ریتم تعامل</div>
              <div className="text-xs text-white font-bold">
                {RHYTHM_LABELS[profile.interaction_rhythm]}
              </div>
            </div>
          )}
        </div>

        {/* بار درصد هوشمند */}
        {profile.smart_score > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <TrendingUp size={11} />
                امتیاز هوشمند
              </span>
              <span className="text-xs font-bold text-orange-400">{Math.round(profile.smart_score)}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, profile.smart_score)}%` }}
              />
            </div>
          </div>
        )}

        {/* اگر هنوز پروفایل کامل نشده */}
        {!profile.communication_type && !profile.is_suspended && (
          <div className="rounded-xl p-3 text-center"
            style={{ background: "rgba(255,107,0,0.05)", border: "1px dashed rgba(255,107,0,0.2)" }}>
            <p className="text-xs text-slate-400">
              پروفایل هوشمند بعد از اولین رویداد تکمیل می‌شود 🌱
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
