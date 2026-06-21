import Link from "next/link";

interface CategoryItem {
  name: string;
  slug: string;
  imageUrl: string | null;
}

export default function CategoriesSection({
  categories,
}: {
  categories: CategoryItem[];
}) {
  if (categories.length === 0) return null;

  return (
    <section className="bg-[#080808] py-20 lg:py-28">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] uppercase text-[#C9956C] mb-4">
            Categories
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-light text-[#F5F0EB]">
            Explore by{" "}
            <span className="italic text-[#C9956C]">Category</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="group relative aspect-[3/4] overflow-hidden bg-[#111111]"
            >
              <img
                src={cat.imageUrl || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80"}
                alt={cat.name}
                className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-all duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-[family-name:var(--font-heading)] text-xl md:text-2xl font-light text-[#F5F0EB] group-hover:text-[#C9956C] transition-colors">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
