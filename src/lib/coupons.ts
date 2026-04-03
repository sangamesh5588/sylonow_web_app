import { supabase } from "./supabase";
import { formatCurrency } from "./utils";

export interface CheckoutCoupon {
  code: string;
  title: string;
  description: string;
  discountPercent: number;
  minOrderAmount: number;
  maxOrderAmount: number | null;
  maxDiscountAmount: number | null;
  discountType: "percentage" | "fixed";
  discountValue: number;
}

export async function fetchActiveCoupons(): Promise<CheckoutCoupon[]> {
  const { data, error } = await supabase
    .from("coupons")
    .select("code, description, discount_type, discount_value, max_discount_amount, min_order_amount, max_order_amount")
    .eq("is_active", true)
    .eq("is_public", true)
    .order("min_order_amount", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => {
    const discountValue = Number(row.discount_value);
    const minOrder = Number(row.min_order_amount) || 0;
    const maxOrder = row.max_order_amount ? Number(row.max_order_amount) : null;
    const maxDiscount = row.max_discount_amount ? Number(row.max_discount_amount) : null;
    const isPercent = row.discount_type === "percentage";

    // Build a human-readable title
    const title = isPercent
      ? `${discountValue}% off${maxDiscount ? ` up to ₹${maxDiscount}` : ""}`
      : `Flat ₹${discountValue} off`;

    return {
      code: row.code,
      title,
      description: row.description || "",
      discountPercent: isPercent ? discountValue : 0,
      minOrderAmount: minOrder,
      maxOrderAmount: maxOrder,
      maxDiscountAmount: maxDiscount,
      discountType: row.discount_type as "percentage" | "fixed",
      discountValue,
    };
  });
}

export const findCoupon = (coupons: CheckoutCoupon[], code?: string | null) => {
  if (!code) return null;
  return coupons.find((c) => c.code === code.toUpperCase()) ?? null;
};

export const isCouponAvailableForAmount = (coupon: CheckoutCoupon, amount: number) =>
  amount >= coupon.minOrderAmount;

export const calcDiscount = (coupon: CheckoutCoupon, amount: number): number => {
  if (coupon.discountType === "fixed") return Math.min(coupon.discountValue, amount);
  const raw = Math.round(amount * (coupon.discountPercent / 100));
  return coupon.maxDiscountAmount ? Math.min(raw, coupon.maxDiscountAmount) : raw;
};

export const getCouponAvailabilityMessage = (coupon: CheckoutCoupon) => {
  if (coupon.minOrderAmount > 0) {
    return `Coupon valid on orders from ${formatCurrency(coupon.minOrderAmount)}`;
  }

  return "Coupon is not valid for this booking amount";
};

const getCouponDistanceFromAmount = (coupon: CheckoutCoupon, amount: number) => {
  if (amount < coupon.minOrderAmount) return coupon.minOrderAmount - amount;
  return 0;
};

export const sortCouponsForAmount = (coupons: CheckoutCoupon[], amount: number) =>
  [...coupons].sort((a, b) => {
    const aAvailable = isCouponAvailableForAmount(a, amount);
    const bAvailable = isCouponAvailableForAmount(b, amount);

    if (aAvailable !== bAvailable) return aAvailable ? -1 : 1;

    const aDiscount = aAvailable ? calcDiscount(a, amount) : 0;
    const bDiscount = bAvailable ? calcDiscount(b, amount) : 0;
    if (aDiscount !== bDiscount) return bDiscount - aDiscount;

    const aDistance = getCouponDistanceFromAmount(a, amount);
    const bDistance = getCouponDistanceFromAmount(b, amount);
    if (aDistance !== bDistance) return aDistance - bDistance;

    if (a.minOrderAmount !== b.minOrderAmount) return a.minOrderAmount - b.minOrderAmount;
    return a.code.localeCompare(b.code);
  });
