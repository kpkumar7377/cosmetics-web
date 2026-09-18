import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md bg-white/70 border border-gold/20 rounded-3xl p-8 sm:p-10 shadow-sm animate-pulse space-y-5">
            <div className="w-12 h-12 rounded-full bg-brand/10 mx-auto" />
            <div className="h-6 bg-brand/10 rounded-md w-3/4 mx-auto" />
            <div className="h-3 bg-brand/5 rounded-md w-1/2 mx-auto" />
            <div className="space-y-4 pt-4">
              <div className="h-10 bg-brand/5 rounded-xl" />
              <div className="h-10 bg-brand/5 rounded-xl" />
              <div className="h-11 bg-brand/10 rounded-xl" />
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
