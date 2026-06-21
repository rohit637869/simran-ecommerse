import { getNewProducts } from "@/lib/storefront-actions";
import ProductCard from "@/components/storefront/ProductCard";

export default async function NewInPage() {
  const products = await getNewProducts(20);

  return (
    <div className="bg-[#080808] min-h-screen pt-28 pb-20">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] uppercase text-[#C9956C] mb-4">
            Fresh Arrivals
          </p>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-light text-[#F5F0EB]">
            New <span className="italic text-[#C9956C]">In</span>
          </h1>
          <p className="text-sm text-[#F5F0EB]/60 mt-4 max-w-md mx-auto">
            The latest additions to our collection — curated for the modern
            woman.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#6B6460]">No new arrivals yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
