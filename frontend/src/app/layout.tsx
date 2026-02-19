import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import AppProvider from "@/context/AppContext";
import { AnimatedBackground } from "@/components/ui/animated-background";
import BottomNav from "@/components/BottomNav";
import TopHeader from "@/components/TopHeader";
import { ProfileGuard } from "@/components/ProfileGuard";

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
        {/* 🔵 Animated 3D circles on EVERY page — fixed behind all content */}
        <AnimatedBackground />

        <AppProvider>
          <TopHeader />

          <div className="relative z-10 pt-16">
            {/* Profile completion guard — enforces onboarding flow */}
            <ProfileGuard>
              {children}
            </ProfileGuard>
          </div>

          <BottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
