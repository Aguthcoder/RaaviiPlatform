import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AppProvider from "@/context/AppContext";
import { AnimatedBackground } from "@/components/ui/animated-background";
import BottomNav from "@/components/BottomNav";
import TopHeader from "@/components/TopHeader";
import { ProfileGuard } from "@/components/ProfileGuard";
import AuthGate from "@/components/AuthGate";
import TestGate from "@/components/TestGate";
import AIChatWidget from "@/components/AIChatWidget";
import { Suspense } from "react";
import GlobalPageLoader from "@/components/GlobalPageLoader";

const vazirmatn = localFont({
  src: "./fonts/Vazirmatn-Regular.woff2",
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "راوی - پلتفرم هوشمند یافتن دوست",
  description:
    "با راوی به جامعه‌ای از افراد می‌پیوندید که به دنبال روابط معنادار هستند",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="font-sans antialiased" style={{ background: "#0a1628" }}>
        <AnimatedBackground />
        <AppProvider>
          {/* لودینگ گلوبال — روی همه صفحات و ناوبری‌ها */}
          <Suspense fallback={null}>
            <GlobalPageLoader />
          </Suspense>
          <AuthGate>
            <TestGate>
              <TopHeader />
              <div className="relative z-10 pt-16">
                <ProfileGuard>{children}</ProfileGuard>
              </div>
              <BottomNav />
              <AIChatWidget />
            </TestGate>
          </AuthGate>
        </AppProvider>
      </body>
    </html>
  );
}
