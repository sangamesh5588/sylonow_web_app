import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowDownUp,
  Check,
  ChevronLeft,
  MapPin,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { SERVICES } from "../services/mockData";
import { Button } from "../components/ui";
import { ServiceCard } from "../components/ServiceCard";
import { CATEGORIES } from "../services/mockData";
import { Category } from "../types";

const LOCATIONS = Array.from(new Set(SERVICES.map((service) => service.location)));
const PRICE_OPTIONS = [
  { label: "Under Rs. 5,000", value: "under-5000" },
  { label: "Rs. 5,000 - Rs. 8,000", value: "5000-8000" },
  { label: "Above Rs. 8,000", value: "above-8000" },
] as const;
const SORT_OPTIONS = [
  { label: "Popularity", value: "popular" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
  { label: "Top rated", value: "rating" },
] as const;

type PriceFilter = (typeof PRICE_OPTIONS)[number]["value"] | "all";
type SortFilter = (typeof SORT_OPTIONS)[number]["value"];

const matchesPriceRange = (price: number, priceFilter: PriceFilter) => {
  if (priceFilter === "under-5000") return price < 5000;
  if (priceFilter === "5000-8000") return price >= 5000 && price <= 8000;
  if (priceFilter === "above-8000") return price > 8000;
  return true;
};

const CategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
  const initialCategory = (searchParams.get("category") as Category | null) || (categoryName as Category | undefined) || "Birthday";
  const initialLocation = searchParams.get("location") || "all";
  const initialPrice = (searchParams.get("price") as PriceFilter | null) || "all";
  const initialSort = (searchParams.get("sort") as SortFilter | null) || "popular";

  const [searchValue, setSearchValue] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<Category>(initialCategory);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [selectedPrice, setSelectedPrice] = useState<PriceFilter>(initialPrice);
  const [selectedSort, setSelectedSort] = useState<SortFilter>(initialSort);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [draftCategory, setDraftCategory] = useState<Category>(initialCategory);
  const [draftLocation, setDraftLocation] = useState(initialLocation);
  const [draftPrice, setDraftPrice] = useState<PriceFilter>(initialPrice);

  useEffect(() => {
    setSearchValue(initialSearch);
    setSelectedCategory(initialCategory);
    setSelectedLocation(initialLocation);
    setSelectedPrice(initialPrice);
    setSelectedSort(initialSort);
    setDraftCategory(initialCategory);
    setDraftLocation(initialLocation);
    setDraftPrice(initialPrice);
  }, [initialCategory, initialLocation, initialPrice, initialSearch, initialSort]);

  const filteredServices = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase();

    const results = SERVICES.filter((service) => {
      const matchesCategory = service.category === selectedCategory;
      const matchesSearch = normalizedQuery
        ? service.title.toLowerCase().includes(normalizedQuery) ||
          service.description.toLowerCase().includes(normalizedQuery) ||
          service.tags?.some((tag) => tag.toLowerCase().includes(normalizedQuery))
        : true;
      const matchesLocation = selectedLocation === "all" ? true : service.location === selectedLocation;
      const matchesPrice = matchesPriceRange(service.price, selectedPrice);

      return matchesCategory && matchesSearch && matchesLocation && matchesPrice;
    });

    return results.sort((a, b) => {
      if (selectedSort === "price-asc") return a.price - b.price;
      if (selectedSort === "price-desc") return b.price - a.price;
      if (selectedSort === "rating") return b.rating - a.rating;
      if (Number(b.trending) !== Number(a.trending)) return Number(b.trending) - Number(a.trending);
      return b.rating - a.rating;
    });
  }, [searchValue, selectedCategory, selectedLocation, selectedPrice, selectedSort]);

  const syncParams = (updates: Record<string, string>) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all" || (key === "sort" && value === "popular")) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    });

    setSearchParams(nextParams, { replace: true });
  };

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
    setDraftCategory(category);
    syncParams({ category, search: searchValue.trim(), location: selectedLocation, price: selectedPrice, sort: selectedSort });
    navigate(`/category/${encodeURIComponent(category)}?${new URLSearchParams({
      ...(searchValue.trim() ? { search: searchValue.trim() } : {}),
      ...(selectedLocation !== "all" ? { location: selectedLocation } : {}),
      ...(selectedPrice !== "all" ? { price: selectedPrice } : {}),
      ...(selectedSort !== "popular" ? { sort: selectedSort } : {}),
    }).toString()}`, { replace: true });
  };

  const handleSortChange = (sort: SortFilter) => {
    setSelectedSort(sort);
    syncParams({ category: selectedCategory, search: searchValue.trim(), location: selectedLocation, price: selectedPrice, sort });
  };

  const applyFilters = () => {
    setSelectedCategory(draftCategory);
    setSelectedLocation(draftLocation);
    setSelectedPrice(draftPrice);
    setIsFilterOpen(false);
    navigate(`/category/${encodeURIComponent(draftCategory)}?${new URLSearchParams({
      ...(searchValue.trim() ? { search: searchValue.trim() } : {}),
      ...(draftLocation !== "all" ? { location: draftLocation } : {}),
      ...(draftPrice !== "all" ? { price: draftPrice } : {}),
      ...(selectedSort !== "popular" ? { sort: selectedSort } : {}),
    }).toString()}`, { replace: true });
  };

  const resetFilters = () => {
    setDraftCategory(selectedCategory);
    setDraftLocation("all");
    setDraftPrice("all");
    setSelectedLocation("all");
    setSelectedPrice("all");
    navigate(`/category/${encodeURIComponent(selectedCategory)}${searchValue.trim() ? `?search=${encodeURIComponent(searchValue.trim())}` : ""}`, { replace: true });
    setIsFilterOpen(false);
  };

  const activeFilterCount = Number(selectedLocation !== "all") + Number(selectedPrice !== "all");

  return (
    <div className="space-y-6 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-x-auto no-scrollbar"
      >
        <div className="flex min-w-max items-center gap-3 pb-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0B4964] shadow-sm ring-1 ring-[#eadfdb] transition hover:-translate-x-0.5"
          >
            <ChevronLeft size={20} />
          </button>
          <motion.div layout className="flex min-w-max gap-2">
            {CATEGORIES.map((category) => {
              const isActive = category === selectedCategory;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryChange(category)}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-[#0B4964] bg-[#0B4964] text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-[#0B4964]"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </motion.div>
        </div>
      </motion.div>

      <div className="sticky top-0 z-30 bg-white py-1">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full bg-white hover:border-[#0B4964] transition-colors whitespace-nowrap"
          >
            <SlidersHorizontal size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 rounded-full bg-[#FB2965] px-2 py-0.5 text-[11px] text-white">{activeFilterCount}</span>
            )}
          </button>
          {SORT_OPTIONS.map((option) => {
            const isActive = option.value === selectedSort;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSortChange(option.value)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-full transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-[#0B4964] bg-[#0B4964] text-white"
                    : "border-gray-300 bg-white hover:border-[#0B4964]"
                }`}
              >
                {option.value === "popular" && <ArrowDownUp size={16} className={isActive ? "text-white" : "text-gray-600"} />}
                <span className={`text-sm font-medium ${isActive ? "text-white" : "text-gray-700"}`}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#fb2965]">{filteredServices.length} curated options</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B4964]">{selectedCategory} setups near you</h1>
        </div>
        {selectedLocation !== "all" ? (
          <div className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-[#0B4964] shadow-sm ring-1 ring-[#eadfdb] md:flex">
            <MapPin size={14} />
            {selectedLocation}
          </div>
        ) : null}
      </div>

      {filteredServices.length > 0 ? (
        <motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              layout
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: index * 0.04 }}
            >
              <ServiceCard service={service} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[28px] bg-white p-10 text-center shadow-sm ring-1 ring-[#eadfdb]"
        >
          <h2 className="text-xl font-bold text-[#0B4964]">No decoration packages match this filter</h2>
          <p className="mt-2 text-sm text-[#6b7680]">Try a different category, location, or price range.</p>
          <Button variant="outline" className="mt-5" onClick={resetFilters}>Clear filters</Button>
        </motion.div>
      )}

      <AnimatePresence>
        {isFilterOpen ? (
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
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] bg-[#fffaf8] p-5 shadow-2xl md:inset-auto md:left-1/2 md:top-1/2 md:w-[560px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[32px]"
            >
              <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[#e6d8d2] md:hidden" />
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#0B4964]">Filter decorations</h2>
                  <p className="text-sm text-[#6b7680]">Refine by category, location, and price.</p>
                </div>
                <button type="button" onClick={() => setIsFilterOpen(false)} className="rounded-full p-2 text-[#68727a] hover:bg-white">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="mb-3 text-sm font-semibold text-[#0B4964]">Category</p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setDraftCategory(category)}
                        className={`rounded-full px-4 py-2 text-sm transition ${
                          draftCategory === category
                            ? "bg-[#0B4964] text-white"
                            : "bg-white text-[#0B4964] ring-1 ring-[#eadfdb]"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold text-[#0B4964]">Location</p>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    <button
                      type="button"
                      onClick={() => setDraftLocation("all")}
                      className={`rounded-2xl px-4 py-3 text-sm transition ${
                        draftLocation === "all"
                          ? "bg-[#fff0f4] text-[#d81b60] ring-1 ring-[#ffd0dd]"
                          : "bg-white text-[#0B4964] ring-1 ring-[#eadfdb]"
                      }`}
                    >
                      All cities
                    </button>
                    {LOCATIONS.map((location) => (
                      <button
                        key={location}
                        type="button"
                        onClick={() => setDraftLocation(location)}
                        className={`rounded-2xl px-4 py-3 text-sm transition ${
                          draftLocation === location
                            ? "bg-[#fff0f4] text-[#d81b60] ring-1 ring-[#ffd0dd]"
                            : "bg-white text-[#0B4964] ring-1 ring-[#eadfdb]"
                        }`}
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold text-[#0B4964]">Price range</p>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setDraftPrice("all")}
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm transition ${
                        draftPrice === "all"
                          ? "bg-[#fff0f4] text-[#d81b60] ring-1 ring-[#ffd0dd]"
                          : "bg-white text-[#0B4964] ring-1 ring-[#eadfdb]"
                      }`}
                    >
                      All budgets
                      {draftPrice === "all" ? <Check size={16} /> : null}
                    </button>
                    {PRICE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setDraftPrice(option.value)}
                        className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm transition ${
                          draftPrice === option.value
                            ? "bg-[#fff0f4] text-[#d81b60] ring-1 ring-[#ffd0dd]"
                            : "bg-white text-[#0B4964] ring-1 ring-[#eadfdb]"
                        }`}
                      >
                        {option.label}
                        {draftPrice === option.value ? <Check size={16} /> : null}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={resetFilters}>Reset</Button>
                <Button className="flex-1" onClick={applyFilters}>Apply filters</Button>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default CategoryPage;
