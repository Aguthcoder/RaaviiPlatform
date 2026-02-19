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

    interface Orb {
      x: number; y: number;
      vx: number; vy: number;
      r: number;
      baseOpacity: number;
      phase: number;
      hue: number;
    }

    const PALETTES = [
      { r: 255, g: 107, b: 0 },    // orange
      { r: 255, g: 154, b: 60 },   // light orange
      { r: 234, g: 88,  b: 12 },   // deep orange
      { r: 249, g: 115, b: 22 },   // mid orange
      { r: 27,  g: 42,  b: 74 },   // navy #1B2A4A
      { r: 15,  g: 30,  b: 60 },   // deep navy
      { r: 255, g: 140, b: 30 },   // amber
      { r: 40,  g: 60,  b: 110 },  // mid navy
    ];

    const makeOrbs = (): Orb[] => {
      const w = canvas.width;
      const h = canvas.height;
      return Array.from({ length: 10 }, (_, i) => {
        const angle = (i * 36 * Math.PI) / 180;
        const speed = 0.28 + Math.random() * 0.22; // ↑ slightly faster
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 65 + Math.random() * 80,   // ~25% smaller: was 90+110, now 65+80
          baseOpacity: 0.28 + Math.random() * 0.22, // clearly visible
          phase: (i / 10) * Math.PI * 2,
          hue: i % PALETTES.length,
        };
      });
    };

    let orbs = makeOrbs();

    const handleResize = () => { resize(); orbs = makeOrbs(); };
    window.addEventListener('resize', handleResize);

    const draw = () => {
      tRef.current += 0.009; // ↑ slightly faster (was 0.007)
      const t = tRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      orbs.forEach((b) => {
        b.x += b.vx + Math.sin(t * 0.8 + b.phase) * 0.3;
        b.y += b.vy + Math.cos(t * 0.6 + b.phase) * 0.3;

        if (b.x + b.r > canvas.width || b.x - b.r < 0) {
          b.vx *= -1;
          b.x = Math.max(b.r, Math.min(canvas.width - b.r, b.x));
        }
        if (b.y + b.r > canvas.height || b.y - b.r < 0) {
          b.vy *= -1;
          b.y = Math.max(b.r, Math.min(canvas.height - b.r, b.y));
        }

        const pulse = 1 + 0.07 * Math.sin(t * 1.2 + b.phase);
        const r = b.r * pulse;
        const alpha = b.baseOpacity + 0.06 * Math.sin(t * 0.8 + b.phase);

        const { r: cr, g: cg, b: cb } = PALETTES[b.hue];

        // 3D radial gradient — off-center top-left light source
        const lightX = b.x - r * 0.38;
        const lightY = b.y - r * 0.38;

        const g = ctx.createRadialGradient(lightX, lightY, r * 0.01, b.x, b.y, r);
        g.addColorStop(0,    `rgba(${cr},${cg},${cb},${Math.min(1, alpha * 2.0)})`);
        g.addColorStop(0.12, `rgba(${cr},${cg},${cb},${Math.min(1, alpha * 1.65)})`);
        g.addColorStop(0.35, `rgba(${cr},${cg},${cb},${alpha * 1.1})`);
        g.addColorStop(0.65, `rgba(${cr},${cg},${cb},${alpha * 0.5})`);
        g.addColorStop(0.88, `rgba(${cr},${cg},${cb},${alpha * 0.12})`);
        g.addColorStop(1,    `rgba(${cr},${cg},${cb},0)`);

        ctx.beginPath();
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        // Specular highlight — 3D sheen
        const hl = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, r * 0.45);
        hl.addColorStop(0,   `rgba(255,250,240,${alpha * 1.0})`);
        hl.addColorStop(0.3, `rgba(255,235,200,${alpha * 0.45})`);
        hl.addColorStop(1,   `rgba(255,220,170,0)`);

        ctx.beginPath();
        ctx.arc(b.x, b.y, r * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = hl;
        ctx.fill();

        // Outer shadow ring (depth)
        const rim = ctx.createRadialGradient(b.x, b.y, r * 0.78, b.x, b.y, r * 1.06);
        rim.addColorStop(0,   `rgba(${cr},${Math.max(0,cg-20)},0,0)`);
        rim.addColorStop(0.5, `rgba(${cr},${Math.max(0,cg-30)},0,${alpha * 0.15})`);
        rim.addColorStop(1,   `rgba(${cr},${Math.max(0,cg-40)},0,0)`);

        ctx.beginPath();
        ctx.arc(b.x, b.y, r * 1.06, 0, Math.PI * 2);
        ctx.fillStyle = rim;
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
