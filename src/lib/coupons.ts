import { supabase } from "./supabase";

export interface CheckoutCoupon {
  code: string;
  title: string;
  description: string;
  discountPercent: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  discountType: "percentage" | "fixed";
  discountValue: number;
}

export async function fetchActiveCoupons(): Promise<CheckoutCoupon[]> {
  const { data, error } = await supabase
    .from("coupons")
    .select("code, description, discount_type, discount_value, max_discount_amount, min_order_amount")
    .eq("is_active", true)
    .eq("is_public", true)
    .order("min_order_amount", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => {
    const discountValue = Number(row.discount_value);
    const minOrder = Number(row.min_order_amount) || 0;
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
