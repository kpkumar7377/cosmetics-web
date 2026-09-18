"use client";

import { Suspense, useState, useId } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiArrowRight,
  FiCheck,
} from "react-icons/fi";
import { useAuth } from "../../../lib/authContext";

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Simple client-side strength checks
  const hasMinLength = form.password.length >= 8;
  const hasNumberOrSpecial = /[0-9!@#$%^&*]/.test(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!hasMinLength) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password);
      router.push(redirect);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Main Card Container */}
        <div className="bg-white border border-gold/25 rounded-3xl p-8 sm:p-10 shadow-xl shadow-brand/5 relative overflow-hidden">
          {/* Subtle Top Gold Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold/30 via-clay to-gold/30" />

          {/* Heading */}
          <div className="text-center mb-8">
            <span className="text-[11px] font-semibold tracking-widest uppercase text-clay block mb-1">
              Join the Society
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-brand font-normal tracking-tight">
              Create an Account
            </h1>
            <p className="text-xs text-brand/60 mt-2">
              Enjoy tailored skincare recommendations & fast checkout
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50/80 border border-rose-200/70 flex items-start gap-2.5 text-xs text-rose-800">
              <FiAlertCircle
                size={15}
                className="text-rose-500 shrink-0 mt-0.5"
              />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor={nameId}
                className="block text-[11px] uppercase tracking-wider text-brand/70 font-medium mb-1.5"
              >
                Full Name
              </label>
              <div className="relative flex items-center">
                <FiUser className="absolute left-3.5 text-brand/40" size={16} />
                <input
                  id={nameId}
                  type="text"
                  placeholder="e.g. Ananya Rao"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-ivory/30 border border-gold/30 rounded-xl text-xs sm:text-sm text-brand placeholder:text-brand/35 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor={emailId}
                className="block text-[11px] uppercase tracking-wider text-brand/70 font-medium mb-1.5"
              >
                Email Address
              </label>
              <div className="relative flex items-center">
                <FiMail className="absolute left-3.5 text-brand/40" size={16} />
                <input
                  id={emailId}
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-ivory/30 border border-gold/30 rounded-xl text-xs sm:text-sm text-brand placeholder:text-brand/35 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor={passwordId}
                className="block text-[11px] uppercase tracking-wider text-brand/70 font-medium mb-1.5"
              >
                Create Password
              </label>
              <div className="relative flex items-center">
                <FiLock className="absolute left-3.5 text-brand/40" size={16} />
                <input
                  id={passwordId}
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
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

              {/* Password Helper Micro-Indicators */}
              {form.password.length > 0 && (
                <div className="mt-2 space-y-1 pl-1">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <FiCheck
                      size={12}
                      className={
                        hasMinLength ? "text-emerald-600" : "text-brand/30"
                      }
                    />
                    <span
                      className={
                        hasMinLength ? "text-emerald-700" : "text-brand/50"
                      }
                    >
                      Minimum 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <FiCheck
                      size={12}
                      className={
                        hasNumberOrSpecial
                          ? "text-emerald-600"
                          : "text-brand/30"
                      }
                    />
                    <span
                      className={
                        hasNumberOrSpecial
                          ? "text-emerald-700"
                          : "text-brand/50"
                      }
                    >
                      Includes a number or special character
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Terms of Service Acceptance Notice */}
            <p className="text-[11px] text-brand/60 leading-relaxed pt-1">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-clay">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                className="underline hover:text-clay"
              >
                Privacy Policy
              </Link>
              .
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 bg-brand text-ivory text-xs font-semibold uppercase tracking-widest rounded-xl hover:bg-brand/90 hover:shadow-md transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-ivory border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <FiArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Login Redirection */}
          <div className="mt-8 pt-6 border-t border-gold/15 text-center text-xs text-brand/60">
            Already have an account?{" "}
            <Link
              href={`/login?redirect=${encodeURIComponent(redirect)}`}
              className="text-brand font-semibold hover:text-clay hover:underline transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center text-xs uppercase tracking-widest text-brand/50">
          Loading registration...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
