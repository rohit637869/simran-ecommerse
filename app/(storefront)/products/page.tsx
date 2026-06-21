import {
  getStoreProducts,
  getCategoriesList,
  getAllBrands,
  getAllCollections,
} from "@/lib/storefront-actions";
import ProductCard from "@/components/storefront/ProductCard";
import Link from "next/link";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    category?: string;
    collection?: string;
    brand?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const search = params.search;
  const category = params.category;
  const collection = params.collection;
  const brand = params.brand;
  const page = parseInt(params.page || "1");

  const [data, categories, brands, collections] = await Promise.all([
    getStoreProducts(search, category, collection, brand, page),
    getCategoriesList(),
    getAllBrands(),
    getAllCollections(),
  ]);

  return (
    <div className="bg-[#080808] min-h-screen pt-28 pb-20">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-[#C9956C] mb-4">
            The Edit
          </p>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-light text-[#F5F0EB]">
            Shop <span className="italic text-[#C9956C]">All</span>
          </h1>
        </div>

        {brands.length > 0 && (
          <div className="mb-12">
            <p className="text-xs tracking-[0.2em] uppercase text-[#F5F0EB]/40 mb-5 text-center">
              Brands
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {brands.map((b) => (
                <Link
                  key={b.id}
                  href={`/products?brand=${b.slug}`}
                  className={`group flex flex-col items-center gap-2 transition-all duration-300 ${
                    brand === b.slug ? "opacity-100" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <div
                    className={`w-16 h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden border-2 flex items-center justify-center transition-colors ${
                      brand === b.slug
                        ? "border-[#C9956C] bg-[#C9956C]/10"
                        : "border-white/10 bg-[#111111] group-hover:border-[#C9956C]/50"
                    }`}
                  >
                    {b.logoUrl ? (
                      <img
                        src={b.logoUrl}
                        alt={b.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs tracking-wider uppercase text-[#F5F0EB]/60 font-[family-name:var(--font-heading)]">
                        {b.name.slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] tracking-wider uppercase ${
                      brand === b.slug
                        ? "text-[#C9956C]"
                        : "text-[#6B6460] group-hover:text-[#F5F0EB]/70"
                    }`}
                  >
                    {b.name}
                  </span>
                </Link>
              ))}
              {brand && (
                <Link
                  href="/products"
                  className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full border-2 border-white/10 bg-[#111111] flex items-center justify-center group-hover:border-[#C9956C]/50">
                    <span className="text-lg text-[#F5F0EB]/60">×</span>
                  </div>
                  <span className="text-[10px] tracking-wider uppercase text-[#6B6460]">
                    Clear
                  </span>
                </Link>
              )}
            </div>
          </div>
        )}

        {collections.length > 0 && (
          <div className="mb-12">
            <p className="text-xs tracking-[0.2em] uppercase text-[#F5F0EB]/40 mb-5 text-center">
              Collections
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {collections.map((c) => (
                <Link
                  key={c.id}
                  href={`/products?collection=${c.slug}`}
                  className={`group flex flex-col items-center gap-2 transition-all duration-300 ${
                    collection === c.slug
                      ? "opacity-100"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <div
                    className={`w-16 h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden border-2 flex items-center justify-center transition-colors ${
                      collection === c.slug
                        ? "border-[#C9956C] bg-[#C9956C]/10"
                        : "border-white/10 bg-[#111111] group-hover:border-[#C9956C]/50"
                    }`}
                  >
                    {c.coverImage ? (
                      <img
                        src={c.coverImage}
                        alt={c.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] tracking-wider uppercase text-[#F5F0EB]/60 font-[family-name:var(--font-heading)] text-center leading-tight px-1">
                        {c.name.slice(0, 10)}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] tracking-wider uppercase ${
                      collection === c.slug
                        ? "text-[#C9956C]"
                        : "text-[#6B6460] group-hover:text-[#F5F0EB]/70"
                    }`}
                  >
                    {c.name}
                  </span>
                </Link>
              ))}
              {collection && (
                <Link
                  href="/products"
                  className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full border-2 border-white/10 bg-[#111111] flex items-center justify-center">
                    <span className="text-lg text-[#F5F0EB]/60">×</span>
                  </div>
                  <span className="text-[10px] tracking-wider uppercase text-[#6B6460]">
                    Clear
                  </span>
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <Link
            href="/products"
            className={`px-5 py-2 text-xs tracking-[0.15em] uppercase border transition-colors ${
              !category && !collection && !brand
                ? "bg-[#F5F0EB] text-[#080808] border-[#F5F0EB]"
                : "border-white/10 text-[#F5F0EB]/60 hover:border-[#C9956C] hover:text-[#C9956C]"
            }`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}${collection ? `&collection=${collection}` : ""}${brand ? `&brand=${brand}` : ""}`}
              className={`px-5 py-2 text-xs tracking-[0.15em] uppercase border transition-colors ${
                category === cat.slug
                  ? "bg-[#F5F0EB] text-[#080808] border-[#F5F0EB]"
                  : "border-white/10 text-[#F5F0EB]/60 hover:border-[#C9956C] hover:text-[#C9956C]"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {data.products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#6B6460]">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {data.products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}

        {data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-16">
            {page > 1 && (
              <Link
                href={`/products?page=${page - 1}${category ? `&category=${category}` : ""}${collection ? `&collection=${collection}` : ""}${brand ? `&brand=${brand}` : ""}`}
                className="px-6 py-2.5 border border-white/10 text-xs tracking-[0.15em] uppercase text-[#F5F0EB]/60 hover:border-[#C9956C] hover:text-[#C9956C] transition-colors"
              >
                Previous
              </Link>
            )}
            <span className="text-xs text-[#6B6460]">
              Page {page} of {data.totalPages}
            </span>
            {page < data.totalPages && (
              <Link
                href={`/products?page=${page + 1}${category ? `&category=${category}` : ""}${collection ? `&collection=${collection}` : ""}${brand ? `&brand=${brand}` : ""}`}
                className="px-6 py-2.5 border border-white/10 text-xs tracking-[0.15em] uppercase text-[#F5F0EB]/60 hover:border-[#C9956C] hover:text-[#C9956C] transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
