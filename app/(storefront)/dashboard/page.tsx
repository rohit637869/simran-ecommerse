"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { getCustomerOrders } from "@/lib/storefront-actions";
import { Package, ShoppingBag } from "lucide-react";

interface Order {
  id: number;
  orderNumber: string;
  status: string | null;
  paymentStatus: string | null;
  grandTotal: string | null;
  placedAt: Date | null;
}

const statusStyles: Record<string, string> = {
  pending: "text-yellow-400 border-yellow-400/30",
  paid: "text-green-400 border-green-400/30",
  processing: "text-blue-400 border-blue-400/30",
  shipped: "text-purple-400 border-purple-400/30",
  delivered: "text-green-400 border-green-400/30",
  canceled: "text-red-400 border-red-400/30",
};

export default function DashboardPage() {
  const { data: session } = authClient.useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.email) {
      getCustomerOrders(session.user.email).then((data) => {
        setOrders(data as Order[]);
        setLoading(false);
      });
    }
  }, [session]);

  return (
    <div>
      <h2 className="text-sm tracking-[0.15em] uppercase text-[#F5F0EB] mb-6">
        Order History
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-5 w-5 border border-[#F5F0EB]/30 border-t-[#F5F0EB] rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-[#111111] border border-white/5">
          <ShoppingBag className="h-10 w-10 text-[#6B6460] mx-auto mb-4" />
          <p className="text-sm text-[#6B6460] mb-6">No orders yet</p>
          <Link
            href="/products"
            className="inline-flex py-3 px-6 bg-[#F5F0EB] text-[#080808] text-xs tracking-[0.15em] uppercase font-medium hover:bg-[#C9956C] transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="block bg-[#111111] border border-white/5 p-6 hover:border-[#C9956C]/30 transition-colors group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-[#6B6460]" />
                  <span className="text-sm font-mono text-[#F5F0EB]">
                    {order.orderNumber}
                  </span>
                </div>
                <span
                  className={`text-[10px] tracking-wider uppercase px-3 py-1 border ${
                    statusStyles[order.status || "pending"]
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6B6460]">
                  {order.placedAt
                    ? new Date(order.placedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"}
                </span>
                <span className="text-[#F5F0EB]">
                  ₹{parseFloat(order.grandTotal || "0").toLocaleString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
