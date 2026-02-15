import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "لطفا صبر کنید..." }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-navy-900 text-white">
      <div className="relative mb-8 text-center">
        <h1 className="text-6xl font-black tracking-widest text-raavi-orange animate-pulse">
          RAAVI
        </h1>
        <div className="flex justify-center gap-2 mt-4">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
        </div>
      </div>
      <p className="text-slate-400 text-sm font-light animate-pulse">{message}</p>
    </div>
  );
}
