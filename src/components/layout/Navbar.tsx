import { MapPin, Search, ShoppingBag, User, ChevronDown, ChevronLeft, Check, Navigation, Loader2 } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { fetchAllServices } from "../../lib/services";
import {
  getSelectableCities,
  readSelectedCity,
  writeSelectedCity,
  detectCityFromBrowser,
  detectCityFromIP,
  writeUserCoords,
  setNearMeActive,
  isNearMeActive,
} from "../../lib/citySelection";
import { getCartCount, getCartUpdatedEventName } from "../../lib/booking";

export const Navbar = () => {
  const { profile, isAuthenticated, setShowLoginModal, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [isCityPickerOpen, setIsCityPickerOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [nearMe, setNearMe] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isDecorationsPage = location.pathname.startsWith("/category/");
  const isOffersPage = location.pathname === "/offers";
  const isServiceDetailPage = location.pathname.startsWith("/service/") || location.pathname.includes("/service/");
  const isSearchPage = location.pathname === "/search";
  const showSearchBar = isHomePage || isDecorationsPage || isServiceDetailPage || isSearchPage;
  const showMobileSearchBar = isHomePage || isDecorationsPage;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled((current) => {
        if (current) {
          return window.scrollY > 20;
        }
        return window.scrollY > 60;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setSelectedCity(readSelectedCity());
    setNearMe(isNearMeActive());

    let active = true;
    fetchAllServices().then((services) => {
      if (!active) return;
      setAvailableCities(getSelectableCities(services));
    });

    // Auto-detect city from IP on first visit (no permission needed)
    if (!readSelectedCity() || readSelectedCity() === "Bengaluru") {
      detectCityFromIP().then((result) => {
        if (!active || !result) return;
        writeSelectedCity(result.city);
        setSelectedCity(result.city);
      });
    }

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isSearchPage) {
      const currentQuery = new URLSearchParams(location.search).get("search") || "";
      setSearchQuery(currentQuery);
      return;
    }

    setSearchQuery("");
  }, [isSearchPage, location.search]);

  useEffect(() => {
    const syncCartCount = () => setCartCount(getCartCount());

    syncCartCount();

    const cartUpdatedEvent = getCartUpdatedEventName();
    window.addEventListener(cartUpdatedEvent, syncCartCount);
    window.addEventListener("storage", syncCartCount);

    return () => {
      window.removeEventListener(cartUpdatedEvent, syncCartCount);
      window.removeEventListener("storage", syncCartCount);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    writeSelectedCity(city);
    setNearMeActive(false);
    setNearMe(false);
    setIsCityPickerOpen(false);
    setLocationError("");

    if (location.pathname.startsWith("/category/")) {
      const nextParams = new URLSearchParams(location.search);
      if (city) {
        nextParams.set("location", city);
      } else {
        nextParams.delete("location");
      }
      nextParams.delete("nearMe");

      const nextQuery = nextParams.toString();
      navigate(`${location.pathname}${nextQuery ? `?${nextQuery}` : ""}`, { replace: true });
    }
  };

  const handleUseMyLocation = async () => {
    setLocationError("");
    setDetectingLocation(true);

    const applyLocation = (city: string, coords: { latitude: number; longitude: number }) => {
      writeUserCoords(coords);
      setNearMeActive(true);
      setNearMe(true);
      if (city) {
        setSelectedCity(city);
        writeSelectedCity(city);
      }
      setIsCityPickerOpen(false);
      if (location.pathname.startsWith("/category/")) {
        const nextParams = new URLSearchParams(location.search);
        nextParams.set("nearMe", "1");
        if (city) nextParams.set("location", city);
        navigate(`${location.pathname}?${nextParams.toString()}`, { replace: true });
      }
    };

    try {
      const { city, coords } = await detectCityFromBrowser();
      applyLocation(city, coords);
    } catch {
      // GPS failed — try IP-based location silently
      const ipResult = await detectCityFromIP();
      if (ipResult) {
        applyLocation(ipResult.city, ipResult.coords);
      } else {
        setLocationError("Location access denied. Please allow location in browser settings and try again.");
      }
    } finally {
      setDetectingLocation(false);
    }
  };

  if (isServiceDetailPage) {
    return (
      <header className="hidden md:block relative top-0 z-50 bg-white md:border-b md:border-gray-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-8">
          <Link to="/" className="flex flex-col shrink-0">
            <span
              className="text-3xl leading-none text-[#0B4164]"
              style={{ fontFamily: '"Para", serif', fontWeight: 600 }}
            >
              Sylonow
            </span>
            <span className="mt-1 text-[10px] font-semibold tracking-widest text-gray-400">Let's celebrate</span>
          </Link>
          <button type="button" onClick={() => setIsCityPickerOpen(true)} className="flex items-center gap-2 cursor-pointer group shrink-0 text-left">
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-gray-100 transition-colors">
              <MapPin className="text-gray-600" size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-500">Select City</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-[#0B4964]">{selectedCity || "Not Selected"}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
            </div>
          </button>
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative">
            <input type="text" placeholder='Search "Decorations"' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-12 bg-gray-50 border border-gray-100 rounded-full px-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#FB2965]/10 transition-all" />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </form>
          <div className="flex items-center gap-8 shrink-0">
            {isAuthenticated ? (
              <Link to="/profile" className="flex flex-col items-center gap-1 group">
                <div className="w-10 h-10 bg-[#FB2965]/10 rounded-full flex items-center justify-center">
                  <User size={20} className="text-[#FB2965]" />
                </div>
                <span className="text-[10px] font-semibold text-gray-500 truncate max-w-[60px]">{profile?.full_name || 'Profile'}</span>
              </Link>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="flex flex-col items-center gap-1 group">
                <User size={24} className="text-gray-600 group-hover:text-[#FB2965] transition-colors" />
                <span className="text-[10px] font-semibold text-gray-500">Login</span>
              </button>
            )}
            <Link to="/cart" className="flex flex-col items-center gap-1 group relative">
              <ShoppingBag size={24} className="text-gray-600 group-hover:text-[#FB2965] transition-colors" />
              <span className="text-[10px] font-semibold text-gray-500">Cart</span>
              {cartCount > 0 ? (
                <span className="absolute -top-1 right-0 min-w-4 h-4 px-1 bg-[#FB2965] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">{cartCount}</span>
              ) : null}
            </Link>
          </div>
        </div>
        {isCityPickerOpen ? (
          <div className="fixed inset-0 z-[95]">
            <button type="button" aria-label="Close city picker" onClick={() => setIsCityPickerOpen(false)} className="absolute inset-0 bg-[#101828]/30 backdrop-blur-[2px]" />
            <div className="absolute left-[240px] top-20 w-[360px] rounded-[28px] border border-[#e7ebf0] bg-white p-4 shadow-[0_28px_60px_rgba(15,23,42,0.18)]">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#98a2b3]">Location</p>
                  <h3 className="text-lg font-bold text-[#0B4964]">Choose your city</h3>
                </div>
                <button type="button" onClick={() => handleCitySelect("")} className="rounded-full border border-[#e4e7ec] px-3 py-1 text-xs font-semibold text-[#667085] transition-colors hover:border-[#0B4964] hover:text-[#0B4964]">Clear</button>
              </div>
              <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
                <button type="button" onClick={handleUseMyLocation} disabled={detectingLocation} className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors ${nearMe ? "border-[#FB2965] bg-[#fff0f5] text-[#FB2965]" : "border-[#edf0f4] bg-white text-[#344054] hover:border-[#FB2965]"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${nearMe ? "bg-[#FB2965] text-white" : "bg-[#f4f6f8] text-[#667085]"}`}>
                      {detectingLocation ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Near Me</p>
                      <p className="text-xs text-[#98a2b3]">{detectingLocation ? "Detecting location…" : "Use my current location"}</p>
                    </div>
                  </div>
                  {nearMe ? <Check size={18} className="shrink-0" /> : null}
                </button>
                {locationError ? <p className="text-xs text-red-500 px-1">{locationError}</p> : null}
                {availableCities.map((city) => {
                  const isActive = !nearMe && city === selectedCity;
                  return (
                    <button key={city} type="button" onClick={() => handleCitySelect(city)} className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors ${isActive ? "border-[#0B4964] bg-[#eef7fc] text-[#0B4964]" : "border-[#edf0f4] bg-white text-[#344054] hover:border-[#0B4964]"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isActive ? "bg-[#0B4964] text-white" : "bg-[#f4f6f8] text-[#667085]"}`}><MapPin size={18} /></div>
                        <div>
                          <p className="text-sm font-semibold">{city}</p>
                          <p className="text-xs text-[#98a2b3]">Use this city for decoration browsing</p>
                        </div>
                      </div>
                      {isActive ? <Check size={18} className="shrink-0" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </header>
    );
  }

  return (
    <header
      className={`${isHomePage || isOffersPage ? "sticky" : "relative"} md:relative top-0 z-50 bg-white ${
        isDecorationsPage ? "border-b-0" : showMobileSearchBar || isHomePage ? "border-b border-gray-100" : "md:border-b md:border-gray-100"
      }`}
    >
      {/* Desktop Header */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/" className="flex flex-col shrink-0">
            <span
              className="text-3xl leading-none text-[#0B4164]"
              style={{ fontFamily: '"Para", serif', fontWeight: 600 }}
            >
              Sylonow
            </span>
            <span className="mt-1 text-[10px] font-semibold tracking-widest text-gray-400">Let's celebrate</span>
          </Link>

          {/* Location Selector */}
          <button
            type="button"
            onClick={() => setIsCityPickerOpen(true)}
            className="flex items-center gap-2 cursor-pointer group shrink-0 text-left"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${nearMe ? "bg-[#FB2965]/10 group-hover:bg-[#FB2965]/20" : "bg-gray-50 group-hover:bg-gray-100"}`}>
              {nearMe ? <Navigation className="text-[#FB2965]" size={20} /> : <MapPin className="text-gray-600" size={20} />}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-500">{nearMe ? "Near Me" : "Select City"}</span>
              <div className="flex items-center gap-1">
                <span className={`text-sm font-bold ${nearMe ? "text-[#FB2965]" : "text-[#0B4964]"}`}>{nearMe ? "Current Location" : (selectedCity || "Not Selected")}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
            </div>
          </button>

          {/* Search Bar */}
          {showSearchBar ? (
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative">
              <input
                type="text"
                placeholder='Search "Decorations"'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 bg-gray-50 border border-gray-100 rounded-full px-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#FB2965]/10 transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </form>
          ) : (
            <div className="flex-1" />
          )}

          {/* Actions */}
          <div className="flex items-center gap-8 shrink-0">
            {isAuthenticated ? (
              <Link to="/profile" className="flex flex-col items-center gap-1 group">
                <div className="w-10 h-10 bg-[#FB2965]/10 rounded-full flex items-center justify-center">
                  <User size={20} className="text-[#FB2965]" />
                </div>
                <span className="text-[10px] font-semibold text-gray-500 truncate max-w-[60px]">{profile?.full_name || 'Profile'}</span>
              </Link>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="flex flex-col items-center gap-1 group">
                <User size={24} className="text-gray-600 group-hover:text-[#FB2965] transition-colors" />
                <span className="text-[10px] font-semibold text-gray-500">Login</span>
              </button>
            )}

            <Link to="/cart" className="flex flex-col items-center gap-1 group relative">
              <ShoppingBag size={24} className="text-gray-600 group-hover:text-[#FB2965] transition-colors" />
              <span className="text-[10px] font-semibold text-gray-500">Cart</span>
              {cartCount > 0 ? (
                <span className="absolute -top-1 right-0 min-w-4 h-4 px-1 bg-[#FB2965] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        {isHomePage ? (
          <div
            className={`overflow-hidden transition-[opacity,transform] duration-300 ease-in-out ${
              isScrolled ? "opacity-0 -translate-y-full pointer-events-none h-0" : "opacity-100 translate-y-0 h-16"
            }`}
          >
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsCityPickerOpen(true)}
                className="flex items-center gap-2 text-left"
              >
                <div className="w-8 h-8 bg-[#FB2965]/10 rounded-lg flex items-center justify-center">
                  {nearMe ? <Navigation className="text-[#FB2965]" size={18} /> : <MapPin className="text-[#FB2965]" size={18} />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold tracking-widest text-gray-400 leading-none">{nearMe ? "NEAR ME" : "SELECT CITY"}</span>
                  <span className={`text-xs font-semibold ${nearMe ? "text-[#FB2965]" : "text-[#0B4964]"}`}>{nearMe ? "Current Location" : (selectedCity || "Not Selected")}</span>
                </div>
              </button>

              <div className="flex items-center gap-4">
                <Link to="/cart" className="p-2 hover:bg-gray-50 rounded-full transition-colors relative">
                  <ShoppingBag size={20} className="text-gray-600" />
                  {cartCount > 0 ? (
                    <span className="absolute -top-0.5 right-0 min-w-4 h-4 px-1 bg-[#FB2965] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                      {cartCount}
                    </span>
                  ) : null}
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        {/* Mobile Search Bar */}
        {showMobileSearchBar && (isHomePage || isDecorationsPage) && isScrolled ? <div className="h-[72px]" /> : null}

        {showMobileSearchBar && (
          <div
            className={`px-4 pb-1 transition-[box-shadow,background-color] duration-300 ease-in-out ${
              (isHomePage || isDecorationsPage) && isScrolled
                ? "fixed inset-x-0 top-0 z-[60] bg-white pt-3 shadow-sm"
                : "bg-white pt-3"
            }`}
          >
            <div className="flex items-center gap-3">
              {isDecorationsPage ? (
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0B4964] ring-1 ring-[#eadfdb]"
                >
                  <ChevronLeft size={20} />
                </button>
              ) : null}

              <form onSubmit={handleSearch} className="relative flex-1">
                <input
                  type="text"
                  placeholder='Search "Decorations"'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 rounded-full border border-[#eadfdb] bg-white px-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#FB2965]/10 transition-all"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </form>
            </div>
          </div>
        )}
      </div>

      {isCityPickerOpen ? (
        <div className="fixed inset-0 z-[95]">
          <button
            type="button"
            aria-label="Close city picker"
            onClick={() => setIsCityPickerOpen(false)}
            className="absolute inset-0 bg-[#101828]/30 backdrop-blur-[2px]"
          />
          <div className="absolute left-1/2 top-24 w-[min(92vw,420px)] -translate-x-1/2 rounded-[28px] border border-[#e7ebf0] bg-white p-4 shadow-[0_28px_60px_rgba(15,23,42,0.18)] md:left-[240px] md:top-20 md:w-[360px] md:translate-x-0">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#98a2b3]">Location</p>
                <h3 className="text-lg font-bold text-[#0B4964]">Choose your city</h3>
              </div>
              <button
                type="button"
                onClick={() => handleCitySelect("")}
                className="rounded-full border border-[#e4e7ec] px-3 py-1 text-xs font-semibold text-[#667085] transition-colors hover:border-[#0B4964] hover:text-[#0B4964]"
              >
                Clear
              </button>
            </div>

            <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={detectingLocation}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors ${
                  nearMe
                    ? "border-[#FB2965] bg-[#fff0f5] text-[#FB2965]"
                    : "border-[#edf0f4] bg-white text-[#344054] hover:border-[#FB2965]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${nearMe ? "bg-[#FB2965] text-white" : "bg-[#f4f6f8] text-[#667085]"}`}>
                    {detectingLocation ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Near Me</p>
                    <p className="text-xs text-[#98a2b3]">{detectingLocation ? "Detecting location…" : "Use my current location"}</p>
                  </div>
                </div>
                {nearMe ? <Check size={18} className="shrink-0" /> : null}
              </button>
              {locationError ? <p className="text-xs text-red-500 px-1">{locationError}</p> : null}
              {availableCities.length > 0 ? availableCities.map((city) => {
                const isActive = !nearMe && city === selectedCity;
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleCitySelect(city)}
                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors ${
                      isActive
                        ? "border-[#0B4964] bg-[#eef7fc] text-[#0B4964]"
                        : "border-[#edf0f4] bg-white text-[#344054] hover:border-[#0B4964]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isActive ? "bg-[#0B4964] text-white" : "bg-[#f4f6f8] text-[#667085]"}`}>
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{city}</p>
                        <p className="text-xs text-[#98a2b3]">Use this city for decoration browsing</p>
                      </div>
                    </div>
                    {isActive ? <Check size={18} className="shrink-0" /> : null}
                  </button>
                );
              }) : (
                <div className="rounded-2xl border border-dashed border-[#d0d5dd] bg-[#fcfcfd] px-4 py-5 text-sm text-[#667085]">
                  Cities will appear here once service locations are available.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
};
