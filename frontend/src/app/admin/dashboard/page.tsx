import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-3xl font-black text-slate-900">داشبورد ادمین</h1>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500">مدیریت همنشینی‌ها</p>
            <p className="font-bold text-xl mt-2">ایجاد و انتشار رویدادهای جدید</p>
          </div>
          <Link href="/admin/events/new" className="rounded-2xl bg-orange-500 px-5 py-3 text-white font-bold">ایجاد همنشینی</Link>
        </div>
      </div>
    </main>
  );
}
