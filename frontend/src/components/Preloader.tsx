// src/components/Preloader.tsx
"use client";

type Props = {
  isDone?: boolean;
};

export default function Preloader({ isDone = false }: Props) {
  return (
    <div className={`preloader-overlay ${isDone ? "hide" : ""}`}>
      <div className="preloader-content">
        {/* R A V I - با فاصله مثل اسنپ */}
        <div className="preloader-logo" aria-label="راوی">
          <span>R</span>
          <span>A</span>
          <span>V</span>
          <span>I</span>
        </div>
        {/* نوار پیشرفت نارنجی - مثل اسنپ */}
        <div className="preloader-bar">
          <div className="preloader-bar-fill" />
        </div>
      </div>
    </div>
  );
}
