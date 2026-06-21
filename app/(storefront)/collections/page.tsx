import Link from "next/link";
import {
  getAllCollections,
  getUpcomingCollections,
} from "@/lib/storefront-actions";
import UpcomingCollectionTimer from "@/components/storefront/UpcomingCollectionTimer";

export default async function CollectionsPage() {
  const [allCollections, upcoming] = await Promise.all([
    getAllCollections(),
    getUpcomingCollections(),
  ]);

  const futureCollections = upcoming.filter(
    (c) => c.launchDate && new Date(c.launchDate) > new Date()
  );

  return (
    <div className="bg-[#080808] min-h-screen pt-28 pb-20">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] uppercase text-[#C9956C] mb-4">
            Curated Curation
          </p>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-light text-[#F5F0EB]">
            Our <span className="italic text-[#C9956C]">Collections</span>
          </h1>
        </div>

        {futureCollections.length > 0 && (
          <section className="mb-20">
            <div className="relative overflow-hidden bg-[#111111] border border-white/5">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30"
                style={{
                  backgroundImage: `url(${futureCollections[0].coverImage || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1400&q=80"})`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/80 via-[#080808]/60 to-transparent" />
              <div className="relative z-10 px-8 lg:px-16 py-16 lg:py-24 max-w-2xl">
                <p className="text-xs tracking-[0.3em] uppercase text-[#C9956C] mb-3">
                  Upcoming Collection
                </p>
                <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl font-light text-[#F5F0EB] mb-4">
                  {futureCollections[0].name}
                </h2>
                {futureCollections[0].description && (
                  <p className="text-sm text-[#F5F0EB]/60 leading-relaxed mb-8 max-w-lg">
                    {futureCollections[0].description}
                  </p>
                )}
                {futureCollections[0].brandName && (
                  <p className="text-xs tracking-[0.2em] uppercase text-[#F5F0EB]/40 mb-6">
                    By {futureCollections[0].brandName}
                  </p>
                )}
                <UpcomingCollectionTimer
                  launchDate={futureCollections[0].launchDate!}
                />
                {futureCollections.length > 1 && (
                  <p className="text-xs text-[#6B6460] mt-4">
                    + {futureCollections.length - 1} more upcoming collection
                   {futureCollections.length > 2 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
            {futureCollections.length > 1 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {futureCollections.slice(1).map((col) => (
                  <div
                    key={col.id}
                    className="relative overflow-hidden bg-[#111111] border border-white/5 p-6 group hover:border-[#C9956C]/30 transition-colors"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity"
                      style={{
                        backgroundImage: `url(${col.coverImage || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80"})`,
                      }}
                    />
                    <div className="relative z-10">
                      <h3 className="font-[family-name:var(--font-heading)] text-xl font-light text-[#F5F0EB] group-hover:text-[#C9956C] transition-colors">
                        {col.name}
                      </h3>
                      {col.brandName && (
                        <p className="text-xs tracking-wider uppercase text-[#6B6460] mt-1">
                          {col.brandName}
                        </p>
                      )}
                      <UpcomingCollectionTimer
                        launchDate={col.launchDate!}
                        small
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <div className="space-y-16">
          {allCollections.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#6B6460]">No collections yet.</p>
            </div>
          ) : (
            allCollections.map((col, i) => (
              <section key={col.id}>
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <h2 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl font-light text-[#F5F0EB] group-hover:text-[#C9956C]">
                      {col.name}
                    </h2>
                    {col.brandName && (
                      <p className="text-xs tracking-[0.2em] uppercase text-[#6B6460] mt-1">
                        {col.brandName}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/products?collection=${col.slug}`}
                    className="text-xs tracking-[0.2em] uppercase text-[#C9956C] hover:text-[#F5F0EB] transition-colors"
                  >
                    View All ({col.productCount})
                  </Link>
                </div>

                {i % 2 === 0 ? (
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#111111]">
                      {col.coverImage ? (
                        <img
                          src={col.coverImage}
                          alt={col.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#6B6460] text-xs tracking-wider uppercase">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center">
                      {col.description && (
                        <p className="text-sm text-[#F5F0EB]/60 leading-relaxed mb-6">
                          {col.description}
                        </p>
                      )}
                      {col.launchDate && (
                        <p className="text-xs text-[#6B6460] mb-4">
                          Launch:{new Date(col.launchDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      )}
                      <div className="flex gap-3">
                        <Link
                          href={`/products?collection=${col.slug}`}
                          className="inline-flex py-3 px-6 bg-[#F5F0EB] text-[#080808] text-xs tracking-[0.15em] uppercase font-medium hover:bg-[#C9956C] transition-colors"
                        >
                          Explore Collection
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div className="flex flex-col justify-center lg:order-1">
                      {col.description && (
                        <p className="text-sm text-[#F5F0EB]/60 leading-relaxed mb-6">
                          {col.description}
                        </p>
                      )}
                      {col.launchDate && (
                        <p className="text-xs text-[#6B6460] mb-4">
                          Launch: {new Date(col.launchDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      )}
                      <div className="flex gap-3">
                        <Link
                          href={`/products?collection=${col.slug}`}
                          className="inline-flex py-3 px-6 bg-[#F5F0EB] text-[#080808] text-xs tracking-[0.15em] uppercase font-medium hover:bg-[#C9956C] transition-colors"
                        >
                          Explore Collection
                        </Link>
                      </div>
                    </div>
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#111111] lg:order-2">
                      {col.coverImage ? (
                        <img
                          src={col.coverImage}
                          alt={col.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#6B6460] text-xs tracking-wider uppercase">
                          No Image
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
