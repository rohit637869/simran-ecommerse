"use client";

export default function NewsletterSection() {
  return (
    <section className="bg-[#080808] py-20 lg:py-28 border-t border-white/5">
      <div className="max-w-[600px] mx-auto px-6 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-[#C9956C] mb-4">
          Stay Connected
        </p>
        <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-light text-[#F5F0EB] mb-4">
          Join the{" "}
          <span className="italic text-[#C9956C]">Velour Edit</span>
        </h2>
        <p className="text-sm text-[#F5F0EB]/60 leading-relaxed mb-8 max-w-md mx-auto">
          Be the first to receive exclusive previews, private collection
          access, and personalized styling advice.
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-5 py-3.5 bg-[#111111] border border-white/10 text-[#F5F0EB] text-sm placeholder:text-[#6B6460] focus:outline-none focus:border-[#C9956C] transition-colors"
          />
          <button
            type="submit"
            className="px-8 py-3.5 bg-[#F5F0EB] text-[#080808] text-sm tracking-[0.15em] uppercase font-medium hover:bg-[#C9956C] transition-colors"
          >
            Subscribe
          </button>
        </form>
        <p className="text-xs text-[#6B6460] mt-4">
          By subscribing, you agree to our Privacy Policy.
        </p>
      </div>
    </section>
  );
}
