import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  BriefcaseBusiness,
  ChevronDown,
  Crosshair,
  Home,
  LoaderCircle,
  MapPinned,
  MapPinHouse,
  Search,
  User,
  X,
} from "lucide-react";
import { Address } from "../../types";
import { GOOGLE_MAPS_API_KEY, loadGoogleMaps, parseAddressComponents } from "../../lib/googleMaps";
import { Button, Input } from "../ui";

export interface AddressDraft extends Omit<Address, "id"> {}

interface AddressPickerProps {
  value: AddressDraft;
  onChange: (next: AddressDraft) => void;
}

const DEFAULT_CENTER = { lat: 19.076, lng: 72.8777 };

const ADDRESS_TYPES = [
  { label: "Home", icon: Home },
  { label: "Office", icon: BriefcaseBusiness },
  { label: "Friend", icon: User },
] as const;

export const AddressPicker = ({ value, onChange }: AddressPickerProps) => {
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);
  const latestValueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  const [loading, setLoading] = useState(Boolean(GOOGLE_MAPS_API_KEY));
  const [error, setError] = useState("");
  const initialSearchValue = value.fullAddress;
  const [isMapExpanded, setIsMapExpanded] = useState(!(value.latitude && value.longitude));
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    latestValueRef.current = value;
    onChangeRef.current = onChange;
  }, [value, onChange]);

  useEffect(() => {
    if (value.latitude && value.longitude) {
      setIsMapExpanded(false);
    }
  }, [value.latitude, value.longitude]);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const reverseGeocode = (location: { lat: number; lng: number }, placeId?: string) => {
      const google = (window as any).google;
      const currentValue = latestValueRef.current;

      if (!google || !geocoderRef.current) {
        // No geocoder — still save lat/lng
        onChangeRef.current({ ...currentValue, latitude: location.lat, longitude: location.lng });
        setIsMapExpanded(false);
        return;
      }

      geocoderRef.current.geocode({ location }, (results: any[], status: string) => {
        const latest = latestValueRef.current;

        if (status !== "OK" || !results?.[0]) {
          // Geocoding failed — still save lat/lng
          onChangeRef.current({ ...latest, latitude: location.lat, longitude: location.lng });
          setIsMapExpanded(false);
          return;
        }

        const primary = results[0];
        const parsed = parseAddressComponents(primary.address_components);

        onChangeRef.current({
          ...latest,
          fullAddress: primary.formatted_address || latest.fullAddress,
          city: parsed.city || latest.city,
          pincode: parsed.pincode || latest.pincode,
          houseNumber: parsed.houseNumber || latest.houseNumber || "",
          latitude: location.lat,
          longitude: location.lng,
          placeId: placeId || primary.place_id || latest.placeId,
        });
        setIsMapExpanded(false);
      });
    };

    const initValue = latestValueRef.current;

    loadGoogleMaps()
      .then((google) => {
        // Wait for the modal animation to finish so the map div has dimensions
        return new Promise<any>((resolve) => setTimeout(() => resolve(google), 350));
      })
      .then((google) => {
        if (cancelled || !mapRef.current) return;

        const center =
          initValue.latitude && initValue.longitude
            ? { lat: initValue.latitude, lng: initValue.longitude }
            : DEFAULT_CENTER;

        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom: initValue.latitude && initValue.longitude ? 16 : 12,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
          styles: [
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] },
          ],
        });

        const marker = new google.maps.Marker({
          position: center,
          map,
          draggable: true,
        });

        geocoderRef.current = new google.maps.Geocoder();
        mapInstanceRef.current = map;
        markerRef.current = marker;

        map.addListener("click", (event: any) => {
          const lat = event.latLng?.lat();
          const lng = event.latLng?.lng();
          if (typeof lat !== "number" || typeof lng !== "number") return;
          marker.setPosition({ lat, lng });
          reverseGeocode({ lat, lng });
        });

        marker.addListener("dragend", (event: any) => {
          const lat = event.latLng?.lat();
          const lng = event.latLng?.lng();
          if (typeof lat !== "number" || typeof lng !== "number") return;
          reverseGeocode({ lat, lng });
        });

        if (searchInputRef.current) {
          const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
            fields: ["formatted_address", "geometry", "place_id", "address_components"],
          });

          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            const location = place.geometry?.location;
            if (!location) return;

            const lat = location.lat();
            const lng = location.lng();
            const parsed = parseAddressComponents(place.address_components || []);
            const currentValue = latestValueRef.current;

            map.panTo({ lat, lng });
            map.setZoom(16);
            marker.setPosition({ lat, lng });

            onChangeRef.current({
              ...currentValue,
              fullAddress: place.formatted_address || currentValue.fullAddress,
              city: parsed.city || currentValue.city,
              pincode: parsed.pincode || currentValue.pincode,
              houseNumber: parsed.houseNumber || currentValue.houseNumber || "",
              latitude: lat,
              longitude: lng,
              placeId: place.place_id || currentValue.placeId,
            });
            setIsMapExpanded(false);
          });

          autocompleteRef.current = autocomplete;
        }

        setLoading(false);
      })
      .catch((loadError) => {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load Google Maps");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    if (typeof value.latitude !== "number" || typeof value.longitude !== "number") return;

    const position = { lat: value.latitude, lng: value.longitude };
    mapInstanceRef.current.panTo(position);
    markerRef.current.setPosition(position);
  }, [value.latitude, value.longitude]);

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser");
      return;
    }

    setError("");
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.panTo(next);
          mapInstanceRef.current.setZoom(16);
          markerRef.current.setPosition(next);
        }

        const google = (window as any).google;
        if (google && geocoderRef.current) {
          geocoderRef.current.geocode({ location: next }, (results: any[], status: string) => {
            setIsLocating(false);
            const currentValue = latestValueRef.current;

            if (status !== "OK" || !results?.[0]) {
              // Geocoding API may not be enabled — still save lat/lng
              onChangeRef.current({
                ...currentValue,
                latitude: next.lat,
                longitude: next.lng,
              });
              setIsMapExpanded(false);
              return;
            }

            const primary = results[0];
            const parsed = parseAddressComponents(primary.address_components);

            onChangeRef.current({
              ...currentValue,
              fullAddress: primary.formatted_address || currentValue.fullAddress,
              city: parsed.city || currentValue.city,
              pincode: parsed.pincode || currentValue.pincode,
              houseNumber: parsed.houseNumber || currentValue.houseNumber || "",
              latitude: next.lat,
              longitude: next.lng,
              placeId: primary.place_id || currentValue.placeId,
            });
            setIsMapExpanded(false);
          });
        } else {
          setIsLocating(false);
          // No geocoder yet — still save lat/lng
          const currentValue = latestValueRef.current;
          onChangeRef.current({
            ...currentValue,
            latitude: next.lat,
            longitude: next.lng,
          });
        }
      },
      () => {
        setIsLocating(false);
        setError("Unable to access your current location");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const hasPickedLocation = Boolean(value.fullAddress || (value.latitude && value.longitude));

  return (
    <div className="overflow-hidden rounded-[30px] border border-[#e6e8ef] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <div className={`${isMapExpanded ? "block" : "hidden"} relative h-[280px] overflow-hidden bg-[#f4f5f7]`}>
        {GOOGLE_MAPS_API_KEY ? (
          <div ref={mapRef} className="h-full w-full" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <AlertCircle size={28} className="text-[#f79009]" />
            <p className="max-w-sm text-sm text-[#667085]">
              Add `VITE_GOOGLE_MAPS_API_KEY` in `.env.local` to enable Google Maps search and map address selection.
            </p>
          </div>
        )}

        <div className="absolute inset-x-0 top-0 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/95 text-[#0B4964] shadow-sm">
              <MapPinned size={20} />
            </div>
            <div className="relative flex-1">
              <Input
                ref={searchInputRef}
                defaultValue={initialSearchValue}
                placeholder={
                  GOOGLE_MAPS_API_KEY
                    ? "Search for area, street name..."
                    : "Google Maps API key required"
                }
                className="h-12 rounded-full border-0 bg-white/95 pl-11 pr-10 shadow-sm"
                disabled={!GOOGLE_MAPS_API_KEY}
              />
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98a2b3]" />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleCurrentLocation}
              className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-[#0B4964] shadow-sm"
              disabled={!GOOGLE_MAPS_API_KEY || isLocating}
            >
              {isLocating ? <LoaderCircle size={14} className="animate-spin" /> : <Crosshair size={14} />}
              Use current location
            </button>
          </div>
        </div>

        {loading && GOOGLE_MAPS_API_KEY ? (
          <div className="absolute right-4 top-20 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs text-[#667085] shadow-sm">
            <LoaderCircle size={14} className="animate-spin" />
            Loading map
          </div>
        ) : null}
      </div>

      <div className="rounded-t-[30px] bg-white px-5 py-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[28px] font-bold tracking-tight text-[#22313f]">Address details</h3>
            <p className="mt-1 max-w-sm text-sm leading-6 text-[#667085]">
              Complete address would assist better us in serving you
            </p>
          </div>
          <button type="button" className="rounded-2xl bg-[#f4f6fb] p-2 text-[#667085]">
            <X size={16} />
          </button>
        </div>

        {hasPickedLocation ? (
          <div className="mt-5 rounded-[24px] border border-[#d8e6f2] bg-[#f5fbff] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-2xl bg-white p-2 text-[#0B4964] shadow-sm">
                  <MapPinHouse size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0B4964]">Selected address</p>
                  <p className="mt-1 text-sm leading-6 text-[#526070]">
                    {value.fullAddress || "Pin selected on map"}
                  </p>
                  {value.city || value.pincode ? (
                    <p className="mt-1 text-xs text-[#667085]">
                      {[value.city, value.pincode].filter(Boolean).join(" - ")}
                    </p>
                  ) : null}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full px-3 text-[#0B4964]"
                onClick={() => setIsMapExpanded((current) => !current)}
              >
                {isMapExpanded ? "Hide map" : "Change"}
                <ChevronDown size={14} className={`ml-2 transition-transform ${isMapExpanded ? "rotate-180" : ""}`} />
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsMapExpanded(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#dbe2ea] px-4 py-2 text-sm font-medium text-[#0B4964]"
          >
            <MapPinned size={16} />
            Open map picker
          </button>
        )}

        <div className="mt-5">
          <p className="mb-3 text-sm font-medium text-[#98a2b3]">Select address type</p>
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {ADDRESS_TYPES.map((item) => {
              const isActive = value.label === item.label;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => onChange({ ...value, label: item.label })}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium transition ${
                    isActive
                      ? "border-[#93c5fd] bg-[#edf5ff] text-[#0B4964]"
                      : "border-[#dbe2ea] bg-white text-[#667085]"
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#667085]">Flat / House No*</label>
            <div className="relative">
              <Input
                value={value.houseNumber || ""}
                onChange={(event) => onChange({ ...value, houseNumber: event.target.value })}
                placeholder="19/111"
                className="h-14 rounded-2xl border-[#c8d2de] pr-10"
              />
              {(value.houseNumber || "").length > 0 ? (
                <button
                  type="button"
                  onClick={() => onChange({ ...value, houseNumber: "" })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[#eef2f6] p-1 text-[#667085]"
                >
                  <X size={14} />
                </button>
              ) : null}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#667085]">Complete address *</label>
            <Input
              value={value.fullAddress}
              onChange={(event) => onChange({ ...value, fullAddress: event.target.value })}
              placeholder="Apartment, building, street"
              className="h-14 rounded-2xl border-[#dbe2ea]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#667085]">Nearby Landmark (optional)</label>
            <Input
              value={value.landmark || ""}
              onChange={(event) => onChange({ ...value, landmark: event.target.value })}
              placeholder="Temple, metro station, mall"
              className="h-14 rounded-2xl border-[#dbe2ea]"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#667085]">City</label>
              <Input
                value={value.city}
                onChange={(event) => onChange({ ...value, city: event.target.value })}
                placeholder="City"
                className="h-14 rounded-2xl border-[#dbe2ea]"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#667085]">Pincode</label>
              <Input
                value={value.pincode}
                onChange={(event) => onChange({ ...value, pincode: event.target.value })}
                placeholder="Pincode"
                className="h-14 rounded-2xl border-[#dbe2ea]"
              />
            </div>
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
      </div>
    </div>
  );
};
