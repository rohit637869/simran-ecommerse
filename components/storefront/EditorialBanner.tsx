import Link from "next/link";

export default function EditorialBanner() {
  return (
    <section className="relative overflow-hidden bg-[#080808]">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid lg:grid-cols-2 min-h-[600px]">
          <div className="relative h-[400px] lg:h-auto overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&q=80"
              alt="Editorial"
              className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-1000"
            />
          </div>
          <div className="flex items-center justify-center px-8 lg:px-16 py-16 lg:py-0">
            <div className="max-w-md">
              <p className="text-xs tracking-[0.3em] uppercase text-[#C9956C] mb-4">
                Editorial
              </p>
              <h2 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-light text-[#F5F0EB] leading-tight mb-6">
                The Art of
                <br />
                <span className="italic">Modern Luxury</span>
              </h2>
              <p className="text-sm text-[#F5F0EB]/60 leading-relaxed mb-8">
                Each piece in our collection is a testament to enduring design —
                where meticulous tailoring meets luxurious fabrics, creating
                silhouettes that transcend seasons.
              </p>
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 text-sm tracking-[0.2em] uppercase text-[#C9956C] hover:text-[#F5F0EB] transition-colors"
              >
                Discover the Collection
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
