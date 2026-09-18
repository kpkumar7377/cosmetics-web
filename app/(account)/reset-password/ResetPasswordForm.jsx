"use client";

import { useState, useId, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiAlertCircle,
  FiArrowRight,
  FiKey,
} from "react-icons/fi";
import api from "../../../lib/api";

export default function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");

  const passwordId = useId();
  const confirmPasswordId = useId();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Requirements checks
  const hasMinLength = newPassword.length >= 8;
  const hasNumberOrSymbol = /[0-9!@#$%^&*]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Auto redirect after successful reset
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  // Missing or expired token fallback
  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-gold/25 rounded-3xl p-8 sm:p-10 shadow-xl shadow-brand/5 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center mb-4">
            <FiAlertCircle size={26} />
          </div>
          <h2 className="font-serif text-2xl text-brand mb-2">Invalid or Missing Link</h2>
          <p className="text-xs text-brand/60 leading-relaxed mb-6">
            This password recovery link is missing its security token or has already expired. Please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-brand text-ivory text-xs font-semibold uppercase tracking-widest rounded-xl hover:bg-brand/90 transition-all shadow-xs"
          >
            <span>Request New Reset Link</span>
            <FiArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  // Success view
  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-gold/25 rounded-3xl p-8 sm:p-10 shadow-xl shadow-brand/5 text-center">
          <div className="relative mx-auto mb-6 w-16 h-16 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-emerald-100/60 animate-ping opacity-30" />
            <div className="relative w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shadow-inner">
              <FiCheck className="w-8 h-8 stroke-[2.5]" />
            </div>
          </div>
          <span className="text-[11px] font-semibold tracking-widest uppercase text-clay block mb-1">
            Credentials Updated
          </span>
          <h1 className="font-serif text-2xl text-brand font-normal mb-2">
            Password Changed!
          </h1>
          <p className="text-xs text-brand/60 leading-relaxed mb-6">
            Your new password has been saved. Redirecting you to the sign-in screen in a moment...
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-brand text-ivory text-xs font-semibold uppercase tracking-widest rounded-xl hover:bg-brand/90 transition-all shadow-xs"
          >
            <span>Sign In Now</span>
            <FiArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!hasMinLength) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword });
      setIsSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update password. The link may have expired."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gold/25 rounded-3xl p-8 sm:p-10 shadow-xl shadow-brand/5 relative overflow-hidden">
          {/* Decorative Gold Border Gradient */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold/30 via-clay to-gold/30" />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 mx-auto rounded-full bg-gold/10 text-brand flex items-center justify-center mb-3">
              <FiKey size={20} className="text-clay" />
            </div>
            <span className="text-[11px] font-semibold tracking-widest uppercase text-clay block mb-1">
              Account Security
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-brand font-normal tracking-tight">
              Reset Password
            </h1>
            <p className="text-xs text-brand/60 mt-2">
              Please enter and confirm your new secure password
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50/80 border border-rose-200/70 flex items-start gap-2.5 text-xs text-rose-800">
              <FiAlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password Field */}
            <div>
              <label
                htmlFor={passwordId}
                className="block text-[11px] uppercase tracking-wider text-brand/70 font-medium mb-1.5"
              >
                New Password
              </label>
              <div className="relative flex items-center">
                <FiLock className="absolute left-3.5 text-brand/40" size={16} />
                <input
                  id={passwordId}
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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

              {/* Password Requirements */}
              {newPassword.length > 0 && (
                <div className="mt-2 space-y-1 pl-1">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <FiCheck
                      size={12}
                      className={hasMinLength ? "text-emerald-600" : "text-brand/30"}
                    />
                    <span className={hasMinLength ? "text-emerald-700" : "text-brand/50"}>
                      Minimum 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <FiCheck
                      size={12}
                      className={hasNumberOrSymbol ? "text-emerald-600" : "text-brand/30"}
                    />
                    <span className={hasNumberOrSymbol ? "text-emerald-700" : "text-brand/50"}>
                      Includes a number or special character
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor={confirmPasswordId}
                className="block text-[11px] uppercase tracking-wider text-brand/70 font-medium mb-1.5"
              >
                Confirm New Password
              </label>
              <div className="relative flex items-center">
                <FiLock className="absolute left-3.5 text-brand/40" size={16} />
                <input
                  id={confirmPasswordId}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-ivory/30 border border-gold/30 rounded-xl text-xs sm:text-sm text-brand placeholder:text-brand/35 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 text-brand/40 hover:text-brand transition-colors p-1"
                >
                  {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>

              {confirmPassword.length > 0 && (
                <div className="mt-1.5 pl-1 flex items-center gap-1.5 text-[11px]">
                  <FiCheck
                    size={12}
                    className={passwordsMatch ? "text-emerald-600" : "text-brand/30"}
                  />
                  <span className={passwordsMatch ? "text-emerald-700" : "text-rose-600"}>
                    {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                  </span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !hasMinLength || !passwordsMatch}
              className="w-full mt-3 py-3 px-4 bg-brand text-ivory text-xs font-semibold uppercase tracking-widest rounded-xl hover:bg-brand/90 hover:shadow-md transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-ivory border-t-transparent rounded-full animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Save New Password</span>
                  <FiArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-8 pt-6 border-t border-gold/15 text-center text-xs text-brand/60">
            Remember your credentials?{" "}
            <Link
              href="/login"
              className="text-brand font-semibold hover:text-clay hover:underline transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}