"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Loader2, Package, User, Heart, LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#C9956C]" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#080808] pt-24">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-light text-[#F5F0EB]">
              My Account
            </h1>
            <p className="text-sm text-[#6B6460] mt-1">
              {session.user.email}
            </p>
          </div>
          <button
            onClick={async () => {
              await authClient.signOut();
              router.push("/");
              router.refresh();
            }}
            className="flex items-center gap-2 text-sm text-[#6B6460] hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        <div className="flex gap-2 mb-10 border-b border-white/5 pb-0 overflow-x-auto scrollbar-hide">
          <Link
            href="/dashboard"
            className="pb-4 px-1 text-xs tracking-[0.15em] uppercase border-b-2 border-transparent text-[#6B6460] hover:text-[#F5F0EB] transition-colors data-[active=true]:border-[#C9956C] data-[active=true]:text-[#C9956C]"
          >
            <Package className="h-3.5 w-3.5 inline mr-1.5" />
            Orders
          </Link>
          <Link
            href="/dashboard"
            className="pb-4 px-1 text-xs tracking-[0.15em] uppercase text-[#6B6460] hover:text-[#F5F0EB] transition-colors"
          >
            <User className="h-3.5 w-3.5 inline mr-1.5" />
            Profile
          </Link>
          <Link
            href="/dashboard"
            className="pb-4 px-1 text-xs tracking-[0.15em] uppercase text-[#6B6460] hover:text-[#F5F0EB] transition-colors"
          >
            <Heart className="h-3.5 w-3.5 inline mr-1.5" />
            Wishlist
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}
