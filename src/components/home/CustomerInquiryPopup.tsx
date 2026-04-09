import { AnimatePresence, motion } from "motion/react";
import { ChevronRight, Phone, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import {
  CustomerInquirySource,
  submitCustomerInquiry,
} from "../../lib/customerInquiries";

const OCCASION_OPTIONS = [
  "Birthday",
  "Anniversary",
  "Bride To Be",
  "Baby Shower",
  "Haladi",
  "Naming Ceremony",
  "Other",
] as const;

const BUDGET_OPTIONS = [
  "Below Rs 5,000",
  "Rs 5,000 - Rs 10,000",
  "Rs 10,000 - Rs 20,000",
  "Rs 20,000 - Rs 35,000",
  "Above Rs 35,000",
] as const;

interface CustomerInquiryPopupProps {
  open: boolean;
  onClose: () => void;
  source: CustomerInquirySource;
}

export const CustomerInquiryPopup = ({
  open,
  onClose,
  source,
}: CustomerInquiryPopupProps) => {
  const { user, profile } = useAuth();
  const [occasion, setOccasion] = useState("");
  const [otherOccasion, setOtherOccasion] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setOccasion("");
    setOtherOccasion("");
    setBudgetRange("");
    setPhoneNumber(profile?.phone_number?.replace(/\D/g, "").slice(-10) ?? "");
  }, [open, profile?.phone_number]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const cleanPhone = phoneNumber.replace(/\D/g, "").slice(0, 10);

    if (!occasion) {
      toast.error("Select an occasion");
      return;
    }

    if (occasion === "Other" && !otherOccasion.trim()) {
      toast.error("Enter the occasion type");
      return;
    }

    if (!budgetRange) {
      toast.error("Select a budget range");
      return;
    }

    if (cleanPhone.length !== 10) {
      toast.error("Enter a valid 10-digit number");
      return;
    }

    setSubmitting(true);

    const { error } = await submitCustomerInquiry({
      authUserId: user?.id ?? null,
      source,
      occasion,
      otherOccasion: occasion === "Other" ? otherOccasion : null,
      budgetInput: budgetRange,
      phoneNumber: `+91 ${cleanPhone}`,
      metadata: {
        trigger: source,
      },
    });

    setSubmitting(false);

    if (error) {
      toast.error("Could not save your request");
      return;
    }

    toast.success("Thanks. Our team will reach out shortly.");
    localStorage.setItem("inquiry_popup_seen", "1");
    onClose();
  };

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
          <motion.button
            type="button"
            aria-label="Close inquiry popup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0f172a]/35 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 22, scale: 0.98 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="relative z-10 w-full max-w-[500px] rounded-[28px] border border-[#e7edf2] bg-white px-4 pb-5 pt-4 shadow-[0_22px_60px_rgba(15,23,42,0.22)] md:rounded-[32px] md:px-7 md:pb-7 md:pt-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="max-w-md pr-2">
                <h2 className="text-[1.55rem] font-bold tracking-tight leading-[1.08] text-[#0B4964] md:text-[32px]">
                  Need help finding the right decoration?
                </h2>
                <p className="mt-2 max-w-sm text-[14px] leading-6 text-[#667085] md:text-base md:leading-7">
                  Share your occasion, budget range, and phone number. Our team will help you with a suitable setup.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close inquiry popup"
                className="rounded-full border border-[#e7edf2] p-2 text-[#667085] transition hover:bg-[#f8fbfd] hover:text-[#12384a]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                  Occasion
                </label>
                <select
                  value={occasion}
                  onChange={(event) => {
                    const nextOccasion = event.target.value;
                    setOccasion(nextOccasion);
                    if (nextOccasion !== "Other") setOtherOccasion("");
                  }}
                  className="h-11 w-full rounded-2xl border border-[#e5eaf0] bg-white px-4 text-sm text-[#22313f] outline-none transition focus:border-[#FB2965] focus:ring-4 focus:ring-[#FB2965]/10"
                >
                  <option value="">Select occasion</option>
                  {OCCASION_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {occasion === "Other" ? (
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                    Type occasion
                  </label>
                  <input
                    type="text"
                    value={otherOccasion}
                    onChange={(event) => setOtherOccasion(event.target.value)}
                    placeholder="Enter occasion"
                    className="h-11 w-full rounded-2xl border border-[#e5eaf0] bg-white px-4 text-sm text-[#22313f] outline-none transition focus:border-[#FB2965] focus:ring-4 focus:ring-[#FB2965]/10"
                  />
                </div>
              ) : null}

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                  Budget range
                </label>
                <select
                  value={budgetRange}
                  onChange={(event) => setBudgetRange(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-[#e5eaf0] bg-white px-4 text-sm text-[#22313f] outline-none transition focus:border-[#FB2965] focus:ring-4 focus:ring-[#FB2965]/10"
                >
                  <option value="">Select budget range</option>
                  {BUDGET_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                  Phone number
                </label>
                <div className="flex h-11 items-center rounded-2xl border border-[#e5eaf0] bg-white px-4 transition focus-within:border-[#FB2965] focus-within:ring-4 focus-within:ring-[#FB2965]/10">
                  <span className="pr-2 text-sm font-semibold text-[#344054]">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phoneNumber}
                    onChange={(event) =>
                      setPhoneNumber(
                        event.target.value.replace(/\D/g, "").slice(0, 10)
                      )
                    }
                    placeholder="Enter 10-digit number"
                    className="w-full border-0 bg-transparent text-sm text-[#22313f] outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#FB2965] text-sm font-semibold text-white transition hover:bg-[#e91e5a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>{submitting ? "Submitting..." : "Submit request"}</span>
                  {!submitting ? <ChevronRight size={16} /> : null}
                </button>
                <a
                  href="tel:+919035954662"
                  className="flex h-11 items-center justify-center gap-1.5 rounded-2xl border border-[#e5eaf0] px-4 text-sm font-semibold text-[#0B4964] transition hover:bg-[#f8fbfd]"
                >
                  <Phone size={15} />
                  Call now
                </a>
              </div>
            </form>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};
