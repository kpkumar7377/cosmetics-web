import AddressesClient from "./AddressesClient";

export default function AddressesPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-serif text-2xl text-ink mb-6">Saved Addresses</h1>
      <AddressesClient />
    </div>
  );
}
