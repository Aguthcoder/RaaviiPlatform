"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { fetchAllUsers, isAdminPhone, AdminUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Users, Search, MapPin, Phone, Filter } from "lucide-react";

const CITIES = ["همه شهرها","تهران","مشهد","اصفهان","شیراز","تبریز","کرج","قم","اهواز","کرمانشاه","ارومیه","رشت","زاهدان","کرمان","همدان","یزد"];
const CARD = { background: "linear-gradient(145deg, #1B2A4A, #132038)", border: "1px solid rgba(255,255,255,0.08)" };

export default function AdminUsersPage() {
  const { state } = useApp();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("همه شهرها");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!state.isLoading && !isAdminPhone(state.user?.mobileNumber)) router.replace("/dashboard");
  }, [state.isLoading, state.user]);

  useEffect(() => {
    setLoading(true);
    fetchAllUsers({ city: cityFilter === "همه شهرها" ? undefined : cityFilter, page, limit: 20 })
      .then((res) => { setUsers(res.users); setTotal(res.total); })
      .catch(() => {
        setUsers([
          { id: "1", name: "علی احمدی", mobileNumber: "09120000001", city: "تهران", createdAt: new Date().toISOString(), bookingCount: 3 },
          { id: "2", name: "مریم حسینی", mobileNumber: "09130000002", city: "مشهد", createdAt: new Date().toISOString(), bookingCount: 1 },
          { id: "3", name: "رضا کریمی", mobileNumber: "09140000003", city: "اصفهان", createdAt: new Date().toISOString(), bookingCount: 5 },
        ]);
        setTotal(3);
      })
      .finally(() => setLoading(false));
  }, [cityFilter, page]);

  const filtered = search.trim() ? users.filter((u) => u.name?.includes(search) || u.mobileNumber?.includes(search)) : users;

  return (
    <div className="max-w-2xl mx-auto pb-24 space-y-5 relative z-10" dir="rtl">
      <div className="rounded-3xl p-6" style={CARD}>
        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <Users size={20} className="text-orange-400" /> مدیریت کاربران
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>مجموع {total} کاربر</p>
      </div>

      <div className="rounded-2xl p-4 space-y-3" style={CARD}>
        <div className="relative">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="جستجو نام یا شماره..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-9 pl-4 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CITIES.slice(0, 8).map((c) => (
            <button key={c} onClick={() => { setCityFilter(c); setPage(1); }}
              className={`text-xs px-3 py-1 rounded-xl font-bold transition-all ${cityFilter === c ? "bg-orange-500 text-white" : "text-slate-400"}`}
              style={cityFilter === c ? {} : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((u) => (
            <div key={u.id} className="rounded-2xl p-4 flex items-center gap-3" style={CARD}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,107,0,0.15)" }}>
                <span className="font-black text-orange-400 text-base">{(u.name || "؟").charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-white text-sm">{u.name || "بدون نام"}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[11px] flex items-center gap-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                    <Phone size={10} />{u.mobileNumber || "—"}
                  </span>
                  {u.city && <span className="text-[11px] flex items-center gap-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                    <MapPin size={10} className="text-orange-400" />{u.city}
                  </span>}
                </div>
              </div>
              <div className="flex-shrink-0">
                {u.bookingCount !== undefined && (
                  <span className="text-xs px-2 py-1 rounded-xl font-bold" style={{ background: "rgba(255,107,0,0.12)", color: "#FF9A3C" }}>
                    {u.bookingCount} رزرو
                  </span>
                )}
                {u.createdAt && <p className="text-[10px] mt-1 text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {new Date(u.createdAt).toLocaleDateString("fa-IR")}
                </p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
