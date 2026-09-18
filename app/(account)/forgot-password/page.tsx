"use client";

import { useState, useId } from "react";
import Link from "next/link";
import {
  FiMail,
  FiArrowRight,
  FiArrowLeft,
  FiCheck,
  FiAlertCircle,
  FiRefreshCw,
  FiKey,
} from "react-icons/fi";
import api from "../../../lib/api";

export default function ForgotPasswordPage() {
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Unable to process request. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Main Card Container */}
        <div className="bg-white border border-gold/25 rounded-3xl p-8 sm:p-10 shadow-xl shadow-brand/5 relative overflow-hidden">
          {/* Subtle Top Gold Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold/30 via-clay to-gold/30" />

          {sent ? (
            /* Email Dispatched State */
            <div className="text-center">
              <div className="relative mx-auto mb-6 w-16 h-16 flex items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-emerald-100/60 animate-ping opacity-30" />
                <div className="relative w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shadow-inner">
                  <FiCheck className="w-8 h-8 stroke-[2.5]" />
                </div>
              </div>

              <span className="text-[11px] font-semibold tracking-widest uppercase text-clay block mb-1">
                Instructions Dispatched
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl text-brand font-normal tracking-tight mb-2">
                Check Your Inbox
              </h1>
              <p className="text-xs text-brand/70 leading-relaxed mb-6">
                If an account exists for{" "}
                <span className="font-medium text-brand">{email}</span>, you
                will receive a link to reset your password shortly.
              </p>

              <div className="p-4 rounded-xl bg-ivory/60 border border-gold/20 text-left text-xs text-brand/70 space-y-1.5 mb-6">
                <p className="font-medium text-brand">
                  Didn’t receive an email?
                </p>
                <p className="text-[11px] leading-relaxed">
                  Be sure to check your spam/promotions folder or verify the
                  entered email address.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-ivory border border-gold/30 text-brand text-xs font-semibold uppercase tracking-widest rounded-xl hover:bg-gold/10 transition-colors"
                >
                  <FiRefreshCw size={13} />
                  <span>Try another email</span>
                </button>

                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold uppercase tracking-widest text-brand/60 hover:text-brand transition-colors"
                >
                  <FiArrowLeft size={14} />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Input Form State */
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-12 h-12 mx-auto rounded-full bg-gold/10 text-brand flex items-center justify-center mb-3">
                  <FiKey size={20} className="text-clay" />
                </div>
                <span className="text-[11px] font-semibold tracking-widest uppercase text-clay block mb-1">
                  Account Recovery
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl text-brand font-normal tracking-tight">
                  Forgot Password?
                </h1>
                <p className="text-xs text-brand/60 mt-2">
                  Enter your registered email address and we'll send you
                  recovery instructions.
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

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor={emailId}
                    className="block text-[11px] uppercase tracking-wider text-brand/70 font-medium mb-1.5"
                  >
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <FiMail
                      className="absolute left-3.5 text-brand/40"
                      size={16}
                    />
                    <input
                      id={emailId}
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 bg-ivory/30 border border-gold/30 rounded-xl text-xs sm:text-sm text-brand placeholder:text-brand/35 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 bg-brand text-ivory text-xs font-semibold uppercase tracking-widest rounded-xl hover:bg-brand/90 hover:shadow-md transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-ivory border-t-transparent rounded-full animate-spin" />
                      <span>Sending Instructions...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <FiArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              {/* Navigation Back */}
              <div className="mt-8 pt-6 border-t border-gold/15 text-center text-xs text-brand/60">
                Remember your credentials?{" "}
                <Link
                  href="/login"
                  className="text-brand font-semibold hover:text-clay hover:underline transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
