import { Link, useLocation } from "wouter";
import { useCartId } from "@/hooks/use-cart-id";
import { useGetCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { ShoppingCart, Menu, X, Zap } from "lucide-react";
import { useState } from "react";
import WarpBackground from "@/components/WarpBackground";

export default function Layout({ children }: { children: React.ReactNode }) {
  const cartId = useCartId();
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  const { data: cart } = useGetCart(
    { cartId: cartId ?? "" },
    { query: { enabled: !!cartId, queryKey: getGetCartQueryKey({ cartId: cartId ?? "" }) } }
  );

  const itemCount = cart?.itemCount ?? 0;

  const navLinks = [
    { href: "/", label: "Bridge" },
    { href: "/products", label: "Armory" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* Full-page warp starfield */}
      <WarpBackground />

      {/* Top neon bar */}
      <div className="h-[3px] w-full" style={{
        background: "linear-gradient(to right, hsl(172 100% 48%), hsl(272 100% 63%), hsl(330 100% 57%), hsl(172 100% 48%))",
        backgroundSize: "200% 100%",
        animation: "warp-pulse 3s ease-in-out infinite"
      }} />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{
        background: "hsl(258 35% 4% / 0.95)",
        borderColor: "hsl(172 100% 48% / 0.25)",
        backdropFilter: "blur(16px)"
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <Zap className="h-6 w-6 group-hover:animate-float" style={{ color: "hsl(172 100% 48%)" }} />
              <span className="font-black text-xl tracking-widest uppercase">
                <span style={{ color: "hsl(172 100% 48%)" }} className="text-glow-primary">STELLA</span>
                <span className="text-foreground">OUTPOST</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-1.5 text-sm font-bold tracking-widest uppercase rounded-md transition-all duration-200"
                  style={location === link.href ? {
                    background: "hsl(172 100% 48%)",
                    color: "hsl(258 35% 4%)",
                    boxShadow: "0 0 14px hsl(172 100% 48% / 0.6)"
                  } : {
                    color: "hsl(172 100% 48%)",
                    border: "1px solid hsl(172 100% 48% / 0.3)"
                  }}
                  data-testid={`nav-link-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right */}
            <div className="flex items-center gap-4">
              <span className="hidden md:block text-xs font-mono tracking-widest" style={{ color: "hsl(172 100% 48% / 0.5)" }}>
                ★ SD {new Date().getFullYear()}.{String(Math.floor(Date.now() / 86400000) % 999).padStart(3, "0")}
              </span>

              <Link
                href="/cart"
                className="relative flex items-center gap-2 px-3 py-2 rounded-md border transition-all duration-200 hover:glow-primary"
                style={{ borderColor: "hsl(330 100% 57% / 0.5)", color: "hsl(330 100% 57%)" }}
                data-testid="nav-cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 text-xs font-black w-5 h-5 flex items-center justify-center rounded-full animate-red-alert"
                    style={{ background: "hsl(330 100% 57%)", color: "hsl(258 35% 4%)" }}>
                    {itemCount}
                  </span>
                )}
              </Link>

              <button
                className="md:hidden p-2 rounded-md border transition-colors"
                style={{ borderColor: "hsl(172 100% 48% / 0.3)", color: "hsl(172 100% 48%)" }}
                onClick={() => setMenuOpen(!menuOpen)}
                data-testid="nav-mobile-toggle"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden border-b px-4 py-4 flex flex-col gap-2" style={{
          background: "hsl(258 30% 8%)",
          borderColor: "hsl(172 100% 48% / 0.25)"
        }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-bold tracking-widest uppercase rounded-md"
              style={location === link.href ? {
                background: "hsl(172 100% 48%)",
                color: "hsl(258 35% 4%)"
              } : {
                color: "hsl(172 100% 48%)",
                border: "1px solid hsl(172 100% 48% / 0.3)"
              }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <main className="flex-1" style={{ position: "relative", zIndex: 1 }}>{children}</main>

      {/* Footer */}
      <footer className="mt-20 border-t" style={{ borderColor: "hsl(172 100% 48% / 0.2)", background: "hsl(258 35% 4%)" }}>
        <div className="h-[2px]" style={{
          background: "linear-gradient(to right, transparent, hsl(172 100% 48%), hsl(330 100% 57%), hsl(272 100% 63%), transparent)"
        }} />
        <div className="max-w-7xl mx-auto px-4 py-10 text-center">
          <p className="font-black tracking-widest text-sm uppercase mb-1">
            <span style={{ color: "hsl(172 100% 48%)" }} className="text-glow-primary">STELLA</span>
            <span className="text-foreground">OUTPOST</span>
          </p>
          <p className="text-xs" style={{ color: "hsl(258 20% 55%)" }}>
            Boldly supplying what no outpost has stocked before · Resistance is futile
          </p>
          <div className="flex justify-center gap-4 mt-4 text-xs font-mono" style={{ color: "hsl(258 20% 40%)" }}>
            <span style={{ color: "hsl(172 100% 48% / 0.6)" }}>LCARS v47.2</span>
            <span>·</span>
            <span style={{ color: "hsl(330 100% 57% / 0.6)" }}>FEDERATION CERTIFIED</span>
            <span>·</span>
            <span style={{ color: "hsl(272 100% 63% / 0.6)" }}>ALL CARGO CLEARED</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
