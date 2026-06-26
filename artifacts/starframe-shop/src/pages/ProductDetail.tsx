import { useState } from "react";
import { useParams, Link } from "wouter";
import {
  useGetProduct,
  useAddToCart,
  getGetCartQueryKey,
  getGetProductQueryKey,
} from "@workspace/api-client-react";
import { useCartId } from "@/hooks/use-cart-id";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, ArrowLeft, Package, Ruler, Layers, Palette } from "lucide-react";

const FRAME_COLORS = [
  { label: "Black", value: "black", hex: "#111111", available: true },
  { label: "Stainless Steel", value: "stainless", hex: "#b0b8c1", available: false },
];


const FRAME_SIZES = [
  "4×6 in",
  "5×7 in",
  "8×10 in",
  "8×12 in",
  "11×14 in",
  "13×19 in",
];

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id ?? "0", 10);
  const cartId = useCartId();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("black");
  const [selectedSize, setSelectedSize] = useState(FRAME_SIZES[0]);

  const { data: product, isLoading, isError } = useGetProduct(productId, {
    query: { enabled: !!productId, queryKey: getGetProductQueryKey(productId) },
  });

  const addToCart = useAddToCart({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ cartId: cartId ?? "" }) });
        toast({
          title: "Added to Replicator",
          description: `${product?.name} has been beamed to your cart.`,
        });
      },
      onError: () => {
        toast({
          title: "Transporter malfunction",
          description: "Could not add item to cart. Please try again.",
          variant: "destructive",
        });
      },
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <p className="text-xl text-muted-foreground">This product was lost in the Neutral Zone.</p>
        <Link href="/products">
          <Button variant="outline" className="mt-6">Return to Armory</Button>
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!cartId) return;
    addToCart.mutate({
      data: { cartId, productId: product.id, quantity },
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors" data-testid="link-back">
        <ArrowLeft className="h-4 w-4" />
        Back to Armory
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="rounded-lg overflow-hidden border border-border bg-card aspect-square">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            data-testid="img-product"
          />
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <Badge className="w-fit mb-3 bg-primary/20 text-primary border-primary/30">{product.category}</Badge>
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-product-name">{product.name}</h1>

          <p className="text-3xl font-extrabold text-primary mb-4" data-testid="text-product-price">
            ${product.price.toFixed(2)}
          </p>

          <p className="text-muted-foreground mb-6 leading-relaxed">{product.description}</p>

          {/* Trek quote */}
          <blockquote className="border-l-4 border-accent pl-4 italic text-accent/90 text-sm mb-6">
            "{product.starTrekQuote}"
          </blockquote>

          {/* Specs — 2×2 grid: Dimensions (with size picker) | Material | Status | Colour */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Dimensions + size dropdown */}
            {product.dimensions && (
              <div className="flex items-start gap-2 bg-muted/30 rounded-md p-3">
                <Ruler className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Dimensions</p>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full rounded border border-border bg-background text-foreground px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {FRAME_SIZES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Material */}
            {product.material && (
              <div className="flex items-start gap-2 bg-muted/30 rounded-md p-3">
                <Layers className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Material</p>
                  <p className="text-sm text-foreground">{product.material}</p>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="flex items-start gap-2 bg-muted/30 rounded-md p-3">
              <Package className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className={`text-sm font-medium ${product.inStock ? "text-green-400" : "text-destructive"}`}>
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </p>
              </div>
            </div>

            {/* Colour swatches as 4th spec card */}
            <div className="flex items-start gap-2 bg-muted/30 rounded-md p-3">
              <Palette className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Colour</p>
                <div className="flex gap-2 mt-1.5">
                  {FRAME_COLORS.map((c) => (
                    <button
                      key={c.value}
                      title={c.available ? c.label : `${c.label} — not available`}
                      disabled={!c.available}
                      onClick={() => c.available && setSelectedColor(c.value)}
                      className={`relative w-6 h-6 rounded-full border-2 transition-all duration-150 focus:outline-none
                        ${!c.available ? "opacity-35 cursor-not-allowed" : "cursor-pointer hover:scale-110"}
                        ${selectedColor === c.value && c.available
                          ? "border-primary ring-2 ring-primary/50 ring-offset-1 ring-offset-background"
                          : "border-border/60"}`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {!c.available && <span className="absolute inset-0 flex items-center justify-center text-white/70 text-[9px] font-bold select-none">✕</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quantity + Add */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border border-border rounded-md overflow-hidden">
              <button
                className="px-3 py-2 text-foreground hover:bg-muted transition-colors"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                data-testid="button-quantity-decrease"
              >
                -
              </button>
              <span className="px-4 py-2 text-foreground font-medium" data-testid="text-quantity">{quantity}</span>
              <button
                className="px-3 py-2 text-foreground hover:bg-muted transition-colors"
                onClick={() => setQuantity((q) => q + 1)}
                data-testid="button-quantity-increase"
              >
                +
              </button>
            </div>

            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              disabled={!product.inStock || addToCart.isPending || !cartId}
              onClick={handleAddToCart}
              data-testid="button-add-to-cart"
            >
              <ShoppingCart className="h-4 w-4" />
              {addToCart.isPending ? "Beaming..." : "Add to Replicator"}
            </Button>
          </div>

          {!product.inStock && (
            <p className="text-destructive text-sm mt-3">
              Red Alert — This item has been destroyed. Check back after repairs.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
