export default function ContactPage() {
  return (
    <div className="px-6 py-8 prose max-w-2xl">
      <h1>Contact Us</h1>

      {/* PLACEHOLDER — replace/expand as needed */}
      <p>We're happy to help with orders, returns, or product questions.</p>
      <ul>
        <li>
          Email:{" "}
          <a href="mailto:support@cosmeticsstore.in">
            support@cosmeticsstore.in
          </a>
        </li>
        <li>Phone: +91 9874569874</li>
        <li>Hours: Mon–Sat, 10am–6pm IST</li>
      </ul>
    </div>
  );
}
