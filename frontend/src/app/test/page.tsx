"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";

const questions = [
  { id: 1, text: "در گفت‌وگوهای گروهی، انرژی شما چطور است؟", left: "آرام و شنونده", right: "فعال و پرانرژی" },
  { id: 2, text: "برای همنشینی ترجیح می‌دهید؟", left: "جمع کوچک و خصوصی", right: "جمع شلوغ و اجتماعی" },
];

export default function TestPage() {
  const { dispatch } = useAppContext();
  const router = useRouter();
  const [values, setValues] = useState([50, 50]);

  const submit = () => {
    dispatch({ type: "TAKE_TEST" });
    dispatch({ type: "COMPLETE_PROFILE" });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen p-6 md:p-12 bg-slate-100">
      <div className="max-w-4xl mx-auto app-card rounded-3xl p-6 md:p-10">
        <h1 className="text-3xl font-black mb-2">تست اجباری همنشینی</h1>
        <p className="text-slate-300 mb-8">تا تکمیل این تست امکان ورود به سایر صفحات وجود ندارد.</p>

        <div className="space-y-8">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-slate-800 rounded-2xl p-6">
              <p className="font-bold mb-4 text-white">{q.text}</p>
              <input
                type="range"
                min={0}
                max={100}
                value={values[idx]}
                onChange={(e) => {
                  const cp = [...values];
                  cp[idx] = Number(e.target.value);
                  setValues(cp);
                }}
                className="w-full accent-orange-500"
              />
              <div className="flex justify-between text-xs text-slate-300 mt-2">
                <span>{q.left}</span>
                <span>{q.right}</span>
              </div>
            </div>
          ))}
        </div>

        <button onClick={submit} className="mt-8 w-full bg-orange-500 py-3 rounded-xl font-bold text-white">ثبت پاسخ و ورود</button>
      </div>
    </div>
  );
}
