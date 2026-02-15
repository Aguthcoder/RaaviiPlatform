import { BookOpen, Brain, Briefcase, Dumbbell, Home, Sparkles, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getTopicImage } from "@/lib/dynamic-images";

export type EventCategory = {
  id: string;
  title: string;
  icon: LucideIcon;
  theme: string;
  description: string;
  samples: string[];
  discounts: string[];
};

export const categories: EventCategory[] = [
  {
    id: "hamneshin",
    title: "همنشین",
    icon: Home,
    theme: "friendly gathering",
    description: "برای دورهمی‌های امن، صمیمی و آشنا شدن با افراد هم‌فرکانس.",
    samples: ["کافه‌گردی دو نفره", "بردگیم گروهی", "پیاده‌روی عصرانه"],
    discounts: ["۱۵٪ تخفیف اولین رزرو", "۲۵٪ تخفیف رزرو گروهی ۳ نفره"],
  },
  {
    id: "hamsohbat",
    title: "هم‌صحبت",
    icon: Users,
    theme: "deep conversation",
    description: "برای گفت‌وگوهای عمیق درباره زندگی، تجربه‌ها و دغدغه‌ها.",
    samples: ["گفت‌وگوی موضوعی", "کتاب‌خوانی و تحلیل", "گپ عصرانه"],
    discounts: ["۱۰٪ تخفیف عصرهای سه‌شنبه", "بسته ۲ جلسه با ۲۰٪ تخفیف"],
  },
  {
    id: "hampa",
    title: "هم‌پا",
    icon: Dumbbell,
    theme: "sport partner",
    description: "برای فعالیت‌های ورزشی و سبک زندگی سالم.",
    samples: ["باشگاه دونفره", "دوچرخه‌سواری", "کوهنوردی سبک"],
    discounts: ["۳۰٪ تخفیف رزرو صبحگاهی", "اشتراک هفتگی با ۱۸٪ تخفیف"],
  },
  {
    id: "hamkar",
    title: "همکار",
    icon: Briefcase,
    theme: "coworking productivity",
    description: "برای همکاری، شبکه‌سازی و رشد حرفه‌ای.",
    samples: ["کوورک در کافه", "جلسه ایده‌پردازی", "منتورینگ مهارت"],
    discounts: ["۲۰٪ تخفیف رزرو اولین همکاری", "۱۵٪ تخفیف ورک‌اسپیس"],
  },
  {
    id: "hamamooz",
    title: "هم‌آموز",
    icon: BookOpen,
    theme: "study partner",
    description: "برای یادگیری مشترک و برنامه‌ریزی مطالعه.",
    samples: ["مرور آزمون", "مطالعه گروهی", "حل تمرین مشترک"],
    discounts: ["یک جلسه رایگان بعد از ۴ رزرو", "۱۲٪ تخفیف بسته دانشجویی"],
  },
  {
    id: "hamfekr",
    title: "هم‌فکر",
    icon: Brain,
    theme: "mindset growth",
    description: "برای تبادل ایده، تفکر عمیق و رشد فردی.",
    samples: ["کلاب فلسفه", "بحث موضوع آزاد", "تحلیل تجربه"],
    discounts: ["۱۰٪ تخفیف جلسات شبانه", "۲۲٪ تخفیف بسته ماهانه"],
  },
  {
    id: "hamteami",
    title: "هم‌تیمی",
    icon: Sparkles,
    theme: "team challenge",
    description: "برای ساخت تیم، رقابت دوستانه و پروژه‌های مشترک.",
    samples: ["پروژه آخر هفته", "چالش محصول", "مسابقه تیمی"],
    discounts: ["۲۵٪ تخفیف تیم‌های ۴ نفره", "کد تخفیف TEAM20"],
  },
  {
    id: "hamghese",
    title: "هم‌قصه",
    icon: Users,
    theme: "storytelling community",
    description: "برای شنیدن داستان‌ها و اشتراک تجربه‌های واقعی.",
    samples: ["شب روایت", "قصه‌گویی کافه‌ای", "پادکست زنده"],
    discounts: ["۵۰٪ تخفیف اولین حضور", "۱۷٪ تخفیف رزرو دوتایی"],
  },
];

export const popularEvents = [
  {
    id: "boardgame",
    categoryId: "hamneshin",
    title: "دورهمی همبازی (بردگیم گروهی) - پنجشنبه ۲۳ بهمن",
    time: "پنجشنبه، ۲۳ بهمن ساعت ۱۵:۰۰",
    topic: "board game friends",
  },
  {
    id: "breakfast",
    categoryId: "hamsohbat",
    title: "قرار صبحانه (میز منتخب)",
    time: "جمعه، ۲۴ بهمن ساعت ۱۰:۰۰",
    topic: "breakfast cafe table",
  },
  {
    id: "cafe",
    categoryId: "hamfekr",
    title: "کافه گفت‌وگو، جمعه ۲۴ بهمن",
    time: "جمعه، ۲۴ بهمن ساعت ۱۰:۰۰",
    topic: "coffee conversation",
  },
  {
    id: "mafia",
    categoryId: "hamteami",
    title: "همبازی ۲۴ بهمن (مافیا)",
    time: "جمعه، ۲۴ بهمن ساعت ۱۶:۰۰",
    topic: "team game night",
  },
].map((event, idx) => ({ ...event, image: getTopicImage(event.topic, idx + 11) }));

export function getCategoryById(categoryId: string) {
  return categories.find((item) => item.id === categoryId);
}

export function getEventById(eventId: string) {
  return popularEvents.find((item) => item.id === eventId);
}
