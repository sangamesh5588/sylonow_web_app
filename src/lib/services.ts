import { supabase } from "./supabase";
import { Service, Addon } from "../types";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1530103862676-fa8c9d34bb34?w=800&h=1200&fit=crop";

interface DbServiceRow {
  id: string;
  title: string;
  description: string | null;
  original_price: number | null;
  offer_price: number | null;
  customised_price: number | null;
  rating: number | null;
  reviews_count: number | null;
  category: string | null;
  cover_photo: string | null;
  photos: string[] | null;
  inclusions: string[] | null;
  add_ons: Addon[] | null;
  theme_tags: string[] | null;
  area_tags: string[] | null;
  is_featured: boolean | null;
  is_featured_main: boolean | null;
  is_featured_collage: boolean | null;
  is_suggested: boolean | null;
  is_active: boolean | null;
  is_verified: boolean | null;
  latitude: number | null;
  longitude: number | null;
  free_service_km: number | null;
  extra_charges_per_km: number | null;
  booking_notice: string | null;
  booking_terms: Service["bookingTerms"] | null;
}

const SELECT_FIELDS =
  "id, title, description, original_price, offer_price, customised_price, rating, reviews_count, category, cover_photo, photos, inclusions, add_ons, theme_tags, area_tags, is_featured, is_featured_main, is_featured_collage, is_suggested, is_active, is_verified, latitude, longitude, free_service_km, extra_charges_per_km, booking_notice, booking_terms";

function mapRow(row: DbServiceRow): Service {
  const images: string[] = [];
  if (row.cover_photo) images.push(row.cover_photo);
  if (row.photos) images.push(...row.photos);
  if (images.length === 0) images.push(PLACEHOLDER_IMAGE);

  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    price: Number(row.customised_price) || Number(row.offer_price) || 0,
    originalPrice: Number(row.original_price) || undefined,
    rating: Number(row.rating) || 0,
    reviews: row.reviews_count || 0,
    category: row.category || "Other",
    images,
    inclusions: row.inclusions || [],
    addons: row.add_ons || [],
    location: "Bengaluru",
    tags: row.theme_tags || [],
    areaTags: row.area_tags || [],
    trending: row.is_featured || false,
    featuredMain: row.is_featured_main || false,
    featuredCollage: row.is_featured_collage || false,
    isSuggested: row.is_suggested || false,
    latitude: row.latitude ? Number(row.latitude) : undefined,
    longitude: row.longitude ? Number(row.longitude) : undefined,
    freeServiceKm: row.free_service_km ? Number(row.free_service_km) : undefined,
    extraChargesPerKm: row.extra_charges_per_km ? Number(row.extra_charges_per_km) : undefined,
    bookingNotice: row.booking_notice ?? undefined,
    bookingTerms: row.booking_terms ?? undefined,
  };
}

/** Fetch all active services */
export async function fetchAllServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from("service_listings")
    .select(SELECT_FIELDS)
    .eq("is_active", true)
    .eq("is_verified", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as DbServiceRow[]).map(mapRow);
}

/** Fetch services by category */
export async function fetchServicesByCategory(
  category: string
): Promise<Service[]> {
  const { data, error } = await supabase
    .from("service_listings")
    .select(SELECT_FIELDS)
    .eq("is_active", true)
    .eq("is_verified", true)
    .eq("category", category)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as DbServiceRow[]).map(mapRow);
}

/** Fetch featured/trending services */
export async function fetchFeaturedServices(
  limit = 8
): Promise<Service[]> {
  const { data, error } = await supabase
    .from("service_listings")
    .select(SELECT_FIELDS)
    .eq("is_active", true)
    .eq("is_verified", true)
    .eq("is_featured", true)
    .order("rating", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as DbServiceRow[]).map(mapRow);
}

/** Fetch a single service by ID */
export async function fetchServiceById(
  id: string
): Promise<Service | null> {
  const { data, error } = await supabase
    .from("service_listings")
    .select(SELECT_FIELDS)
    .eq("id", id)
    .eq("is_active", true)
    .eq("is_verified", true)
    .single();

  if (error || !data) return null;
  return mapRow(data as DbServiceRow);
}

/** Fetch all distinct active categories */
export async function fetchCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from("service_listings")
    .select("category")
    .eq("is_active", true)
    .eq("is_verified", true);

  if (error || !data) return [];
  const cats = [...new Set(data.map((r: { category: string }) => r.category).filter(Boolean))];
  return cats.sort();
}

export interface HomeSection {
  id: string;
  title: string;
  section_type: "flag" | "area" | "suggested";
  flag_column: string | null;
  min_lat: number | null;
  max_lat: number | null;
  min_lng: number | null;
  max_lng: number | null;
  sort_order: number;
}

/** Fetch all active home sections ordered by sort_order */
export async function fetchHomeSections(): Promise<HomeSection[]> {
  const { data, error } = await supabase
    .from("home_sections")
    .select("id, title, section_type, flag_column, min_lat, max_lat, min_lng, max_lng, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data as HomeSection[];
}

export interface PricingTier {
  price_from: number;
  price_to: number;
  advance_amount: number;
  label: string | null;
}

export async function fetchPricingLogic(): Promise<PricingTier[]> {
  const { data, error } = await supabase
    .from("pricing_logic")
    .select("price_from, price_to, advance_amount, label")
    .eq("is_active", true)
    .order("price_from");
  if (error || !data) return [];
  return data as PricingTier[];
}

export function getAdvanceAmount(tiers: PricingTier[], servicePrice: number): number | null {
  const tier = tiers.find((t) => servicePrice >= t.price_from && servicePrice < t.price_to);
  return tier ? tier.advance_amount : null;
}
