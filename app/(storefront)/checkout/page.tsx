"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/lib/storefront-actions";
import { Loader2, AlertCircle, ChevronLeft, CheckCircle } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { items, subtotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");

  const shipping = subtotal >= 500 ? 0 : 25;
  const total = subtotal + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!session?.user?.email) {
      setError("Please sign in to place an order");
      setLoading(false);
      return;
    }

    if (paymentMethod === "online") {
      setError("Online payment will be available soon. Please use Cash on Delivery.");
      setLoading(false);
      return;
    }

    try {
      const result = await createOrder({
        userId: session.user.email,
        items: items.map((item) => ({
          variantId: item.variantId,
          productName: item.name,
          variantLabel: item.size ? `Size: ${item.size}` : undefined,
          sku: String(item.variantId),
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
        })),
        shippingAddress: {
          addressLine1: form.address,
          addressLine2: form.apartment,
          city: form.city,
          stateProvince: form.state,
          postalCode: form.zip,
          countryCode: form.country,
        },
        paymentMethod: "cod",
        subtotal,
        taxTotal: 0,
        shippingTotal: shipping,
        grandTotal: total,
      });

      setSuccess(result.orderNumber);
    } catch (err) {
      setError("Failed to place order. Please try again.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#080808] pt-28 pb-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-6" />
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-light text-[#F5F0EB] mb-4">
            Order Placed!
          </h1>
          <p className="text-sm text-[#F5F0EB]/60 mb-2">
            Your order number is
          </p>
          <p className="text-lg text-[#C9956C] font-mono mb-8">{success}</p>
          <p className="text-sm text-[#6B6460] mb-8">
            You will receive a confirmation email shortly. We&apos;ll notify you
            when your order ships.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="py-3 px-6 bg-[#F5F0EB] text-[#080808] text-sm tracking-[0.15em] uppercase font-medium hover:bg-[#C9956C] transition-colors"
            >
              View Orders
            </Link>
            <Link
              href="/products"
              className="py-3 px-6 border border-white/10 text-[#F5F0EB]/60 text-sm tracking-[0.15em] uppercase hover:border-[#C9956C] hover:text-[#C9956C] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] pt-28 pb-20">
      <div className="max-w-[800px] mx-auto px-6 lg:px-12">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-xs tracking-wider uppercase text-[#6B6460] hover:text-[#C9956C] transition-colors mb-8"
        >
          <ChevronLeft className="h-3 w-3" />
          Back to Cart
        </Link>

        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-light text-[#F5F0EB] mb-10">
          Checkout
        </h1>

        {!session && (
          <div className="bg-[#111111] border border-white/5 p-6 mb-8">
            <p className="text-sm text-[#F5F0EB]/70">
              Please{" "}
              <Link href="/login" className="text-[#C9956C] hover:underline">
                sign in
              </Link>{" "}
              to place an order.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <h2 className="text-sm tracking-[0.15em] uppercase text-[#F5F0EB] mb-6">
              Shipping Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#6B6460] mb-1.5">
                  First Name
                </label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#111111] border border-white/10 text-[#F5F0EB] text-sm placeholder:text-[#6B6460] focus:outline-none focus:border-[#C9956C] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6B6460] mb-1.5">
                  Last Name
                </label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#111111] border border-white/10 text-[#F5F0EB] text-sm placeholder:text-[#6B6460] focus:outline-none focus:border-[#C9956C] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6B6460] mb-1.5">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#111111] border border-white/10 text-[#F5F0EB] text-sm placeholder:text-[#6B6460] focus:outline-none focus:border-[#C9956C] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6B6460] mb-1.5">
                  Phone
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#111111] border border-white/10 text-[#F5F0EB] text-sm placeholder:text-[#6B6460] focus:outline-none focus:border-[#C9956C] transition-colors"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-[#6B6460] mb-1.5">
                  Address
                </label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#111111] border border-white/10 text-[#F5F0EB] text-sm placeholder:text-[#6B6460] focus:outline-none focus:border-[#C9956C] transition-colors"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-[#6B6460] mb-1.5">
                  Apartment, Suite, etc. (optional)
                </label>
                <input
                  name="apartment"
                  value={form.apartment}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#111111] border border-white/10 text-[#F5F0EB] text-sm placeholder:text-[#6B6460] focus:outline-none focus:border-[#C9956C] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6B6460] mb-1.5">
                  City
                </label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#111111] border border-white/10 text-[#F5F0EB] text-sm placeholder:text-[#6B6460] focus:outline-none focus:border-[#C9956C] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6B6460] mb-1.5">
                  State
                </label>
                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#111111] border border-white/10 text-[#F5F0EB] text-sm placeholder:text-[#6B6460] focus:outline-none focus:border-[#C9956C] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6B6460] mb-1.5">
                  ZIP Code
                </label>
                <input
                  name="zip"
                  value={form.zip}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#111111] border border-white/10 text-[#F5F0EB] text-sm placeholder:text-[#6B6460] focus:outline-none focus:border-[#C9956C] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6B6460] mb-1.5">
                  Country
                </label>
                <select
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#111111] border border-white/10 text-[#F5F0EB] text-sm focus:outline-none focus:border-[#C9956C] transition-colors"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm tracking-[0.15em] uppercase text-[#F5F0EB] mb-6">
              Payment Method
            </h2>
            <div className="space-y-3">
              <label
                className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${
                  paymentMethod === "cod"
                    ? "border-[#C9956C] bg-[#C9956C]/5"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="accent-[#C9956C]"
                />
                <div>
                  <p className="text-sm text-[#F5F0EB] font-medium">
                    Cash on Delivery
                  </p>
                  <p className="text-xs text-[#6B6460] mt-0.5">
                    Pay when your order arrives
                  </p>
                </div>
              </label>
              <label
                className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${
                  paymentMethod === "online"
                    ? "border-[#C9956C] bg-[#C9956C]/5"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="online"
                  checked={paymentMethod === "online"}
                  onChange={() => setPaymentMethod("online")}
                  className="accent-[#C9956C]"
                />
                <div>
                  <p className="text-sm text-[#F5F0EB] font-medium">
                    Pay Online
                  </p>
                  <p className="text-xs text-[#6B6460] mt-0.5">
                    Credit / Debit card — Coming soon
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-[#111111] border border-white/5 p-8">
            <h2 className="text-sm tracking-[0.15em] uppercase text-[#F5F0EB] mb-4">
              Order Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[#F5F0EB]/60">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#F5F0EB]/60">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-400">Free</span> : `$${shipping}`}</span>
              </div>
              <div className="border-t border-white/5 pt-2 mt-2 flex justify-between text-[#F5F0EB] font-medium">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !session}
            className="w-full py-3.5 bg-[#F5F0EB] text-[#080808] text-sm tracking-[0.15em] uppercase font-medium hover:bg-[#C9956C] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Placing Order...
              </>
            ) : (
              `Place Order — ₹${total.toLocaleString()}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
