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

    const NUM_STARS = 100;

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
        speed: Math.random() * 0.5 + 0.2,
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

      // Stronger fade = shorter trails
      ctx.fillStyle = "rgba(8, 4, 18, 0.45)";
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

        // Lower max alpha
        const alpha = Math.min(0.55, 0.05 + s.dist / 300);
        const len = Math.hypot(s.x - s.prevX, s.y - s.prevY);

        if (len > 0.4) {
          const grad = ctx.createLinearGradient(s.prevX, s.prevY, s.x, s.y);
          grad.addColorStop(0, `hsla(${s.hue}, 70%, 80%, 0)`);
          grad.addColorStop(1, `hsla(${s.hue}, 80%, 92%, ${alpha})`);
          ctx.beginPath();
          ctx.moveTo(s.prevX, s.prevY);
          ctx.lineTo(s.x, s.y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = Math.min(1.2, 0.2 + s.dist / 260);
          ctx.stroke();
        }

        // Dimmer tip dot
        ctx.beginPath();
        ctx.arc(s.x, s.y, Math.min(1.2, 0.15 + s.dist / 280), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 80%, 95%, ${alpha * 0.8})`;
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
      style={{ zIndex: 0, opacity: 0.7 }}
    />
  );
}
