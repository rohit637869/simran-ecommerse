"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface UpcomingCollection {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  launchDate: string | null;
  brandName: string | null;
}

interface NewProduct {
  id: number;
  name: string;
  slug: string;
  basePrice: string;
  primaryImage: string | null;
}

export default function HeroCarousel({
  upcoming,
  newProducts,
}: {
  upcoming: UpcomingCollection[];
  newProducts: NewProduct[];
}) {
  const [current, setCurrent] = useState(0);
  const [hovering, setHovering] = useState(false);
  const slides = 4;

  const next = useCallback(() => setCurrent((p) => (p + 1) % slides), []);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + slides) % slides), []);

  useEffect(() => {
    if (hovering) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [hovering, next]);

  return (
    <section
      className="relative h-screen min-h-[700px] overflow-hidden bg-[#080808]"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-all duration-1000 ${
            i === current ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
        >
          {i === 0 && <SlideOne />}
          {i === 1 && <SlideTwo upcoming={upcoming} />}
          {i === 2 && <SlideThree products={newProducts} />}
          {i === 3 && <SlideFour />}
        </div>
      ))}

      <button
        onClick={prev}
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 h-10 w-10 lg:h-12 lg:w-12 flex items-center justify-center bg-white/5 backdrop-blur-sm border border-white/10 text-[#F5F0EB] hover:bg-[#C9956C] hover:border-[#C9956C] transition-all duration-300"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 h-10 w-10 lg:h-12 lg:w-12 flex items-center justify-center bg-white/5 backdrop-blur-sm border border-white/10 text-[#F5F0EB] hover:bg-[#C9956C] hover:border-[#C9956C] transition-all duration-300"
        aria-label="Next slide"
      >
        <ChevronRight className="h-4 w-4 lg:h-5 lg:w-5" />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
        {[0, 1, 2, 3].map((i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-500 ${
              i === current
                ? "w-8 h-[2px] bg-[#C9956C]"
                : "w-6 h-[2px] bg-[#F5F0EB]/20 hover:bg-[#F5F0EB]/50"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

function SlideOne() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080808]/80 z-10" />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1618255941102-4f22f8f4e4b6?w=1920&q=80')",
          animation: "heroZoom 20s ease infinite",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/40 via-transparent to-[#080808]/40" />
      <div className="relative z-20 text-center max-w-3xl mx-auto px-6 h-full flex flex-col items-center justify-center">
        <p className="text-xs tracking-[0.3em] uppercase text-[#C9956C] mb-6 font-[family-name:var(--font-geist-sans)]">
          Autumn Winter 2026
        </p>
        <h1 className="font-[family-name:var(--font-heading)] text-5xl md:text-7xl lg:text-8xl font-light text-[#F5F0EB] leading-tight mb-8">
          Timeless
          <br />
          <span className="italic">Elegance</span>
        </h1>
        <p className="text-base md:text-lg text-[#F5F0EB]/60 max-w-xl mx-auto mb-10 leading-relaxed font-light">
          Discover our latest collection &mdash; where heritage craftsmanship
          meets contemporary design.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/products"
            className="px-8 py-3.5 bg-[#F5F0EB] text-[#080808] text-sm tracking-[0.2em] uppercase font-medium hover:bg-[#C9956C] transition-all duration-500"
          >
            Explore Collection
          </Link>
          <Link
            href="/new-in"
            className="px-8 py-3.5 border border-[#F5F0EB]/20 text-[#F5F0EB] text-sm tracking-[0.2em] uppercase font-medium hover:border-[#C9956C] hover:text-[#C9956C] transition-all duration-500"
          >
            New Arrivals
          </Link>
        </div>
      </div>
    </>
  );
}

function SlideTwo({ upcoming }: { upcoming: UpcomingCollection[] }) {
  const featured = upcoming[0];

  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080808]/90 z-10" />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: `url(${featured?.coverImage || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1920&q=80"})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/60 to-transparent" />
      <div className="relative z-20 h-full flex flex-col justify-center px-8 lg:px-16 max-w-3xl">
        <p className="text-xs tracking-[0.3em] uppercase text-[#C9956C] mb-4 font-[family-name:var(--font-geist-sans)]">
          Upcoming Collection
        </p>
        <h2 className="font-[family-name:var(--font-heading)] text-5xl md:text-7xl lg:text-8xl font-light text-[#F5F0EB] leading-tight mb-6">
          {featured?.name || "Coming Soon"}
        </h2>
        {featured?.brandName && (
          <p className="text-sm tracking-[0.2em] uppercase text-[#F5F0EB]/40 mb-4">
            By {featured.brandName}
          </p>
        )}
        {featured?.description && (
          <p className="text-sm md:text-base text-[#F5F0EB]/60 max-w-lg mb-8 leading-relaxed">
            {featured.description}
          </p>
        )}
        {featured?.launchDate && <CountdownTimer launchDate={featured.launchDate} />}
        <div className="flex gap-4 mt-10">
          <Link
            href="/collections"
            className="px-8 py-3.5 bg-[#F5F0EB] text-[#080808] text-sm tracking-[0.2em] uppercase font-medium hover:bg-[#C9956C] transition-all duration-500"
          >
            View All Collections
          </Link>
          {upcoming.length > 1 && (
            <p className="text-xs text-[#6B6460] self-center">
              +{upcoming.length - 1} more upcoming
            </p>
          )}
        </div>
      </div>
    </>
  );
}

function CountdownTimer({ launchDate }: { launchDate: string }) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const target = new Date(launchDate).getTime();
    const update = () => {
      const diff = Math.max(0, target - Date.now());
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [launchDate]);

  const units = [
    { label: "Days", v: time.d },
    { label: "Hours", v: time.h },
    { label: "Mins", v: time.m },
    { label: "Secs", v: time.s },
  ];

  return (
    <div>
      <p className="text-xs tracking-[0.2em] uppercase text-[#F5F0EB]/40 mb-3">
        Launching in
      </p>
      <div className="flex gap-3">
        {units.map((u) => (
          <div key={u.label} className="text-center">
            <div className="bg-[#080808]/60 backdrop-blur-sm border border-white/10 px-4 py-2.5 min-w-[65px]">
              <span className="text-xl md:text-2xl font-mono text-[#F5F0EB]">
                {String(u.v).padStart(2, "0")}
              </span>
            </div>
            <p className="text-[10px] tracking-wider uppercase text-[#6B6460] mt-1">
              {u.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideThree({ products }: { products: NewProduct[] }) {
  const show = products.slice(0, 4);

  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/40 via-[#080808]/20 to-[#080808]/90 z-10" />
      <div className="relative z-20 h-full flex flex-col justify-center px-8 lg:px-16">
        <p className="text-xs tracking-[0.3em] uppercase text-[#C9956C] mb-4 font-[family-name:var(--font-geist-sans)]">
          Just Arrived
        </p>
        <h2 className="font-[family-name:var(--font-heading)] text-4xl md:text-6xl lg:text-7xl font-light text-[#F5F0EB] leading-tight mb-10">
          New <span className="italic text-[#C9956C]">In</span>
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-5xl">
          {show.length > 0
            ? show.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="group relative aspect-[3/4] overflow-hidden bg-[#111111]"
                >
                  {p.primaryImage ? (
                    <img
                      src={p.primaryImage}
                      alt={p.name}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#6B6460] text-xs tracking-wider uppercase">
                      No Image
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#080808]/80 to-transparent">
                    <p className="text-xs text-[#F5F0EB]/80 truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-[#C9956C] font-[family-name:var(--font-heading)]">
                      ${parseFloat(p.basePrice).toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))
            : Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] bg-[#111111] border border-white/5 flex items-center justify-center"
                >
                  <p className="text-xs text-[#6B6460] text-center px-2">
                    New products arriving soon
                  </p>
                </div>
              ))}
        </div>
        <Link
          href="/new-in"
          className="inline-flex mt-8 text-xs tracking-[0.2em] uppercase text-[#C9956C] hover:text-[#F5F0EB] transition-colors"
        >
          View All New Arrivals &rarr;
        </Link>
      </div>
    </>
  );
}

function SlideFour() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080808]/90 z-10" />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=1920&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-l from-[#080808]/60 to-transparent" />
      <div className="relative z-20 h-full flex flex-col justify-center items-end text-right px-8 lg:px-16">
        <p className="text-xs tracking-[0.3em] uppercase text-[#C9956C] mb-4 font-[family-name:var(--font-geist-sans)]">
          The Velour Experience
        </p>
        <h2 className="font-[family-name:var(--font-heading)] text-4xl md:text-6xl lg:text-7xl font-light text-[#F5F0EB] leading-tight mb-6 max-w-2xl">
          Complimentary Shipping
          <br />
          <span className="italic text-[#C9956C]">On Orders Over $500</span>
        </h2>
        <p className="text-sm md:text-base text-[#F5F0EB]/60 max-w-lg mb-8 leading-relaxed">
          Enjoy free worldwide shipping on all orders above $500. 
          Easy returns within 30 days. Personal styling advice included 
          with every purchase.
        </p>
        <div className="flex items-center gap-8 text-xs tracking-wider uppercase text-[#F5F0EB]/40">
          <span>Free Shipping</span>
          <span className="w-px h-4 bg-white/10" />
          <span>30-Day Returns</span>
          <span className="w-px h-4 bg-white/10" />
          <span>Personal Stylist</span>
        </div>
        <Link
          href="/products"
          className="inline-flex mt-10 px-8 py-3.5 border border-[#F5F0EB]/20 text-[#F5F0EB] text-sm tracking-[0.2em] uppercase font-medium hover:bg-[#F5F0EB] hover:text-[#080808] transition-all duration-500"
        >
          Start Shopping
        </Link>
      </div>
    </>
  );
}
