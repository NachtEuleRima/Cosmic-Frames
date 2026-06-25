import { Link } from "wouter";
import { motion } from "framer-motion";
import { useListFeaturedProducts, useGetStoreStats } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Zap, Shield, Star } from "lucide-react";
import { useEffect, useRef } from "react";

/* ─── Starfield canvas ──────────────────────────────────────── */
function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.2,
      speed: Math.random() * 0.3 + 0.05,
      phase: Math.random() * Math.PI * 2,
    }));

    let frame = 0;
    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      for (const s of stars) {
        const alpha = 0.3 + 0.7 * Math.abs(Math.sin(s.phase + frame * s.speed * 0.05));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 255, 240, ${alpha})`;
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

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

/* ─── Product card ──────────────────────────────────────────── */
function ProductCard({ product }: { product: { id: number; name: string; price: number; category: string; imageUrl: string; starTrekQuote: string; inStock: boolean } }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link href={`/products/${product.id}`} data-testid={`card-product-${product.id}`}>
        <div className="rounded-xl overflow-hidden group cursor-pointer h-full flex flex-col border transition-all duration-300"
          style={{ background: "hsl(258 30% 8%)", borderColor: "hsl(258 25% 16%)" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(172 100% 48% / 0.6)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 24px hsl(172 100% 48% / 0.15), 0 8px 32px hsl(258 35% 4% / 0.6)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(258 25% 16%)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          }}
        >
          <div className="relative overflow-hidden aspect-[4/3]" style={{ background: "hsl(258 25% 6%)" }}>
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            {!product.inStock && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: "hsl(258 35% 4% / 0.8)" }}>
                <span className="text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded border animate-red-alert" style={{ color: "hsl(2 100% 55%)", borderColor: "hsl(2 100% 55%)" }}>
                  🚨 RED ALERT — OUT OF STOCK
                </span>
              </div>
            )}
            <div className="absolute top-2 right-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "hsl(272 100% 63% / 0.9)", color: "hsl(258 35% 4%)" }}>
                {product.category}
              </span>
            </div>
          </div>
          <div className="p-4 flex flex-col flex-1">
            <h3 className="font-bold text-foreground group-hover:text-glow-primary transition-colors text-sm leading-snug"
              style={{ color: "hsl(180 60% 94%)" }}>
              {product.name}
            </h3>
            <p className="text-xs italic mt-1 flex-1 line-clamp-2" style={{ color: "hsl(258 20% 55%)" }}>
              "{product.starTrekQuote}"
            </p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xl font-black text-glow-primary" style={{ color: "hsl(172 100% 48%)" }} data-testid={`text-price-${product.id}`}>
                ${product.price.toFixed(2)}
              </span>
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "hsl(330 100% 57%)" }}>
                Engage →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function Home() {
  const { data: featured, isLoading: featLoading } = useListFeaturedProducts();
  const { data: stats } = useGetStoreStats();

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: "85vh", display: "flex", alignItems: "center" }}>
        <Starfield />

        {/* Neon radial glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px]" style={{ background: "hsl(172 100% 48% / 0.08)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px]" style={{ background: "hsl(330 100% 57% / 0.07)" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px]" style={{ background: "hsl(272 100% 63% / 0.06)" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center w-full">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block text-xs font-black tracking-[0.3em] uppercase px-4 py-2 rounded-full mb-8 border"
              style={{ color: "hsl(172 100% 48%)", borderColor: "hsl(172 100% 48% / 0.4)", background: "hsl(172 100% 48% / 0.08)" }}>
              ⚡ Starfleet Certified Framing Technology ⚡
            </span>
          </motion.div>

          <motion.h1
            className="font-black tracking-tight mb-6"
            style={{ fontSize: "clamp(3rem, 8vw, 6rem)", lineHeight: 1.05 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="text-foreground">Frame your memories</span>
            <br />
            <span className="text-glow-primary" style={{ color: "hsl(172 100% 48%)" }}>
              at warp speed.
            </span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-4"
            style={{ color: "hsl(258 20% 60%)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            The galaxy's premier destination for Star Trek-themed photo frames.
          </motion.p>

          <motion.p
            className="text-base max-w-xl mx-auto mb-10 font-bold"
            style={{ color: "hsl(330 100% 57%)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            Resistance is futile — you will buy one. And you'll love it.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
          >
            <Link href="/products">
              <button
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-black text-base tracking-widest uppercase transition-all duration-200 glow-primary"
                style={{ background: "hsl(172 100% 48%)", color: "hsl(258 35% 4%)" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                data-testid="button-explore-products"
              >
                Explore the Armory <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
            <Link href="/products?category=LCARS+Edition">
              <button
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-black text-base tracking-widest uppercase border transition-all duration-200"
                style={{ borderColor: "hsl(330 100% 57%)", color: "hsl(330 100% 57%)" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "hsl(330 100% 57% / 0.12)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px hsl(330 100% 57% / 0.3)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                }}
                data-testid="button-featured"
              >
                LCARS Edition
              </button>
            </Link>
          </motion.div>

          {/* Stat pills */}
          {stats && (
            <motion.div
              className="flex flex-wrap justify-center gap-4 mt-14"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {[
                { value: `${stats.totalProducts}+`, label: "Frame Models", color: "hsl(172 100% 48%)" },
                { value: stats.happyCustomers.toLocaleString(), label: "Happy Crew Members", color: "hsl(330 100% 57%)" },
                { value: `${stats.totalCategories}`, label: "Collections", color: "hsl(272 100% 63%)" },
              ].map((s) => (
                <div key={s.label} className="px-5 py-3 rounded-xl border text-center" data-testid={`stat-${s.label}`}
                  style={{ borderColor: `${s.color}40`, background: `${s.color}0d` }}>
                  <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs tracking-widest uppercase mt-0.5" style={{ color: "hsl(258 20% 55%)" }}>{s.label}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Trek fact ticker */}
          {stats && (
            <motion.p
              className="mt-6 text-xs italic"
              style={{ color: "hsl(272 100% 63% / 0.7)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              📡 Starfleet Intel: "{stats.starTrekFact}"
            </motion.p>
          )}
        </div>
      </section>

      {/* ── FEATURED ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-black text-3xl sm:text-4xl text-foreground mb-2">
            <span className="text-glow-secondary" style={{ color: "hsl(330 100% 57%)" }}>Starfleet</span>
            {" "}Approved Frames
          </h2>
          <p style={{ color: "hsl(258 20% 55%)" }}>Our finest specimens from across the quadrant</p>
        </motion.div>

        {featLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="rounded-xl overflow-hidden border" style={{ background: "hsl(258 30% 8%)", borderColor: "hsl(258 25% 16%)" }}>
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured?.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/products">
            <button
              className="px-8 py-3 rounded-xl font-black tracking-widest uppercase border text-sm transition-all duration-200"
              style={{ borderColor: "hsl(172 100% 48% / 0.4)", color: "hsl(172 100% 48%)" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "hsl(172 100% 48% / 0.1)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px hsl(172 100% 48% / 0.2)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
              data-testid="button-view-all"
            >
              View Full Armory <ArrowRight className="h-4 w-4 inline ml-1" />
            </button>
          </Link>
        </div>
      </section>

      {/* ── WHY STARFRAME ────────────────────────────────── */}
      <section className="py-20 border-y" style={{ borderColor: "hsl(258 25% 14%)", background: "hsl(258 30% 6%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Warp-Speed Delivery", color: "hsl(172 100% 48%)", desc: "Orders beamed to your location faster than a photon torpedo. Well, nearly." },
              { icon: Shield, title: "Starfleet Quality", color: "hsl(330 100% 57%)", desc: "Every frame tested to withstand Klingon boarding parties and awkward family photos alike." },
              { icon: Star, title: "Trek-Certified™", color: "hsl(272 100% 63%)", desc: "We didn't ask for official certification. But if we had, we'd totally have it. Probably." },
            ].map((feat, i) => (
              <motion.div
                key={feat.title}
                className="text-center p-8 rounded-2xl border transition-all duration-300"
                style={{ background: "hsl(258 30% 8%)", borderColor: "hsl(258 25% 16%)" }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.03 }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = feat.color + "60";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px ${feat.color}20`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(258 25% 16%)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                <feat.icon className="h-10 w-10 mx-auto mb-4" style={{ color: feat.color }} />
                <h3 className="font-black text-foreground mb-2">{feat.title}</h3>
                <p className="text-sm" style={{ color: "hsl(258 20% 55%)" }}>{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
