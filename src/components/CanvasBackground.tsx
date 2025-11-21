"use client";

import React from "react";

type CanvasBackgroundProps = {
  variant?: "grid" | "speckle";
  className?: string;
  opacity?: number; // 0..1 overall alpha
  colorLight?: string; // stroke/tint in light mode
  colorDark?: string;  // stroke/tint in dark mode
  gap?: number;        // grid gap
  lineWidth?: number;  // grid line width
  speed?: number;      // px/s drift
};

// A highly subtle, performant canvas background with tiny drift.
// - Grid: draws faint lines with small drifting offset
// - Speckle: tiles a low-res noise pattern and drifts slowly
export default function CanvasBackground({
  variant = "grid",
  className = "",
  opacity = 0.1,
  colorLight = "rgba(163, 230, 53, 0.12)", // lime-300 ~ lime-400
  colorDark = "rgba(163, 230, 53, 0.10)",
  gap = 24,
  lineWidth = 1,
  speed = 6,
}: CanvasBackgroundProps): React.ReactElement {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const patternRef = React.useRef<CanvasPattern | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let offset = 0; // drift offset in px
    let last = performance.now();
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1)); // cap for perf

    const resize = () => {
      const parent = canvas.parentElement || canvas;
      const rect = parent.getBoundingClientRect();
      canvas.width = Math.ceil(rect.width * dpr);
      canvas.height = Math.ceil(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    // Prepare a subtle speckle pattern once (low-res for performance)
    const ensureSpeckle = () => {
      if (patternRef.current) return;
      const tile = document.createElement("canvas");
      const size = 96; // low-res tile for efficiency
      tile.width = size;
      tile.height = size;
      const tctx = tile.getContext("2d");
      if (!tctx) return;

      const img = tctx.createImageData(size, size);
      // Extremely light, sparse grain
      for (let i = 0; i < img.data.length; i += 4) {
        const rnd = Math.random();
        // sparse noise: only paint a fraction
        const v = rnd < 0.12 ? 220 + Math.floor(Math.random() * 35) : 0; // light specks
        const alpha = rnd < 0.12 ? 22 : 0; // overall subtle
        img.data[i] = v;     // R
        img.data[i + 1] = v; // G
        img.data[i + 2] = v; // B
        img.data[i + 3] = alpha; // A
      }
      tctx.putImageData(img, 0, 0);
      patternRef.current = ctx.createPattern(tile, "repeat");
    };

    const drawGrid = (w: number, h: number) => {
      const isDark = document.documentElement.classList.contains("dark");
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
      ctx.strokeStyle = isDark ? colorDark : colorLight;
      ctx.lineWidth = lineWidth;

      const ox = offset % gap;
      const oy = (offset * 0.6) % gap;

      // Vertical lines
      for (let x = ox; x <= w; x += gap) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      // Horizontal lines
      for (let y = oy; y <= h; y += gap) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    };

    const drawSpeckle = (w: number, h: number) => {
      ensureSpeckle();
      const isDark = document.documentElement.classList.contains("dark");
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
      if (patternRef.current) {
        // tint by drawing a translucent rect beneath the pattern
        ctx.fillStyle = isDark ? "rgba(163, 230, 53, 0.04)" : "rgba(163, 230, 53, 0.05)";
        ctx.fillRect(0, 0, w, h);
        ctx.save();
        ctx.translate(offset * 0.1, offset * 0.06);
        ctx.fillStyle = patternRef.current as CanvasPattern;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }
    };

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      offset += speed * dt; // slow drift

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (variant === "grid") drawGrid(w, h); else drawSpeckle(w, h);
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [variant, opacity, colorLight, colorDark, gap, lineWidth, speed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none ${className}`}
    />
  );
}