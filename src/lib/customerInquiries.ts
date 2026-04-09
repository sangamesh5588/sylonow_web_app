import { supabase } from "./supabase";

export type CustomerInquirySource = "home_popup" | "support_fab";
export const OPEN_CUSTOMER_INQUIRY_EVENT = "sylonow:open-customer-inquiry";

export interface CustomerInquiryPayload {
  authUserId?: string | null;
  source: CustomerInquirySource;
  occasion: string;
  otherOccasion?: string | null;
  budgetInput: string;
  phoneNumber: string;
  pagePath?: string;
  metadata?: Record<string, unknown>;
}

export async function submitCustomerInquiry(payload: CustomerInquiryPayload) {
  const { error } = await supabase.from("customer_inquiries").insert({
    auth_user_id: payload.authUserId ?? null,
    source: payload.source,
    occasion: payload.occasion.trim(),
    other_occasion: payload.otherOccasion?.trim() || null,
    budget_input: payload.budgetInput.trim(),
    phone_number: payload.phoneNumber.trim(),
    page_path: payload.pagePath ?? window.location.pathname,
    metadata: payload.metadata ?? {},
  });

  return { error };
}

export function openCustomerInquiryPopup(source: CustomerInquirySource = "home_popup") {
  window.dispatchEvent(
    new CustomEvent(OPEN_CUSTOMER_INQUIRY_EVENT, {
      detail: { source },
    })
  );
}
