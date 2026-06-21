"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search, ShoppingCart, Clock, Zap, Truck, Package, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { getOrdersList, updateOrderStatus } from "@/app/actions/orders";
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

const paymentColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  refunded: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

interface Order {
  id: number;
  orderNumber: string;
  status: string | null;
  paymentStatus: string | null;
  fulfillmentStatus: string | null;
  grandTotal: string | null;
  currencyCode: string | null;
  placedAt: Date | null;
  customerName: string | null;
  customerEmail: string | null;
  itemCount: number;
}

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") || "all";
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 20;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOrdersList(search || undefined, statusFilter === "all" ? undefined : statusFilter, page, pageSize);
      setOrders(res.orders as Order[]);
      setTotal(res.total);
    } finally { setLoading(false); }
  }, [search, statusFilter, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const totalPages = Math.ceil(total / pageSize);

  const statusTabs = [
    { label: "All", value: "all", icon: <ShoppingCart className="h-4 w-4" /> },
    { label: "Pending", value: "pending", icon: <Clock className="h-4 w-4" /> },
    { label: "Processing", value: "processing", icon: <Zap className="h-4 w-4" /> },
    { label: "Shipped", value: "shipped", icon: <Truck className="h-4 w-4" /> },
    { label: "Delivered", value: "delivered", icon: <Package className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
        <p className="text-sm text-muted-foreground">{total} orders</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <Button
            key={tab.value}
            variant={statusFilter === tab.value ? "default" : "outline"}
            size="sm"
            onClick={() => { setPage(1); router.push(`/admin/orders?status=${tab.value}`); }}
          >
            {tab.icon}
            <span className="ml-1.5">{tab.label}</span>
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search orders or customers..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b text-xs uppercase text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Order</th>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Payment</th>
                <th className="px-4 py-3 text-left font-medium">Items</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 text-right font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">No orders found</td></tr>
              ) : orders.map((o) => (
                <tr key={o.id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/admin/orders/${o.id}`)}>
                  <td className="px-4 py-3 text-sm font-medium">#{o.orderNumber}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium">{o.customerName || "—"}</div>
                    <div className="text-xs text-muted-foreground">{o.customerEmail || ""}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={statusColors[o.status || ""] || ""}>{o.status || "—"}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={paymentColors[o.paymentStatus || ""] || ""}>{o.paymentStatus || "—"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">{o.itemCount}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    {o.grandTotal ? new Intl.NumberFormat("en-US", { style: "currency", currency: o.currencyCode || "USD" }).format(Number(o.grandTotal)) : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-muted-foreground">
                    {o.placedAt ? new Date(o.placedAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages} ({total} total)
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
