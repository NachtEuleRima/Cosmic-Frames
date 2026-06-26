import { useEffect, useRef } from "react";

export default function WarpBackground() {
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

    const NUM_STARS = 60;

    type Star = {
      angle: number;
      dist: number;
      speed: number;
      size: number;
      x: number;
      y: number;
      prevX: number;
      prevY: number;
      hue: number;
    };

    const makeStar = (spread = false): Star => {
      const angle = Math.random() * Math.PI * 2;
      const dist = spread ? Math.random() * 280 : Math.random() * 15;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;
      return {
        angle,
        dist,
        speed: Math.random() * 0.25 + 0.1,
        size: Math.random() * 1.0 + 0.2,
        x, y, prevX: x, prevY: y,
        hue: Math.random() < 0.15 ? 280 + Math.random() * 40
           : Math.random() < 0.1  ? 170 + Math.random() * 20
           : 210 + Math.random() * 30,
      };
    };

    const stars: Star[] = Array.from({ length: NUM_STARS }, () => makeStar(true));

    let raf: number;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;

      // Trail fade — quick, so streaks stay short
      ctx.fillStyle = "rgba(28, 22, 52, 0.55)";
      ctx.fillRect(0, 0, W, H);

      for (const s of stars) {
        s.prevX = s.x;
        s.prevY = s.y;

        // Gentler acceleration
        s.dist += s.speed * (0.5 + s.dist * 0.010);

        s.x = cx + Math.cos(s.angle) * s.dist;
        s.y = cy + Math.sin(s.angle) * s.dist;

        if (s.x < -20 || s.x > W + 20 || s.y < -20 || s.y > H + 20) {
          Object.assign(s, makeStar(false));
          continue;
        }

        // Alpha ramps up with distance — kept low
        const alpha = Math.min(0.35, 0.03 + s.dist / 350);
        const len = Math.hypot(s.x - s.prevX, s.y - s.prevY);

        if (len > 0.4) {
          const grad = ctx.createLinearGradient(s.prevX, s.prevY, s.x, s.y);
          grad.addColorStop(0, `hsla(${s.hue}, 80%, 85%, 0)`);
          grad.addColorStop(1, `hsla(${s.hue}, 90%, 98%, ${alpha})`);
          ctx.beginPath();
          ctx.moveTo(s.prevX, s.prevY);
          ctx.lineTo(s.x, s.y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = Math.min(1.6, 0.3 + s.dist / 200);
          ctx.stroke();
        }

        // Bright tip dot
        ctx.beginPath();
        ctx.arc(s.x, s.y, Math.min(1.6, 0.2 + s.dist / 220), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 90%, 100%, ${alpha})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0, opacity: 0.5 }}
    />
  );
}
