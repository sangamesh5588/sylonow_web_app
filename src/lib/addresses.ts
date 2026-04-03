import { Address } from "../types";
import { supabase } from "./supabase";

type AddressRow = Record<string, unknown>;

const toText = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const toNumber = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

export const mapDbAddressToAddress = (row: AddressRow): Address => {
  const id = toText(row.id) || `address-${Date.now()}`;
  const label =
    toText(row.address_for) ||
    toText(row.label) ||
    "Home";
  const fullAddress =
    toText(row.full_address) ||
    toText(row.address) ||
    [toText(row.house_number), toText(row.landmark), toText(row.area)].filter(Boolean).join(", ");
  const city =
    toText(row.city) ||
    toText(row.area) ||
    "";
  const pincode =
    toText(row.pincode) ||
    toText(row.postal_code) ||
    "";

  return {
    id,
    label: label ? label[0].toUpperCase() + label.slice(1) : "Home",
    houseNumber: toText(row.house_number) || undefined,
    fullAddress,
    landmark: toText(row.landmark) || undefined,
    city,
    pincode,
    latitude: toNumber(row.latitude ?? row.lat),
    longitude: toNumber(row.longitude ?? row.lng),
    placeId: toText(row.place_id) || undefined,
  };
};

export const fetchUserAddresses = async (userId: string): Promise<Address[]> => {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data
    .map((row) => mapDbAddressToAddress(row as AddressRow))
    .filter((address) => address.fullAddress || address.city || address.pincode);
};
