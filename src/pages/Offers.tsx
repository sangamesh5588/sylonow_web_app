import { Percent, Copy, Check, ArrowRight, TicketPercent } from "lucide-react";
import { useEffect, useState } from "react";
import SEO from "../components/SEO";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { toast } from "sonner";
import { CheckoutCoupon, fetchActiveCoupons, calcDiscount } from "../lib/coupons";
import { formatCurrency } from "../lib/utils";

const CARD_GRADIENTS = [
  "from-[#741EFF]/15 to-[#FF4F81]/15",
  "from-[#0B4164]/15 to-[#741EFF]/15",
  "from-[#FF4F81]/15 to-[#FFD93D]/15",
  "from-[#0ea5e9]/15 to-[#6366f1]/15",
];

const Offers = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<CheckoutCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveCoupons().then((data) => {
      setCoupons(data);
      setLoading(false);
    });
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      toast.success(`Copied: ${code}`);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const handleApply = (code: string) => {
    navigate(`/cart?coupon=${code}`);
  };

  return (
    <div className="pt-3 pb-24 space-y-6 md:py-8">
      <SEO
        title="Exclusive Offers & Coupons on Decoration Packages"
        description="Get the best deals on birthday decoration, anniversary setups & surprise packages in Bangalore. Apply exclusive coupon codes and save on every booking."
        canonical="/offers"
      />
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#FFD93D] rounded-2xl flex items-center justify-center text-black shrink-0">
          <Percent size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B4964]">Exclusive offers</h1>
          <p className="text-sm text-[#667085]">Apply any coupon at checkout</p>
        </div>
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-[24px] bg-[#f4f6f8] p-6 space-y-4">
              <div className="h-5 w-40 rounded-full bg-[#e8eaed]" />
              <div className="h-4 w-56 rounded-full bg-[#e8eaed]" />
              <div className="flex gap-3 pt-1">
                <div className="h-9 w-36 rounded-xl bg-[#e8eaed]" />
                <div className="h-9 w-28 rounded-xl bg-[#e8eaed]" />
              </div>
              <div className="h-12 w-full rounded-2xl bg-[#e8eaed]" />
            </div>
          ))}
        </div>
      )}

      {/* Coupon cards */}
      {!loading && (
        <div className="space-y-4">
          {coupons.map((coupon, i) => {
            const isCopied = copiedCode === coupon.code;
            const gradient = CARD_GRADIENTS[i % CARD_GRADIENTS.length];
            const exampleSaving = calcDiscount(coupon, coupon.minOrderAmount > 0 ? coupon.minOrderAmount : 5000);

            return (
              <motion.div
                key={coupon.code}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.25 }}
              >
                <div className="relative overflow-hidden rounded-[24px] bg-white shadow-[0_4px_24px_rgba(15,23,42,0.07)] ring-1 ring-[#f0e7e2]">
                  {/* Gradient blob */}
                  <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${gradient} rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none`} />

                  <div className="relative z-10 p-5 space-y-4">
                    {/* Title + icon */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff4ed] text-[#0B4964]">
                        <TicketPercent size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#98a2b3]">{coupon.title}</p>
                        <p className="mt-0.5 text-sm text-[#475467] leading-snug">{coupon.description}</p>
                      </div>
                    </div>

                    {/* Code row */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 rounded-xl border border-dashed border-[#c8d0d8] bg-[#f8fafc] px-4 py-2">
                        <span className="text-sm font-bold tracking-widest text-[#22313f]">{coupon.code}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(coupon.code)}
                          className="flex items-center gap-1 text-[#741EFF] text-xs font-bold tracking-wide hover:text-[#5b0ed4] transition-colors"
                        >
                          {isCopied ? <Check size={13} /> : <Copy size={13} />}
                          {isCopied ? "Copied" : "Copy"}
                        </button>
                      </div>
                      {coupon.minOrderAmount > 0 ? (
                        <span className="text-[11px] font-semibold text-[#667085]">
                          Min order {formatCurrency(coupon.minOrderAmount)}
                        </span>
                      ) : null}
                    </div>

                    {/* Savings badge */}
                    {exampleSaving > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        <span className="rounded-full bg-[#eefbf3] px-3 py-1 text-xs font-semibold text-[#157f3d]">
                          Save up to {formatCurrency(exampleSaving)}
                        </span>
                      </div>
                    )}

                    {/* Apply button */}
                    <button
                      type="button"
                      onClick={() => handleApply(coupon.code)}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl border border-[#c8d0d8] bg-white py-3 text-sm font-semibold text-[#0B4964] transition-colors hover:bg-[#0B4964] hover:text-white hover:border-[#0B4964] active:scale-[0.98]"
                    >
                      Apply Offer <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && coupons.length === 0 && (
        <div className="rounded-[24px] bg-[#f8fafc] p-10 text-center ring-1 ring-[#eaecf0]">
          <p className="text-sm font-semibold text-[#667085]">No active offers right now.</p>
          <p className="mt-1 text-xs text-[#98a2b3]">Check back soon for new deals.</p>
        </div>
      )}
    </div>
  );
};

export default Offers;
