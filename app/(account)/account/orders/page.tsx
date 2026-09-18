import OrdersClient from "./OrdersClient";

export default function OrderHistoryPage() {
  return (
    <div className="px-6 py-8 max-w-2xl">
      <h1 className="text-xl font-semibold mb-4">My Orders</h1>
      <OrdersClient />
    </div>
  );
}
