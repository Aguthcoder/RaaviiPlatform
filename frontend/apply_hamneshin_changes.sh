#!/usr/bin/env bash
set -euo pipefail

TARGET="/nextjs/Raavi/frontend/raavi-project"
mkdir -p "$TARGET"
cd "$TARGET"

mkdir -p src/components "src/app/(auth)/login" src/app/verify-mobile src/app/test src/app/events "src/app/events/[id]/booking" src/app/dashboard src/app/dashboard/profile src/app/games src/app/notifications src/app/wallet src/app/invite-friends src/lib

cat > src/components/Preloader.tsx <<'EOT'
"use client";
export default function Preloader(){return <div className="preloader-overlay"><div className="preloader-content"><div className="preloader-logo">Ravi</div><div className="preloader-dots"><span className="dot dot-1"/><span className="dot dot-2"/><span className="dot dot-3"/></div></div></div>}
EOT

cat > src/lib/events-data.ts <<'EOT'
export interface EventData { id:string; title:string; subtitle:string; category:string; city:string; date:string; time:string; price:number; capacity:number; image:string; active:boolean; waitingCount?:number; }
export const EVENTS_DATA: EventData[] = [
{id:"hamneshin-cafe",title:"کافه‌گفتگو همنشین",subtitle:"گفتگوی صمیمی",category:"همنشین",city:"تهران",date:"پنجشنبه",time:"۱۸:۰۰",price:390000,capacity:20,image:"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",active:true},
{id:"hamsohbat-book",title:"جمع کتاب‌خوانی هم صحبت",subtitle:"هم‌صحبتی",category:"هم صحبت",city:"اصفهان",date:"جمعه",time:"۱۶:۰۰",price:320000,capacity:18,image:"https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200&q=80",active:true},
{id:"hampa-walk",title:"پیاده‌روی شهری هم پا",subtitle:"گروه هم‌پا",category:"هم پا",city:"شیراز",date:"شنبه",time:"۱۷:۰۰",price:280000,capacity:24,image:"https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=1200&q=80",active:true},
{id:"inactive-art",title:"کارگاه هنر جمعی",subtitle:"غیرفعال",category:"هنر و سرگرمی",city:"تهران",date:"به‌زودی",time:"-",price:0,capacity:30,image:"https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&q=80",active:false,waitingCount:15}
];
EOT

echo "Applied Ravi/Hamneshin updates." 
