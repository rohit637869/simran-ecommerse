import HeroCarousel from "@/components/storefront/HeroCarousel";
import TickerBar from "@/components/storefront/TickerBar";
import EditorialBanner from "@/components/storefront/EditorialBanner";
import CategoriesSection from "@/components/storefront/CategoriesSection";
import TestimonialsSection from "@/components/storefront/TestimonialsSection";
import NewsletterSection from "@/components/storefront/NewsletterSection";
import { getFeaturedProducts, getUpcomingCollections, getNewProducts, getCategoriesList } from "@/lib/storefront-actions";
import ProductCard from "@/components/storefront/ProductCard";

export default async function HomePage() {
  const [products, upcoming, newProducts, allCategories] = await Promise.all([
    getFeaturedProducts(),
    getUpcomingCollections(),
    getNewProducts(4),
    getCategoriesList(),
  ]);

  return (
    <>
      <HeroCarousel
        upcoming={upcoming.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          coverImage: c.coverImage,
          launchDate: c.launchDate,
          brandName: c.brandName,
        }))}
        newProducts={newProducts.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          basePrice: p.basePrice,
          primaryImage: p.primaryImage,
        }))}
      />
      <TickerBar />
      <section className="bg-[#080808] py-20 lg:py-28">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex items-end justify-between mb-14">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-[#C9956C] mb-4">
                Trending Now
              </p>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-light text-[#F5F0EB]">
                Featured <span className="italic text-[#C9956C]">Pieces</span>
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>
      <EditorialBanner />
      <CategoriesSection categories={allCategories} />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  );
}
