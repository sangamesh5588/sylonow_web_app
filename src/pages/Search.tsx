import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui";
import { Search as SearchIcon, ChevronLeft, Heart, Star, SlidersHorizontal, X, Navigation, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "../lib/utils";
import { getResponsiveImageProps } from "../lib/images";
import {
  getCityCenter,
  normalizeCityName,
  readSelectedCity,
  isNearMeActive,
  setNearMeActive,
  readUserCoords,
  writeUserCoords,
  detectCityFromBrowser,
} from "../lib/citySelection";
import { fetchAllServices } from "../lib/services";
import { Service } from "../types";

const TOKEN_ALIASES: Record<string, string> = {
  ballon: "balloon",
  baloon: "balloon",
  balloons: "balloon",
  decorators: "decorator",
  decorations: "decoration",
};

const GENERIC_SEARCH_TOKENS = new Set([
  "near",
  "me",
  "in",
  "at",
  "the",
  "a",
  "an",
  "best",
  "service",
  "services",
  "decorator",
  "decoration",
  "event",
]);

const tokenizeQuery = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((token) => TOKEN_ALIASES[token] || token)
    .filter(Boolean);

const normalizeAreaTitle = (value: string) =>
  value
    .toLowerCase()
    .replace(/^best in\s+/i, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toRadians = (value: number) => (value * Math.PI) / 180;

const getDistanceInKm = (
  from: { latitude: number; longitude: number },
  to: { latitude?: number; longitude?: number }
) => {
  if (to.latitude == null || to.longitude == null) {
    return Number.POSITIVE_INFINITY;
  }

  const earthRadius = 6371;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLng / 2) ** 2;

  return 2 * earthRadius * Math.asin(Math.sqrt(a));
};

const PRICE_FILTERS = [
  { label: "All budgets", value: "all" },
  { label: "Under ₹5,000", value: "under-5000" },
  { label: "₹5,000 – ₹8,000", value: "5000-8000" },
  { label: "Above ₹8,000", value: "above-8000" },
] as const;

const SORT_OPTIONS = [
  { label: "Popular", value: "popular" },
  { label: "Price ↑", value: "price-asc" },
  { label: "Price ↓", value: "price-desc" },
  { label: "Top rated", value: "rating" },
] as const;

type PriceFilter = (typeof PRICE_FILTERS)[number]["value"];
type SortOption = (typeof SORT_OPTIONS)[number]["value"];

const matchesPriceFilter = (price: number, filter: PriceFilter) => {
  if (filter === "all") return true;
  if (filter === "under-5000") return price < 5000;
  if (filter === "5000-8000") return price >= 5000 && price <= 8000;
  if (filter === "above-8000") return price > 8000;
  return true;
};

const SearchCard = ({ service, index }: { service: Service; index: number }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const imageProps = getResponsiveImageProps(service.images[0], {
    widths: [320, 480, 640, 768],
    height: 800,
    quality: 80,
    resize: "cover",
    sizes: "(max-width: 768px) 92vw, (max-width: 1280px) 45vw, 380px",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link to={`/category/${encodeURIComponent(service.category)}/service/${service.id}`} className="block group">
        <article className="overflow-hidden rounded-[22px] border border-[#edf0f4] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.08)] transition-transform duration-300 group-hover:-translate-y-1 md:rounded-[28px] md:shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
          <div className="relative">
            <div className="aspect-[0.9/1] overflow-hidden rounded-b-[24px] rounded-t-[22px] md:aspect-[1.18/1] md:rounded-b-[32px] md:rounded-t-[28px] bg-[#f0f2f5]">
              {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-[#e8eaed]" />}
              <img
                src={imageProps.src}
                srcSet={imageProps.srcSet}
                sizes={imageProps.sizes}
                alt={service.title}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onLoad={() => setImgLoaded(true)}
                className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              />
            </div>

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#14384c]/85 via-[#14384c]/35 to-transparent px-3 pb-3 pt-8 text-white md:px-4 md:pb-5 md:pt-10">
              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/80 md:text-[10px] md:tracking-[0.22em]">
                Limited time offer
              </p>
              <p className="mt-1 text-[11px] font-bold leading-4 md:text-[15px] md:leading-5">
                Flat 29% OFF <span className="font-semibold text-white/85 hidden md:inline">+ 2 more</span>
              </p>
            </div>

            <button
              type="button"
              className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#7b91a3]/85 text-white backdrop-blur-sm md:right-3 md:top-3 md:h-11 md:w-11"
            >
              <Heart size={16} className="md:h-[18px] md:w-[18px]" />
            </button>
          </div>

          <div className="space-y-2 px-3 pb-3 pt-3 md:space-y-3 md:px-4 md:pb-4 md:pt-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2
                  className="overflow-hidden text-[13px] font-bold leading-4 text-[#22313f] md:text-[15px] md:leading-5"
                  style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
                >
                  {service.title}
                </h2>
                <p className="mt-1 truncate text-[12px] text-[#667085] md:text-sm">{service.location}</p>
              </div>
              <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#16a34a] px-2 py-1 text-[11px] font-semibold text-white md:px-2.5 md:text-sm">
                <span>{service.rating.toFixed(1)}</span>
                <Star size={12} className="fill-current" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 text-[12px] text-[#667085] md:text-sm">
              <p className="truncate">{service.category}</p>
              <p className="shrink-0">{service.distance || "2.4km"}</p>
            </div>

            <div className="flex items-end justify-between gap-2">
              <div className="text-[10px] text-[#98a2b3] md:text-xs">
                {service.originalPrice ? <span className="line-through">{formatCurrency(service.originalPrice)}</span> : null}
              </div>
              <p className="text-[14px] font-bold text-[#4c5c68] md:text-[16px]">{formatCurrency(service.price)}</p>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
};

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryFromParams = searchParams.get("search") || searchParams.get("q") || "";
  const searchQuery = queryFromParams.toLowerCase();
  const selectedCity = readSelectedCity().toLowerCase();
  const [searchValue, setSearchValue] = useState(queryFromParams);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceFilters, setPriceFilters] = useState<PriceFilter[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>("popular");
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [nearMe, setNearMe] = useState(() => isNearMeActive());
  const [userCoords, setUserCoords] = useState(() => readUserCoords());
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  // draft state for filter panel
  const [draftPrices, setDraftPrices] = useState<PriceFilter[]>([]);
  const [draftCategories, setDraftCategories] = useState<string[]>([]);
  const [draftSort, setDraftSort] = useState<SortOption>("popular");

  useEffect(() => {
    setSearchValue(queryFromParams);
  }, [queryFromParams]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchAllServices()
      .then((serviceData) => {
        if (!active) return;
        setServices(serviceData);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const allAreaNames = useMemo(
    () =>
      Array.from(
        new Set(
          services.flatMap((service) =>
            (service.areaTags ?? []).map((area) => normalizeAreaTitle(area)).filter(Boolean)
          )
        )
      ),
    [services]
  );

  const baseFilteredServices = useMemo(() => {
    const tokens = tokenizeQuery(queryFromParams);
    const normalizedQuery = queryFromParams
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const matchedAreaNames = allAreaNames.filter((area) => {
      const areaTokens = area.split(" ").filter(Boolean);
      return areaTokens.length > 0 && areaTokens.every((token) => normalizedQuery.includes(token));
    });
    const matchedAreaTokenSet = new Set(matchedAreaNames.flatMap((area) => area.split(" ").filter(Boolean)));
    const meaningfulTokens = tokens.filter(
      (token) => !GENERIC_SEARCH_TOKENS.has(token) && !matchedAreaTokenSet.has(token)
    );
    const hasNearMeIntent = /\bnear me\b/i.test(queryFromParams);
    const cityCenter = getCityCenter(selectedCity);
    const areaScopedServices =
      matchedAreaNames.length > 0
        ? services.filter((service) =>
            matchedAreaNames.some((area) =>
              (service.areaTags ?? []).some((serviceArea) => normalizeAreaTitle(serviceArea) === area)
            )
          )
        : services;

    const matchedServices = areaScopedServices.filter((service) => {
      const haystack = [
        service.title,
        service.description,
        service.category,
        service.location,
        ...(service.tags || []),
        ...(service.areaTags || []),
      ]
        .join(" ")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ");

      const matchesMeaningfulTokens =
        meaningfulTokens.length === 0 || meaningfulTokens.every((token) => haystack.includes(token));
      const matchesFullQuery = !searchQuery || haystack.includes(searchQuery) || matchesMeaningfulTokens;
      const matchesSelectedCity =
        !hasNearMeIntent || !selectedCity || normalizeCityName(service.location).toLowerCase().includes(selectedCity);

      return matchesFullQuery && matchesSelectedCity;
    });

    if (!hasNearMeIntent) return matchedServices;
    return [...matchedServices].sort((a, b) => {
      const distanceA = getDistanceInKm(cityCenter, a);
      const distanceB = getDistanceInKm(cityCenter, b);
      return distanceA - distanceB;
    });
  }, [allAreaNames, queryFromParams, searchQuery, selectedCity, services]);

  const availableCategories = useMemo(
    () => Array.from(new Set(baseFilteredServices.map((s) => s.category).filter(Boolean))).sort(),
    [baseFilteredServices]
  );

  const filteredServices = useMemo(() => {
    let results = baseFilteredServices.filter((s) => {
      const priceOk = priceFilters.length === 0 || priceFilters.some((f) => matchesPriceFilter(s.price, f));
      const catOk = categoryFilters.length === 0 || categoryFilters.includes(s.category);
      return priceOk && catOk;
    });
    if (nearMe && userCoords) {
      return [...results].sort((a, b) =>
        getDistanceInKm(userCoords, a) - getDistanceInKm(userCoords, b)
      );
    }
    if (sortOption === "price-asc") results = [...results].sort((a, b) => a.price - b.price);
    else if (sortOption === "price-desc") results = [...results].sort((a, b) => b.price - a.price);
    else if (sortOption === "rating") results = [...results].sort((a, b) => b.rating - a.rating);
    return results;
  }, [baseFilteredServices, priceFilters, categoryFilters, sortOption, nearMe, userCoords]);

  const handleNearMeToggle = async () => {
    if (nearMe) {
      setNearMe(false);
      setNearMeActive(false);
      setLocationError("");
      return;
    }
    const cached = readUserCoords();
    if (cached) {
      setUserCoords(cached);
      setNearMe(true);
      setNearMeActive(true);
      return;
    }
    setDetectingLocation(true);
    setLocationError("");
    try {
      const { coords, city } = await detectCityFromBrowser();
      writeUserCoords(coords);
      setUserCoords(coords);
      setNearMe(true);
      setNearMeActive(true);
      if (city) {
        // update stored city silently
        const { writeSelectedCity } = await import("../lib/citySelection");
        writeSelectedCity(city);
      }
    } catch {
      const msg = "Could not detect your location. Please allow location access.";
      setLocationError(msg);
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(`/search?search=${encodeURIComponent(searchValue.trim())}`);
  };

  return (
    <div className="pb-8 pt-[68px] md:pt-6 space-y-4">
      {/* Fixed search bar — mobile only */}
      <div className="md:hidden fixed inset-x-0 top-0 z-50 bg-white px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 transition-all active:scale-90"
          >
            <ChevronLeft size={22} className="text-[#0B4964]" />
          </button>
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder='Search "Decorations"'
              className="h-10 w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-[#22313f] focus:border-[#0B4964] focus:outline-none"
            />
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </form>
        </div>
      </div>

      {/* Desktop header */}
      <div className="hidden md:block space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-[#0B4964]">
          {searchQuery ? `Search results for "${searchQuery}"` : "Search decorations"}
        </h1>
        <p className="text-sm text-gray-400">{filteredServices.length} results found</p>
      </div>

      {/* Mobile result label */}
      {queryFromParams && (
        <p className="md:hidden text-sm text-gray-400 truncate">
          <span className="font-medium text-[#0B4964]">"{searchQuery}"</span>
          {" · "}{filteredServices.length} results
        </p>
      )}

      {queryFromParams && (
        <div className="flex items-center gap-3">
          {/* Filter button */}
          <button
            type="button"
            onClick={() => {
              setDraftPrices(priceFilters);
              setDraftCategories(categoryFilters);
              setDraftSort(sortOption);
              setIsFilterOpen(true);
            }}
            className="flex items-center gap-2 rounded-full border border-[#e4e7ec] bg-white px-4 py-2.5 text-sm font-semibold text-[#344054] transition hover:border-[#0B4964] relative"
          >
            <SlidersHorizontal size={16} />
            Filter
            {(priceFilters.length > 0 || categoryFilters.length > 0) && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#FB2965] text-[10px] font-bold text-white">
                {priceFilters.length + categoryFilters.length}
              </span>
            )}
          </button>
          {/* Sort + Near Me chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
            <button
              type="button"
              onClick={handleNearMeToggle}
              disabled={detectingLocation}
              className={`shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors border ${
                nearMe
                  ? "bg-[#0B4964] text-white border-[#0B4964]"
                  : "bg-white text-[#344054] border-[#e4e7ec] hover:border-[#0B4964]"
              }`}
            >
              {detectingLocation
                ? <Loader2 size={13} className="animate-spin" />
                : <Navigation size={13} className={nearMe ? "text-white" : "text-gray-500"} />
              }
              Near Me
            </button>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSortOption(opt.value)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors border ${
                  sortOption === opt.value
                    ? "bg-[#0B4964] text-white border-[#0B4964]"
                    : "bg-white text-[#344054] border-[#e4e7ec] hover:border-[#0B4964]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {locationError ? <p className="text-xs text-red-500 mt-1">{locationError}</p> : null}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B4964] border-t-transparent" />
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
          {filteredServices.map((service, index) => (
            <SearchCard key={service.id} service={service} index={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
            <SearchIcon size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#0B4964]">No results found</h2>
            <p className="text-gray-500 max-w-xs">
              We couldn't find any decorations matching your search. Try different keywords.
            </p>
          </div>
          <Link to="/">
            <Button variant="outline">Go back home</Button>
          </Link>
        </div>
      )}

      {/* Filter panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 z-40 bg-[#1a1a1a]/35 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 32 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="fixed inset-x-0 bottom-0 z-[70] max-h-[75vh] overflow-y-auto rounded-t-[32px] bg-white p-5 shadow-2xl md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[85vh] md:w-[560px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[32px]"
            >
              <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[#e4e7ec] md:hidden" />
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#0B4964]">Filter results</h2>
                  <p className="text-sm text-[#6b7680]">Refine by category, price, and sort.</p>
                </div>
                <button type="button" onClick={() => setIsFilterOpen(false)} className="rounded-full p-2 text-[#68727a] hover:bg-[#f8fafc]">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-6 pb-24">
                {/* Sort */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#98a2b3]">Sort by</p>
                  <div className="divide-y divide-[#f2f4f7] rounded-2xl border border-[#edf0f4] overflow-hidden">
                    {SORT_OPTIONS.map((opt) => {
                      const checked = draftSort === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setDraftSort(checked ? "popular" : opt.value)}
                          className="flex w-full items-center justify-between px-4 py-3.5 text-left transition hover:bg-[#fafcff]"
                        >
                          <span className={`text-sm font-medium ${checked ? "text-[#0B4964]" : "text-[#344054]"}`}>{opt.label}</span>
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-2 transition ${checked ? "border-[#0B4964] bg-[#0B4964]" : "border-[#d0d5dd] bg-white"}`}>
                            {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Category */}
                {availableCategories.length > 1 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#98a2b3]">Category</p>
                    <div className="divide-y divide-[#f2f4f7] rounded-2xl border border-[#edf0f4] overflow-hidden">
                      {availableCategories.map((cat) => {
                        const checked = draftCategories.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setDraftCategories(checked ? draftCategories.filter((c) => c !== cat) : [...draftCategories, cat])}
                            className="flex w-full items-center justify-between px-4 py-3.5 text-left transition hover:bg-[#fafcff]"
                          >
                            <span className={`text-sm font-medium ${checked ? "text-[#0B4964]" : "text-[#344054]"}`}>{cat}</span>
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-2 transition ${checked ? "border-[#0B4964] bg-[#0B4964]" : "border-[#d0d5dd] bg-white"}`}>
                              {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Price */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#98a2b3]">Price range</p>
                  <div className="divide-y divide-[#f2f4f7] rounded-2xl border border-[#edf0f4] overflow-hidden">
                    {PRICE_FILTERS.filter((f) => f.value !== "all").map((opt) => {
                      const checked = draftPrices.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setDraftPrices(checked ? draftPrices.filter((p) => p !== opt.value) : [...draftPrices, opt.value])}
                          className="flex w-full items-center justify-between px-4 py-3.5 text-left transition hover:bg-[#fafcff]"
                        >
                          <span className={`text-sm font-medium ${checked ? "text-[#FB2965]" : "text-[#344054]"}`}>{opt.label}</span>
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-2 transition ${checked ? "border-[#FB2965] bg-[#FB2965]" : "border-[#d0d5dd] bg-white"}`}>
                            {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-[-20px] -mx-5 flex gap-3 border-t border-[#eef2f6] bg-white px-5 pt-4 pb-8">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setDraftPrices([]);
                    setDraftCategories([]);
                    setDraftSort("popular");
                    setPriceFilters([]);
                    setCategoryFilters([]);
                    setSortOption("popular");
                    setIsFilterOpen(false);
                  }}
                >
                  Reset
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setPriceFilters(draftPrices);
                    setCategoryFilters(draftCategories);
                    setSortOption(draftSort);
                    setIsFilterOpen(false);
                  }}
                >
                  Apply filters
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchPage;
