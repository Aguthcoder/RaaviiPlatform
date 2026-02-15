import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6 pb-20">
      <section className="app-card rounded-3xl p-6">
        <h2 className="text-2xl font-black">داشبورد همنشینی‌ها</h2>
        <p className="text-slate-200 mt-2">اطلاعات خصوصی همنشینی رزروشده (از جمله لوکیشن) فقط در این داشبورد نمایش داده می‌شود.</p>
        <Link href="/events" className="inline-block mt-4 bg-orange-500 text-white px-5 py-2 rounded-xl">رفتن به رزرو</Link>
      </section>

      <section className="app-card rounded-3xl p-6">
        <h3 className="text-xl font-bold">همنشینی فعال شما</h3>
        <p className="text-sm text-slate-300 mt-2">مکان: نمایش خصوصی برای کاربر • زمان شروع: ۱۹:۰۰</p>
      </section>
    </div>
  );
}
