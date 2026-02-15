"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

export default function VerifyPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { dispatch } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 4 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if(code.length !== 5) return;
    
    setLoading(true);
    // شبیه‌سازی تاخیر سرور
    await new Promise(r => setTimeout(r, 1000));
    
    dispatch({ type: "LOGIN" });
    // هدایت به صفحه تست
    router.push("/test");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-navy-900 relative">
      <div className="w-full max-w-md bg-navy-800 p-8 rounded-3xl border border-navy-700 shadow-2xl relative z-10">
        <button 
            onClick={() => router.back()} 
            className="text-slate-400 hover:text-white mb-8 flex items-center gap-2 text-sm transition-colors"
        >
            <ArrowRight size={16}/> اصلاح شماره
        </button>
        
        <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white mb-2">کد تایید</h1>
            <p className="text-slate-400 text-sm dir-ltr">
               Code sent to <span className="text-raavi-orange font-bold mx-1">{params.get('phone')}</span>
            </p>
        </div>
        
        <form onSubmit={handleVerify} className="space-y-8">
            <div className="flex gap-3 justify-center dir-ltr">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={el => { inputRefs.current[index] = el }}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleChange(index, e.target.value)}
                        onKeyDown={e => handleKeyDown(index, e)}
                        className="w-12 h-14 text-center text-2xl font-bold bg-navy-900 border border-navy-700 rounded-xl text-white focus:border-raavi-orange focus:ring-1 focus:ring-raavi-orange outline-none transition-all"
                    />
                ))}
            </div>
            
            <button 
                disabled={otp.join("").length !== 5 || loading} 
                className="w-full bg-raavi-orange disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" /> : "تایید و ادامه"}
            </button>
        </form>
      </div>
    </div>
  );
}
