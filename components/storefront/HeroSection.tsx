import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-[#080808]">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080808]/80 z-10" />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1618255941102-4f22f8f4e4b6?w=1920&q=80')",
          animation: "slowZoom 20s ease infinite",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/40 via-transparent to-[#080808]/40" />
      <div className="relative z-20 text-center max-w-3xl mx-auto px-6">
        <p className="text-xs tracking-[0.3em] uppercase text-[#C9956C] mb-6 font-[family-name:var(--font-geist-sans)]">
          Autumn Winter 2026
        </p>
        <h1 className="font-[family-name:var(--font-heading)] text-5xl md:text-7xl lg:text-8xl font-light text-[#F5F0EB] leading-tight mb-8">
          Timeless
          <br />
          <span className="italic">Elegance</span>
        </h1>
        <p className="text-base md:text-lg text-[#F5F0EB]/60 max-w-xl mx-auto mb-10 leading-relaxed font-light">
          Discover our latest collection &mdash; where heritage craftsmanship meets
          contemporary design.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/products"
            className="group relative inline-flex items-center gap-2 px-8 py-3.5 bg-[#F5F0EB] text-[#080808] text-sm tracking-[0.2em] uppercase overflow-hidden transition-all duration-500 hover:bg-[#C9956C]"
          >
            <span className="relative z-10 font-medium">Explore Collection</span>
          </Link>
          <Link
            href="/products?category=new-in"
            className="group relative inline-flex items-center gap-2 px-8 py-3.5 border border-[#F5F0EB]/20 text-[#F5F0EB] text-sm tracking-[0.2em] uppercase overflow-hidden transition-all duration-500 hover:border-[#C9956C] hover:text-[#C9956C]"
          >
            <span className="relative z-10 font-medium">New Arrivals</span>
          </Link>
        </div>
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        <span className="text-xs tracking-[0.2em] text-[#F5F0EB]/30 uppercase">
          Scroll
        </span>
        <div
          className="w-[1px] h-12 bg-gradient-to-b from-[#F5F0EB]/30 to-transparent"
          style={{ animation: "scrollPulse 2s ease infinite" }}
        />
      </div>
      <style>{`
        @keyframes slowZoom {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.3; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(1.2); }
        }
      `}</style>
    </section>
  );
}
