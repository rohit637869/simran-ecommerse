"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();

  const shipping = subtotal >= 500 ? 0 : 25;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#080808] pt-28 pb-20">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="text-center py-20">
            <ShoppingBag className="h-12 w-12 text-[#6B6460] mx-auto mb-6" />
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-light text-[#F5F0EB] mb-4">
              Your Bag is Empty
            </h1>
            <p className="text-sm text-[#6B6460] mb-8">
              Discover pieces that speak to you.
            </p>
            <Link
              href="/products"
              className="inline-flex py-3.5 px-8 bg-[#F5F0EB] text-[#080808] text-sm tracking-[0.15em] uppercase font-medium hover:bg-[#C9956C] transition-colors"
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
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between mb-10">
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-light text-[#F5F0EB]">
            Shopping Bag
          </h1>
          <span className="text-sm text-[#6B6460]">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-6 pb-6 border-b border-white/5"
              >
                <div className="w-24 h-32 bg-[#111111] shrink-0 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-medium text-[#F5F0EB]">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#6B6460] mt-1">
                        Size: {item.size || "One Size"}
                      </p>
                    </div>
                    <p className="text-sm text-[#F5F0EB]">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-white/10">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="px-3 py-1.5 text-[#F5F0EB]/60 hover:text-[#F5F0EB]"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-3 py-1.5 text-xs text-[#F5F0EB]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="px-3 py-1.5 text-[#F5F0EB]/60 hover:text-[#F5F0EB]"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[#6B6460] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-[#111111] border border-white/5 p-8 sticky top-28">
              <h2 className="text-sm tracking-[0.15em] uppercase text-[#F5F0EB] mb-6">
                Order Summary
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[#F5F0EB]/60">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#F5F0EB]/60">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-400">Free</span>
                    ) : (
                      `$${shipping}`
                    )}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-[#6B6460]">
                    Free shipping on orders over $500
                  </p>
                )}
                <div className="border-t border-white/5 pt-3 mt-3">
                  <div className="flex justify-between text-[#F5F0EB] font-medium">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <Link
                href="/checkout"
                className="block w-full py-3.5 bg-[#F5F0EB] text-[#080808] text-sm tracking-[0.15em] uppercase font-medium text-center hover:bg-[#C9956C] transition-colors mt-8"
              >
                Checkout
              </Link>
              <Link
                href="/products"
                className="block w-full py-3 text-xs tracking-wider uppercase text-center text-[#6B6460] hover:text-[#F5F0EB] transition-colors mt-4"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
