import { Address, Service, Order } from "../types";

export interface BookingDraft {
  serviceId: string;
  date: string;
  time: string;
  price: number;
}

const BOOKING_DRAFT_KEY = "sylonow_booking_draft";
const WISHLIST_KEY = "sylonow_wishlist";

export const getAddressStorageKey = (phoneNumber: string) => `sylonow_addresses_${phoneNumber}`;
export const getOrderStorageKey = (phoneNumber: string) => `sylonow_orders_${phoneNumber}`;

export const readAddresses = (phoneNumber?: string | null): Address[] => {
  if (!phoneNumber) return [];

  const stored = localStorage.getItem(getAddressStorageKey(phoneNumber));
  if (!stored) return [];

  try {
    return JSON.parse(stored) as Address[];
  } catch {
    return [];
  }
};

export const writeAddresses = (phoneNumber: string, addresses: Address[]) => {
  localStorage.setItem(getAddressStorageKey(phoneNumber), JSON.stringify(addresses));
};

export const saveBookingDraft = (draft: BookingDraft) => {
  localStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft));
};

export const readBookingDraft = (): BookingDraft | null => {
  const stored = localStorage.getItem(BOOKING_DRAFT_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as BookingDraft;
  } catch {
    return null;
  }
};

export const clearBookingDraft = () => {
  localStorage.removeItem(BOOKING_DRAFT_KEY);
};

export const readWishlist = (): string[] => {
  const stored = localStorage.getItem(WISHLIST_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored) as string[];
  } catch {
    return [];
  }
};

export const toggleWishlist = (serviceId: string) => {
  const current = readWishlist();
  const next = current.includes(serviceId)
    ? current.filter((id) => id !== serviceId)
    : [...current, serviceId];

  localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
  return next;
};

export const buildBookingSummary = (service: Service, draft: BookingDraft | null) => {
  return {
    service,
    date: draft?.date ?? "",
    time: draft?.time ?? "",
    amount: draft?.price ?? service.price,
  };
};

// Order Management
export const readOrders = (phoneNumber?: string | null): Order[] => {
  if (!phoneNumber) return [];

  const stored = localStorage.getItem(getOrderStorageKey(phoneNumber));
  if (!stored) return [];

  try {
    const orders = JSON.parse(stored) as Order[];
    // Sort by date, newest first
    return orders.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
};

export const writeOrders = (phoneNumber: string, orders: Order[]) => {
  localStorage.setItem(getOrderStorageKey(phoneNumber), JSON.stringify(orders));
};

export const createOrder = (
  phoneNumber: string,
  userId: string,
  service: Service,
  draft: BookingDraft,
  address: Address
): Order => {
  const newOrder: Order = {
    id: `order-${Date.now()}`,
    userId,
    items: [{
      serviceId: service.id,
      service: service,
      selectedAddons: [],
      date: draft.date,
      time: draft.time,
      quantity: 1,
    }],
    totalAmount: draft.price + Math.round(draft.price * 0.05), // Include taxes
    status: "pending",
    address,
    createdAt: new Date().toISOString(),
    scheduledAt: `${draft.date}T${draft.time}`,
  };

  const existingOrders = readOrders(phoneNumber);
  const updatedOrders = [newOrder, ...existingOrders];
  writeOrders(phoneNumber, updatedOrders);

  return newOrder;
};
