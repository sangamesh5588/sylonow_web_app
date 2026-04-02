import { Service } from "../types";

const SELECTED_CITY_KEY = "sylonow_selected_city";
const USER_COORDS_KEY = "sylonow_user_coords";
const NEAR_ME_KEY = "sylonow_near_me";

const BENGALURU_CENTER = {
  city: "Bengaluru",
  latitude: 12.9250,
  longitude: 77.5938,
};

export const normalizeCityName = (city: string) => {
  const normalized = city.trim().toLowerCase();

  if (normalized === "bangalore" || normalized === "bengaluru") {
    return "Bengaluru";
  }

  return city.trim();
};

export const readSelectedCity = (): string => {
  if (typeof window === "undefined") return BENGALURU_CENTER.city;
  return normalizeCityName(localStorage.getItem(SELECTED_CITY_KEY) || BENGALURU_CENTER.city);
};

export const writeSelectedCity = (city: string) => {
  if (typeof window === "undefined") return;

  if (city) {
    localStorage.setItem(SELECTED_CITY_KEY, normalizeCityName(city));
    return;
  }

  localStorage.removeItem(SELECTED_CITY_KEY);
};

export const getCityCenter = (city: string) => {
  if (normalizeCityName(city) === BENGALURU_CENTER.city) {
    return BENGALURU_CENTER;
  }

  return BENGALURU_CENTER;
};

export const getSelectableCities = (services: Service[]): string[] =>
  Array.from(
    new Set(
      services
        .map((service) => normalizeCityName(service.location.split(",")[0] || ""))
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

export interface UserCoords {
  latitude: number;
  longitude: number;
}

export const readUserCoords = (): UserCoords | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_COORDS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const writeUserCoords = (coords: UserCoords | null) => {
  if (typeof window === "undefined") return;
  if (coords) {
    localStorage.setItem(USER_COORDS_KEY, JSON.stringify(coords));
  } else {
    localStorage.removeItem(USER_COORDS_KEY);
  }
};

export const isNearMeActive = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(NEAR_ME_KEY) === "1";
};

export const setNearMeActive = (active: boolean) => {
  if (typeof window === "undefined") return;
  if (active) {
    localStorage.setItem(NEAR_ME_KEY, "1");
  } else {
    localStorage.removeItem(NEAR_ME_KEY);
  }
};

/** Haversine distance in km between two lat/lng points */
export const distanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Check the browser geolocation permission state without triggering a prompt.
 * Returns "granted" | "denied" | "prompt" | "unknown"
 */
export const getLocationPermissionState = async (): Promise<"granted" | "denied" | "prompt" | "unknown"> => {
  try {
    if (!navigator.permissions) return "unknown";
    const result = await navigator.permissions.query({ name: "geolocation" });
    return result.state as "granted" | "denied" | "prompt";
  } catch {
    return "unknown";
  }
};

/**
 * Detect approximate city from IP address (no permission needed).
 * Uses ipapi.co — supports HTTPS and CORS from browsers.
 */
export const detectCityFromIP = async (): Promise<{ city: string; coords: UserCoords } | null> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: controller.signal });
    const json = await res.json();
    if (!json.latitude || !json.longitude) return null;
    return {
      city: normalizeCityName(json.city || ""),
      coords: { latitude: json.latitude, longitude: json.longitude },
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Requests GPS from the browser and reverse-geocodes to a city name via
 * the Google Maps Geocoding API. Returns the city string or null on failure.
 */
export const detectCityFromBrowser = (): Promise<{ city: string; coords: UserCoords }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords: UserCoords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };

        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          resolve({ city: "", coords });
          return;
        }

        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${apiKey}&result_type=locality`
          );
          const json = await res.json();
          const locality =
            json.results?.[0]?.address_components?.find((c: any) =>
              c.types.includes("locality")
            )?.long_name || "";

          const city = locality ? normalizeCityName(locality) : "";
          resolve({ city, coords });
        } catch {
          resolve({ city: "", coords });
        }
      },
      (err) => reject(err),
      { timeout: 10000, maximumAge: 300_000 }
    );
  });
};
