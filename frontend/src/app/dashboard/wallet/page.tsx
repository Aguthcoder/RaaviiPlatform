"use client";

import { useState } from "react";

export default function WalletPage() {
  const [amount, setAmount] = useState(200000);
  return (
    <div className="app-card rounded-3xl p-6">
      <h1 className="text-2xl font-black">کیف پول</h1>
      <p className="mt-2 text-slate-300">موجودی فعلی: ۰ تومان</p>
      <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="mt-5 w-full rounded-xl bg-slate-800 p-3" />
      <button className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-xl">شارژ کیف پول</button>
    </div>
  );
}
