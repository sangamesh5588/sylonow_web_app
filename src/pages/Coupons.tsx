import { ChevronLeft, Percent, TicketPercent } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Card, Button } from "../components/ui";
import { CheckoutCoupon, fetchActiveCoupons, findCoupon, isCouponAvailableForAmount, calcDiscount } from "../lib/coupons";
import { formatCurrency } from "../lib/utils";

const Coupons = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const amount = Number(searchParams.get("amount") ?? 0);
  const returnTo = searchParams.get("returnTo") ?? "/checkout";
  const appliedCouponCode = searchParams.get("coupon");

  const [coupons, setCoupons] = useState<CheckoutCoupon[]>([]);
  const appliedCoupon = findCoupon(coupons, appliedCouponCode);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    fetchActiveCoupons().then(setCoupons);
  }, []);

  const handleApply = (code: string) => {
    const nextCoupon = findCoupon(coupons, code);
    if (!nextCoupon) return;
    if (!isCouponAvailableForAmount(nextCoupon, amount)) {
      toast.error(`Coupon valid on orders above ${formatCurrency(nextCoupon.minOrderAmount)}`);
      return;
    }

    navigate(`${returnTo}?coupon=${code}`);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 pb-24">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0B4964] shadow-sm ring-1 ring-[#eadfdb]"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#FB2965]">Coupons</p>
          <h1 className="text-lg font-semibold text-[#0B4964] sm:text-xl">Available coupons</h1>
          <p className="mt-1 text-sm text-[#667085]">Select a coupon to apply to your booking.</p>
        </div>
      </div>

      <Card className="border border-[#f0e7e2] p-4 shadow-none">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf5ff] text-[#0B4964]">
            <Percent size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#22313f]">Booking amount</p>
            <p className="text-sm text-[#667085]">{formatCurrency(amount)}</p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {coupons.map((coupon) => {
          const isApplied = appliedCoupon?.code === coupon.code;
          const isAvailable = isCouponAvailableForAmount(coupon, amount);
          const savings = calcDiscount(coupon, amount);

          return (
            <Card
              key={coupon.code}
              className={`border p-5 shadow-none ${
                isApplied
                  ? "border-[#0B4964] bg-[#f5fbff]"
                  : isAvailable
                    ? "border-[#eadfdb] bg-white"
                    : "border-[#eaecf0] bg-[#f8fafc]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff4ed] text-[#0B4964]">
                      <TicketPercent size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#98a2b3]">{coupon.title}</p>
                      <h2 className="text-lg font-semibold text-[#22313f]">{coupon.code}</h2>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-[#475467]">{coupon.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#eefbf3] px-3 py-1 text-xs font-medium text-[#157f3d]">
                      Save {formatCurrency(savings)}
                    </span>
                    {coupon.minOrderAmount > 0 ? (
                      <span className="rounded-full bg-[#f8fafc] px-3 py-1 text-xs font-medium text-[#667085]">
                        Min order {formatCurrency(coupon.minOrderAmount)}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="shrink-0">
                  <Button
                    type="button"
                    variant={isApplied ? "primary" : "secondary"}
                    className="rounded-full px-4"
                    disabled={!isAvailable}
                    onClick={() => handleApply(coupon.code)}
                  >
                    {isApplied ? "Applied" : isAvailable ? "Apply" : "Unavailable"}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Coupons;
