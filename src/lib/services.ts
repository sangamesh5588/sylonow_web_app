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
  is_featured: boolean | null;
  is_active: boolean | null;
  is_verified: boolean | null;
}

const SELECT_FIELDS =
  "id, title, description, original_price, offer_price, customised_price, rating, reviews_count, category, cover_photo, photos, inclusions, add_ons, theme_tags, is_featured, is_active, is_verified";

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
    location: "Bangalore",
    tags: row.theme_tags || [],
    trending: row.is_featured || false,
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
