import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGetCart,
  useCreateOrder,
  getGetCartQueryKey,
} from "@workspace/api-client-react";
import { useCartId } from "@/hooks/use-cart-id";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Enter a valid Starfleet comm address"),
  shippingAddress: z.string().min(10, "Provide full coordinates for the transporter"),
  notes: z.string().optional(),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const cartId = useCartId();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [orderId, setOrderId] = useState<number | null>(null);

  const { data: cart, isLoading } = useGetCart(
    { cartId: cartId ?? "" },
    { query: { enabled: !!cartId, queryKey: getGetCartQueryKey({ cartId: cartId ?? "" }) } }
  );

  const createOrder = useCreateOrder({
    mutation: {
      onSuccess: (order) => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ cartId: cartId ?? "" }) });
        localStorage.removeItem("stella_outpost_cart_id");
        setOrderId(order.id);
      },
    },
  });

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      shippingAddress: "",
      notes: "",
    },
  });

  const onSubmit = (values: CheckoutValues) => {
    if (!cartId) return;
    createOrder.mutate({
      data: {
        cartId,
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        shippingAddress: values.shippingAddress,
        notes: values.notes ?? null,
      },
    });
  };

  if (orderId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="bg-card border border-primary/30 rounded-xl p-10">
          <div className="text-5xl mb-4">&#9733;</div>
          <h1 className="text-3xl font-bold text-primary mb-3">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-2">
            Your frames have been beamed to our warehouse, Captain.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Order #{orderId} — Starfleet tracking activated. You'll receive a subspace communication shortly.
          </p>
          <div className="flex flex-col gap-3">
            <Link href={`/order/${orderId}`}>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-view-order">
                View Order Details
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" className="w-full" data-testid="button-continue-shopping">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !cartId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Skeleton className="h-8 w-40 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const items = cart?.items ?? [];
  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-xl text-muted-foreground">Your cargo hold is empty, Captain.</p>
        <Link href="/products">
          <Button className="mt-6 bg-primary text-primary-foreground" data-testid="button-browse">Browse Armory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Cargo Hold
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-8">
        <span className="text-primary">Initiate</span> Checkout Sequence
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name, Captain</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. James T. Kirk" className="bg-card border-border" {...field} data-testid="input-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subspace Comm Address (Email)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="captain@enterprise.fed" className="bg-card border-border" {...field} data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shippingAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transporter Coordinates (Shipping Address)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="1701 Enterprise Way, San Francisco, CA 94102"
                        className="bg-card border-border"
                        rows={3}
                        {...field}
                        data-testid="input-address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Orders (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any messages for the crew?"
                        className="bg-card border-border"
                        rows={2}
                        {...field}
                        data-testid="input-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {createOrder.isError && (
                <p className="text-destructive text-sm">Transporter malfunction — could not complete order. Please try again.</p>
              )}

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-base"
                disabled={createOrder.isPending}
                data-testid="button-place-order"
              >
                {createOrder.isPending ? "Engaging warp drive..." : "Engage — Place Order"}
              </Button>
            </form>
          </Form>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg p-5 sticky top-20">
            <h2 className="font-semibold text-foreground mb-4">Order Manifest</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={item.imageUrl} alt={item.name} className="w-8 h-8 rounded object-cover shrink-0" />
                    <span className="text-muted-foreground truncate">{item.name} x{item.quantity}</span>
                  </div>
                  <span className="text-foreground font-medium shrink-0 ml-2">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-xl font-bold text-primary" data-testid="text-total">${cart?.subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Shipping included</p>
          </div>
        </div>
      </div>
    </div>
  );
}
