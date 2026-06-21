"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/lib/storefront-actions";
import { useCart } from "@/context/CartContext";
import { Heart, Minus, Plus, ShoppingBag, ChevronLeft } from "lucide-react";

interface ProductData {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  designStory: string | null;
  materials: string | null;
  basePrice: string;
  sku: string;
  categoryName: string | null;
  images: Array<{ imageUrl: string; altText: string | null }>;
  variants: Array<{
    id: number;
    size: string | null;
    colorName: string | null;
    colorHex: string | null;
    additionalPrice: string | null;
    stockQuantity: number;
    imageUrl: string | null;
  }>;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const { addToCart, isInCart } = useCart();

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    const data = await getProductBySlug(slug);
    setProduct(data as ProductData | null);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] pt-28 pb-20 flex items-center justify-center">
        <div className="h-6 w-6 border border-[#F5F0EB]/30 border-t-[#F5F0EB] rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#080808] pt-28 pb-20 flex flex-col items-center justify-center gap-4">
        <p className="text-[#6B6460]">Product not found</p>
        <Link
          href="/products"
          className="text-sm tracking-wider uppercase text-[#C9956C] hover:text-[#F5F0EB] transition-colors"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const allImages = product.images.length > 0
    ? product.images
    : [{ imageUrl: "/placeholder.svg", altText: product.name }];

  const sizes = [...new Set(product.variants.filter((v) => v.size).map((v) => v.size as string))];
  const selectedVariant = product.variants.find(
    (v) => v.size === selectedSize
  ) || product.variants[0];
  const inBag = selectedVariant ? isInCart(selectedVariant.id, selectedVariant.size) : undefined;

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-20">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs tracking-wider uppercase text-[#6B6460] hover:text-[#C9956C] transition-colors mb-8"
        >
          <ChevronLeft className="h-3 w-3" />
          Back
        </button>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div className="space-y-4">
            <div className="relative aspect-[4/5] overflow-hidden bg-[#111111]">
              <img
                src={allImages[selectedImage].imageUrl}
                alt={allImages[selectedImage].altText || product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`shrink-0 w-20 h-24 overflow-hidden border-2 transition-colors ${
                      i === selectedImage ? "border-[#C9956C]" : "border-transparent hover:border-white/20"
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.altText || `View ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:pt-8">
            {product.categoryName && (
              <p className="text-xs tracking-[0.2em] uppercase text-[#6B6460] mb-3">
                {product.categoryName}
              </p>
            )}
            <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-light text-[#F5F0EB] mb-4">
              {product.name}
            </h1>
            <p className="text-2xl text-[#C9956C] mb-8 font-[family-name:var(--font-heading)]">
              ${parseFloat(product.basePrice).toLocaleString()}
            </p>

            {sizes.length > 0 && (
              <div className="mb-8">
                <label className="block text-xs tracking-[0.15em] uppercase text-[#F5F0EB]/50 mb-3">
                  Size
                </label>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-5 py-2.5 text-xs tracking-wider uppercase border transition-colors ${
                        selectedSize === size
                          ? "bg-[#F5F0EB] text-[#080808] border-[#F5F0EB]"
                          : "border-white/10 text-[#F5F0EB]/60 hover:border-[#C9956C] hover:text-[#C9956C]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center border border-white/10">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2.5 text-[#F5F0EB]/60 hover:text-[#F5F0EB] transition-colors"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="px-4 py-2.5 text-sm text-[#F5F0EB] min-w-[3ch] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2.5 text-[#F5F0EB]/60 hover:text-[#F5F0EB] transition-colors"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-10">
              <button
                onClick={() => {
                  if (!selectedVariant || inBag) return;
                  addToCart({
                    productId: product.id,
                    variantId: selectedVariant.id,
                    name: product.name,
                    size: selectedVariant.size || null,
                    price: parseFloat(product.basePrice) + parseFloat(selectedVariant.additionalPrice || "0"),
                    quantity,
                    image: allImages[0]?.imageUrl || "",
                    slug: product.slug,
                  });
                }}
                className={`flex-1 py-3.5 text-sm tracking-[0.15em] uppercase font-medium flex items-center justify-center gap-2 transition-colors ${
                  inBag
                    ? "bg-[#C9956C]/20 text-[#C9956C] cursor-default"
                    : "bg-[#F5F0EB] text-[#080808] hover:bg-[#C9956C]"
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                {inBag ? "In Bag \u2713" : "Add to Bag"}
              </button>
              <button
                onClick={() => setWishlisted(!wishlisted)}
                className={`h-[50px] w-[50px] flex items-center justify-center border transition-colors ${
                  wishlisted
                    ? "bg-[#C9956C] border-[#C9956C] text-[#080808]"
                    : "border-white/10 text-[#F5F0EB]/60 hover:text-[#C9956C] hover:border-[#C9956C]"
                }`}
              >
                <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
              </button>
            </div>

            {product.description && (
              <div className="border-t border-white/5 pt-8 mb-6">
                <h3 className="text-xs tracking-[0.15em] uppercase text-[#F5F0EB]/50 mb-3">
                  Description
                </h3>
                <p className="text-sm text-[#F5F0EB]/60 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {product.designStory && (
              <div className="border-t border-white/5 pt-6 mb-6">
                <h3 className="text-xs tracking-[0.15em] uppercase text-[#F5F0EB]/50 mb-3">
                  Design Story
                </h3>
                <p className="text-sm text-[#F5F0EB]/60 leading-relaxed italic">
                  {product.designStory}
                </p>
              </div>
            )}

            {product.materials && (
              <div className="border-t border-white/5 pt-6">
                <h3 className="text-xs tracking-[0.15em] uppercase text-[#F5F0EB]/50 mb-3">
                  Materials & Care
                </h3>
                <p className="text-sm text-[#F5F0EB]/60 leading-relaxed">
                  {product.materials}
                </p>
              </div>
            )}

            <div className="border-t border-white/5 pt-6 mt-6">
              <p className="text-xs text-[#6B6460]">SKU: {product.sku}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
