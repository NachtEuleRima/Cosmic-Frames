import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearch } from "wouter";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function Products() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const [selectedCategory, setSelectedCategory] = useState<string>(params.get("category") ?? "");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: categories, isLoading: catLoading } = useListCategories();
  const { data: products, isLoading: prodLoading } = useListProducts(
    {
      category: selectedCategory || undefined,
      search: searchTerm || undefined,
    },
    { query: { queryKey: ["products", selectedCategory, searchTerm] } }
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          The <span className="text-primary">Armory</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          All frames, all quadrants. Choose your weapon.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-56 shrink-0">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Scan for frames..."
              className="pl-9 bg-card border-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search"
            />
            {searchTerm && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Collections</p>
            <div className="flex flex-col gap-1">
              <button
                className={`text-left text-sm px-3 py-2 rounded-md transition-colors ${
                  !selectedCategory
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                onClick={() => setSelectedCategory("")}
                data-testid="filter-all"
              >
                All Quadrants
              </button>
              {catLoading
                ? [1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-8 w-full" />)
                : categories?.map((cat) => (
                  <button
                    key={cat.id}
                    className={`text-left text-sm px-3 py-2 rounded-md transition-colors ${
                      selectedCategory === cat.name
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setSelectedCategory(cat.name === selectedCategory ? "" : cat.name)}
                    data-testid={`filter-${cat.id}`}
                  >
                    {cat.name}
                    <span className="ml-1 text-xs opacity-60">({cat.productCount})</span>
                  </button>
                ))}
            </div>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          {selectedCategory && (
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className="border-primary/40 text-primary">
                {selectedCategory}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory("")}
                className="h-6 text-xs text-muted-foreground"
                data-testid="button-clear-filter"
              >
                Clear
              </Button>
            </div>
          )}

          {prodLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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
          ) : products?.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <p className="text-lg font-medium">Sensors detect no products in this sector.</p>
              <p className="text-sm mt-2">Try adjusting your scanning parameters.</p>
              <Button
                variant="ghost"
                className="mt-6 text-primary hover:text-primary"
                onClick={() => { setSelectedCategory(""); setSearchTerm(""); }}
                data-testid="button-reset-filters"
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {products?.map((product) => (
                <motion.div key={product.id} variants={item}>
                  <Link href={`/products/${product.id}`} data-testid={`card-product-${product.id}`}>
                    <div className="bg-card border border-border rounded-lg overflow-hidden group hover:border-primary/50 transition-all duration-300 cursor-pointer h-full flex flex-col">
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
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground italic mt-1 flex-1 line-clamp-2">
                          "{product.starTrekQuote}"
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-lg font-bold text-primary" data-testid={`text-price-${product.id}`}>
                            ${product.price.toFixed(2)}
                          </span>
                          <span className="text-xs text-accent font-medium">View Details &rarr;</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
