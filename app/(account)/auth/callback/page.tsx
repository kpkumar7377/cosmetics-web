import { Suspense } from "react";
import CallbackContent from "./CallbackContent";

// Landing page for the Google OAuth redirect:
// server redirects here as /auth/callback?token=<jwt>
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<p className="px-6 py-12 text-sm text-gray-500">Signing you in…</p>}>
      <CallbackContent />
    </Suspense>
  );
}
