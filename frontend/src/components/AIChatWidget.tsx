"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Sparkles } from "lucide-react";

const API_KEY = "sk-fRQfQLXc8pkuNIIf6eSokMD2KU1BdsLUXXj4gtv4yQLrIlxQ";
const AI_MODEL = "claude-opus-4-6";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SYSTEM_PROMPT = `شما دستیار هوشمند پلتفرم راوی هستید. راوی یک پلتفرم دورهمی اجتماعی هوشمند است که افراد را بر اساس شخصیت، سن و علایق با هم آشنا می‌کند.

وظایف شما:
- راهنمایی کاربر برای انتخاب برنامه مناسب
- کمک به رزرو رویداد
- توضیح قوانین و فرآیندهای راوی
- پاسخ به سوالات درباره گروه‌بندی هوشمند

درباره راوی:
- رویدادها شامل: دورهمی کافه، بردگیم، کوهنوردی، تئاتر، موسیقی و غیره
- گروه‌ها ۴-۶ نفره بر اساس الگوریتم هوشمند شکل می‌گیرند
- قیمت‌ها معمولاً بین ۳۰,۰۰۰ تا ۲۰۰,۰۰۰ تومان است
- مکان رویداد ۲۴ ساعت قبل اعلام می‌شود

همیشه به فارسی پاسخ بده. مختصر، دوستانه و مفید باش.`;

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "سلام! 👋 من دستیار هوشمند راوی هستم. چطور می‌تونم کمکت کنم؟\n\nمی‌تونی بپرسی:\n• کدوم برنامه مناسب منه؟\n• نحوه رزرو رویداد\n• قوانین راوی",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setHasNewMessage(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.concat(userMessage).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: AI_MODEL,
          max_tokens: 500,
          system: SYSTEM_PROMPT,
          messages: history,
        }),
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text || "متاسفم، مشکلی پیش اومد. دوباره تلاش کن.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          timestamp: new Date(),
        },
      ]);

      if (!isOpen) setHasNewMessage(true);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "اتصال به دستیار موقتاً قطع شده. لطفاً دوباره تلاش کن. 🔄",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function formatTime(date: Date) {
    return date.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="fixed bottom-6 left-6 z-50" dir="rtl">
      {/* چت ویجت */}
      {isOpen && (
        <div
          className="absolute bottom-16 left-0 w-[340px] sm:w-[380px] rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: "linear-gradient(145deg, #1B2A4A 0%, #132038 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            height: "480px",
          }}
        >
          {/* هدر */}
          <div
            className="flex items-center justify-between p-4 shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">دستیار راوی</h3>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[11px] text-slate-400">آنلاین</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X size={16} />
            </button>
          </div>

          {/* پیام‌ها */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-orange-500 text-white rounded-bl-none"
                      : "text-slate-200 rounded-br-none"
                  }`}
                  style={
                    msg.role === "assistant"
                      ? { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }
                      : {}
                  }
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                  <span className="text-[10px] opacity-60 block mt-1 text-left">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-end">
                <div
                  className="rounded-2xl rounded-br-none px-4 py-3"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* سوالات سریع */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2 shrink-0">
              {["چه برنامه‌ای مناسبه؟", "قوانین راوی", "نحوه رزرو"].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    setTimeout(sendMessage, 0);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full text-orange-400 hover:bg-orange-500 hover:text-white transition"
                  style={{ border: "1px solid rgba(255,107,0,0.3)" }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* فیلد ارسال */}
          <div
            className="p-3 shrink-0"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex gap-2 items-center">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="سوالت رو بپرس..."
                disabled={isLoading}
                className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* دکمه باز/بسته کردن */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-14 h-14 bg-orange-500 hover:bg-orange-400 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all active:scale-95 relative"
        style={{ boxShadow: "0 8px 32px rgba(255,107,0,0.4)" }}
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <MessageCircle size={24} />
        )}

        {/* نشانگر پیام جدید */}
        {hasNewMessage && !isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-ping" />
        )}

        {/* pulse effect */}
        {!isOpen && (
          <div className="absolute inset-0 rounded-2xl bg-orange-500 animate-ping opacity-20" />
        )}
      </button>
    </div>
  );
}
