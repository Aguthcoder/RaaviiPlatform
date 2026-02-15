"use client";

import { useEffect, useState } from "react";
import { fetchUserProfile, updateUserProfile, UserProfile } from "@/lib/api";

const INITIAL_PROFILE: UserProfile = {
  avatarUrl: "",
  bio: "",
  interests: [],
  city: "",
  age: null,
  gender: "",
  education: "",
};

export default function UserProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [interestsInput, setInterestsInput] = useState("");
  const [status, setStatus] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchUserProfile();
        setProfile(data);
        setInterestsInput(data.interests.join(", "));
      } catch {
        setStatus("اتصال به سرور برقرار نشد. اطلاعات نمونه نمایش داده می‌شود.");
      }
    }

    loadProfile();
  }, []);

  function updateField<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setProfile((previous) => ({ ...previous, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setIsSaving(true);

    try {
      const payload = {
        ...profile,
        interests: interestsInput
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      const updated = await updateUserProfile(payload);
      setProfile(updated);
      setInterestsInput(updated.interests.join(", "));
      setStatus("پروفایل با موفقیت ذخیره شد. این داده‌ها فقط برای مچ گروه/ایونت استفاده می‌شود.");
    } catch {
      setStatus("ذخیره‌سازی انجام نشد. لطفاً مجدد تلاش کنید.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto pb-10 space-y-6">
      <div className="app-card rounded-3xl p-6">
        <h1 className="text-2xl font-black text-white">پروفایل برای مچ گروهی</h1>
        <p className="text-sm text-slate-300 mt-2">
          این پروفایل صرفاً برای پیشنهاد گروه‌ها و ایونت‌ها استفاده می‌شود و هیچ فیلد مرتبط با چت ندارد.
        </p>
      </div>

      <form onSubmit={onSubmit} className="app-card rounded-3xl p-6 space-y-4">
        <label className="block space-y-2">
          <span className="text-sm text-slate-200">Avatar URL</span>
          <input
            value={profile.avatarUrl ?? ""}
            onChange={(event) => updateField("avatarUrl", event.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 text-white"
            placeholder="https://cdn.example.com/avatar.jpg"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-slate-200">Bio</span>
          <textarea
            value={profile.bio ?? ""}
            onChange={(event) => updateField("bio", event.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 text-white min-h-24"
            maxLength={500}
          />
        </label>

        <div className="grid md:grid-cols-2 gap-4">
          <label className="block space-y-2">
            <span className="text-sm text-slate-200">City</span>
            <input
              value={profile.city ?? ""}
              onChange={(event) => updateField("city", event.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 text-white"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-slate-200">Age</span>
            <input
              type="number"
              min={18}
              max={99}
              value={profile.age ?? ""}
              onChange={(event) => updateField("age", event.target.value ? Number(event.target.value) : null)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 text-white"
            />
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <label className="block space-y-2">
            <span className="text-sm text-slate-200">Gender</span>
            <select
              value={profile.gender ?? ""}
              onChange={(event) => updateField("gender", event.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 text-white"
            >
              <option value="">انتخاب کنید</option>
              <option value="male">male</option>
              <option value="female">female</option>
              <option value="non-binary">non-binary</option>
              <option value="prefer-not-to-say">prefer-not-to-say</option>
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-slate-200">Education</span>
            <input
              value={profile.education ?? ""}
              onChange={(event) => updateField("education", event.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 text-white"
            />
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm text-slate-200">Interests (comma separated tags)</span>
          <input
            value={interestsInput}
            onChange={(event) => setInterestsInput(event.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 text-white"
            placeholder="tech, hiking, language-exchange"
          />
        </label>

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/50 text-white px-5 py-2 font-semibold"
        >
          {isSaving ? "در حال ذخیره..." : "ذخیره پروفایل"}
        </button>

        {status ? <p className="text-sm text-slate-300">{status}</p> : null}
      </form>
    </div>
  );
}
