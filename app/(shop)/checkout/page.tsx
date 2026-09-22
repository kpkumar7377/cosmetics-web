"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import {
  FiCreditCard,
  FiTruck,
  FiPlus,
  FiChevronDown,
  FiShoppingBag,
  FiShield,
} from "react-icons/fi";
import { useCart } from "../../../lib/cartContext";
import { useAuth } from "../../../lib/authContext";
import { trackEvent } from "../../../lib/fpixel";
import api from "../../../lib/api";

declare global {
  interface Window {
    Razorpay: new (options: {
      key: string;
      amount: number;
      currency: string;
      name: string;
      order_id: string;
      prefill: { name: string; email: string; contact: string };
      handler: (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => void | Promise<void>;
      theme: { color: string };
    }) => { open: () => void };
  }
}

const INDIAN_STATES_AND_UTS = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const inputClass =
  "w-full border rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-ivory outline-none transition-all placeholder:text-ink/35";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Dynamic Shipping Configuration
  const [shippingConfig, setShippingConfig] = useState({
    standardShippingFee: 49,
    freeShippingThreshold: 499,
    codConvenienceFee: 29,
  });

  // Saved Address management
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  const [saveAddressToAccount, setSaveAddressToAccount] = useState(true);
  const [addressLoading, setAddressLoading] = useState(true);

  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const codBlockedItems = items.filter((i) => i.codEligible === false);
  const codAvailable = codBlockedItems.length === 0;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only redirect once client has mounted AND auth check is completely finished
    if (mounted && !authLoading && !user) {
      router.replace("/login?redirect=/checkout");
    }
  }, [mounted, authLoading, user, router]);

  useEffect(() => {
    if (!codAvailable && paymentMethod === "cod") setPaymentMethod("razorpay");
  }, [codAvailable, paymentMethod]);

  // Fetch dynamic shipping parameters
  useEffect(() => {
    api
      .get("/settings/shipping")
      .then((res) => {
        if (res.data) setShippingConfig(res.data);
      })
      .catch(() => {});
  }, []);

  // Fetch saved user addresses
  useEffect(() => {
    if (!user) return;

    const fetchAddresses = async () => {
      setAddressLoading(true);
      try {
        const { data } = await api.get("/users/addresses");
        setSavedAddresses(data || []);

        if (data && data.length > 0) {
          const defaultAddr = data.find((a: any) => a.isDefault) || data[0];
          setSelectedAddressId(defaultAddr._id);
          setForm({
            name: defaultAddr.name || "",
            email: user?.email || "",
            phone: defaultAddr.phone || "",
            line1: defaultAddr.line1 || "",
            line2: defaultAddr.line2 || "",
            city: defaultAddr.city || "",
            state: defaultAddr.state || "",
            pincode: defaultAddr.pincode || "",
          });
        } else {
          setSelectedAddressId("new");
          setForm((prev) => ({
            ...prev,
            name: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || "",
          }));
        }
      } catch (err) {
        console.error("Failed to load addresses", err);
      } finally {
        setAddressLoading(false);
      }
    };

    fetchAddresses();
  }, [user]);

  // Dynamic Calculations
  const isFreeShipping = subtotal >= shippingConfig.freeShippingThreshold;
  const baseShippingFee = isFreeShipping
    ? 0
    : shippingConfig.standardShippingFee;
  const codFee = paymentMethod === "cod" ? shippingConfig.codConvenienceFee : 0;
  const totalShipping = baseShippingFee + codFee;
  const grandTotal = subtotal + totalShipping;

  useEffect(() => {
    if (items.length === 0) return;
    trackEvent("InitiateCheckout", {
      content_ids: items.map((i) => i.productId),
      value: grandTotal,
      currency: "INR",
      num_items: items.reduce((sum, i) => sum + i.qty, 0),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectAddress = (address: any) => {
    setSelectedAddressId(address._id);
    setFormErrors({});
    setForm({
      name: address.name || "",
      email: user?.email || "",
      phone: address.phone || "",
      line1: address.line1 || "",
      line2: address.line2 || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
    });
  };

  const handleSelectNew = () => {
    setSelectedAddressId("new");
    setFormErrors({});
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
    });
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm((prev) => ({ ...prev, phone: numericValue }));
    if (formErrors.phone) {
      setFormErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, "").slice(0, 6);
    setForm((prev) => ({ ...prev, pincode: numericValue }));
    if (formErrors.pincode) {
      setFormErrors((prev) => ({ ...prev, pincode: "" }));
    }
  };

  const validateAddressForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.name.trim()) {
      errors.name = "Full name is required";
    }

    if (!form.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(form.phone)) {
      errors.phone = "Enter a valid 10-digit mobile number";
    }

    if (!form.line1.trim()) {
      errors.line1 = "Street address is required";
    }

    if (!form.city.trim()) {
      errors.city = "City is required";
    }

    if (!form.state.trim()) {
      errors.state = "Please select a state";
    }

    if (!form.pincode.trim()) {
      errors.pincode = "Pincode is required";
    } else if (!/^[1-9][0-9]{5}$/.test(form.pincode)) {
      errors.pincode = "Enter a valid 6-digit postal code";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedAddressId === "new" || savedAddresses.length === 0) {
      const isValid = validateAddressForm();
      if (!isValid) return;
    }

    setLoading(true);

    try {
      if (
        selectedAddressId === "new" &&
        (saveAddressToAccount || savedAddresses.length === 0)
      ) {
        try {
          await api.post("/users/addresses", {
            name: form.name.trim(),
            phone: form.phone.trim(),
            line1: form.line1.trim(),
            line2: form.line2.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            pincode: form.pincode.trim(),
            label: "Home",
            isDefault: savedAddresses.length === 0,
          });
        } catch (saveErr) {
          console.warn("Could not save address:", saveErr);
        }
      }

      const { data: order } = await api.post("/orders", {
        items: items.map((i) => ({
          productId: i.productId,
          variantSku: i.variantSku,
          qty: i.qty,
        })),
        shippingAddress: {
          name: form.name.trim(),
          line1: form.line1.trim(),
          line2: form.line2.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
          phone: form.phone.trim(),
        },
        guestInfo: user
          ? undefined
          : {
              name: form.name.trim(),
              email: form.email.trim(),
              phone: form.phone.trim(),
            },
        paymentMethod,
      });

      if (paymentMethod === "cod") {
        clearCart();
        router.push(
          `/checkout/success?orderNumber=${order.orderNumber}&orderId=${order._id}&value=${order.total}`,
        );
        return;
      }

      // Safeguard for Razorpay script initialization
      if (typeof window.Razorpay === "undefined") {
        alert(
          "Payment gateway is still initializing. Please wait a moment and try again.",
        );
        setLoading(false);
        return;
      }

      const { data: rp } = await api.post("/payments/razorpay/create-order", {
        orderId: order._id,
      });

      const razorpay = new window.Razorpay({
        key: rp.key,
        amount: rp.amount,
        currency: "INR",
        name: "Cosmetics Store",
        order_id: rp.razorpayOrderId,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        handler: async (response) => {
          await api.post("/payments/razorpay/verify", {
            orderId: order._id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          clearCart();
          router.push(
            `/checkout/success?orderNumber=${order.orderNumber}&orderId=${order._id}&value=${order.total}`,
          );
        },
        theme: { color: "#1F3A5F" },
      });

      razorpay.open();
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          "Something went wrong placing your order.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Guard 1: Still mounting or validating auth
  if (!mounted || authLoading) {
    return (
      <p className="px-4 py-24 text-center text-xs sm:text-sm text-ink/50">
        Loading checkout…
      </p>
    );
  }

  // Guard 2: Not logged in after check completes
  if (!user) {
    return (
      <p className="px-4 py-24 text-center text-xs sm:text-sm text-ink/50">
        Redirecting to login…
      </p>
    );
  }

  // Guard 3: Empty cart
  if (items.length === 0) {
    return (
      <p className="px-4 py-24 text-center text-xs sm:text-sm text-ink/50">
        Your cart is empty.
      </p>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      {/* Sticky Mobile Order Summary Bar */}
      <div className="lg:hidden sticky top-[57px] z-30 bg-ivory border-b border-gold/25 px-4 py-3 shadow-sm">
        <button
          type="button"
          onClick={() => setMobileSummaryOpen((prev) => !prev)}
          className="w-full flex items-center justify-between text-xs sm:text-sm font-medium text-brand"
        >
          <div className="flex items-center gap-2">
            <FiShoppingBag className="text-clay" />
            <span>
              {mobileSummaryOpen ? "Hide order summary" : "Show order summary"}
            </span>
            <FiChevronDown
              className={`transition-transform duration-200 ${
                mobileSummaryOpen ? "rotate-180" : ""
              }`}
            />
          </div>
          <span className="font-serif text-sm sm:text-base font-semibold">
            ₹{grandTotal}
          </span>
        </button>

        {mobileSummaryOpen && (
          <div className="pt-3 mt-3 border-t border-gold/15 space-y-2 text-xs">
            {items.map((i) => (
              <div key={i.key} className="flex justify-between text-ink/75">
                <span className="truncate pr-4">
                  {i.name} × {i.qty}
                </span>
                <span className="shrink-0 font-medium">₹{i.price * i.qty}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-gold/10 space-y-1 text-ink/65">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{isFreeShipping ? "FREE" : `₹${baseShippingFee}`}</span>
              </div>
              {paymentMethod === "cod" && codFee > 0 && (
                <div className="flex justify-between">
                  <span>COD Handling Fee</span>
                  <span>₹{codFee}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <h1 className="font-serif text-2xl sm:text-3xl text-ink mb-6 sm:mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Main Checkout Form Column */}
          <form
            onSubmit={handlePlaceOrder}
            noValidate
            className="lg:col-span-8 flex flex-col gap-5 sm:gap-6"
          >
            {/* Delivery Address Section */}
            <div className="bg-blush/60 border border-gold/15 rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-base sm:text-lg text-ink font-medium">
                  Shipping Address
                </h2>
                {!addressLoading &&
                  savedAddresses.length > 0 &&
                  selectedAddressId !== "new" && (
                    <button
                      type="button"
                      onClick={handleSelectNew}
                      className="text-xs font-medium text-clay hover:underline flex items-center gap-1"
                    >
                      <FiPlus size={13} /> Add New Address
                    </button>
                  )}
              </div>

              {/* Address Loading Skeleton State */}
              {addressLoading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="h-28 rounded-xl bg-ivory/80 border border-gold/15 p-4 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="h-3 w-20 bg-brand/10 rounded" />
                        <div className="h-3 w-32 bg-brand/10 rounded" />
                        <div className="h-2.5 w-44 bg-brand/5 rounded" />
                      </div>
                      <div className="h-3 w-24 bg-brand/10 rounded" />
                    </div>
                    <div className="h-28 rounded-xl bg-ivory/80 border border-gold/15 p-4 hidden sm:flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="h-3 w-20 bg-brand/10 rounded" />
                        <div className="h-3 w-32 bg-brand/10 rounded" />
                        <div className="h-2.5 w-44 bg-brand/5 rounded" />
                      </div>
                      <div className="h-3 w-24 bg-brand/10 rounded" />
                    </div>
                  </div>
                  <p className="text-[11px] text-center text-brand/40 italic py-1">
                    Loading your saved addresses...
                  </p>
                </div>
              ) : (
                <>
                  {/* Saved Addresses Cards */}
                  {savedAddresses.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr._id;
                        return (
                          <div
                            key={addr._id}
                            onClick={() => handleSelectAddress(addr)}
                            className={`p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all text-xs sm:text-sm flex flex-col justify-between ${
                              isSelected
                                ? "border-clay bg-ivory shadow-sm ring-1 ring-clay"
                                : "border-clay/20 bg-ivory/60 hover:border-clay/50"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-ink">
                                  {addr.label || "Saved Address"}
                                </span>
                                {addr.isDefault && (
                                  <span className="text-[10px] bg-clay/10 text-clay font-medium px-2 py-0.5 rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="font-medium text-ink">
                                {addr.name}
                              </p>
                              <p className="text-xs text-ink/70 mt-1 line-clamp-2 leading-relaxed">
                                {addr.line1}
                                {addr.line2 ? `, ${addr.line2}` : ""},{" "}
                                {addr.city}, {addr.state} - {addr.pincode}
                              </p>
                              <p className="text-xs text-ink/60 mt-1">
                                Phone: {addr.phone}
                              </p>
                            </div>
                            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-clay">
                              <input
                                type="radio"
                                name="addressSelect"
                                checked={isSelected}
                                onChange={() => handleSelectAddress(addr)}
                                className="accent-clay"
                              />
                              <span>Deliver to this address</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Enter New Address Form */}
                  {(selectedAddressId === "new" ||
                    savedAddresses.length === 0) && (
                    <div
                      className={
                        savedAddresses.length > 0
                          ? "border-t border-clay/15 pt-4 mt-2"
                          : ""
                      }
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold tracking-wide uppercase text-ink/60">
                          {savedAddresses.length > 0
                            ? "New Address Details"
                            : "Enter Delivery Address"}
                        </p>
                        {savedAddresses.length > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              handleSelectAddress(savedAddresses[0])
                            }
                            className="text-xs text-clay hover:underline"
                          >
                            Cancel & Pick Saved
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col gap-3">
                        {/* Name Field */}
                        <div>
                          <input
                            name="name"
                            placeholder="Full name"
                            value={form.name}
                            onChange={handleTextChange}
                            className={`${inputClass} ${
                              formErrors.name
                                ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                : "border-clay/20 focus:border-clay focus:ring-1 focus:ring-clay"
                            }`}
                          />
                          {formErrors.name && (
                            <p className="text-[11px] text-rose-600 mt-1 font-medium">
                              {formErrors.name}
                            </p>
                          )}
                        </div>

                        {/* Phone Field */}
                        <div>
                          <input
                            name="phone"
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            placeholder="10-digit Mobile number"
                            value={form.phone}
                            onChange={handlePhoneChange}
                            className={`${inputClass} ${
                              formErrors.phone
                                ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                : "border-clay/20 focus:border-clay focus:ring-1 focus:ring-clay"
                            }`}
                          />
                          {formErrors.phone && (
                            <p className="text-[11px] text-rose-600 mt-1 font-medium">
                              {formErrors.phone}
                            </p>
                          )}
                        </div>

                        {/* Address Line 1 */}
                        <div>
                          <input
                            name="line1"
                            placeholder="House / Flat / Street address"
                            value={form.line1}
                            onChange={handleTextChange}
                            className={`${inputClass} ${
                              formErrors.line1
                                ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                : "border-clay/20 focus:border-clay focus:ring-1 focus:ring-clay"
                            }`}
                          />
                          {formErrors.line1 && (
                            <p className="text-[11px] text-rose-600 mt-1 font-medium">
                              {formErrors.line1}
                            </p>
                          )}
                        </div>

                        {/* Address Line 2 */}
                        <input
                          name="line2"
                          placeholder="Apartment, suite, unit (optional)"
                          value={form.line2}
                          onChange={handleTextChange}
                          className={`${inputClass} border-clay/20 focus:border-clay focus:ring-1 focus:ring-clay`}
                        />

                        {/* City & State Dropdown */}
                        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                          <div>
                            <input
                              name="city"
                              placeholder="City"
                              value={form.city}
                              onChange={handleTextChange}
                              className={`${inputClass} ${
                                formErrors.city
                                  ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                  : "border-clay/20 focus:border-clay focus:ring-1 focus:ring-clay"
                              }`}
                            />
                            {formErrors.city && (
                              <p className="text-[11px] text-rose-600 mt-1 font-medium">
                                {formErrors.city}
                              </p>
                            )}
                          </div>

                          <div>
                            <select
                              name="state"
                              value={form.state}
                              onChange={handleTextChange}
                              className={`${inputClass} cursor-pointer ${
                                !form.state ? "text-ink/40" : "text-ink"
                              } ${
                                formErrors.state
                                  ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                  : "border-clay/20 focus:border-clay focus:ring-1 focus:ring-clay"
                              }`}
                            >
                              <option value="" disabled>
                                Select State / UT
                              </option>
                              {INDIAN_STATES_AND_UTS.map((st) => (
                                <option
                                  key={st}
                                  value={st}
                                  className="text-ink"
                                >
                                  {st}
                                </option>
                              ))}
                            </select>
                            {formErrors.state && (
                              <p className="text-[11px] text-rose-600 mt-1 font-medium">
                                {formErrors.state}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* 6-Digit Pincode */}
                        <div>
                          <input
                            name="pincode"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="Pincode (6-digit)"
                            value={form.pincode}
                            onChange={handlePincodeChange}
                            className={`${inputClass} ${
                              formErrors.pincode
                                ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                : "border-clay/20 focus:border-clay focus:ring-1 focus:ring-clay"
                            }`}
                          />
                          {formErrors.pincode && (
                            <p className="text-[11px] text-rose-600 mt-1 font-medium">
                              {formErrors.pincode}
                            </p>
                          )}
                        </div>

                        <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={saveAddressToAccount}
                            onChange={(e) =>
                              setSaveAddressToAccount(e.target.checked)
                            }
                            className="accent-clay rounded w-4 h-4"
                          />
                          <span className="text-xs text-ink/75">
                            Save this address to my account for future orders
                          </span>
                        </label>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="bg-blush/60 border border-gold/15 rounded-2xl p-4 sm:p-6 shadow-sm">
              <h2 className="font-serif text-base sm:text-lg text-ink font-medium mb-4">
                Payment Method
              </h2>
              <div className="flex flex-col gap-3">
                <label
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 sm:py-3.5 cursor-pointer border transition-all ${
                    paymentMethod === "razorpay"
                      ? "border-clay bg-ivory shadow-sm ring-1 ring-clay"
                      : "border-clay/15 bg-ivory/60 hover:border-clay/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "razorpay"}
                    onChange={() => setPaymentMethod("razorpay")}
                    className="accent-clay"
                  />
                  <FiCreditCard size={18} className="text-clay shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-medium text-ink">
                      Pay Online (UPI, Cards, Netbanking)
                    </span>
                    <span className="text-[11px] text-ink/50">
                      Safe & secure checkout via Razorpay
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 sm:py-3.5 border transition-all ${
                    !codAvailable
                      ? "opacity-40 cursor-not-allowed border-clay/15 bg-ivory/30"
                      : paymentMethod === "cod"
                        ? "border-clay bg-ivory cursor-pointer shadow-sm ring-1 ring-clay"
                        : "border-clay/15 bg-ivory/60 hover:border-clay/40 cursor-pointer"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "cod"}
                    disabled={!codAvailable}
                    onChange={() => setPaymentMethod("cod")}
                    className="accent-clay"
                  />
                  <FiTruck size={18} className="text-clay shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-medium text-ink">
                      Cash on Delivery (COD)
                    </span>
                    {shippingConfig.codConvenienceFee > 0 && (
                      <span className="text-[11px] text-ink/55">
                        +₹{shippingConfig.codConvenienceFee} convenience fee
                        applies
                      </span>
                    )}
                  </div>
                </label>
              </div>

              {!codAvailable && (
                <p className="text-xs text-rose-700 mt-3 font-medium">
                  Cash on Delivery isn't available for{" "}
                  {codBlockedItems.map((i) => i.name).join(", ")}.
                </p>
              )}
            </div>

            {/* Submit Action CTA Button */}
            <button
              type="submit"
              disabled={loading || addressLoading}
              className="w-full bg-clay text-ivory rounded-full py-3.5 sm:py-4 text-xs sm:text-sm uppercase tracking-widest font-medium hover:bg-clay/90 active:scale-[0.99] transition-all disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
            >
              <FiShield size={16} />
              <span>
                {loading
                  ? "Processing..."
                  : paymentMethod === "cod"
                    ? `Place Order • ₹${grandTotal}`
                    : `Pay & Place Order • ₹${grandTotal}`}
              </span>
            </button>
          </form>

          {/* Desktop Sticky Order Summary Column */}
          <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-ivory border border-gold/25 rounded-2xl p-6 shadow-sm">
              <h2 className="font-serif text-lg sm:text-xl text-ink mb-4">
                Order Summary
              </h2>

              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto no-scrollbar pr-1">
                {items.map((i) => (
                  <div
                    key={i.key}
                    className="flex justify-between text-xs sm:text-sm text-ink/75 py-1"
                  >
                    <span className="truncate pr-2">
                      {i.name} × {i.qty}
                    </span>
                    <span className="shrink-0 font-medium">
                      ₹{i.price * i.qty}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gold/20 mt-4 pt-3 space-y-2 text-xs sm:text-sm text-ink/70">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-ink">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>
                    {isFreeShipping ? (
                      <span className="text-emerald-700 font-medium">FREE</span>
                    ) : (
                      `₹${baseShippingFee}`
                    )}
                  </span>
                </div>

                {paymentMethod === "cod" && codFee > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>COD Convenience Charge</span>
                    <span>₹{codFee}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between font-serif text-base sm:text-lg text-ink font-semibold pt-3 border-t border-gold/15 mt-3">
                <span>Total Payable</span>
                <span>₹{grandTotal}</span>
              </div>

              {!isFreeShipping && (
                <div className="mt-4 p-3 bg-gold/10 border border-gold/20 rounded-xl text-center">
                  <p className="text-[11px] text-clay font-medium leading-tight">
                    Add ₹{shippingConfig.freeShippingThreshold - subtotal} more
                    to unlock <strong>FREE Delivery</strong>!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
