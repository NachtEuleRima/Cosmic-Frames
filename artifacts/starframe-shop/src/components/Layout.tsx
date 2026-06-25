import { Link, useLocation } from "wouter";
import { useCartId } from "@/hooks/use-cart-id";
import { useGetCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { ShoppingCart, Star, Menu, X } from "lucide-react";
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
      {/* Top bar - LCARS style */}
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-secondary" />

      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <Star className="h-6 w-6 text-primary fill-primary group-hover:rotate-12 transition-transform" />
              <span className="font-bold text-xl tracking-wider text-foreground">
                STAR<span className="text-primary">FRAME</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium tracking-wide uppercase transition-colors hover:text-primary ${
                    location === link.href ? "text-primary" : "text-muted-foreground"
                  }`}
                  data-testid={`nav-link-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Cart + Mobile Menu */}
            <div className="flex items-center gap-4">
              <Link href="/cart" className="relative" data-testid="nav-cart">
                <ShoppingCart className="h-6 w-6 text-foreground hover:text-primary transition-colors" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>

              <button
                className="md:hidden text-foreground"
                onClick={() => setMenuOpen(!menuOpen)}
                data-testid="nav-mobile-toggle"
              >
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium uppercase tracking-wide text-muted-foreground hover:text-primary"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border bg-card mt-16">
        <div className="h-1 bg-gradient-to-r from-secondary via-primary to-accent" />
        <div className="max-w-7xl mx-auto px-4 py-10 text-center">
          <p className="text-muted-foreground text-sm">
            StarFrame Shop &mdash; Boldly framing what no one has framed before.
          </p>
          <p className="text-muted-foreground/60 text-xs mt-2">
            Stardate {new Date().getFullYear()}.{Math.floor(Math.random() * 9) + 1} &mdash; All frames are tested to Starfleet specifications
          </p>
        </div>
      </footer>
    </div>
  );
}
