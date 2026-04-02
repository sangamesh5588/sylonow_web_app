import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import SEO from "../components/SEO";
import { AnimatePresence, motion } from "motion/react";
import {
  MapPin,
  Navigation,
  X,
} from "lucide-react";
import { Button } from "../components/ui";
import { ServiceCard } from "../components/ServiceCard";
import { Category, Service } from "../types";
import { CategoryTopSection } from "../components/category/CategoryTopSection";
import { fetchAllServices, fetchCategories } from "../lib/services";
import { isNearMeActive, setNearMeActive, readUserCoords, distanceKm } from "../lib/citySelection";

const PRICE_OPTIONS = [

  { label: "Under Rs. 5,000", value: "under-5000" },

  { label: "Rs. 5,000 - Rs. 8,000", value: "5000-8000" },

  { label: "Above Rs. 8,000", value: "above-8000" },

] as const;

const PRICE_SLIDER_OPTIONS = [
  { label: "All budgets", value: "all", caption: "Show every package" },
  { label: "Under Rs. 5,000", value: "under-5000", caption: "Budget-friendly picks" },
  { label: "Rs. 5,000 - Rs. 8,000", value: "5000-8000", caption: "Balanced premium range" },
  { label: "Above Rs. 8,000", value: "above-8000", caption: "Luxury setups" },
] as const;

const SORT_OPTIONS = [

  { label: "Price: low to high", value: "price-asc" },

  { label: "Price: high to low", value: "price-desc" },

  { label: "Top rated", value: "rating" },

] as const;



type PriceFilter = (typeof PRICE_OPTIONS)[number]["value"] | "all";

type SortFilter = (typeof SORT_OPTIONS)[number]["value"];

const getPriceSliderIndex = (priceFilter: PriceFilter) =>
  PRICE_SLIDER_OPTIONS.findIndex((option) => option.value === priceFilter);



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

  const [allServices, setAllServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAllServices(), fetchCategories()]).then(([services, cats]) => {
      setAllServices(services);
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  const locations = useMemo(
    () => Array.from(new Set(allServices.map((s) => s.location).filter(Boolean))),
    [allServices]
  );

  const initialSearch = searchParams.get("search") || "";

  const initialCategory = (searchParams.get("category") as Category | null) || (categoryName as Category | undefined) || (categories[0] || "Birthday");

  const initialLocation = searchParams.get("location") || "all";

  const initialPrice = (searchParams.get("price") as PriceFilter | null) || "all";

  const initialSort = (searchParams.get("sort") as SortFilter | null) || "price-asc";



  const [searchValue, setSearchValue] = useState(initialSearch);

  const [selectedCategory, setSelectedCategory] = useState<Category>(initialCategory);

  const [selectedLocation, setSelectedLocation] = useState(initialLocation);

  const [selectedPrice, setSelectedPrice] = useState<PriceFilter>(initialPrice);

  const [selectedSort, setSelectedSort] = useState<SortFilter>(initialSort);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [draftCategory, setDraftCategory] = useState<Category>(initialCategory);

  const [draftLocation, setDraftLocation] = useState(initialLocation);

  const [draftPrice, setDraftPrice] = useState<PriceFilter>(initialPrice);

  const [draftNearMe, setDraftNearMe] = useState(() => isNearMeActive() && searchParams.get("nearMe") === "1");

  const stickySentinelRef = useRef<HTMLDivElement | null>(null);
  const [isTopSectionSticky, setIsTopSectionSticky] = useState(false);
  const [nearMe, setNearMe] = useState(() => isNearMeActive() && searchParams.get("nearMe") === "1");
  const userCoords = useMemo(() => readUserCoords(), []);



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

  // Sync nearMe from URL
  useEffect(() => {
    const active = isNearMeActive() && searchParams.get("nearMe") === "1";
    setNearMe(active);
    setDraftNearMe(active);
  }, [searchParams]);



  useEffect(() => {
    const handleScroll = () => {
      const sentinel = stickySentinelRef.current;
      if (!sentinel) return;

      setIsTopSectionSticky(sentinel.getBoundingClientRect().top <= 0);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  const filteredServices = useMemo(() => {

    const normalizedQuery = searchValue.trim().toLowerCase();

    const results = allServices.filter((service: Service) => {

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

    if (nearMe && userCoords) {
      return results
        .map((s) => ({
          service: s,
          dist:
            s.latitude != null && s.longitude != null
              ? distanceKm(userCoords.latitude, userCoords.longitude, s.latitude, s.longitude)
              : Infinity,
        }))
        .sort((a, b) => a.dist - b.dist)
        .map(({ service }) => service);
    }

    return results.sort((a, b) => {

      if (selectedSort === "price-asc") return a.price - b.price;

      if (selectedSort === "price-desc") return b.price - a.price;

      if (selectedSort === "rating") return b.rating - a.rating;

      if (Number(b.trending) !== Number(a.trending)) return Number(b.trending) - Number(a.trending);

      return b.rating - a.rating;

    });

  }, [allServices, searchValue, selectedCategory, selectedLocation, selectedPrice, selectedSort, nearMe, userCoords]);



  const syncParams = (updates: Record<string, string>) => {

    const nextParams = new URLSearchParams(searchParams);



    Object.entries(updates).forEach(([key, value]) => {

      if (!value || value === "all") {

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

      ...(selectedSort ? { sort: selectedSort } : {}),

    }).toString()}`, { replace: true });

  };



  const handleSortChange = (sort: SortFilter) => {

    setSelectedSort(sort);

    syncParams({ category: selectedCategory, search: searchValue.trim(), location: selectedLocation, price: selectedPrice, sort });

  };

  const buildCategoryRoute = ({
    category,
    search,
    location,
    price,
    sort,
  }: {
    category: Category;
    search: string;
    location: string;
    price: PriceFilter;
    sort: SortFilter;
  }) => {
    const nextParams = new URLSearchParams({
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(location !== "all" ? { location } : {}),
      ...(price !== "all" ? { price } : {}),
      ...(sort ? { sort } : {}),
    });

    const queryString = nextParams.toString();
    return `/category/${encodeURIComponent(category)}${queryString ? `?${queryString}` : ""}`;
  };



  const applyFilters = () => {
    setSelectedCategory(draftCategory);
    setSelectedLocation(draftNearMe ? "all" : draftLocation);
    setSelectedPrice(draftPrice);
    setNearMe(draftNearMe);
    setIsFilterOpen(false);

    const nextParams = new URLSearchParams({
      ...(searchValue.trim() ? { search: searchValue.trim() } : {}),
      ...(!draftNearMe && draftLocation !== "all" ? { location: draftLocation } : {}),
      ...(draftPrice !== "all" ? { price: draftPrice } : {}),
      ...(selectedSort ? { sort: selectedSort } : {}),
      ...(draftNearMe ? { nearMe: "1" } : {}),
    });

    navigate(`/category/${encodeURIComponent(draftCategory)}${nextParams.toString() ? `?${nextParams.toString()}` : ""}`, { replace: true });
  };



  const resetFilters = () => {
    const nextCategory = selectedCategory;

    setDraftCategory(nextCategory);
    setDraftLocation("all");
    setDraftPrice("all");
    setDraftNearMe(false);
    setSelectedLocation("all");
    setSelectedPrice("all");
    setNearMe(false);
    setIsFilterOpen(false);

    const nextRoute = buildCategoryRoute({
      category: nextCategory,
      search: searchValue,
      location: "all",
      price: "all",
      sort: selectedSort,
    });

    navigate(nextRoute, { replace: true });
  };



  const handleNearMeToggle = () => {
    const next = !nearMe;
    setNearMe(next);
    setDraftNearMe(next);
    setNearMeActive(next);
    const nextParams = new URLSearchParams(searchParams);
    if (next) {
      nextParams.set("nearMe", "1");
    } else {
      nextParams.delete("nearMe");
    }
    navigate(`/category/${encodeURIComponent(selectedCategory)}?${nextParams.toString()}`, { replace: true });
  };

  const activeFilterCount = Number(nearMe || selectedLocation !== "all") + Number(selectedPrice !== "all");



  return (

    <div className="space-y-6 pb-10">
      <SEO
        title={`${selectedCategory} Decoration in Bangalore`}
        description={`Book premium ${selectedCategory} decoration packages in Bangalore. ${filteredServices.length > 0 ? `${filteredServices.length} curated options` : "Handpicked setups"} with professional setup included. Same-day service available.`}
        canonical={`/category/${encodeURIComponent(selectedCategory)}`}
      />

      <div ref={stickySentinelRef} className="h-px" />
      <CategoryTopSection
        activeFilterCount={activeFilterCount}
        isSticky={isTopSectionSticky}
        nearMe={nearMe}
        onFilterOpen={() => setIsFilterOpen(true)}
        onNearMeToggle={handleNearMeToggle}
        onSortChange={handleSortChange}
        selectedSort={selectedSort}
        sortOptions={SORT_OPTIONS}
      />



      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-4 w-28 rounded-full bg-[#e8eaed]" />
          <div className="h-7 w-64 rounded-full bg-[#e8eaed]" />
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">

          <div>

            <p className="text-sm font-medium text-[#fb2965]">{filteredServices.length} curated options</p>

            <h1 className="text-2xl font-bold tracking-tight text-[#0B4964]">{selectedCategory} setups near you</h1>

          </div>

          <div className="hidden md:flex items-center gap-2">
            {nearMe ? (
              <div className="flex items-center gap-2 rounded-full bg-[#fff0f5] px-4 py-2 text-sm text-[#FB2965] shadow-sm ring-1 ring-[#FB2965]/20">
                <Navigation size={14} />
                Near Me
              </div>
            ) : selectedLocation !== "all" ? (
              <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-[#0B4964] shadow-sm ring-1 ring-[#eadfdb]">
                <MapPin size={14} />
                {selectedLocation}
              </div>
            ) : null}
          </div>

        </div>
      )}



      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-[24px] overflow-hidden bg-[#f4f6f8]">
              <div className="aspect-[4/3] bg-[#e8eaed]" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-[#e8eaed] rounded-full w-3/4" />
                <div className="h-3 bg-[#e8eaed] rounded-full w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredServices.length > 0 ? (

        <motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

          {filteredServices.map((service, index) => (

            <motion.div

              key={service.id}

              layout

              initial={{ opacity: 0 }}

              animate={{ opacity: 1 }}

              transition={{ duration: 0.25, delay: index * 0.03 }}

            >

              <ServiceCard service={service} />

            </motion.div>

          ))}

        </motion.div>

      ) : (

        <motion.div

          initial={{ opacity: 0 }}

          animate={{ opacity: 1 }}

          transition={{ duration: 0.3 }}

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

              className="fixed inset-x-0 bottom-0 z-[70] max-h-[60vh] overflow-y-auto rounded-t-[32px] bg-white p-5 shadow-2xl md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[85vh] md:w-[560px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[32px]"

            >

              <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[#e4e7ec] md:hidden" />

              <div className="mb-5 flex items-center justify-between">

                <div>

                  <h2 className="text-xl font-bold text-[#0B4964]">Filter decorations</h2>

                  <p className="text-sm text-[#6b7680]">Refine by category, location, and price.</p>

                </div>

                <button type="button" onClick={() => setIsFilterOpen(false)} className="rounded-full p-2 text-[#68727a] hover:bg-[#f8fafc]">

                  <X size={18} />

                </button>

              </div>



              <div className="space-y-5 pb-24">

                <div>

                  <p className="mb-3 text-sm font-semibold text-[#0B4964]">Category</p>

                  <div className="flex flex-wrap gap-2">

                    {categories.map((category) => (

                      <button

                        key={category}

                        type="button"

                        onClick={() => setDraftCategory(category)}

                        className={`rounded-full border px-4 py-2 text-sm transition ${

                          draftCategory === category

                            ? "border-[#0B4964] bg-[#0B4964] text-white"

                            : "border-[#e4e7ec] bg-white text-[#0B4964]"

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
                      onClick={() => { setDraftNearMe(true); setDraftLocation("all"); }}
                      className={`flex items-center justify-center gap-1.5 rounded-2xl border px-4 py-3 text-sm transition ${
                        draftNearMe
                          ? "border-[#FB2965] bg-[#fff0f5] text-[#FB2965]"
                          : "border-[#e4e7ec] bg-white text-[#0B4964]"
                      }`}
                    >
                      <Navigation size={14} />
                      Near Me
                    </button>

                    <button

                      type="button"

                      onClick={() => { setDraftLocation("all"); setDraftNearMe(false); }}

                        className={`rounded-2xl border px-4 py-3 text-sm transition ${

                          !draftNearMe && draftLocation === "all"

                          ? "border-[#0B4964] bg-[#f5fbff] text-[#0B4964]"

                          : "border-[#e4e7ec] bg-white text-[#0B4964]"

                      }`}

                    >

                      All cities

                    </button>

                    {locations.map((location) => (

                      <button

                        key={location}

                        type="button"

                        onClick={() => { setDraftLocation(location); setDraftNearMe(false); }}

                        className={`rounded-2xl border px-4 py-3 text-sm transition ${

                          !draftNearMe && draftLocation === location

                            ? "border-[#0B4964] bg-[#f5fbff] text-[#0B4964]"

                            : "border-[#e4e7ec] bg-white text-[#0B4964]"

                        }`}

                      >

                        {location}

                      </button>

                    ))}

                  </div>

                </div>



                <div>

                  <p className="mb-3 text-sm font-semibold text-[#0B4964]">Price range</p>

                  <div className="rounded-[28px] border border-[#e4e7ec] bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#22313f]">
                          {PRICE_SLIDER_OPTIONS[getPriceSliderIndex(draftPrice)].label}
                        </p>
                        <p className="mt-1 text-xs text-[#667085]">
                          {PRICE_SLIDER_OPTIONS[getPriceSliderIndex(draftPrice)].caption}
                        </p>
                      </div>
                      <div className="rounded-full bg-[#f5fbff] px-3 py-1 text-xs font-semibold text-[#0B4964]">
                        Budget
                      </div>
                    </div>

                    <div className="mt-5">
                      <input
                        type="range"
                        min={0}
                        max={PRICE_SLIDER_OPTIONS.length - 1}
                        step={1}
                        value={getPriceSliderIndex(draftPrice)}
                        onChange={(event) =>
                          setDraftPrice(
                            PRICE_SLIDER_OPTIONS[Number(event.target.value)].value as PriceFilter
                          )
                        }
                        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#dbe5ec] accent-[#0B4964]"
                      />
                      <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-[#98a2b3]">
                        <span>All</span>
                        <span>5k</span>
                        <span>8k</span>
                        <span>8k+</span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {PRICE_SLIDER_OPTIONS.map((option) => {
                        const isActive = draftPrice === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setDraftPrice(option.value as PriceFilter)}
                            className={`rounded-full border px-3 py-2 text-sm transition ${
                              isActive
                                ? "border-[#0B4964] bg-[#0B4964] text-white"
                                : "border-[#e4e7ec] bg-white text-[#0B4964]"
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>



              <div className="sticky bottom-[-20px] -mx-5 mt-6 flex gap-3 border-t border-[#eef2f6] bg-white px-5 pt-4 pb-8">

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
