"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  FiArrowLeft,
  FiTruck,
  FiMapPin,
  FiClock,
  FiPackage,
  FiCopy,
  FiCheck,
  FiAlertCircle,
  FiRotateCcw,
  FiUploadCloud,
  FiX,
  FiEdit2,
  FiCreditCard,
} from "react-icons/fi";
import api from "../../../../../lib/api";

// Configurable return window from public env (defaults to 7 days)
const RETURN_WINDOW_DAYS =
  Number(process.env.NEXT_PUBLIC_RETURN_WINDOW_DAYS) || 7;

type OrderStatus =
  | "placed"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "return_requested"
  | "return_approved"
  | "return_rejected"
  | "returned";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
  image?: string;
  shade?: string;
}

interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
}

interface Shipment {
  courierName?: string;
  awbCode?: string;
  trackingStatus?: string;
  trackingUrl?: string;
}

interface BankAccount {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName?: string;
}

interface ReturnRequest {
  reason: string;
  notes?: string;
  photos?: string[];
  bankAccount?: BankAccount;
  shiprocketReturnOrderId?: string;
  reverseAwb?: string;
  requestedAt?: string;
  status: "pending" | "approved" | "rejected" | "completed";
  refund?: {
    amount?: number;
    type?: "full" | "partial";
    referenceId?: string;
    paymentMode?: string;
    refundedAt?: string;
    adminNotes?: string;
  };
}

interface OrderPayment {
  method?: "cod" | "razorpay" | string;
  status?: string;
  razorpayPaymentId?: string;
}

interface OrderDetail {
  _id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
  shippingFee: number;
  deliveryFee?: number;
  codFee?: number;
  discountAmount?: number;
  total: number;
  payment?: OrderPayment;
  shipment?: Shipment;
  shippingAddress: ShippingAddress;
  returnRequest?: ReturnRequest;
}

const ORDER_STEPS: { key: OrderStatus; label: string }[] = [
  { key: "placed", label: "Order Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

const statusStyles: Record<
  OrderStatus,
  { bg: string; dot: string; label: string }
> = {
  placed: {
    bg: "bg-amber-50 text-amber-800 border-amber-200/60",
    dot: "bg-amber-500",
    label: "Placed",
  },
  confirmed: {
    bg: "bg-blue-50 text-blue-800 border-blue-200/60",
    dot: "bg-blue-500",
    label: "Confirmed",
  },
  shipped: {
    bg: "bg-indigo-50 text-indigo-800 border-indigo-200/60",
    dot: "bg-indigo-500",
    label: "In Transit",
  },
  delivered: {
    bg: "bg-emerald-50 text-emerald-800 border-emerald-200/60",
    dot: "bg-emerald-500",
    label: "Delivered",
  },
  cancelled: {
    bg: "bg-rose-50 text-rose-800 border-rose-200/60",
    dot: "bg-rose-500",
    label: "Cancelled",
  },
  return_requested: {
    bg: "bg-orange-50 text-orange-800 border-orange-200/60",
    dot: "bg-orange-500",
    label: "Return Requested",
  },
  return_approved: {
    bg: "bg-cyan-50 text-cyan-800 border-cyan-200/60",
    dot: "bg-cyan-500",
    label: "Return Approved",
  },
  return_rejected: {
    bg: "bg-rose-50 text-rose-800 border-rose-200/60",
    dot: "bg-rose-500",
    label: "Return Rejected",
  },
  returned: {
    bg: "bg-emerald-50 text-emerald-800 border-emerald-200/60",
    dot: "bg-emerald-500",
    label: "Returned & Refunded",
  },
};

const RETURN_REASONS = [
  "Defective or Damaged Product",
  "Wrong Product Delivered",
  "Product Expired / Near Expiry",
  "Packaging Broken / Leaking",
  "Quality Not As Expected",
  "Other",
];

const inputClass =
  "w-full border border-clay/20 rounded-xl px-3.5 py-2.5 text-xs bg-ivory outline-none focus:border-clay transition-colors placeholder:text-ink/35";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = "then" in params ? use(params) : params;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedAWB, setCopiedAWB] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [savedBankAccount, setSavedBankAccount] = useState<BankAccount | null>(
    null,
  );
  const [isEditingAccount, setIsEditingAccount] = useState(false);

  const [returnForm, setReturnForm] = useState({
    reason: RETURN_REASONS[0],
    notes: "",
    photos: [] as string[],
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    saveAccount: true,
  });

  const loadOrder = () => {
    return api
      .get(`/orders/${resolvedParams.id}`)
      .then((res) => setOrder(res.data))
      .catch(() =>
        setError("Unable to load order details. Please check back later."),
      );
  };

  useEffect(() => {
    setLoading(true);
    loadOrder().finally(() => setLoading(false));
  }, [resolvedParams.id]);

  const loadBankAccount = async () => {
    try {
      const { data } = await api.get("/users/bank-account");
      if (data && data.accountNumber) {
        setSavedBankAccount(data);
        setIsEditingAccount(false);
        setReturnForm((prev) => ({
          ...prev,
          accountHolderName: data.accountHolderName,
          accountNumber: data.accountNumber,
          ifscCode: data.ifscCode,
          bankName: data.bankName || "",
        }));
      } else {
        setSavedBankAccount(null);
        setIsEditingAccount(true);
      }
    } catch (e) {
      setSavedBankAccount(null);
      setIsEditingAccount(true);
    }
  };

  const handleOpenReturnModal = () => {
    loadBankAccount();
    setShowReturnModal(true);
  };

  const handleCancelOrder = async () => {
    const reason = prompt("Please provide a reason for cancelling this order:");
    if (reason === null) return;

    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    setCancellingOrder(true);
    try {
      await api.post(`/orders/${resolvedParams.id}/cancel`, { reason });
      alert("Your order has been cancelled successfully.");
      await loadOrder();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to cancel this order.");
    } finally {
      setCancellingOrder(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);

    setUploadingPhoto(true);
    try {
      const { data } = await api.post("/uploads", formData);
      setReturnForm((prev) => ({
        ...prev,
        photos: [...prev.photos, data.url],
      }));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleRemovePhoto = (index: number) => {
    setReturnForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReturn(true);
    try {
      await api.post(`/orders/${resolvedParams.id}/return-request`, {
        reason: returnForm.reason,
        notes: returnForm.notes,
        photos: returnForm.photos,
        bankAccount: {
          accountHolderName: returnForm.accountHolderName,
          accountNumber: returnForm.accountNumber,
          ifscCode: returnForm.ifscCode,
          bankName: returnForm.bankName,
        },
        saveAccount: returnForm.saveAccount,
      });
      setShowReturnModal(false);
      await loadOrder();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit return request.");
    } finally {
      setSubmittingReturn(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAWB(true);
    setTimeout(() => setCopiedAWB(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6 animate-pulse">
        <div className="h-4 w-32 bg-brand/10 rounded" />
        <div className="h-8 w-64 bg-brand/10 rounded" />
        <div className="h-40 bg-white border border-gold/15 rounded-2xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
        <FiAlertCircle className="mx-auto text-rose-500 mb-3" size={36} />
        <h2 className="font-serif text-xl text-brand mb-2">Order Not Found</h2>
        <p className="text-xs sm:text-sm text-brand/60 mb-6">{error}</p>
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-ivory text-xs uppercase tracking-widest rounded-lg hover:bg-brand/90 transition-colors"
        >
          <FiArrowLeft size={14} /> Back to My Orders
        </Link>
      </div>
    );
  }

  const currentStepIndex = ORDER_STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "cancelled";
  const canCancelOrder = ["placed", "confirmed"].includes(order.status);

  // Calculate elapsed time from order placement
  const orderTime = new Date(order.createdAt).getTime();
  const daysSincePlaced = (Date.now() - orderTime) / (1000 * 60 * 60 * 24);
  const isWithinReturnWindow = daysSincePlaced <= RETURN_WINDOW_DAYS;

  // Enforce return allowed only if delivered AND placed within the return window
  const canRequestReturn = order.status === "delivered" && isWithinReturnWindow;
  const isReturnExpired = order.status === "delivered" && !isWithinReturnWindow;

  const isReturnActive = [
    "return_requested",
    "return_approved",
    "return_rejected",
    "returned",
  ].includes(order.status);

  const subtotal = order.items.reduce(
    (acc, item) => acc + item.price * item.qty,
    0,
  );

  const isCodOrder = order.payment?.method === "cod";
  const totalShippingFee = Number(order.shippingFee || 0);

  const explicitDeliveryFee =
    typeof order.deliveryFee === "number"
      ? order.deliveryFee
      : isCodOrder && totalShippingFee >= 29
        ? totalShippingFee - 29
        : totalShippingFee;

  const explicitCodFee =
    typeof order.codFee === "number"
      ? order.codFee
      : isCodOrder
        ? totalShippingFee - explicitDeliveryFee
        : 0;

  const hasRefundReleased =
    order.status === "returned" &&
    order.returnRequest?.refund &&
    typeof order.returnRequest.refund.amount === "number" &&
    !isNaN(order.returnRequest.refund.amount) &&
    order.returnRequest.refund.amount > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Top Action Header */}
      <div className="mb-4 sm:mb-6 flex flex-col xs:flex-row xs:items-center justify-between gap-3">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand/60 hover:text-clay transition-colors"
        >
          <FiArrowLeft size={14} /> Back to Orders
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          {canCancelOrder && (
            <button
              onClick={handleCancelOrder}
              disabled={cancellingOrder}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 border border-rose-200 bg-rose-50 text-rose-700 text-xs uppercase tracking-wider font-medium rounded-xl hover:bg-rose-100 transition-colors disabled:opacity-50"
            >
              <FiX size={13} />{" "}
              {cancellingOrder ? "Cancelling..." : "Cancel Order"}
            </button>
          )}

          {canRequestReturn && (
            <button
              onClick={handleOpenReturnModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-clay text-ivory text-xs uppercase tracking-wider font-medium rounded-xl hover:bg-clay-light transition-all shadow-xs"
            >
              <FiRotateCcw size={13} /> Request Return
            </button>
          )}
        </div>
      </div>

      {/* Return Request Banner */}
      {isReturnActive && order.returnRequest && (
        <div className="bg-blush border border-clay/25 rounded-2xl p-4 sm:p-5 mb-6 text-xs text-ink space-y-3">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1.5">
            <span className="font-semibold uppercase tracking-wider text-clay flex items-center gap-1.5">
              <FiRotateCcw size={14} /> Return Status:{" "}
              <strong className="capitalize">
                {order.returnRequest.status}
              </strong>
            </span>
            <span className="text-ink/50 text-[11px]">
              {order.returnRequest.requestedAt &&
                new Date(order.returnRequest.requestedAt).toLocaleDateString()}
            </span>
          </div>

          <p>
            <strong>Reason:</strong> {order.returnRequest.reason}
          </p>
          {order.returnRequest.notes && (
            <p className="text-ink/70">
              <strong>Notes:</strong> {order.returnRequest.notes}
            </p>
          )}

          {order.returnRequest.reverseAwb && (
            <div className="p-3 bg-white/70 border border-clay/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="font-medium text-ink">
                  Shiprocket Reverse Pickup Scheduled
                </p>
                <p className="text-[11px] text-ink/60">
                  A courier partner will arrive to collect the package.
                </p>
              </div>
              <span className="font-mono bg-ivory px-2.5 py-1 border border-clay/20 rounded font-semibold text-clay self-start sm:self-auto">
                AWB: {order.returnRequest.reverseAwb}
              </span>
            </div>
          )}

          {hasRefundReleased && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-emerald-900">
              <p className="font-semibold flex items-center gap-1.5">
                <FiCheck size={14} /> Refund Released via Netbanking
              </p>
              <p>
                Amount Refunded:{" "}
                <strong>
                  ₹
                  {Number(order.returnRequest!.refund!.amount).toLocaleString(
                    "en-IN",
                  )}
                </strong>{" "}
                ({order.returnRequest!.refund!.type} refund)
              </p>
              <p className="font-mono text-[11px] text-emerald-800 break-all">
                Bank UTR / Ref: {order.returnRequest!.refund!.referenceId}
              </p>
              {order.returnRequest!.refund!.adminNotes && (
                <p className="text-[11px] text-emerald-700">
                  Note: {order.returnRequest!.refund!.adminNotes}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white border border-gold/25 rounded-2xl p-4 sm:p-6 mb-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-serif text-xl sm:text-2xl md:text-3xl text-brand font-medium tracking-tight">
                Order #{order.orderNumber}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-medium border ${
                  statusStyles[order.status]?.bg ?? "bg-gray-100 text-gray-800"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    statusStyles[order.status]?.dot ?? "bg-gray-500"
                  }`}
                />
                {statusStyles[order.status]?.label ?? order.status}
              </span>
            </div>
            <p className="text-xs text-brand/60 mt-1.5 flex items-center gap-1.5">
              <FiClock size={13} />
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-gold/15">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-brand/50 block">
              Total Amount
            </span>
            <span className="font-serif text-xl sm:text-2xl font-semibold text-brand">
              ₹{Number(order.total).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Order Stepper */}
        {!isCancelled && !isReturnActive && (
          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-gold/15">
            {/* Desktop / Tablet Stepper */}
            <div className="hidden sm:block">
              <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-gold/20 -z-0" />
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-brand transition-all duration-500 -z-0"
                  style={{
                    width: `${Math.max(
                      0,
                      (currentStepIndex / (ORDER_STEPS.length - 1)) * 100,
                    )}%`,
                  }}
                />

                {ORDER_STEPS.map((step, idx) => {
                  const isPassed = idx <= currentStepIndex;
                  return (
                    <div
                      key={step.key}
                      className="relative z-10 flex flex-col items-center bg-white px-2"
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                          isPassed
                            ? "bg-brand text-ivory ring-4 ring-ivory"
                            : "bg-white border-2 border-gold/40 text-brand/40"
                        }`}
                      >
                        {isPassed ? <FiCheck size={13} /> : idx + 1}
                      </div>
                      <span
                        className={`text-[11px] mt-2 tracking-wide text-center font-medium ${
                          isPassed ? "text-brand" : "text-brand/40"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Vertical Stepper */}
            <div className="sm:hidden space-y-3">
              {ORDER_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div key={step.key} className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                        isPassed
                          ? "bg-brand text-ivory"
                          : "bg-white border border-gold/40 text-brand/40"
                      }`}
                    >
                      {isPassed ? <FiCheck size={12} /> : idx + 1}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isCurrent
                          ? "text-brand font-semibold"
                          : isPassed
                            ? "text-brand/80"
                            : "text-brand/40"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="mt-4 p-3 bg-rose-50/70 border border-rose-200/60 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <FiAlertCircle size={15} /> This order has been cancelled.
          </div>
        )}

        {/* Return Policy Notice: Shown if delivered but window has passed */}
        {isReturnExpired && !isReturnActive && (
          <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs text-amber-800 flex items-center gap-2">
            <FiAlertCircle size={16} className="shrink-0" />
            <span>
              The {RETURN_WINDOW_DAYS}-day return window from the order
              placement date has expired. Returns are no longer accepted for
              this order.
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Ordered Items & Bill Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gold/25 rounded-2xl p-4 sm:p-6 shadow-xs">
            <h2 className="font-serif text-base sm:text-lg text-brand mb-4 flex items-center gap-2">
              <FiPackage className="text-clay" /> Ordered Items (
              {order.items.length})
            </h2>

            <div className="divide-y divide-gold/10">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="py-3.5 flex flex-col xs:flex-row xs:items-center justify-between gap-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-ivory border border-gold/20 flex items-center justify-center shrink-0 text-brand/30 overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <FiPackage size={18} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-brand truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] sm:text-xs text-brand/60 mt-0.5">
                        Qty: {item.qty} × ₹
                        {Number(item.price).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between xs:justify-end items-center border-t xs:border-t-0 pt-2 xs:pt-0 border-gold/10">
                    <span className="text-[11px] text-brand/50 xs:hidden">
                      Line Total:
                    </span>
                    <span className="font-serif text-xs sm:text-sm font-medium text-brand whitespace-nowrap">
                      ₹{Number(item.price * item.qty).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Accounting Breakdown */}
            <div className="mt-5 pt-4 border-t border-gold/15 space-y-2 text-xs">
              <div className="flex justify-between text-brand/70">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              {order.discountAmount && order.discountAmount > 0 ? (
                <div className="flex justify-between text-emerald-700">
                  <span>Promotional Discount</span>
                  <span>
                    -₹{Number(order.discountAmount).toLocaleString("en-IN")}
                  </span>
                </div>
              ) : null}

              <div className="flex justify-between text-brand/70">
                <span>Delivery Fee</span>
                <span>
                  {explicitDeliveryFee === 0 ? (
                    <span className="text-emerald-700 font-medium">FREE</span>
                  ) : (
                    `₹${explicitDeliveryFee}`
                  )}
                </span>
              </div>

              {isCodOrder && explicitCodFee > 0 && (
                <div className="flex justify-between text-brand/70">
                  <span>COD Convenience Charge</span>
                  <span>₹{explicitCodFee}</span>
                </div>
              )}

              <div className="flex justify-between font-serif text-sm sm:text-base font-semibold text-brand pt-3 border-t border-gold/15">
                <span>Total Paid</span>
                <span>₹{Number(order.total).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tracking & Delivery Details */}
        <div className="space-y-4 sm:space-y-6">
          {order.shipment?.awbCode && (
            <div className="bg-white border border-gold/25 rounded-2xl p-4 sm:p-5 shadow-xs">
              <h3 className="text-xs uppercase tracking-widest font-semibold text-brand/80 mb-3 flex items-center gap-2">
                <FiTruck className="text-clay" /> Courier Tracking
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-brand/60">Courier</span>
                  <span className="font-medium text-brand">
                    {order.shipment.courierName || "Standard Express"}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-brand/60">AWB Code</span>
                  <button
                    onClick={() => copyToClipboard(order.shipment!.awbCode!)}
                    className="inline-flex items-center gap-1 font-mono text-[11px] bg-ivory border border-gold/30 px-2 py-0.5 rounded hover:bg-gold/10 transition-colors shrink-0"
                  >
                    <span>{order.shipment.awbCode}</span>
                    {copiedAWB ? (
                      <FiCheck className="text-emerald-600" size={12} />
                    ) : (
                      <FiCopy size={12} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white border border-gold/25 rounded-2xl p-4 sm:p-5 shadow-xs">
            <h3 className="text-xs uppercase tracking-widest font-semibold text-brand/80 mb-3 flex items-center gap-2">
              <FiMapPin className="text-clay" /> Shipping Address
            </h3>
            <div className="text-xs text-brand/80 leading-relaxed space-y-0.5">
              <p className="font-medium text-brand mb-1">
                {order.shippingAddress.name}
              </p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && (
                <p>{order.shippingAddress.line2}</p>
              )}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                {order.shippingAddress.pincode}
              </p>
              {order.shippingAddress.phone && (
                <p className="text-brand/60 mt-1">
                  Phone: {order.shippingAddress.phone}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white border border-gold/25 rounded-2xl p-4 sm:p-5 shadow-xs">
            <h3 className="text-xs uppercase tracking-widest font-semibold text-brand/80 mb-2 flex items-center gap-2">
              <FiCreditCard className="text-clay" /> Payment Mode
            </h3>
            <p className="text-xs text-brand/70 capitalize">
              {isCodOrder
                ? "Cash on Delivery (COD)"
                : "Online Payment (Razorpay)"}
            </p>
          </div>
        </div>
      </div>

      {/* Return Request Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[85dvh] overflow-y-auto space-y-4 shadow-xl border border-gold/20">
            <div className="flex items-center justify-between pb-3 border-b border-gold/15">
              <h2 className="font-serif text-base sm:text-lg text-brand font-medium flex items-center gap-2">
                <FiRotateCcw className="text-clay" /> Request Return & Refund
              </h2>
              <button
                onClick={() => setShowReturnModal(false)}
                className="p-1 text-brand/40 hover:text-brand"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitReturn} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-brand mb-1">
                  Reason for Return *
                </label>
                <select
                  value={returnForm.reason}
                  onChange={(e) =>
                    setReturnForm({ ...returnForm, reason: e.target.value })
                  }
                  className={inputClass}
                >
                  {RETURN_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-brand mb-1">
                  Additional Details / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain what is wrong with the item..."
                  value={returnForm.notes}
                  onChange={(e) =>
                    setReturnForm({ ...returnForm, notes: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-medium text-brand mb-1">
                  Product Photos (for Verification)
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  {returnForm.photos.map((p, idx) => (
                    <div
                      key={idx}
                      className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border border-gold/30 shrink-0"
                    >
                      <img
                        src={p}
                        alt="return-proof"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5"
                      >
                        <FiX size={10} />
                      </button>
                    </div>
                  ))}
                  <label className="w-12 h-12 sm:w-14 sm:h-14 border border-dashed border-clay/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gold/10 transition-colors text-clay shrink-0">
                    <FiUploadCloud size={16} />
                    <span className="text-[9px] mt-0.5">
                      {uploadingPhoto ? "..." : "+ Photo"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-gold/15 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-medium text-brand">
                    Refund Bank Details *
                  </label>
                  {savedBankAccount && !isEditingAccount && (
                    <button
                      type="button"
                      onClick={() => setIsEditingAccount(true)}
                      className="text-[11px] text-clay hover:underline flex items-center gap-1 font-medium"
                    >
                      <FiEdit2 size={11} /> Edit Details
                    </button>
                  )}
                </div>

                {savedBankAccount && !isEditingAccount ? (
                  <div className="p-3 rounded-xl border border-clay bg-blush shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-brand truncate max-w-[200px]">
                        {savedBankAccount.accountHolderName}
                      </span>
                      <span className="text-[9px] bg-clay/15 text-clay px-2 py-0.5 rounded-full font-medium shrink-0">
                        Saved
                      </span>
                    </div>
                    <p className="font-mono text-xs text-brand/80">
                      A/C: {savedBankAccount.accountNumber}
                    </p>
                    <p className="font-mono text-xs text-brand/80">
                      IFSC: {savedBankAccount.ifscCode}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 bg-ivory/40 p-3 sm:p-3.5 rounded-xl border border-clay/20">
                    <input
                      placeholder="Account Holder Name *"
                      required
                      value={returnForm.accountHolderName}
                      onChange={(e) =>
                        setReturnForm({
                          ...returnForm,
                          accountHolderName: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                    <input
                      placeholder="Bank Account Number *"
                      required
                      value={returnForm.accountNumber}
                      onChange={(e) =>
                        setReturnForm({
                          ...returnForm,
                          accountNumber: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                      <input
                        placeholder="IFSC Code *"
                        required
                        value={returnForm.ifscCode}
                        onChange={(e) =>
                          setReturnForm({
                            ...returnForm,
                            ifscCode: e.target.value.toUpperCase(),
                          })
                        }
                        className={inputClass}
                      />
                      <input
                        placeholder="Bank Name (Optional)"
                        value={returnForm.bankName}
                        onChange={(e) =>
                          setReturnForm({
                            ...returnForm,
                            bankName: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse xs:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="w-full xs:flex-1 py-2.5 bg-ivory border border-gold/30 rounded-xl text-brand font-medium hover:bg-gold/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReturn}
                  className="w-full xs:flex-1 py-2.5 bg-clay text-ivory rounded-xl font-medium hover:bg-clay-light disabled:opacity-50 transition-colors shadow-sm"
                >
                  {submittingReturn ? "Submitting..." : "Submit Return"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
