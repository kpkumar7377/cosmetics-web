import { Suspense } from "react";
import SuccessContent from "./SuccessContent";

// useSearchParams() requires a Suspense boundary in Next.js App Router,
// or `next build` fails with a de-opt-to-client-render error.
export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="px-6 py-16 text-center text-sm text-gray-500">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
