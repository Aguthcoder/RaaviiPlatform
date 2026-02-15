"use client";

export default function BackgroundBlobs() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-raavi-orange/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-navy-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-navy-300/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-blob animation-delay-4000"></div>
    </div>
  );
}
