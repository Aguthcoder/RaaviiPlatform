"use client";
import { Trophy } from "lucide-react";

export default function GamePage() {
  return (
    <div className="p-6 pt-10 min-h-screen flex flex-col items-center justify-center text-center">
       <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-6 animate-bounce">
          <Trophy size={48} />
       </div>
       <h1 className="text-2xl font-black text-slate-900 mb-4">بازی یخ‌شکن 🧊</h1>
       <p className="text-slate-500 max-w-xs leading-7 mb-8">
          این بازی پس از شروع همنشینی شما فعال می‌شود. سوالاتی طراحی شده تا با هم‌گروهی‌های خود بیشتر آشنا شوید.
       </p>
       <div className="card-navy p-4 w-full max-w-xs opacity-50">
          <p className="text-white text-sm">منتظر شروع رویداد باشید...</p>
       </div>
    </div>
  );
}
