import { CartItem } from "../types";
import { getCartItemKey } from "./booking";
import { supabase } from "./supabase";

export type AbandonedCartStatus = "active" | "archived" | "converted";
const GUEST_CART_SESSION_KEY = "sylonow_guest_cart_session_id";

interface AbandonedCartSnapshotItem {
  cart_key: string;
  service_id: string;
  title: string;
  category: string;
  image: string | null;
  booking_date: string;
  booking_time: string;
  quantity: number;
  unit_price: number;
  addon_names: string[];
  addon_total: number;
  line_total: number;
}

interface SyncAbandonedCartSnapshotInput {
  items: CartItem[];
  authUserId?: string | null;
  guestSessionId?: string | null;
  phoneNumber?: string | null;
  fullName?: string | null;
  status?: AbandonedCartStatus;
}

export const getGuestCartSessionId = () => {
  const existing = localStorage.getItem(GUEST_CART_SESSION_KEY);
  if (existing) return existing;

  const nextId = crypto.randomUUID();
  localStorage.setItem(GUEST_CART_SESSION_KEY, nextId);
  return nextId;
};

const getSelectedAddonNames = (item: CartItem) =>
  item.selectedAddons
    .map((addonId) => item.service.addons.find((addon) => addon.id === addonId)?.name)
    .filter((addonName): addonName is string => Boolean(addonName));

const getSelectedAddonTotal = (item: CartItem) =>
  item.selectedAddons.reduce((sum, addonId) => {
    const addonPrice = item.service.addons.find((addon) => addon.id === addonId)?.price ?? 0;
    return sum + addonPrice;
  }, 0);

export const buildAbandonedCartSnapshot = (items: CartItem[]) => {
  const snapshotItems: AbandonedCartSnapshotItem[] = items.map((item) => {
    const quantity = item.quantity || 1;
    const addonNames = getSelectedAddonNames(item);
    const addonTotal = getSelectedAddonTotal(item);
    const lineTotal = (item.service.price + addonTotal) * quantity;

    return {
      cart_key: getCartItemKey(item),
      service_id: item.service.id,
      title: item.service.title,
      category: item.service.category,
      image: item.service.images[0] ?? null,
      booking_date: item.date,
      booking_time: item.time,
      quantity,
      unit_price: item.service.price,
      addon_names: addonNames,
      addon_total: addonTotal,
      line_total: lineTotal,
    };
  });

  const cartTotal = snapshotItems.reduce((sum, item) => sum + item.line_total, 0);
  const cartFingerprint = snapshotItems
    .map((item) => item.cart_key)
    .sort()
    .join("|");

  return {
    snapshotItems,
    cartTotal,
    itemCount: snapshotItems.length,
    cartFingerprint,
  };
};

export const syncAbandonedCartSnapshot = async ({
  items,
  authUserId,
  guestSessionId,
  phoneNumber,
  fullName,
  status,
}: SyncAbandonedCartSnapshotInput) => {
  const { snapshotItems, cartTotal, itemCount, cartFingerprint } =
    buildAbandonedCartSnapshot(items);

  const resolvedStatus: AbandonedCartStatus =
    status ?? (itemCount === 0 ? "archived" : "active");

  const rpcPayload = {
    p_cart_items: snapshotItems,
    p_item_count: itemCount,
    p_cart_total: cartTotal,
    p_cart_fingerprint: cartFingerprint,
    p_phone_number: phoneNumber ?? null,
    p_full_name: fullName ?? null,
    p_recovery_url:
      typeof window !== "undefined" ? `${window.location.origin}/cart` : null,
    p_metadata: {
      source: "web-app",
      synced_at: new Date().toISOString(),
    },
    p_status: resolvedStatus,
    p_guest_session_id: guestSessionId ?? null,
  };

  const { error } = await supabase.rpc("upsert_abandoned_cart_snapshot", rpcPayload);

  if (!error) {
    return;
  }

  const missingRpc =
    error.message?.toLowerCase().includes("upsert_abandoned_cart_snapshot") ||
    error.message?.toLowerCase().includes("could not find the function") ||
    error.code === "PGRST202";

  if (!missingRpc) {
    throw error;
  }

  if (!authUserId) {
    throw error;
  }

  const now = new Date().toISOString();

  const directPayload = {
    auth_user_id: authUserId,
    phone_number: phoneNumber ?? null,
    full_name: fullName ?? null,
    cart_items: snapshotItems,
    cart_fingerprint: cartFingerprint,
    item_count: itemCount,
    cart_total: cartTotal,
    status: resolvedStatus,
    recovery_url: typeof window !== "undefined" ? `${window.location.origin}/cart` : null,
    metadata: {
      source: "web-app",
      synced_at: now,
    },
    last_activity_at: now,
    converted_at: resolvedStatus === "converted" ? now : null,
  };

  const { error: upsertError } = await supabase
    .from("abandoned_carts")
    .upsert(directPayload, { onConflict: "auth_user_id" });

  if (upsertError) {
    throw upsertError;
  }

  if (resolvedStatus === "active") {
    const { error: resetError } = await supabase
      .from("abandoned_carts")
      .update({
        first_abandoned_at: null,
        last_notified_at: null,
        notification_count: 0,
        converted_at: null,
        last_activity_at: now,
      })
      .eq("auth_user_id", authUserId);

    if (resetError) {
      throw resetError;
    }
  }
};
