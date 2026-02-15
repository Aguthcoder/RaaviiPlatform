"use client";

import { useState } from "react";
import { ArrowRight, Bell, Calendar, Users, Trophy, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import BackgroundBlobs from "@/components/BackgroundBlobs";
import BottomNavbar from "@/components/BottomNavbar";

interface Notification {
  id: string;
  type: "event" | "match" | "reward" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: typeof Bell;
  color: string;
}

const sampleNotifications: Notification[] = [
  {
    id: "1",
    type: "event",
    title: "یک روز تا همنشینی!",
    message: "همنشینی «قدم زدن در پارک لاله» فردا ساعت ۱۷:۰۰ شروع می‌شه",
    time: "۲ ساعت پیش",
    read: false,
    icon: Calendar,
    color: "bg-blue-500",
  },
  {
    id: "2",
    type: "match",
    title: "تطابق جدید!",
    message: "۱۵ نفر منتظر همنشینی با شما هستند. الان رزرو کن!",
    time: "۵ ساعت پیش",
    read: false,
    icon: Users,
    color: "bg-raavi-orange",
  },
  {
    id: "3",
    type: "reward",
    title: "پاداش جدید!",
    message: "۵۰ امتیاز برای تکمیل پروفایل به کیف پول شما اضافه شد",
    time: "دیروز",
    read: true,
    icon: Trophy,
    color: "bg-green-500",
  },
  {
    id: "4",
    type: "system",
    title: "به‌روزرسانی راوی",
    message: "نسخه جدید راوی با قابلیت‌های جدید منتشر شد!",
    time: "۲ روز پیش",
    read: true,
    icon: Bell,
    color: "bg-purple-500",
  },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(sampleNotifications);

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map((notif) => ({ ...notif, read: true }))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen pb-24 pt-8 px-4 relative">
      <BackgroundBlobs />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-navy-900 mb-4 transition"
          >
            <ArrowRight size={20} />
            <span className="font-medium">بازگشت</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-navy-900 mb-2 font-estedad">
                اعلان‌ها
              </h1>
              {unreadCount > 0 && (
                <p className="text-raavi-orange font-bold">
                  {unreadCount} اعلان خوانده نشده
                </p>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-raavi-orange text-white font-bold rounded-xl hover:bg-raavi-600 transition text-sm"
              >
                خواندن همه
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const Icon = notification.icon;

              return (
                <div
                  key={notification.id}
                  onClick={() => handleMarkAsRead(notification.id)}
                  className={`bg-white rounded-3xl p-6 transition-all hover:shadow-xl cursor-pointer ${
                    !notification.read ? "border-2 border-raavi-orange" : ""
                  }`}
                >
                  <div className="flex gap-4">
                    <div
                      className={`w-12 h-12 ${notification.color} rounded-xl flex items-center justify-center text-white flex-shrink-0`}
                    >
                      <Icon size={24} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-black text-navy-900 font-estedad">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-raavi-orange rounded-full flex-shrink-0"></div>
                        )}
                      </div>

                      <p className="text-slate-600 text-sm mb-2">
                        {notification.message}
                      </p>

                      <p className="text-slate-400 text-xs">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-2xl font-bold text-navy-900 mb-2">
              اعلانی وجود ندارد
            </h3>
            <p className="text-slate-600">
              اعلان‌های جدید اینجا نمایش داده می‌شوند
            </p>
          </div>
        )}
      </div>

      <BottomNavbar />
    </div>
  );
}
