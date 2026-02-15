'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global app error:', error);
  }, [error]);

  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-800">مشکلی پیش آمده است</h2>
          <p className="text-sm text-slate-600">در پردازش درخواست خطایی رخ داد. لطفاً دوباره تلاش کنید.</p>
          <button
            onClick={reset}
            className="inline-flex rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 transition"
          >
            تلاش مجدد
          </button>
        </div>
      </body>
    </html>
  );
}
