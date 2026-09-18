"use client";

import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/")}
      className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-clay transition-colors"
    >
      <FiArrowLeft size={15} />
      Back
    </button>
  );
}