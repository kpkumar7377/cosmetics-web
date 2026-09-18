"use client";

import { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiCheck, FiMapPin } from "react-icons/fi";
import api from "../../../../lib/api";

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
  "w-full border rounded-xl px-4 py-2.5 text-sm bg-ivory outline-none transition-all placeholder:text-ink/35";

const emptyForm = {
  label: "",
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

export default function AddressesClient() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/users/addresses");
      setAddresses(data || []);
    } catch {
      setError("Couldn't load your addresses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePhoneChange = (e) => {
    const numericValue = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm((prev) => ({ ...prev, phone: numericValue }));
    if (formErrors.phone) {
      setFormErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  const handlePincodeChange = (e) => {
    const numericValue = e.target.value.replace(/\D/g, "").slice(0, 6);
    setForm((prev) => ({ ...prev, pincode: numericValue }));
    if (formErrors.pincode) {
      setFormErrors((prev) => ({ ...prev, pincode: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!form.name.trim()) {
      errors.name = "Full name is required";
    }

    if (!form.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(form.phone)) {
      errors.phone = "Enter a valid 10-digit mobile number";
    }

    if (!form.line1.trim()) {
      errors.line1 = "Address line 1 is required";
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

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        label: form.label.trim() || "Home",
        name: form.name.trim(),
        phone: form.phone.trim(),
        line1: form.line1.trim(),
        line2: form.line2.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
      };

      const { data } = await api.post("/users/addresses", payload);
      setAddresses(data || []);
      setForm(emptyForm);
      setFormErrors({});
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save that address.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { data } = await api.delete(`/users/addresses/${id}`);
      setAddresses(data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete address.");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const { data } = await api.put(`/users/addresses/${id}/default`);
      setAddresses(data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update default address.",
      );
    }
  };

  if (loading)
    return <p className="text-sm text-ink/50">Loading your addresses...</p>;

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        {addresses.length === 0 && !showForm && (
          <div className="text-center py-12 border border-dashed border-clay/20 rounded-2xl">
            <FiMapPin className="mx-auto text-ink/30 mb-2" size={24} />
            <p className="text-sm text-ink/50">No saved addresses yet.</p>
          </div>
        )}

        {addresses.map((addr) => (
          <div
            key={addr._id}
            className="bg-blush rounded-2xl p-5 flex justify-between gap-4"
          >
            <div className="text-sm text-ink">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium">{addr.label || "Address"}</p>
                {addr.isDefault && (
                  <span className="text-[10px] bg-clay text-ivory rounded-full px-2 py-0.5">
                    Default
                  </span>
                )}
              </div>
              <p className="text-ink/70">
                {addr.name} · {addr.phone}
              </p>
              <p className="text-ink/60 mt-0.5">
                {addr.line1}
                {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state}{" "}
                - {addr.pincode}
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              {!addr.isDefault && (
                <button
                  type="button"
                  onClick={() => handleSetDefault(addr._id)}
                  aria-label="Set as default"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-clay hover:bg-ivory transition-colors"
                >
                  <FiCheck size={15} />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDelete(addr._id)}
                aria-label="Delete address"
                className="w-8 h-8 rounded-full flex items-center justify-center text-ink/40 hover:text-clay hover:bg-ivory transition-colors"
              >
                <FiTrash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm ? (
        <form
          onSubmit={handleAdd}
          noValidate
          className="bg-blush rounded-2xl p-6 flex flex-col gap-3"
        >
          {error && (
            <p className="text-rose-600 text-xs font-medium">{error}</p>
          )}

          <div>
            <input
              name="label"
              placeholder="Label (e.g. Home, Work, Studio)"
              onChange={handleTextChange}
              value={form.label}
              className={`${inputClass} border-clay/20 focus:border-clay focus:ring-1 focus:ring-clay`}
            />
          </div>

          <div>
            <input
              name="name"
              placeholder="Full name"
              onChange={handleTextChange}
              value={form.name}
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

          <div>
            <input
              name="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit Mobile number"
              onChange={handlePhoneChange}
              value={form.phone}
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

          <div>
            <input
              name="line1"
              placeholder="Address line 1 (Flat, House no., Building, Street)"
              onChange={handleTextChange}
              value={form.line1}
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

          <div>
            <input
              name="line2"
              placeholder="Address line 2 (Area, Landmark - optional)"
              onChange={handleTextChange}
              value={form.line2}
              className={`${inputClass} border-clay/20 focus:border-clay focus:ring-1 focus:ring-clay`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <input
                name="city"
                placeholder="City"
                onChange={handleTextChange}
                value={form.city}
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
                  <option key={st} value={st} className="text-ink">
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

          <div>
            <input
              name="pincode"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Pincode (6-digit)"
              onChange={handlePincodeChange}
              value={form.pincode}
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

          <div className="flex items-center gap-3 mt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-clay text-ivory rounded-full px-5 py-2.5 text-sm font-medium hover:bg-clay/90 transition-colors disabled:opacity-50 shadow-sm"
            >
              {saving ? "Saving..." : "Save address"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormErrors({});
                setError("");
              }}
              className="text-sm text-ink/50 hover:text-ink transition-colors px-2 py-1"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => {
            setShowForm(true);
            setFormErrors({});
            setError("");
          }}
          className="flex items-center gap-2 text-sm text-clay border border-clay/25 rounded-full px-5 py-2.5 hover:bg-blush transition-colors"
        >
          <FiPlus size={15} /> Add new address
        </button>
      )}
    </div>
  );
}
