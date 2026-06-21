"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!name || !email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const { error: authError } = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (authError) {
        setError(authError.message || "Registration failed");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080808] px-4 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/">
            <span className="font-[family-name:var(--font-heading)] text-3xl tracking-[0.3em] text-[#F5F0EB] font-light">
              VELOUR
            </span>
          </Link>
          <p className="text-sm text-[#6B6460] mt-4">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs tracking-[0.15em] uppercase text-[#F5F0EB]/50 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="Jane Doe"
              className="w-full px-4 py-3 bg-[#111111] border border-white/10 text-[#F5F0EB] text-sm placeholder:text-[#6B6460] focus:outline-none focus:border-[#C9956C] transition-colors"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-xs tracking-[0.15em] uppercase text-[#F5F0EB]/50 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-[#111111] border border-white/10 text-[#F5F0EB] text-sm placeholder:text-[#6B6460] focus:outline-none focus:border-[#C9956C] transition-colors"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-xs tracking-[0.15em] uppercase text-[#F5F0EB]/50 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Min. 8 characters"
                className="w-full px-4 py-3 pr-12 bg-[#111111] border border-white/10 text-[#F5F0EB] text-sm placeholder:text-[#6B6460] focus:outline-none focus:border-[#C9956C] transition-colors"
                disabled={loading}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6460] hover:text-[#F5F0EB]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#F5F0EB] text-[#080808] text-sm tracking-[0.15em] uppercase font-medium hover:bg-[#C9956C] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-[#6B6460] mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-[#C9956C] hover:text-[#F5F0EB] transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
