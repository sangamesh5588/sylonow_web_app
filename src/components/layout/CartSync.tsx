import { useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getCartUpdatedEventName, readCart } from "../../lib/booking";
import { syncAbandonedCartSnapshot } from "../../lib/abandonedCart";

export const CartSync = () => {
  const { user, isAuthenticated, profile } = useAuth();
  const lastSyncedSignatureRef = useRef("");

  useEffect(() => {
    if (!isAuthenticated || !user) {
      lastSyncedSignatureRef.current = "";
      return;
    }

    let timeoutId: number | undefined;
    let cancelled = false;

    const syncCart = async () => {
      const items = readCart();
      const status = items.length === 0 ? "archived" : "active";
      const signature = JSON.stringify({
        authUserId: user.id,
        phoneNumber: profile?.phone_number ?? user.phone ?? "",
        fullName: profile?.full_name ?? "",
        keys: items.map((item) => `${item.serviceId}__${item.date}__${item.time}`),
        status,
      });

      if (signature === lastSyncedSignatureRef.current) {
        return;
      }

      try {
        await syncAbandonedCartSnapshot({
          items,
          phoneNumber: profile?.phone_number ?? user.phone ?? null,
          fullName: profile?.full_name ?? null,
          status,
        });

        if (!cancelled) {
          lastSyncedSignatureRef.current = signature;
        }
      } catch (error) {
        console.error("Failed to sync cart snapshot", error);
      }
    };

    const scheduleSync = () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(() => {
        void syncCart();
      }, 500);
    };

    scheduleSync();

    const cartUpdatedEvent = getCartUpdatedEventName();
    window.addEventListener(cartUpdatedEvent, scheduleSync);
    window.addEventListener("storage", scheduleSync);

    return () => {
      cancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      window.removeEventListener(cartUpdatedEvent, scheduleSync);
      window.removeEventListener("storage", scheduleSync);
    };
  }, [isAuthenticated, profile?.full_name, profile?.phone_number, user]);

  return null;
};
