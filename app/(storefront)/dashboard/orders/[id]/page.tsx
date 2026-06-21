"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { getCustomerOrderDetail } from "@/lib/storefront-actions";
import { ChevronLeft, Package, MapPin, CreditCard } from "lucide-react";

interface OrderDetail {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  grandTotal: string;
  subtotal: string;
  taxTotal: string;
  shippingTotal: string;
  placedAt: Date;
  items: Array<{
    id: number;
    productName: string;
    variantLabel: string | null;
    sku: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
  }>;
  payments: Array<{
    id: number;
    transactionId: string | null;
    paymentGateway: string;
    amount: string;
    status: string | null;
    paymentMethod: string | null;
  }>;
  shippingAddress: {
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    stateProvince: string | null;
    postalCode: string;
    countryCode: string;
  } | null;
}

const statusStyles: Record<string, string> = {
  pending: "text-yellow-400 border-yellow-400/30",
  paid: "text-green-400 border-green-400/30",
  processing: "text-blue-400 border-blue-400/30",
  shipped: "text-purple-400 border-purple-400/30",
  delivered: "text-green-400 border-green-400/30",
  canceled: "text-red-400 border-red-400/30",
};

export default function OrderDetailPage() {
  const params = useParams();
  const { data: session } = authClient.useSession();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.email) {
      getCustomerOrderDetail(session.user.email, parseInt(params.id as string)).then(
        (data) => {
          setOrder(data as OrderDetail | null);
          setLoading(false);
        }
      );
    }
  }, [session, params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-5 w-5 border border-[#F5F0EB]/30 border-t-[#F5F0EB] rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-[#6B6460]">Order not found</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs tracking-wider uppercase text-[#C9956C] hover:text-[#F5F0EB] transition-colors mt-4"
        >
          <ChevronLeft className="h-3 w-3" />
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-xs tracking-wider uppercase text-[#6B6460] hover:text-[#C9956C] transition-colors mb-8"
      >
        <ChevronLeft className="h-3 w-3" />
        Back to Orders
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-light text-[#F5F0EB]">
            Order {order.orderNumber}
          </h2>
          <p className="text-sm text-[#6B6460] mt-1">
            Placed on{" "}
            {new Date(order.placedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <span
          className={`text-[10px] tracking-wider uppercase px-4 py-1.5 border ${
            statusStyles[order.status] || ""
          }`}
        >
          {order.status}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#111111] border border-white/5 p-6">
            <h3 className="text-xs tracking-[0.15em] uppercase text-[#F5F0EB]/50 mb-4 flex items-center gap-2">
              <Package className="h-3.5 w-3.5" />
              Items
            </h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between pb-4 border-b border-white/5 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm text-[#F5F0EB]">{item.productName}</p>
                    <p className="text-xs text-[#6B6460] mt-0.5">
                      {item.variantLabel && `${item.variantLabel} · `}
                      SKU: {item.sku} · Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm text-[#F5F0EB]">
                    ${parseFloat(item.totalPrice).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 space-y-1.5 text-sm">
              <div className="flex justify-between text-[#F5F0EB]/60">
                <span>Subtotal</span>
                <span>${parseFloat(order.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#F5F0EB]/60">
                <span>Shipping</span>
                <span>${parseFloat(order.shippingTotal || "0").toLocaleString()}</span>
              </div>
              {parseFloat(order.taxTotal || "0") > 0 && (
                <div className="flex justify-between text-[#F5F0EB]/60">
                  <span>Tax</span>
                  <span>${parseFloat(order.taxTotal).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-[#F5F0EB] font-medium pt-2 border-t border-white/5">
                <span>Total</span>
                <span>${parseFloat(order.grandTotal).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#111111] border border-white/5 p-6">
            <h3 className="text-xs tracking-[0.15em] uppercase text-[#F5F0EB]/50 mb-3 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              Shipping Address
            </h3>
            {order.shippingAddress ? (
              <div className="text-sm text-[#F5F0EB]/70 space-y-0.5">
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {order.shippingAddress.city}
                  {order.shippingAddress.stateProvince && `, ${order.shippingAddress.stateProvince}`}{" "}
                  {order.shippingAddress.postalCode}
                </p>
              </div>
            ) : (
              <p className="text-sm text-[#6B6460]">Not available</p>
            )}
          </div>

          <div className="bg-[#111111] border border-white/5 p-6">
            <h3 className="text-xs tracking-[0.15em] uppercase text-[#F5F0EB]/50 mb-3 flex items-center gap-2">
              <CreditCard className="h-3.5 w-3.5" />
              Payment
            </h3>
            <div className="space-y-2 text-sm">
              {order.payments.map((p) => (
                <div key={p.id} className="flex justify-between">
                  <span className="text-[#6B6460]">{p.paymentMethod || p.paymentGateway}</span>
                  <span
                    className={`${
                      p.status === "paid" || p.status === "pending"
                        ? "text-yellow-400"
                        : "text-[#F5F0EB]/70"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
              {order.payments.length === 0 && (
                <p className="text-[#6B6460]">No payment records</p>
              )}
              <div className="pt-2 border-t border-white/5 flex justify-between text-[#F5F0EB]">
                <span>Total Charged</span>
                <span>${parseFloat(order.grandTotal).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
