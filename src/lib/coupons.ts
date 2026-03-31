export const CHECKOUT_COUPONS = [
  {
    code: "SYLONOW10",
    title: "Flat 10% off",
    description: "Applies on celebration packages",
    discountPercent: 10,
    minOrderAmount: 0,
  },
  {
    code: "PARTY15",
    title: "Save 15%",
    description: "Valid on orders above Rs. 3000",
    discountPercent: 15,
    minOrderAmount: 3000,
  },
  {
    code: "BIRTHDAY20",
    title: "Birthday special",
    description: "Flat 20% off on premium decoration orders",
    discountPercent: 20,
    minOrderAmount: 5000,
  },
  {
    code: "SETUP500",
    title: "Save Rs. 500",
    description: "Effective flat discount on larger bookings",
    discountPercent: 8,
    minOrderAmount: 6000,
  },
] as const;

export type CheckoutCoupon = (typeof CHECKOUT_COUPONS)[number];

export const findCheckoutCoupon = (code?: string | null) => {
  if (!code) return null;
  return CHECKOUT_COUPONS.find((coupon) => coupon.code === code.toUpperCase()) ?? null;
};

export const isCouponAvailableForAmount = (coupon: CheckoutCoupon, amount: number) =>
  amount >= coupon.minOrderAmount;
