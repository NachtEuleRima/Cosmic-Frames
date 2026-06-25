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

      {/* LCARS top bar — authentic segment strip */}
      <div className="flex h-2 w-full shrink-0">
        <div className="w-32 bg-primary lcars-pill-left" />
        <div className="w-4 bg-background" />
        <div className="w-16 bg-accent" />
        <div className="w-4 bg-background" />
        <div className="w-8 bg-secondary" />
        <div className="flex-1 bg-primary" />
      </div>

      {/* LCARS header */}
      <header className="sticky top-0 z-50 bg-background border-b-2 border-primary">
        <div className="flex items-center h-14">

          {/* LCARS elbow — orange pill on the left */}
          <div className="flex items-center shrink-0 bg-primary lcars-pill-left h-full px-5 mr-3">
            <Link href="/" className="flex items-baseline gap-1">
              <span className="font-black text-xl tracking-[0.15em] text-background uppercase">Star</span>
              <span className="font-black text-xl tracking-[0.15em] text-background uppercase">Frame</span>
            </Link>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-5 py-1 text-xs font-bold tracking-[0.2em] uppercase transition-all
                  ${location === link.href
                    ? "bg-primary text-background"
                    : "bg-muted text-primary hover:bg-primary/20 border border-primary/30"
                  }`}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
            {/* LCARS decorative blocks */}
            <div className="ml-2 flex gap-1">
              <div className="w-8 h-6 bg-secondary/40" />
              <div className="w-4 h-6 bg-accent/40" />
              <div className="w-6 h-6 bg-primary/20" />
            </div>
          </nav>

          <div className="flex-1 md:hidden" />

          {/* Right side — cart + LCARS pill */}
          <div className="flex items-center gap-3 pr-2">
            {/* Stardate readout */}
            <span className="hidden md:block text-xs font-mono text-primary/60 tracking-widest">
              SD {new Date().getFullYear()}.{String(Math.floor(Date.now() / 86400000) % 999).padStart(3, "0")}
            </span>

            <Link href="/cart" className="relative flex items-center gap-2 px-3 py-1 border border-primary/40 hover:border-primary hover:bg-primary/10 transition-all" data-testid="nav-cart">
              <ShoppingCart className="h-5 w-5 text-primary" />
              {itemCount > 0 && (
                <span className="bg-primary text-background text-xs font-bold px-1.5 py-0.5 leading-none">
                  {itemCount}
                </span>
              )}
            </Link>

            <button
              className="md:hidden p-1 border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              data-testid="nav-mobile-toggle"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* LCARS right pill */}
            <div className="hidden md:block w-20 h-full bg-accent lcars-pill-right self-stretch" />
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden border-b-2 border-primary bg-background px-4 py-3 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 text-xs font-bold tracking-[0.2em] uppercase transition-all
                ${location === link.href
                  ? "bg-primary text-background"
                  : "text-primary border border-primary/30 hover:bg-primary/10"
                }`}
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

      {/* LCARS footer */}
      <footer className="border-t-2 border-primary bg-background mt-16">
        {/* LCARS bottom segment bar */}
        <div className="flex h-2 w-full">
          <div className="flex-1 bg-primary" />
          <div className="w-4 bg-background" />
          <div className="w-8 bg-secondary" />
          <div className="w-4 bg-background" />
          <div className="w-16 bg-accent" />
          <div className="w-4 bg-background" />
          <div className="w-24 bg-primary lcars-pill-right" />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-primary" />
              <div>
                <p className="font-black text-sm tracking-[0.15em] text-primary uppercase">StarFrame Shop</p>
                <p className="text-xs text-muted-foreground tracking-wider">Boldly framing what no one has framed before</p>
              </div>
            </div>
            <div className="flex gap-4 text-xs font-mono text-primary/50 tracking-widest">
              <span>LCARS v47.2</span>
              <span>·</span>
              <span>FEDERATION CERTIFIED</span>
              <span>·</span>
              <span>ALL FRAMES CLEARED</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
