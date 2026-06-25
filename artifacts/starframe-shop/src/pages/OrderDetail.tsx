import { useParams, Link } from "wouter";
import { useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { CheckCircle } from "lucide-react";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id ?? "0", 10);

  const { data: order, isLoading, isError } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: getGetOrderQueryKey(orderId) },
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-xl text-muted-foreground">Order not found in the ship's manifest.</p>
        <Link href="/">
          <Button variant="outline" className="mt-6">Return to Bridge</Button>
        </Link>
      </div>
    );
  }

  const items = order.items as Array<{ productId: number; name: string; price: number; quantity: number; imageUrl: string }>;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <CheckCircle className="h-14 w-14 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-foreground">Order Confirmed, Captain!</h1>
        <p className="text-muted-foreground mt-2">
          Your frames have been beamed to our warehouse. The crew is on it.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        {/* Order meta */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-widest">Order ID</p>
            <p className="text-foreground font-semibold" data-testid="text-order-id">#{order.id}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-widest">Status</p>
            <Badge className="mt-1 bg-primary/20 text-primary border-primary/30" data-testid="text-order-status">
              {order.status}
            </Badge>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-widest">Captain</p>
            <p className="text-foreground font-medium" data-testid="text-customer-name">{order.customerName}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-widest">Stardate</p>
            <p className="text-foreground font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground text-xs uppercase tracking-widest">Transport Coordinates</p>
            <p className="text-foreground">{order.shippingAddress}</p>
          </div>
        </div>

        <Separator />

        {/* Items */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Cargo Manifest</p>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 text-sm" data-testid={`order-item-${item.productId}`}>
                <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium truncate">{item.name}</p>
                  <p className="text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="text-foreground font-semibold shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Total</span>
          <span className="text-2xl font-bold text-primary" data-testid="text-order-total">${order.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Link href="/products" className="flex-1">
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-continue">
            Continue Shopping
          </Button>
        </Link>
        <Link href="/" className="flex-1">
          <Button variant="outline" className="w-full" data-testid="button-home">
            Return to Bridge
          </Button>
        </Link>
      </div>
    </div>
  );
}
