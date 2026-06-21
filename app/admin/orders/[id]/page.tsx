"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Package, Truck, CreditCard, MapPin, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { getOrderById, updateOrderStatus, updatePaymentStatus, updateFulfillmentStatus, updateAdminNotes } from "@/app/actions/orders";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  paid: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  processing: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  canceled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  refunded: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

interface OrderData {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  subtotal: string;
  discountTotal: string;
  taxTotal: string;
  shippingTotal: string;
  grandTotal: string;
  currencyCode: string;
  couponCode: string | null;
  notes: string | null;
  adminNotes: string | null;
  placedAt: Date;
  paidAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  customer: { id: number; firstName: string; lastName: string; email: string; phone: string | null } | null;
  billingAddress: { addressLine1: string; addressLine2: string | null; city: string; stateProvince: string | null; postalCode: string; countryCode: string } | null;
  shippingAddress: { addressLine1: string; addressLine2: string | null; city: string; stateProvince: string | null; postalCode: string; countryCode: string } | null;
  items: Array<{ id: number; productName: string; variantLabel: string | null; sku: string; quantity: number; unitPrice: string; totalPrice: string }>;
  payments: Array<{ id: number; transactionId: string | null; paymentGateway: string; amount: string; status: string; paymentMethod: string | null; cardLast4: string | null; capturedAt: Date | null }>;
  shipments: Array<{ id: number; carrier: string; trackingNumber: string | null; trackingUrl: string | null; shippingMethod: string | null; shippedAt: Date | null; deliveredAt: Date | null; estimatedDelivery: string | null }>;
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOrderById(Number(id));
      if (!data) { toast.error("Order not found"); router.push("/admin/orders"); return; }
      setOrder(data as OrderData);
      setAdminNotes(data.adminNotes || "");
    } finally { setLoading(false); }
  }, [id, router]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleStatusChange = async (newStatus: string) => {
    try { await updateOrderStatus(Number(id), newStatus); toast.success("Status updated"); fetch(); }
    catch { toast.error("Failed"); }
  };

  const handlePaymentStatusChange = async (newStatus: string) => {
    try { await updatePaymentStatus(Number(id), newStatus); toast.success("Payment status updated"); fetch(); }
    catch { toast.error("Failed"); }
  };

  const handleFulfillmentChange = async (newStatus: string) => {
    try { await updateFulfillmentStatus(Number(id), newStatus); toast.success("Fulfillment status updated"); fetch(); }
    catch { toast.error("Failed"); }
  };

  const saveNotes = async () => {
    try { await updateAdminNotes(Number(id), adminNotes); toast.success("Notes saved"); }
    catch { toast.error("Failed"); }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (!order) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/orders"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Order #{order.orderNumber}</h2>
            <p className="text-sm text-muted-foreground">
              Placed {new Date(order.placedAt).toLocaleDateString()} at {new Date(order.placedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> Items</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-xs uppercase text-muted-foreground">
                    <th className="px-4 py-3 text-left font-medium">Product</th>
                    <th className="px-4 py-3 text-left font-medium">SKU</th>
                    <th className="px-4 py-3 text-center font-medium">Qty</th>
                    <th className="px-4 py-3 text-right font-medium">Price</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium">{item.productName}</div>
                        {item.variantLabel && <div className="text-xs text-muted-foreground">{item.variantLabel}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm"><code className="rounded bg-muted px-1.5 py-0.5 text-xs">{item.sku}</code></td>
                      <td className="px-4 py-3 text-sm text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-right">{new Intl.NumberFormat("en-US", { style: "currency", currency: order.currencyCode }).format(Number(item.unitPrice))}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">{new Intl.NumberFormat("en-US", { style: "currency", currency: order.currencyCode }).format(Number(item.totalPrice))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t"><td colSpan={4} className="px-4 py-2 text-sm text-right">Subtotal</td><td className="px-4 py-2 text-sm text-right">{new Intl.NumberFormat("en-US", { style: "currency", currency: order.currencyCode }).format(Number(order.subtotal))}</td></tr>
                  {Number(order.discountTotal) > 0 && <tr><td colSpan={4} className="px-4 py-2 text-sm text-right">Discount</td><td className="px-4 py-2 text-sm text-right">-{new Intl.NumberFormat("en-US", { style: "currency", currency: order.currencyCode }).format(Number(order.discountTotal))}</td></tr>}
                  {Number(order.taxTotal) > 0 && <tr><td colSpan={4} className="px-4 py-2 text-sm text-right">Tax</td><td className="px-4 py-2 text-sm text-right">{new Intl.NumberFormat("en-US", { style: "currency", currency: order.currencyCode }).format(Number(order.taxTotal))}</td></tr>}
                  <tr><td colSpan={4} className="px-4 py-2 text-sm text-right">Shipping</td><td className="px-4 py-2 text-sm text-right">{new Intl.NumberFormat("en-US", { style: "currency", currency: order.currencyCode }).format(Number(order.shippingTotal))}</td></tr>
                  <tr className="border-t font-semibold"><td colSpan={4} className="px-4 py-2 text-sm text-right">Total</td><td className="px-4 py-2 text-sm text-right">{new Intl.NumberFormat("en-US", { style: "currency", currency: order.currencyCode }).format(Number(order.grandTotal))}</td></tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2">
            {order.shippingAddress && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Truck className="h-4 w-4" /> Shipping Address</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p className="font-medium">{order.customer?.firstName} {order.customer?.lastName}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>{order.shippingAddress.city}{order.shippingAddress.stateProvince ? `, ${order.shippingAddress.stateProvince}` : ""} {order.shippingAddress.postalCode}</p>
                  <p>{order.shippingAddress.countryCode}</p>
                </CardContent>
              </Card>
            )}
            {order.billingAddress && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><CreditCard className="h-4 w-4" /> Billing Address</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p className="font-medium">{order.customer?.firstName} {order.customer?.lastName}</p>
                  <p>{order.billingAddress.addressLine1}</p>
                  {order.billingAddress.addressLine2 && <p>{order.billingAddress.addressLine2}</p>}
                  <p>{order.billingAddress.city}{order.billingAddress.stateProvince ? `, ${order.billingAddress.stateProvince}` : ""} {order.billingAddress.postalCode}</p>
                  <p>{order.billingAddress.countryCode}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {order.shipments.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" /> Shipments</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {order.shipments.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded border p-3">
                    <div>
                      <p className="text-sm font-medium">{s.carrier} {s.shippingMethod && `- ${s.shippingMethod}`}</p>
                      {s.trackingNumber && (
                        <p className="text-xs text-muted-foreground">
                          Tracking: {s.trackingUrl ? <a href={s.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{s.trackingNumber}</a> : s.trackingNumber}
                        </p>
                      )}
                      {s.estimatedDelivery && <p className="text-xs text-muted-foreground">Est. delivery: {s.estimatedDelivery}</p>}
                    </div>
                    <Badge>{s.shippedAt ? "Shipped" : s.deliveredAt ? "Delivered" : "Pending"}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {order.payments.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Payments</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {order.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded border p-3">
                    <div>
                      <p className="text-sm font-medium">{p.paymentGateway} {p.paymentMethod && `(${p.paymentMethod})`}</p>
                      {p.transactionId && <p className="text-xs text-muted-foreground">Transaction: {p.transactionId}</p>}
                      {p.cardLast4 && <p className="text-xs text-muted-foreground">Card ending in {p.cardLast4}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{new Intl.NumberFormat("en-US", { style: "currency", currency: order.currencyCode }).format(Number(p.amount))}</p>
                      <Badge className={statusColors[p.status] || ""}>{p.status}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Admin Notes</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <textarea
                className="flex min-h-[100px] w-full rounded border border-input bg-transparent px-3 py-2 text-sm"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes..."
              />
              <Button onClick={saveNotes}>Save Notes</Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Order Status</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <Select value={order.status} onValueChange={handleStatusChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Payment</label>
                <Select value={order.paymentStatus} onValueChange={handlePaymentStatusChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Fulfillment</label>
                <Select value={order.fulfillmentStatus} onValueChange={handleFulfillmentChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unfulfilled">Unfulfilled</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="fulfilled">Fulfilled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {order.customer ? (
                <>
                  <p className="font-medium">{order.customer.firstName} {order.customer.lastName}</p>
                  <p className="text-muted-foreground">{order.customer.email}</p>
                  {order.customer.phone && <p className="text-muted-foreground">{order.customer.phone}</p>}
                </>
              ) : (
                <p className="text-muted-foreground">Guest checkout</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Placed</span><span>{new Date(order.placedAt).toLocaleString()}</span></div>
              {order.paidAt && <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span>{new Date(order.paidAt).toLocaleString()}</span></div>}
              {order.shippedAt && <div className="flex justify-between"><span className="text-muted-foreground">Shipped</span><span>{new Date(order.shippedAt).toLocaleString()}</span></div>}
              {order.deliveredAt && <div className="flex justify-between"><span className="text-muted-foreground">Delivered</span><span>{new Date(order.deliveredAt).toLocaleString()}</span></div>}
              {order.notes && <div className="border-t pt-2"><span className="text-muted-foreground">Notes: </span><p className="mt-1">{order.notes}</p></div>}
              {order.couponCode && <div className="border-t pt-2"><span className="text-muted-foreground">Coupon: </span><code className="rounded bg-muted px-1.5 py-0.5 text-xs">{order.couponCode}</code></div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
