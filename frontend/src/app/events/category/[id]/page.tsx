"use client";
import Link from "next/link";
import { ArrowLeft, Users, Calendar, ShieldCheck } from "lucide-react";

export default function CategoryEvents() {
  // دیتای ساختگی برای نمونه
  const events = [
     { id: 1, title: "دورهمی کافه کتاب", date: "جمعه ۱۲ اسفند", capacity: 15 },
     { id: 2, title: "پیاده‌روی بام تهران", date: "پنجشنبه ۱۱ اسفند", capacity: 8 },
  ];

  return (
    <div className="min-h-screen px-4 pt-8 max-w-xl mx-auto">
       <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-black text-slate-900">همنشینی‌های فعال</h1>
          <Link href="/events" className="text-slate-500 hover:text-orange-500"><ArrowLeft /></Link>
       </div>

       <div className="space-y-4">
          {events.map(ev => (
             <div key={ev.id} className="card-navy p-5 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                   <h3 className="text-lg font-bold text-orange-500">{ev.title}</h3>
                   <span className="text-xs bg-slate-700 text-white px-2 py-1 rounded">{ev.date}</span>
                </div>
                
                <p className="text-slate-300 text-sm leading-6">
                   یک فرصت عالی برای آشنایی با افراد جدید. بر اساس تست شما، این رویداد ۸۰٪ با روحیات شما سازگار است.
                </p>

                <div className="flex items-center justify-between mt-2">
                   <div className="text-xs text-orange-300 font-bold flex items-center gap-1">
                      <Users size={14}/>
                      {ev.capacity} نفر منتظر همنشینی شما هستند
                   </div>
                   <Link href="/dashboard" className="bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-orange-600">
                      رزرو نهایی
                   </Link>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
}
