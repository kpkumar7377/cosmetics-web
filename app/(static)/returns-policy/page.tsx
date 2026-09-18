export default function ReturnsPolicyPage() {
  return (
    <div className="px-6 py-8 prose max-w-2xl">
      <h1>Returns &amp; Exchanges</h1>

      {/* PLACEHOLDER — replace with real returns policy copy */}
      <p>
        We accept returns on unopened, sealed products within {process.env.NEXT_PUBLIC_RETURN_WINDOW_DAYS || 10} days of
        delivery.
      </p>
      <p>
        Add your exact eligibility conditions, refund timelines, and how to
        initiate a return here.
      </p>
    </div>
  );
}
