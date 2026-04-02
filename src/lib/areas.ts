import { Service } from "../types";

export function getServicesInArea(
  services: Service[],
  bounds: { min_lat: number; max_lat: number; min_lng: number; max_lng: number }
): Service[] {
  return services.filter(
    (s) =>
      s.latitude != null &&
      s.longitude != null &&
      s.latitude >= bounds.min_lat &&
      s.latitude <= bounds.max_lat &&
      s.longitude >= bounds.min_lng &&
      s.longitude <= bounds.max_lng
  );
}
