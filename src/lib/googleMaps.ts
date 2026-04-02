const GOOGLE_MAPS_SCRIPT_ID = "sylonow-google-maps-script";

export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const loadGoogleMaps = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window is unavailable"));
  }

  if ((window as any).google?.maps) {
    return Promise.resolve((window as any).google);
  }

  const existing = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    // Script already in DOM — if google.maps loaded, resolve immediately
    if ((window as any).google?.maps) {
      return Promise.resolve((window as any).google);
    }
    // Still loading, wait for it
    return new Promise<any>((resolve, reject) => {
      existing.addEventListener("load", () => resolve((window as any).google));
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps")));
    });
  }

  return new Promise<any>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve((window as any).google);
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
};

export const parseAddressComponents = (components: any[] = []) => {
  const find = (type: string) =>
    components.find((component) => component.types?.includes(type))?.long_name || "";

  const houseNumber =
    find("subpremise") ||
    find("premise") ||
    find("street_number") ||
    "";

  return {
    city: find("locality") || find("administrative_area_level_2") || find("administrative_area_level_1"),
    pincode: find("postal_code"),
    houseNumber,
  };
};
