"use client";
import { useEffect, useRef } from "react";

interface Circle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  hue: number; // 0 = orange, 1 = blue
  pulse: number;
  pulseSpeed: number;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Smaller circles (20-30% smaller), slightly faster
    const circles: Circle[] = Array.from({ length: 18 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.85,   // slightly faster
      vy: (Math.random() - 0.5) * 0.85,
      r: Math.random() * 32 + 18,          // 18–50px (smaller)
      alpha: Math.random() * 0.22 + 0.12,  // more visible
      hue: Math.random() > 0.65 ? 1 : 0,   // mix of orange & navy
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.015 + Math.random() * 0.015,
    }));

    let animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const c of circles) {
        c.pulse += c.pulseSpeed;
        const pulsedR = c.r * (1 + Math.sin(c.pulse) * 0.12);

        // 3D radial gradient — light source top-left
        const grad = ctx.createRadialGradient(
          c.x - pulsedR * 0.3,
          c.y - pulsedR * 0.3,
          pulsedR * 0.08,
          c.x,
          c.y,
          pulsedR
        );

        if (c.hue === 0) {
          // Orange circle with 3D effect
          grad.addColorStop(0, `rgba(255,160,60,${c.alpha * 1.6})`);
          grad.addColorStop(0.35, `rgba(249,115,22,${c.alpha * 1.2})`);
          grad.addColorStop(0.7, `rgba(194,65,12,${c.alpha * 0.7})`);
          grad.addColorStop(1, `rgba(120,30,5,${c.alpha * 0.1})`);
        } else {
          // Navy blue circle with 3D effect
          grad.addColorStop(0, `rgba(100,140,220,${c.alpha * 1.4})`);
          grad.addColorStop(0.35, `rgba(27,42,74,${c.alpha * 1.2})`);
          grad.addColorStop(0.7, `rgba(15,23,42,${c.alpha * 0.7})`);
          grad.addColorStop(1, `rgba(9,14,28,${c.alpha * 0.1})`);
        }

        // Drop shadow (3D depth)
        ctx.shadowColor = c.hue === 0
          ? `rgba(249,115,22,${c.alpha * 0.5})`
          : `rgba(27,42,74,${c.alpha * 0.4})`;
        ctx.shadowBlur = 8;  // low blur

        ctx.beginPath();
        ctx.arc(c.x, c.y, pulsedR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.shadowBlur = 0;

        // Bright specular highlight (top-left of sphere)
        const hlGrad = ctx.createRadialGradient(
          c.x - pulsedR * 0.32,
          c.y - pulsedR * 0.32,
          0,
          c.x - pulsedR * 0.28,
          c.y - pulsedR * 0.28,
          pulsedR * 0.45
        );
        hlGrad.addColorStop(0, `rgba(255,255,255,${c.alpha * 0.55})`);
        hlGrad.addColorStop(1, "rgba(255,255,255,0)");

        ctx.beginPath();
        ctx.arc(c.x, c.y, pulsedR, 0, Math.PI * 2);
        ctx.fillStyle = hlGrad;
        ctx.fill();

        // Move
        c.x += c.vx;
        c.y += c.vy;
        if (c.x < -pulsedR - 20) c.x = canvas.width + pulsedR + 20;
        if (c.x > canvas.width + pulsedR + 20) c.x = -pulsedR - 20;
        if (c.y < -pulsedR - 20) c.y = canvas.height + pulsedR + 20;
        if (c.y > canvas.height + pulsedR + 20) c.y = -pulsedR - 20;
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
