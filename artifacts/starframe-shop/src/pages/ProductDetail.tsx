import { useState } from "react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
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
import { ShoppingCart, ArrowLeft, Package, Ruler, Layers } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id ?? "0", 10);
  const cartId = useCartId();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

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
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-lg overflow-hidden border border-border bg-card aspect-square"
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            data-testid="img-product"
          />
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col"
        >
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

          {/* Specs */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {product.dimensions && (
              <div className="flex items-start gap-2 bg-muted/30 rounded-md p-3">
                <Ruler className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Dimensions</p>
                  <p className="text-sm text-foreground">{product.dimensions}</p>
                </div>
              </div>
            )}
            {product.material && (
              <div className="flex items-start gap-2 bg-muted/30 rounded-md p-3">
                <Layers className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Material</p>
                  <p className="text-sm text-foreground">{product.material}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2 bg-muted/30 rounded-md p-3">
              <Package className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className={`text-sm font-medium ${product.inStock ? "text-green-400" : "text-destructive"}`}>
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </p>
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
        </motion.div>
      </div>
    </div>
  );
}
