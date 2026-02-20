"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AnimatedBackground from "@/components/AnimatedBackground";
import { BookOpen, Clock, Eye, Tag, ChevronLeft, Sparkles, ArrowRight } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Article {
  id: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  view_count: number;
  published_at: string;
  image_url?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  attachment: "سبک دلبستگی",
  communication: "ارتباط مؤثر",
  emotion: "هوش هیجانی",
  social: "مهارت اجتماعی",
  psychology: "روان‌شناسی",
  relationship: "روابط انسانی",
};

const CATEGORY_COLORS: Record<string, string> = {
  attachment: "rgba(168,85,247,0.2)",
  communication: "rgba(59,130,246,0.2)",
  emotion: "rgba(239,68,68,0.2)",
  social: "rgba(34,197,94,0.2)",
  psychology: "rgba(249,115,22,0.2)",
  relationship: "rgba(236,72,153,0.2)",
};

// مقالات نمونه در صورتی که API در دسترس نباشد
const SAMPLE_ARTICLES: Article[] = [
  {
    id: "sample-1",
    title: "سبک‌های دلبستگی و تأثیر آن بر روابط بزرگسالی",
    summary: "تحقیقات نشان می‌دهد که الگوهای دلبستگی در دوران کودکی، تأثیر عمیقی بر کیفیت روابط ما در بزرگسالی دارند. درک این الگوها می‌تواند اولین قدم برای بهبود روابط باشد...",
    category: "attachment",
    tags: ["دلبستگی", "روابط", "روان‌شناسی"],
    view_count: 342,
    published_at: new Date().toISOString(),
  },
  {
    id: "sample-2",
    title: "گوش دادن فعال: هنر شنیدن که رابطه می‌سازد",
    summary: "در دنیایی پر از حواس‌پرتی، توانایی گوش دادن واقعی به دیگران تبدیل به یک مهارت نادر و ارزشمند شده است. مطالعات روان‌شناسی نشان می‌دهد که احساس شنیده‌شدن...",
    category: "communication",
    tags: ["ارتباط", "مهارت", "گوش دادن"],
    view_count: 218,
    published_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "sample-3",
    title: "درون‌گراها و برون‌گراها: همکاری یا تضاد؟",
    summary: "برخلاف باور رایج، درون‌گرایی و برون‌گرایی دو قطب مجزا نیستند بلکه یک طیف پیوسته هستند. تحقیقات جدید نشان می‌دهد که بهترین گروه‌های اجتماعی...",
    category: "psychology",
    tags: ["شخصیت", "گروه", "تعامل"],
    view_count: 156,
    published_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "sample-4",
    title: "هوش هیجانی در روابط بین‌فردی",
    summary: "هوش هیجانی (EQ) یکی از مهم‌ترین عوامل موفقیت در روابط اجتماعی است. مجله Nature Human Behaviour در تحقیق اخیر خود نشان داد که افراد با EQ بالا...",
    category: "emotion",
    tags: ["هوش هیجانی", "روابط", "خودآگاهی"],
    view_count: 289,
    published_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

const CARD_STYLE = {
  background: "linear-gradient(145deg, #1B2A4A 0%, #132038 100%)",
  border: "1px solid rgba(255,255,255,0.07)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    fetch(`${API_URL}/api/articles?limit=20`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.items?.length > 0) {
          setArticles(data.items);
        } else {
          setArticles(SAMPLE_ARTICLES);
        }
      })
      .catch(() => setArticles(SAMPLE_ARTICLES))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    selectedCategory === "all"
      ? articles
      : articles.filter((a) => a.category === selectedCategory);

  const categories = ["all", ...new Set(articles.map((a) => a.category))];

  return (
    <div className="min-h-screen pb-28 relative" dir="rtl">
      <AnimatedBackground />
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-4">
        {/* هدر */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-5 transition-colors"
        >
          <ArrowRight size={16} /> بازگشت
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,107,0,0.2)" }}
            >
              <BookOpen size={20} className="text-orange-400" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">مجله راوی</h1>
              <p className="text-xs text-slate-400">محتوای علمی روان‌شناختی</p>
            </div>
          </div>

          <div
            className="rounded-2xl px-4 py-3 mt-3"
            style={{
              background: "rgba(255,107,0,0.06)",
              border: "1px solid rgba(255,107,0,0.12)",
            }}
          >
            <p className="text-xs text-slate-300 leading-relaxed">
              <Sparkles size={12} className="inline text-orange-400 ml-1" />
              مقالات این بخش با هوش مصنوعی از منابع علمی معتبر (Nature, PubMed) تولید و توسط تیم راوی بررسی می‌شود
            </p>
          </div>
        </div>

        {/* فیلتر دسته‌بندی */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background:
                  selectedCategory === cat
                    ? "rgba(255,107,0,0.8)"
                    : "rgba(255,255,255,0.06)",
                color:
                  selectedCategory === cat
                    ? "white"
                    : "rgba(255,255,255,0.5)",
                border: "1px solid",
                borderColor:
                  selectedCategory === cat
                    ? "rgba(255,107,0,0.5)"
                    : "rgba(255,255,255,0.08)",
              }}
            >
              {cat === "all" ? "همه" : CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>

        {/* مقالات */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-3xl h-32 animate-pulse"
                style={{ background: "rgba(255,255,255,0.05)" }}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((article, index) => (
              <Link key={article.id} href={`/articles/${article.id}`}>
                <div
                  className="rounded-3xl p-4 hover:scale-[1.01] transition-all cursor-pointer group"
                  style={CARD_STYLE}
                >
                  {/* دسته‌بندی */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background:
                          CATEGORY_COLORS[article.category] ||
                          "rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.8)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {CATEGORY_LABELS[article.category] || article.category}
                    </span>
                    {index === 0 && (
                      <span className="text-[10px] text-orange-400 font-bold flex items-center gap-1">
                        <Sparkles size={10} />
                        جدیدترین
                      </span>
                    )}
                  </div>

                  <h2 className="text-sm font-black text-white mb-2 leading-snug group-hover:text-orange-300 transition-colors">
                    {article.title}
                  </h2>

                  <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">
                    {article.summary}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Eye size={10} />
                        {article.view_count.toLocaleString("fa-IR")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {formatDate(article.published_at)}
                      </span>
                    </div>
                    <ChevronLeft
                      size={14}
                      className="text-orange-400 group-hover:translate-x-[-4px] transition-transform"
                    />
                  </div>

                  {/* تگ‌ها */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] px-1.5 py-0.5 rounded-md"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            color: "rgba(255,255,255,0.4)",
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div className="text-center py-12">
            <BookOpen size={40} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500">مقاله‌ای در این دسته‌بندی یافت نشد</p>
          </div>
        )}
      </div>
    </div>
  );
}
