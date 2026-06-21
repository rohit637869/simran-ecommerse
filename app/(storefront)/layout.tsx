import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { CartProvider } from "@/context/CartContext";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F0EB] font-[family-name:var(--font-geist-sans)]">
      <CartProvider>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </CartProvider>
    </div>
  );
}
