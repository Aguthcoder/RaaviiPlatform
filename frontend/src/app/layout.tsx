import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import dynamic from 'next/dynamic';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import AccessGate from '@/components/AccessGate';
import ErrorBoundary from '@/components/ErrorBoundary';

const ClientShell = dynamic(() => import('@/components/ClientShell'));
const GlobalBottomNav = dynamic(() => import('@/components/GlobalBottomNav'));

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  variable: '--font-vazirmatn',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'راوی - پلتفرم هوشمند همنشینی',
    template: '%s | راوی',
  },
  description: 'راوی با استفاده از الگوریتم‌های هوشمند، افراد را به همنشینی‌های سازگار متصل می‌کند.',
  applicationName: 'Raavi',
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: siteUrl,
    siteName: 'Raavi',
    title: 'راوی - پلتفرم هوشمند همنشینی',
    description: 'راوی با استفاده از الگوریتم‌های هوشمند، افراد را به همنشینی‌های سازگار متصل می‌کند.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'راوی - پلتفرم هوشمند همنشینی',
    description: 'راوی با استفاده از الگوریتم‌های هوشمند، افراد را به همنشینی‌های سازگار متصل می‌کند.',
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazirmatn.variable} font-sans bg-white`}>
        <AppProvider>
          <ClientShell>
            <ErrorBoundary><AccessGate>
              <div className="background-animate">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
              {children}
              <GlobalBottomNav />
            </AccessGate></ErrorBoundary>
          </ClientShell>
        </AppProvider>
      </body>
    </html>
  );
}
