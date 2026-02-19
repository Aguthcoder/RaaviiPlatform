"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { categories, getCategoryById, popularEvents } from "@/lib/events-catalog";
import { getTopicImage } from "@/lib/dynamic-images";

export default function CategoryPage() {
  const params = useParams<{ categoryId: string }>();
  const category = getCategoryById(params.categoryId) ?? categories[0];
  const relatedEvents = popularEvents.filter((event) => event.categoryId === category.id);

  return (
    <div className="min-h-screen px-4 py-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <section className="app-card rounded-3xl p-6">
          <img
            src={getTopicImage(category.theme, 200, 1400, 650)}
            alt={category.title}
            className="h-56 w-full object-cover rounded-2xl mb-4"
          />
          <h1 className="text-3xl font-black mb-2 text-orange-400">دسته‌بندی {category.title}</h1>
          <p className="text-slate-200">{category.description}</p>
        </section>

        <section className="app-card rounded-3xl p-6">
          <h2 className="text-xl font-black mb-3 text-orange-300">نمونه همنشینی‌ها</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {category.samples.map((item, idx) => (
              <article key={item} className="rounded-2xl border border-slate-700 overflow-hidden bg-slate-800/70">
                <img src={getTopicImage(`${category.theme} ${item}`, 220 + idx, 900, 500)} alt={item} className="h-28 w-full object-cover" />
                <p className="p-3 text-sm font-bold text-slate-100">{item}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="app-card rounded-3xl p-6">
          <h2 className="text-xl font-black mb-3 text-orange-300">تخفیفات فعال</h2>
          <ul className="space-y-2 text-slate-200">
            {category.discounts.map((discount) => (
              <li key={discount} className="rounded-xl bg-slate-800 px-4 py-3">{discount}</li>
            ))}
          </ul>
        </section>

        <section className="app-card rounded-3xl p-6">
          <h2 className="text-xl font-black mb-3 text-orange-300">رزروهای مرتبط</h2>
          <div className="space-y-3">
            {relatedEvents.length ? relatedEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}/booking`} className="block rounded-2xl bg-slate-800 p-4">
                <p className="font-bold text-white">{event.title}</p>
                <p className="text-sm text-slate-300">{event.time}</p>
              </Link>
            )) : <p className="text-slate-300">به‌زودی رویدادهای بیشتری اضافه می‌شود.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
