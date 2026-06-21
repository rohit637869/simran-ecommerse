"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useCart } from "@/context/CartContext";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  LogOut,
  Package,
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/new-in", label: "New In" },
  { href: "/collections", label: "Collections" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const { itemCount } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled
          ? "bg-[#080808]/80 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          <button
            className="lg:hidden text-[#F5F0EB]"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm tracking-widest uppercase transition-colors duration-300 ${
                  isActive(pathname, link.href)
                    ? "text-[#C9956C]"
                    : "text-[#F5F0EB]/70 hover:text-[#F5F0EB]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <span className="font-[family-name:var(--font-heading)] text-2xl tracking-[0.3em] text-[#F5F0EB] font-light">
              VELOUR
            </span>
          </Link>

          <div className="flex items-center gap-5">
            <button className="text-[#F5F0EB]/70 hover:text-[#F5F0EB] transition-colors hidden sm:block">
              <Search className="h-4 w-4" />
            </button>
            <Link
              href={session ? "/dashboard" : "/login"}
              className="text-[#F5F0EB]/70 hover:text-[#F5F0EB] transition-colors"
            >
              <User className="h-4 w-4" />
            </Link>
            <Link
              href="/cart"
              className="text-[#F5F0EB]/70 hover:text-[#F5F0EB] transition-colors relative"
            >
              <ShoppingBag className="h-4 w-4" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 h-3.5 w-3.5 flex items-center justify-center rounded-full bg-[#C9956C] text-[8px] font-medium text-[#080808]">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-0 right-0 h-full w-72 bg-[#111111] border-l border-white/5 p-8">
            <button
              className="absolute top-6 right-6 text-[#F5F0EB]"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mt-12 flex flex-col gap-6">
              <span className="font-[family-name:var(--font-heading)] text-xl tracking-[0.3em] text-[#F5F0EB] font-light">
                VELOUR
              </span>
              <nav className="flex flex-col gap-4 mt-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm tracking-widest uppercase transition-colors ${
                      isActive(pathname, link.href)
                        ? "text-[#C9956C]"
                        : "text-[#F5F0EB]/70 hover:text-[#F5F0EB]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="border-t border-white/5 pt-6 mt-6 flex flex-col gap-4">
                {session ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 text-sm text-[#F5F0EB]/70 hover:text-[#F5F0EB]"
                    >
                      <Package className="h-4 w-4" />
                      My Orders
                    </Link>
                    <button
                      onClick={async () => {
                        await authClient.signOut();
                        window.location.href = "/";
                      }}
                      className="flex items-center gap-3 text-sm text-[#F5F0EB]/70 hover:text-[#F5F0EB]"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="text-sm tracking-widest uppercase text-[#C9956C]"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
