import { supabase } from "./supabase";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, callback: (payload: any) => void) => void;
    };
  }
}

const RAZORPAY_SDK_URL = "https://checkout.razorpay.com/v1/checkout.js";
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;

export interface RazorpayOrderPayload {
  id: string;
  amount: number;
  currency: string;
}

export interface RazorpayCheckoutSuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

let sdkPromise: Promise<void> | null = null;

export const loadRazorpaySdk = async (): Promise<void> => {
  if (window.Razorpay) return;
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_SDK_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Razorpay SDK")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });

  return sdkPromise;
};

export const createRazorpayOrder = async (payload: {
  amount: number;
  serviceId: string;
  serviceTitle: string;
  bookingDate: string;
  bookingTime: string;
  phoneNumber: string;
  couponCode?: string | null;
}) => {
  const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
    body: payload,
  });

  if (error) {
    throw new Error(error.message || "Failed to create Razorpay order");
  }

  if (!data?.order?.id) {
    throw new Error("Razorpay order was not returned");
  }

  return data.order as RazorpayOrderPayload;
};

export const verifyRazorpayPayment = async (payload: RazorpayCheckoutSuccess) => {
  const { data, error } = await supabase.functions.invoke("verify-razorpay-payment", {
    body: payload,
  });

  if (error) {
    throw new Error(error.message || "Failed to verify Razorpay payment");
  }

  if (!data?.verified) {
    throw new Error(data?.error || "Razorpay payment verification failed");
  }

  return data;
};

export const openRazorpayCheckout = async (payload: {
  order: RazorpayOrderPayload;
  name: string;
  description: string;
  phoneNumber: string;
  email?: string;
}): Promise<RazorpayCheckoutSuccess> => {
  if (!RAZORPAY_KEY_ID) {
    throw new Error("Missing VITE_RAZORPAY_KEY_ID in env");
  }

  await loadRazorpaySdk();

  if (!window.Razorpay) {
    throw new Error("Razorpay SDK not available");
  }

  return new Promise((resolve, reject) => {
    let settled = false;

    const done = (value: RazorpayCheckoutSuccess) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    const fail = (message: string) => {
      if (settled) return;
      settled = true;
      reject(new Error(message));
    };

    const razorpay = new window.Razorpay({
      key: RAZORPAY_KEY_ID,
      amount: payload.order.amount,
      currency: payload.order.currency,
      name: payload.name,
      description: payload.description,
      order_id: payload.order.id,
      handler: (response: RazorpayCheckoutSuccess) => done(response),
      modal: {
        ondismiss: () => fail("Payment cancelled"),
      },
      prefill: {
        contact: payload.phoneNumber,
        email: payload.email,
      },
      theme: {
        color: "#0B4964",
      },
    });

    razorpay.on("payment.failed", (response: any) => {
      const message =
        response?.error?.description ||
        response?.error?.reason ||
        response?.error?.step ||
        "Payment failed";
      fail(message);
    });

    razorpay.open();
  });
};
