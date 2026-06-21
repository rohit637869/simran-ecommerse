"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  id: number;
  name: string;
  slug: string;
  basePrice: string;
  primaryImage: string | null;
  categoryName: string | null;
}

export default function ProductCard({
  id,
  name,
  slug,
  basePrice,
  primaryImage,
  categoryName,
}: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart(id, null);

  useEffect(() => {
    if (imgRef.current?.complete) setImgLoaded(true);
  }, []);

  return (
    <div className="group relative">
      <Link href={`/products/${slug}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-[#111111]">
          {!imgLoaded && (
            <div className="absolute inset-0 bg-[#111111] animate-pulse" />
          )}
          {primaryImage ? (
            <img
              ref={imgRef}
              src={primaryImage}
              alt={name}
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#6B6460] text-xs tracking-wider uppercase">
              No Image
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
            <button
              onClick={(e) => {
                e.preventDefault();
                setWishlisted(!wishlisted);
              }}
              className={`h-9 w-9 flex items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 ${
                wishlisted
                  ? "bg-[#C9956C] text-[#080808]"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
              aria-label="Toggle wishlist"
            >
              <Heart
                className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`}
              />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
            <button
              onClick={(e) => {
                e.preventDefault();
                if (inCart) return;
                addToCart({
                  productId: id,
                  variantId: id,
                  name,
                  size: null,
                  price: parseFloat(basePrice),
                  quantity: 1,
                  image: primaryImage || "",
                  slug,
                });
              }}
              className={`w-full py-3 text-xs tracking-[0.15em] uppercase font-medium flex items-center justify-center gap-2 transition-colors ${
                inCart
                  ? "bg-[#C9956C]/20 text-[#C9956C] cursor-default"
                  : "bg-[#F5F0EB] text-[#080808] hover:bg-[#C9956C]"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {inCart ? "Added \u2713" : "Quick Add"}
            </button>
          </div>
        </div>
      </Link>
      <div className="mt-4 space-y-1.5">
        {categoryName && (
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#6B6460]">
            {categoryName}
          </p>
        )}
        <Link href={`/products/${slug}`}>
          <h3 className="text-sm font-medium text-[#F5F0EB] hover:text-[#C9956C] transition-colors">
            {name}
          </h3>
        </Link>
        <p className="text-sm text-[#F5F0EB]/60">
          ${parseFloat(basePrice).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
