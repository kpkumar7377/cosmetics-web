"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiArrowRight,
} from "react-icons/fi";
import { useAuth } from "../../../lib/authContext";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      router.push(redirect);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Invalid credentials. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${
      process.env.NEXT_PUBLIC_GOOGLE_LOGIN_URL
    }?redirect=${encodeURIComponent(redirect)}`;
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white border border-gold/25 rounded-3xl p-8 sm:p-10 shadow-xl shadow-brand/5 relative overflow-hidden">
          {/* Top Brand Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold/30 via-clay to-gold/30" />

          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-[11px] font-semibold tracking-widest uppercase text-clay block mb-1">
              Member Access
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-brand font-normal tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs text-brand/60 mt-2">
              Sign in to manage your beauty orders & wishlists
            </p>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gold/40 bg-ivory/50 text-brand text-xs font-semibold uppercase tracking-wider hover:bg-gold/10 hover:border-gold transition-all duration-200 shadow-2xs"
          >
            <FcGoogle size={18} />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gold/20" />
            </div>
            <span className="relative bg-white px-3 text-[11px] uppercase tracking-widest text-brand/40">
              or with email
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50/80 border border-rose-200/70 flex items-start gap-2.5 text-xs text-rose-800">
              <FiAlertCircle
                size={15}
                className="text-rose-500 shrink-0 mt-0.5"
              />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-[11px] uppercase tracking-wider text-brand/70 font-medium mb-1.5"
              >
                Email Address
              </label>
              <div className="relative flex items-center">
                <FiMail className="absolute left-3.5 text-brand/40" size={16} />
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-ivory/30 border border-gold/30 rounded-xl text-xs sm:text-sm text-brand placeholder:text-brand/35 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="text-[11px] uppercase tracking-wider text-brand/70 font-medium"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-clay hover:underline tracking-wide"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative flex items-center">
                <FiLock className="absolute left-3.5 text-brand/40" size={16} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-ivory/30 border border-gold/30 rounded-xl text-xs sm:text-sm text-brand placeholder:text-brand/35 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 text-brand/40 hover:text-brand transition-colors p-1"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 bg-brand text-ivory text-xs font-semibold uppercase tracking-widest rounded-xl hover:bg-brand/90 hover:shadow-md transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-ivory border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <FiArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Register Prompt */}
          <div className="mt-8 pt-6 border-t border-gold/15 text-center text-xs text-brand/60">
            Don't have an account?{" "}
            <Link
              href={`/register?redirect=${encodeURIComponent(redirect)}`}
              className="text-brand font-semibold hover:text-clay hover:underline transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center text-xs uppercase tracking-widest text-brand/50">
          Loading authentication...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
