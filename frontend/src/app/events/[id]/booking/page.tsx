"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getCategoryById, getEventById } from "@/lib/events-catalog";
import { getTopicImage } from "@/lib/dynamic-images";

export default function BookingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const event = getEventById(params.id);
  const category = getCategoryById(event?.categoryId ?? "hamneshin");

  return (
    <div className="min-h-screen px-4 py-8 pb-24">
      <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 app-card rounded-3xl p-6 space-y-4">
          <img
            src={getTopicImage(event?.topic ?? category?.theme ?? "social meetup", 90, 1400, 700)}
            alt={event?.title ?? "رزرو همنشینی"}
            className="rounded-2xl h-56 w-full object-cover"
          />
          <h1 className="text-2xl font-black mb-3">جزئیات همنشینی {event?.title ?? params.id}</h1>
          <p className="text-slate-200 mb-4">
            این صفحه نهایی رزرو است. بخش لوکیشن عمومی و زمان‌بندی طبق درخواست حذف شده و اطلاعات تکمیلی فقط در داشبورد خصوصی نمایش داده می‌شود.
          </p>

          <div className="rounded-2xl bg-slate-800 p-4">
            <p className="text-orange-300">۱۵ نفر منتظر همنشینی شما هستند.</p>
          </div>

          {category && (
            <>
              <div className="rounded-2xl bg-slate-800/90 p-4">
                <h2 className="font-black text-orange-400 mb-2">نمونه‌های {category.title}</h2>
                <ul className="text-sm text-slate-200 space-y-1">
                  {category.samples.map((sample) => (
                    <li key={sample}>• {sample}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-slate-800/90 p-4">
                <h2 className="font-black text-orange-400 mb-2">تخفیف‌های ویژه {category.title}</h2>
                <ul className="text-sm text-slate-200 space-y-1">
                  {category.discounts.map((discount) => (
                    <li key={discount}>• {discount}</li>
                  ))}
                </ul>
                <Link href={`/events/category/${category.id}`} className="inline-block mt-3 text-orange-300">
                  مشاهده صفحه داینامیک دسته‌بندی
                </Link>
              </div>
            </>
          )}
        </div>

        <aside className="app-card rounded-3xl p-6">
          <p className="text-sm text-slate-300">هزینه ثبت‌نام</p>
          <p className="text-2xl font-black mt-1">۴۵۰,۰۰۰ تومان</p>
          <button
            onClick={() => router.push(`/payment-success?eventId=${params.id}`)}
            className="w-full bg-orange-500 text-white rounded-xl py-3 mt-6"
          >
            تکمیل رزرو
          </button>
          <Link href="/events" className="block text-center mt-3 text-slate-300 text-sm">بازگشت</Link>
        </aside>
      </div>
    </div>
  );
}
