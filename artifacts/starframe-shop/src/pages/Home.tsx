import { Link } from "wouter";
import { motion } from "framer-motion";
import { useListFeaturedProducts, useGetStoreStats } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Zap, Shield, Star } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function ProductCard({ product }: { product: { id: number; name: string; price: number; category: string; imageUrl: string; starTrekQuote: string; inStock: boolean } }) {
  return (
    <motion.div variants={item}>
      <Link href={`/products/${product.id}`} data-testid={`card-product-${product.id}`}>
        <div className="bg-card border border-border rounded-lg overflow-hidden group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer h-full flex flex-col">
          <div className="relative overflow-hidden aspect-[4/3] bg-muted">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {!product.inStock && (
              <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                <Badge variant="destructive">Red Alert — Out of Stock</Badge>
              </div>
            )}
            <div className="absolute top-2 right-2">
              <Badge className="bg-primary/90 text-primary-foreground text-xs">{product.category}</Badge>
            </div>
          </div>
          <div className="p-4 flex flex-col flex-1">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
            <p className="text-xs text-muted-foreground italic mt-1 flex-1 line-clamp-2">"{product.starTrekQuote}"</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-lg font-bold text-primary" data-testid={`text-price-${product.id}`}>${product.price.toFixed(2)}</span>
              <span className="text-xs text-accent font-medium">Engage &rarr;</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Home() {
  const { data: featured, isLoading: featLoading } = useListFeaturedProducts();
  const { data: stats, isLoading: statsLoading } = useGetStoreStats();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(208_58%_56%_/_0.12),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsl(42_76%_56%_/_0.08),_transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/40 text-sm px-4 py-1">
              Starfleet Certified Framing Technology
            </Badge>
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Frame your memories<br />
            <span className="text-primary">at warp speed.</span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            The galaxy's premier destination for Star Trek-themed photo frames.
            Resistance is futile — you will buy one. And you'll love it.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Link href="/products">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-base px-8" data-testid="button-explore-products">
                Explore the Armory <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/products?category=LCARS+Edition">
              <Button size="lg" variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 text-base px-8" data-testid="button-featured">
                LCARS Edition
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border bg-card/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {statsLoading ? (
            <div className="flex justify-center gap-12">
              {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-32" />)}
            </div>
          ) : stats ? (
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-center">
              <div data-testid="stat-products">
                <p className="text-2xl font-bold text-primary">{stats.totalProducts}+</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Frame Models</p>
              </div>
              <div className="hidden sm:block w-px bg-border" />
              <div data-testid="stat-customers">
                <p className="text-2xl font-bold text-primary">{stats.happyCustomers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Happy Crew Members</p>
              </div>
              <div className="hidden sm:block w-px bg-border" />
              <div data-testid="stat-categories">
                <p className="text-2xl font-bold text-primary">{stats.totalCategories}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Collections</p>
              </div>
            </div>
          ) : null}
          {stats && (
            <p className="text-center text-xs text-accent/80 mt-4 italic">
              Starfleet Database: "{stats.starTrekFact}"
            </p>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">
            <span className="text-primary">Starfleet Approved</span> Frames
          </h2>
          <p className="text-muted-foreground mt-2">Our finest specimens from across the quadrant</p>
        </div>

        {featLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-card border border-border rounded-lg overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : featured?.length ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        ) : (
          <p className="text-center text-muted-foreground py-20">Sensors detect no featured products in this sector.</p>
        )}

        <div className="text-center mt-12">
          <Link href="/products">
            <Button variant="outline" size="lg" className="border-border hover:border-primary hover:text-primary" data-testid="button-view-all">
              View Full Armory <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-card/30 border-y border-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Warp-Speed Delivery",
                desc: "Orders beamed to your location faster than a photon torpedo. Well, nearly.",
              },
              {
                icon: Shield,
                title: "Starfleet Quality",
                desc: "Every frame tested to withstand Klingon boarding parties and awkward family photos alike.",
              },
              {
                icon: Star,
                title: "Trek-Certified",
                desc: "We didn't ask for official certification. But if we had, we'd have it. Probably.",
              },
            ].map((feat) => (
              <div key={feat.title} className="text-center p-6 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors">
                <feat.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
