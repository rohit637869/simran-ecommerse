const testimonials = [
  {
    quote:
      "The quality and craftsmanship of VELOUR pieces are unmatched. Every garment feels like it was made just for me.",
    author: "Sophie Laurent",
    title: "Fashion Editor, Vogue Paris",
  },
  {
    quote:
      "I've never experienced such attention to detail. The fabric, the fit, the finishing — absolute perfection.",
    author: "Amira Hassan",
    title: "Style Director, Harper's Bazaar",
  },
  {
    quote:
      "VELOUR has redefined what luxury means for the modern woman. It's elegant, sustainable, and timeless.",
    author: "Clara Bennett",
    title: "Founder, The Wardrobe Edit",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-[#111111] py-20 lg:py-28">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] uppercase text-[#C9956C] mb-4">
            Testimonials
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-light text-[#F5F0EB]">
            What Our Clients{" "}
            <span className="italic text-[#C9956C]">Say</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.author}
              className="relative p-8 bg-[#080808] border border-white/5 group hover:border-[#C9956C]/30 transition-all duration-500"
            >
              <span className="text-6xl font-[family-name:var(--font-heading)] text-[#C9956C]/20 absolute top-4 left-6 leading-none">
                &ldquo;
              </span>
              <div className="relative z-10">
                <p className="text-sm text-[#F5F0EB]/70 leading-relaxed mb-8 italic">
                  {t.quote}
                </p>
                <div className="border-t border-white/5 pt-4">
                  <p className="text-sm font-medium text-[#F5F0EB]">
                    {t.author}
                  </p>
                  <p className="text-xs text-[#6B6460] mt-1">{t.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
