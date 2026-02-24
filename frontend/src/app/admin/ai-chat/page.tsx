"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { isAdminPhone } from "@/lib/api";
import { Send } from "lucide-react";

type Message = { id: number; text: string; isMe: boolean };
const SYSTEM_PROMPT = "شما دستیار مدیریت پلتفرم راوی هستید و پاسخ‌های مدیریتی و تحلیلی ارائه می‌دهید.";

export default function AdminAiChatPage() {
  const { state } = useApp();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ id: 1, text: "سلام! من دستیار AI مدیریت راوی هستم.", isMe: false }]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.isLoading) return;
    if (!state.isLoggedIn || !isAdminPhone(state.user?.mobileNumber)) router.replace("/dashboard");
  }, [state.isLoading, state.isLoggedIn, state.user?.mobileNumber, router]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((prev) => [...prev, { id: Date.now(), text, isMe: true }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: Date.now() + 5, text: `(${SYSTEM_PROMPT})\nپاسخ نمونه مدیریتی: شاخص‌های CRM و Endpoints را بررسی کنید.`, isMe: false }]);
    }, 250);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 h-[calc(100vh-2rem)] flex flex-col" dir="rtl">
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4 mb-3"><h1 className="text-white font-black text-lg">چت AI مدیریت</h1></div>
      <div className="flex-1 rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4 overflow-y-auto space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.isMe ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${m.isMe ? "bg-orange-500 text-white rounded-bl-none" : "bg-white text-slate-800 rounded-br-none"}`}>{m.text}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-700/60 bg-slate-900/70 p-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onSend()} placeholder="پیام مدیریتی خود را بنویسید..." className="flex-1 bg-transparent text-white text-sm px-3 py-2 outline-none" />
        <button onClick={onSend} className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center"><Send size={16} /></button>
      </div>
    </div>
  );
}
