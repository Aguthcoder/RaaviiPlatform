'use client';
import { useEffect, useRef } from 'react';

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    interface Orb {
      x: number; y: number;
      vx: number; vy: number;
      r: number; opacity: number;
      phase: number;
      colorIdx: number;
      angle: number; // جهت حرکت هر دایره متفاوت
    }

    // رنگ‌های نارنجی با تنوع بیشتر
    const COLORS: [number, number, number][] = [
      [255, 107, 0],   // نارنجی خالص
      [255, 154, 60],  // نارنجی روشن
      [234, 88, 12],   // نارنجی تیره
      [251, 146, 60],  // هلویی
      [249, 115, 22],  // نارنجی متوسط
      [253, 186, 116], // نارنجی کم‌رنگ
      [245, 158, 11],  // کهربایی
      [255, 80, 0],    // نارنجی آتشی
    ];

    const makeOrbs = (): Orb[] => {
      const w = canvas.width;
      const h = canvas.height;
      // ۱۰ دایره با زوایای مختلف - هر کدام جهت متفاوت
      const angles = [0, 35, 70, 110, 145, 180, 215, 250, 290, 325];
      return Array.from({ length: 10 }, (_, i) => {
        const angle = (angles[i] * Math.PI) / 180;
        // سرعت خیلی آرام
        const speed = 0.12 + Math.random() * 0.15;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 140 + Math.random() * 180, // دایره‌های خیلی درشت‌تر
          opacity: 0.16 + Math.random() * 0.14, // پررنگ‌تر
          phase: (i / 10) * Math.PI * 2,
          colorIdx: i % COLORS.length,
          angle,
        };
      });
    };

    let orbs = makeOrbs();

    // وقتی پنجره resize شد دایره‌ها رو دوباره بساز
    const handleResize = () => {
      resize();
      orbs = makeOrbs();
    };
    window.addEventListener('resize', handleResize);

    const draw = () => {
      tRef.current += 0.004; // خیلی آرام‌تر
      const t = tRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // بک‌گراند سفید خالص
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      orbs.forEach((b) => {
        // حرکت آرام با موج سینوسی
        b.x += b.vx + Math.sin(t * 0.7 + b.phase) * 0.25;
        b.y += b.vy + Math.cos(t * 0.5 + b.phase) * 0.25;

        // برخورد با لبه‌ها
        if (b.x + b.r > canvas.width || b.x - b.r < 0) {
          b.vx *= -1;
          b.x = Math.max(b.r, Math.min(canvas.width - b.r, b.x));
        }
        if (b.y + b.r > canvas.height || b.y - b.r < 0) {
          b.vy *= -1;
          b.y = Math.max(b.r, Math.min(canvas.height - b.r, b.y));
        }

        // نبض آرام
        const pulse = 1 + 0.1 * Math.sin(t * 0.9 + b.phase);
        const r = b.r * pulse;
        const alpha = b.opacity + 0.04 * Math.sin(t * 0.6 + b.phase);

        const [cr, cg, cb] = COLORS[b.colorIdx];

        // ── لایه اصلی: گرادیان رادیال سه‌بعدی ──
        // نقطه مرکز نور از بالا-چپ (شبیه نور ۳D)
        const lightX = b.x - r * 0.32;
        const lightY = b.y - r * 0.32;

        const g = ctx.createRadialGradient(lightX, lightY, r * 0.02, b.x, b.y, r);
        g.addColorStop(0,    `rgba(${cr},${cg},${cb},${alpha * 1.6})`);
        g.addColorStop(0.2,  `rgba(${cr},${cg},${cb},${alpha * 1.3})`);
        g.addColorStop(0.5,  `rgba(${cr},${cg},${cb},${alpha * 0.85})`);
        g.addColorStop(0.8,  `rgba(${cr},${cg},${cb},${alpha * 0.35})`);
        g.addColorStop(1,    `rgba(${cr},${cg},${cb},0)`);

        ctx.beginPath();
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        // ── هایلایت سه‌بعدی (لکه نور سفید بالا) ──
        const hl = ctx.createRadialGradient(
          lightX, lightY, 0,
          lightX, lightY, r * 0.55,
        );
        hl.addColorStop(0,   `rgba(255,240,200,${alpha * 0.7})`);
        hl.addColorStop(0.4, `rgba(255,220,160,${alpha * 0.3})`);
        hl.addColorStop(1,   `rgba(255,200,120,0)`);

        ctx.beginPath();
        ctx.arc(b.x, b.y, r * 0.92, 0, Math.PI * 2);
        ctx.fillStyle = hl;
        ctx.fill();

        // ── حلقه بیرونی کم‌رنگ برای عمق بیشتر ──
        const edge = ctx.createRadialGradient(b.x, b.y, r * 0.75, b.x, b.y, r * 1.15);
        edge.addColorStop(0, `rgba(${cr},${Math.max(0,cg-20)},0,0)`);
        edge.addColorStop(0.5, `rgba(${cr},${Math.max(0,cg-30)},0,${alpha * 0.12})`);
        edge.addColorStop(1, `rgba(${cr},${Math.max(0,cg-40)},0,0)`);

        ctx.beginPath();
        ctx.arc(b.x, b.y, r * 1.15, 0, Math.PI * 2);
        ctx.fillStyle = edge;
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
