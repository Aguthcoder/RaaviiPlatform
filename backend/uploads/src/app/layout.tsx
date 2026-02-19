import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import AppProvider from "@/context/AppContext";
import { AnimatedBackground } from "@/components/ui/animated-background";
import BottomNav from "@/components/BottomNav";
import TopHeader from "@/components/TopHeader";

const vazirmatn = localFont({
  src: "./fonts/Vazirmatn-Regular.woff2",
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "راوی - پلتفرم هوشمند یافتن دوست",
  description: "با راوی به جامعه‌ای از افراد می‌پیوندید که به دنبال روابط معنادار هستند",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="font-sans antialiased bg-white">
        {/* بک‌گراند انیمیشنی - در تمام صفحات */}
        <AnimatedBackground />

        <AppProvider>
          {/* هدر ثابت با لوگو بزرگ - در تمام صفحات */}
          <TopHeader />

          <div className="relative z-10 pt-16">
            {children}
          </div>

          <BottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
