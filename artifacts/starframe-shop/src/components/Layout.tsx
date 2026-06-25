import { Link, useLocation } from "wouter";
import { useCartId } from "@/hooks/use-cart-id";
import { useGetCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";

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

      {/* LCARS top segment bar — full rainbow */}
      <div className="flex h-2 w-full shrink-0">
        <div className="w-36 lcars-pill-left" style={{ background: "hsl(215 90% 62%)" }} />
        <div className="w-2 bg-background" />
        <div className="w-10" style={{ background: "hsl(285 60% 68%)" }} />
        <div className="w-2 bg-background" />
        <div className="w-6" style={{ background: "hsl(12 90% 62%)" }} />
        <div className="w-2 bg-background" />
        <div className="w-4" style={{ background: "hsl(37 100% 50%)" }} />
        <div className="w-2 bg-background" />
        <div className="flex-1" style={{ background: "hsl(215 90% 62%)" }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b-2" style={{ borderColor: "hsl(215 90% 62%)" }}>
        <div className="flex items-center h-14">

          {/* LCARS logo pill — blue */}
          <div className="flex items-center shrink-0 h-full px-5 mr-3 lcars-pill-left" style={{ background: "hsl(215 90% 62%)" }}>
            <Link href="/" className="flex items-baseline gap-1">
              <span className="font-black text-xl tracking-[0.15em] uppercase" style={{ color: "hsl(222 45% 5%)" }}>Star</span>
              <span className="font-black text-xl tracking-[0.15em] uppercase" style={{ color: "hsl(222 45% 5%)" }}>Frame</span>
            </Link>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-5 py-1 text-xs font-bold tracking-[0.2em] uppercase transition-all`}
                style={
                  location === link.href
                    ? { background: "hsl(215 90% 62%)", color: "hsl(222 45% 5%)" }
                    : { color: "hsl(215 90% 62%)", border: "1px solid hsl(215 90% 62% / 0.35)" }
                }
                data-testid={`nav-link-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
            {/* LCARS decorative colour blocks */}
            <div className="ml-2 flex gap-1 items-center h-6">
              <div className="w-8 h-full" style={{ background: "hsl(285 60% 68% / 0.5)" }} />
              <div className="w-4 h-full" style={{ background: "hsl(12 90% 62% / 0.5)" }} />
              <div className="w-6 h-full" style={{ background: "hsl(37 100% 50% / 0.4)" }} />
              <div className="w-3 h-full" style={{ background: "hsl(165 70% 48% / 0.5)" }} />
            </div>
          </nav>

          <div className="flex-1 md:hidden" />

          {/* Right — stardate + cart + pill */}
          <div className="flex items-center gap-3 pr-2">
            <span className="hidden md:block text-xs font-mono tracking-widest" style={{ color: "hsl(215 90% 62% / 0.6)" }}>
              SD {new Date().getFullYear()}.{String(Math.floor(Date.now() / 86400000) % 999).padStart(3, "0")}
            </span>

            <Link
              href="/cart"
              className="relative flex items-center gap-2 px-3 py-1 border transition-all"
              style={{ borderColor: "hsl(215 90% 62% / 0.4)", color: "hsl(215 90% 62%)" }}
              data-testid="nav-cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="text-xs font-bold px-1.5 py-0.5 leading-none" style={{ background: "hsl(12 90% 62%)", color: "hsl(222 45% 5%)" }}>
                  {itemCount}
                </span>
              )}
            </Link>

            <button
              className="md:hidden p-1 border transition-colors"
              style={{ borderColor: "hsl(215 90% 62% / 0.4)", color: "hsl(215 90% 62%)" }}
              onClick={() => setMenuOpen(!menuOpen)}
              data-testid="nav-mobile-toggle"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* LCARS right pill — coral */}
            <div className="hidden md:block w-20 h-full lcars-pill-right self-stretch" style={{ background: "hsl(12 90% 62%)" }} />
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden border-b-2 bg-background px-4 py-3 flex flex-col gap-2" style={{ borderColor: "hsl(215 90% 62%)" }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-xs font-bold tracking-[0.2em] uppercase transition-all"
              style={
                location === link.href
                  ? { background: "hsl(215 90% 62%)", color: "hsl(222 45% 5%)" }
                  : { color: "hsl(215 90% 62%)", border: "1px solid hsl(215 90% 62% / 0.35)" }
              }
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t-2 bg-background mt-16" style={{ borderColor: "hsl(215 90% 62%)" }}>
        {/* LCARS bottom bar */}
        <div className="flex h-2 w-full">
          <div className="flex-1" style={{ background: "hsl(215 90% 62%)" }} />
          <div className="w-2 bg-background" />
          <div className="w-4" style={{ background: "hsl(165 70% 48%)" }} />
          <div className="w-2 bg-background" />
          <div className="w-6" style={{ background: "hsl(37 100% 50%)" }} />
          <div className="w-2 bg-background" />
          <div className="w-10" style={{ background: "hsl(12 90% 62%)" }} />
          <div className="w-2 bg-background" />
          <div className="w-24 lcars-pill-right" style={{ background: "hsl(285 60% 68%)" }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8" style={{ background: "hsl(215 90% 62%)" }} />
              <div>
                <p className="font-black text-sm tracking-[0.15em] uppercase" style={{ color: "hsl(215 90% 62%)" }}>StarFrame Shop</p>
                <p className="text-xs tracking-wider" style={{ color: "hsl(220 20% 58%)" }}>Boldly framing what no one has framed before</p>
              </div>
            </div>
            <div className="flex gap-3 text-xs font-mono tracking-widest" style={{ color: "hsl(215 90% 62% / 0.5)" }}>
              <span style={{ color: "hsl(215 90% 62%)" }}>LCARS</span>
              <span style={{ color: "hsl(285 60% 68%)" }}>·</span>
              <span style={{ color: "hsl(12 90% 62%)" }}>FEDERATION CERTIFIED</span>
              <span style={{ color: "hsl(285 60% 68%)" }}>·</span>
              <span style={{ color: "hsl(37 100% 50%)" }}>ALL FRAMES CLEARED</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
