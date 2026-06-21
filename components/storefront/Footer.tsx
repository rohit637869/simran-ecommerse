import Link from "next/link";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "New Arrivals", href: "/products?category=new-in" },
      { label: "Ready to Wear", href: "/products?category=ready-to-wear" },
      { label: "Accessories", href: "/products?category=accessories" },
      { label: "Collections", href: "/products?category=collections" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Our Story", href: "#" },
      { label: "Sustainability", href: "#" },
      { label: "Press", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Us", href: "#" },
      { label: "Shipping & Returns", href: "#" },
      { label: "Size Guide", href: "#" },
      { label: "FAQ", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-white/5">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/">
              <span className="font-[family-name:var(--font-heading)] text-2xl tracking-[0.3em] text-[#F5F0EB] font-light">
                VELOUR
              </span>
            </Link>
            <p className="mt-4 text-sm text-[#6B6460] leading-relaxed max-w-xs">
              Timeless elegance for the modern woman. Curated luxury fashion
              crafted with passion and precision.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs tracking-[0.2em] uppercase text-[#F5F0EB]/50 mb-5">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#F5F0EB]/60 hover:text-[#C9956C] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#6B6460]">
            &copy; {new Date().getFullYear()} VELOUR. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-[#6B6460] tracking-wider">
              Instagram
            </span>
            <span className="text-xs text-[#6B6460] tracking-wider">
              Pinterest
            </span>
            <span className="text-xs text-[#6B6460] tracking-wider">
              Facebook
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
