import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  useGetCart,
  useUpdateCartItem,
  useRemoveFromCart,
  getGetCartQueryKey,
} from "@workspace/api-client-react";
import { useCartId } from "@/hooks/use-cart-id";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Trash2, ArrowRight, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Cart() {
  const cartId = useCartId();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cart, isLoading } = useGetCart(
    { cartId: cartId ?? "" },
    { query: { enabled: !!cartId, queryKey: getGetCartQueryKey({ cartId: cartId ?? "" }) } }
  );

  const updateItem = useUpdateCartItem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ cartId: cartId ?? "" }) });
      },
    },
  });

  const removeItem = useRemoveFromCart({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ cartId: cartId ?? "" }) });
        toast({ title: "Item removed from cargo hold" });
      },
    },
  });

  if (isLoading || !cartId) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Skeleton className="h-8 w-40 mb-6" />
        {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full mb-4" />)}
      </div>
    );
  }

  const items = cart?.items ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-foreground mb-8">
        Your <span className="text-primary">Cargo Hold</span>
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-24 border border-border rounded-lg bg-card/50">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl text-muted-foreground font-medium">Your cargo hold is empty, Captain.</p>
          <p className="text-sm text-muted-foreground mt-2">The crew awaits your orders.</p>
          <Link href="/products">
            <Button className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-browse-products">
              Browse the Armory
            </Button>
          </Link>
        </div>
      ) : (
        <div>
          <motion.div className="space-y-4" initial="hidden" animate="show">
            {items.map((item) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 bg-card border border-border rounded-lg p-4"
                data-testid={`cart-item-${item.productId}`}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-md shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{item.name}</p>
                  <p className="text-primary font-bold mt-1">${item.price.toFixed(2)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      className="w-7 h-7 border border-border rounded text-foreground hover:bg-muted transition-colors text-sm"
                      onClick={() => updateItem.mutate({ data: { cartId, productId: item.productId, quantity: item.quantity - 1 } })}
                      data-testid={`button-decrease-${item.productId}`}
                    >
                      -
                    </button>
                    <span className="text-sm font-medium w-6 text-center" data-testid={`text-quantity-${item.productId}`}>{item.quantity}</span>
                    <button
                      className="w-7 h-7 border border-border rounded text-foreground hover:bg-muted transition-colors text-sm"
                      onClick={() => updateItem.mutate({ data: { cartId, productId: item.productId, quantity: item.quantity + 1 } })}
                      data-testid={`button-increase-${item.productId}`}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <p className="font-bold text-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                  <button
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    onClick={() => removeItem.mutate({ params: { cartId, productId: item.productId } })}
                    data-testid={`button-remove-${item.productId}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <Separator className="my-6" />

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-2xl font-bold text-primary" data-testid="text-subtotal">
                ${cart?.subtotal.toFixed(2)}
              </span>
            </div>
            <Link href="/checkout">
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-base py-6"
                data-testid="button-checkout"
              >
                Proceed to Checkout <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/products" className="block text-center text-sm text-muted-foreground hover:text-foreground mt-4 transition-colors">
              Continue exploring the Armory
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
